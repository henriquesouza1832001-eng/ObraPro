import type { Env } from './env';
import { withSecurityHeaders, redirect } from './http/security';
import { isAuthenticated, sessionToken } from './auth/demoSession';
import { renderLoginPage } from './pages/login';
import { D1MembershipRepository } from './auth/membershipRepository';
import { MockCourseRepository } from './data/mockCourseRepository';
import { D1CourseRepository } from './data/d1CourseRepository';
import { authenticateRequest, authenticatedSession, loginWithD1, logoutFromD1, sessionCookie } from './auth/realSession';
import { D1OperationalRepository } from './data/d1OperationalRepository';
import { D1OperationalAuthorization } from './auth/operationalAuthorization';
import { D1SupportTicketRepository } from './auth/supportTicketRepository';
import { validateSupportTicket } from './domain/support';
import { D1EvidenceAuthorization } from './auth/evidenceAuthorization';
import { D1EvidenceRepository } from './data/d1EvidenceRepository';
import { detectEvidenceMimeType, sha256Checksum, validateEvidenceUpload } from './domain/evidence';
import type { CourseRepository } from './data/course';
import { renderCourseCatalog, renderCourseDetail, renderCourseNotFound } from './pages/courses';
import { renderLessonDetail, renderLessonNotFound, flattenLessons } from './pages/lesson';
import { renderAdminPanel } from './pages/admin';
import { renderLearningHome } from './pages/home';
import { renderComoFunciona } from './pages/comoFunciona';
import { renderServerError } from './pages/serverError';
import { D1CourseProgressRepository } from './data/courseProgressRepository';
import { D1CourseEnrollmentRepository } from './data/courseEnrollmentRepository';
import { D1LessonContentRepository } from './data/lessonContentRepository';
import { D1UserRepository } from './auth/userRepository';
import { D1CatalogAuthorization } from './auth/catalogAuthorization';
import { D1AdminRepository } from './data/adminRepository';

function courseRepositoryFor(env: Env): CourseRepository {
    return env.COURSES_DB ? new D1CourseRepository(env.COURSES_DB) : new MockCourseRepository();
}

function html(body: string, status = 200): Response {
    return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=UTF-8' } });
}

function privateJson(body: unknown, status = 200): Response {
    const response = json(body, status);
    response.headers.set('Cache-Control', 'no-store');

    return withSecurityHeaders(response);
}

function organizationIdFrom(url: URL): string | null {
    const organizationId = url.searchParams.get('organization_id');

    return organizationId && /^[A-Za-z0-9_-]{1,128}$/.test(organizationId) ? organizationId : null;
}

function optionalOrganizationId(value: unknown): string | null | undefined {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : undefined;
}

function ticketIdFrom(path: string): string | null {
    const prefix = '/api/painel/suporte/chamados/';
    const ticketId = path.startsWith(prefix) ? path.slice(prefix.length) : '';

    return /^[A-Za-z0-9_-]{1,128}$/.test(ticketId) ? ticketId : null;
}

function evidenceIdFrom(path: string): string | null {
    const match = path.match(/^\/api\/painel\/evidencias\/([A-Za-z0-9_-]{1,128})\/download$/);

    return match?.[1] ?? null;
}

async function privateApiSession(request: Request, env: Env): Promise<{ userId: string } | null> {
    const session = await authenticatedSession(request, env);

    return session ? { userId: session.userId } : null;
}

async function publicationValue(request: Request): Promise<boolean | null> {
    try {
        const parsed = await request.json<unknown>();

        return typeof parsed === 'object' && parsed !== null && 'published' in parsed &&
            typeof parsed.published === 'boolean' ? parsed.published : null;
    } catch {
        return null;
    }
}

interface LessonContentPayload {
    body: string;
    materials: string[];
    tools: string[];
    steps: string[];
    safetyNotes: string;
}

function stringListPayload(value: unknown): string[] | null {
    if (!Array.isArray(value) || value.length > 100 || !value.every((item) => typeof item === 'string' && item.length <= 500)) {
        return null;
    }

    return value as string[];
}

async function lessonContentPayload(request: Request): Promise<LessonContentPayload | null> {
    try {
        const parsed = await request.json<unknown>();

        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        const value = parsed as Record<string, unknown>;
        const materials = stringListPayload(value.materials);
        const tools = stringListPayload(value.tools);
        const steps = stringListPayload(value.steps);

        if (typeof value.body !== 'string' || value.body.length > 50_000 ||
            materials === null || tools === null || steps === null ||
            typeof value.safetyNotes !== 'string' || value.safetyNotes.length > 10_000) {
            return null;
        }

        return { body: value.body, materials, tools, steps, safetyNotes: value.safetyNotes };
    } catch {
        return null;
    }
}

async function handleCourseDetail(slug: string, courseRepository: CourseRepository): Promise<Response> {
    const course = await courseRepository.findCourseBySlug(slug);

    if (!course) {
        return html(renderCourseNotFound(), 404);
    }

    return html(renderCourseDetail(course, await courseRepository.findModulesByCourseSlug(slug)));
}

async function handleLessonDetail(slug: string, lessonId: string, courseRepository: CourseRepository): Promise<Response> {
    const course = await courseRepository.findCourseBySlug(slug);

    if (!course) {
        return html(renderCourseNotFound(), 404);
    }

    const modules = await courseRepository.findModulesByCourseSlug(slug);
    const flat = flattenLessons(modules);
    const index = flat.findIndex((lesson) => lesson.id === lessonId);
    const current = flat[index];

    if (index === -1 || !current) {
        return html(renderLessonNotFound(course), 404);
    }

    return html(renderLessonDetail(course, current, flat[index - 1] ?? null, flat[index + 1] ?? null));
}

async function route(request: Request, env: Env): Promise<Response> {
    const courseRepository = courseRepositoryFor(env);
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
        return json({ status: 'ok', service: 'obrapro-worker' });
    }

    const adminCatalogRead = path === '/api/admin/catalogo' && request.method === 'GET';
    const adminAuditRead = path === '/api/admin/auditoria' && request.method === 'GET';
    if (adminCatalogRead || adminAuditRead) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB || !env.AUTH_DB) {
            return privateJson({ error: 'catalog_data_unavailable' }, 503);
        }
        if (!await new D1CatalogAuthorization(new D1UserRepository(env.AUTH_DB)).canManageCatalog(session.userId)) {
            return privateJson({ error: 'catalog_admin_required' }, 403);
        }

        const repository = new D1AdminRepository(env.COURSES_DB);
        if (adminCatalogRead) {
            return privateJson({ data: await repository.listCatalog() });
        }

        const requestedLimit = Number(new URL(request.url).searchParams.get('limit') ?? '50');

        return privateJson({ data: await repository.listAuditEvents(Number.isFinite(requestedLimit) ? requestedLimit : 50) });
    }

    const coursePublicationMatch = path.match(/^\/api\/admin\/cursos\/([^/]+)\/publicacao$/);
    const modulePublicationMatch = path.match(/^\/api\/admin\/modulos\/([^/]+)\/publicacao$/);
    if ((coursePublicationMatch || modulePublicationMatch) && request.method === 'PATCH') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB || !env.AUTH_DB) {
            return privateJson({ error: 'catalog_data_unavailable' }, 503);
        }
        if (!await new D1CatalogAuthorization(new D1UserRepository(env.AUTH_DB)).canManageCatalog(session.userId)) {
            return privateJson({ error: 'catalog_admin_required' }, 403);
        }

        const published = await publicationValue(request);
        const slugOrId = decodeURIComponent((coursePublicationMatch ?? modulePublicationMatch)?.[1] ?? '');
        if (published === null || !/^[A-Za-z0-9_-]{1,128}$/.test(slugOrId)) {
            return privateJson({ error: 'invalid_publication_payload' }, 422);
        }

        const table = coursePublicationMatch ? 'courses' : 'instruction_modules';
        const key = coursePublicationMatch ? 'slug' : 'slug';
        const result = await env.COURSES_DB.prepare(`
            UPDATE ${table}
            SET is_published = ?, updated_at = ?
            WHERE ${key} = ?
        `).bind(published ? 1 : 0, new Date().toISOString(), slugOrId).run();

        if (result.meta.changes !== 1) {
            return privateJson({ error: 'catalog_item_not_found' }, 404);
        }

        await new D1AdminRepository(env.COURSES_DB).recordAuditEvent({
            id: crypto.randomUUID(),
            actorUserId: session.userId,
            action: 'catalog.publication.set',
            resourceType: coursePublicationMatch ? 'course' : 'instruction_module',
            resourceId: slugOrId,
            metadata: { published },
            createdAt: new Date().toISOString(),
        });

        return privateJson({ data: { slug: slugOrId, published } });
    }

    const lessonContentReadMatch = path.match(/^\/api\/admin\/aulas\/([A-Za-z0-9_-]{1,128})\/conteudo$/);
    const lessonContentPublicationMatch = path.match(/^\/api\/admin\/aulas\/([A-Za-z0-9_-]{1,128})\/conteudo\/(\d+)\/publicacao$/);
    if ((lessonContentReadMatch && (request.method === 'GET' || request.method === 'POST')) ||
        (lessonContentPublicationMatch && request.method === 'PATCH')) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB || !env.AUTH_DB) {
            return privateJson({ error: 'catalog_data_unavailable' }, 503);
        }
        if (!await new D1CatalogAuthorization(new D1UserRepository(env.AUTH_DB)).canManageCatalog(session.userId)) {
            return privateJson({ error: 'catalog_admin_required' }, 403);
        }

        const repository = new D1LessonContentRepository(env.COURSES_DB);
        const lessonId = decodeURIComponent((lessonContentReadMatch ?? lessonContentPublicationMatch)?.[1] ?? '');
        const now = new Date().toISOString();

        if (request.method === 'GET') {
            return privateJson({ data: await repository.listVersions(lessonId) });
        }

        if (request.method === 'POST') {
            const payload = await lessonContentPayload(request);
            if (!payload) {
                return privateJson({ error: 'invalid_lesson_content_payload' }, 422);
            }

            const draft = await repository.createDraft({
                id: crypto.randomUUID(),
                lessonId,
                ...payload,
                createdAt: now,
            });
            if (!draft) {
                return privateJson({ error: 'lesson_not_found' }, 404);
            }

            await new D1AdminRepository(env.COURSES_DB).recordAuditEvent({
                id: crypto.randomUUID(),
                actorUserId: session.userId,
                action: 'lesson.content.draft_created',
                resourceType: 'lesson_content_version',
                resourceId: draft.id,
                metadata: { lessonId, version: draft.version },
                createdAt: now,
            });

            return privateJson({ data: draft }, 201);
        }

        const version = Number(lessonContentPublicationMatch?.[2]);
        const published = await publicationValue(request);
        if (!Number.isInteger(version) || version < 1 || published === null) {
            return privateJson({ error: 'invalid_publication_payload' }, 422);
        }

        const updated = await repository.setPublication(lessonId, version, published, now);
        if (!updated) {
            return privateJson({ error: 'lesson_content_not_found' }, 404);
        }

        await new D1AdminRepository(env.COURSES_DB).recordAuditEvent({
            id: crypto.randomUUID(),
            actorUserId: session.userId,
            action: 'lesson.content.publication.set',
            resourceType: 'lesson_content_version',
            resourceId: updated.id,
            metadata: { lessonId, version, published },
            createdAt: now,
        });

        return privateJson({ data: updated });
    }

    const courseProgressMatch = path.match(/^\/api\/cursos\/([^/]+)\/progresso$/);
    const courseLessonProgressMatch = path.match(/^\/api\/cursos\/([^/]+)\/aulas\/([^/]+)\/progresso$/);
    const isCourseProgressRead = Boolean(courseProgressMatch) && request.method === 'GET';
    const isCourseLessonProgressWrite = Boolean(courseLessonProgressMatch) && request.method === 'POST';
    if (isCourseProgressRead || isCourseLessonProgressWrite) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB) {
            return privateJson({ error: 'course_data_unavailable' }, 503);
        }

        const repository = new D1CourseProgressRepository(env.COURSES_DB);
        const courseSlug = decodeURIComponent((courseProgressMatch ?? courseLessonProgressMatch)?.[1] ?? '');
        const lessonId = courseLessonProgressMatch?.[2];
        const progress = courseLessonProgressMatch && request.method === 'POST'
            ? await repository.completeLesson(session.userId, courseSlug, decodeURIComponent(lessonId ?? ''), new Date().toISOString())
            : await repository.getProgress(session.userId, courseSlug);

        if (!progress) {
            return privateJson({ error: 'course_or_lesson_not_found' }, 404);
        }

        return privateJson({ data: progress });
    }

    const courseAccessMatch = path.match(/^\/api\/cursos\/([^/]+)\/acesso$/);
    const courseEnrollmentMatch = path.match(/^\/api\/cursos\/([^/]+)\/matricula$/);
    const isCourseAccessRead = Boolean(courseAccessMatch) && request.method === 'GET';
    const isFreeEnrollment = Boolean(courseEnrollmentMatch) && request.method === 'POST';
    if (isCourseAccessRead || isFreeEnrollment) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB) {
            return privateJson({ error: 'course_data_unavailable' }, 503);
        }

        const repository = new D1CourseEnrollmentRepository(env.COURSES_DB);
        const courseSlug = decodeURIComponent((courseAccessMatch ?? courseEnrollmentMatch)?.[1] ?? '');
        const access = isFreeEnrollment
            ? await repository.enrollFree(session.userId, courseSlug, new Date().toISOString())
            : await repository.accessFor(session.userId, courseSlug);

        if (!access) {
            return privateJson({ error: isFreeEnrollment ? 'free_enrollment_unavailable' : 'course_not_found' }, 404);
        }
        if (isFreeEnrollment && !access.enrolled) {
            return privateJson({ error: 'course_access_required' }, 403);
        }

        return privateJson({ data: access });
    }

    const lessonContentMatch = path.match(/^\/api\/cursos\/([^/]+)\/aulas\/([^/]+)\/conteudo$/);
    if (lessonContentMatch && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }
        if (!env.COURSES_DB) {
            return privateJson({ error: 'course_data_unavailable' }, 503);
        }

        const courseSlug = decodeURIComponent(lessonContentMatch[1] ?? '');
        const lessonId = decodeURIComponent(lessonContentMatch[2] ?? '');
        const access = await new D1CourseEnrollmentRepository(env.COURSES_DB).accessFor(session.userId, courseSlug);
        if (!access) {
            return privateJson({ error: 'course_not_found' }, 404);
        }
        if (!access.enrolled) {
            return privateJson({ error: 'course_access_required' }, 403);
        }

        const content = await new D1LessonContentRepository(env.COURSES_DB).findPublishedForCourse(courseSlug, lessonId);
        if (!content) {
            return privateJson({ error: 'lesson_content_not_found' }, 404);
        }

        return privateJson({ data: content });
    }

    if (path === '/api/painel/organizacoes' && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const organizations = await new D1MembershipRepository(env.OPERATIONS_DB).listActiveOrganizationsForUser(session.userId);

        return privateJson({ data: organizations });
    }

    if (path === '/api/painel/obras' && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const works = await new D1OperationalRepository(env.OPERATIONS_DB).listWorks(organizationId);

        return privateJson({ data: works });
    }

    if (path === '/api/painel/procedimentos' && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const procedures = await new D1OperationalRepository(env.OPERATIONS_DB).listPublishedProcedures(organizationId);

        return privateJson({ data: procedures });
    }

    if (path === '/api/painel/checklists' && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const checklists = await new D1OperationalRepository(env.OPERATIONS_DB).listPublishedChecklists(organizationId);

        return privateJson({ data: checklists });
    }

    if (path === '/api/painel/execucoes' && request.method === 'POST') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        let body: Record<string, unknown>;
        try {
            const parsed = await request.json<unknown>();
            body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
        } catch {
            return privateJson({ error: 'execution_invalid' }, 400);
        }

        const organizationId = optionalOrganizationId(body.organization_id);
        const workId = typeof body.work_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(body.work_id) ? body.work_id : null;
        const procedureId = typeof body.procedure_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(body.procedure_id) ? body.procedure_id : null;
        if (!organizationId || !workId || !procedureId) {
            return privateJson({ error: 'execution_invalid' }, 400);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const authorization = new D1OperationalAuthorization(env.OPERATIONS_DB, memberships);
        if (!await authorization.canAccessWork(session.userId, organizationId, workId)) {
            return privateJson({ error: 'work_access_denied' }, 403);
        }

        try {
            const executionId = crypto.randomUUID();
            const startedAt = new Date().toISOString();
            await new D1OperationalRepository(env.OPERATIONS_DB).startExecution({
                id: executionId,
                organizationId,
                workId,
                procedureId,
                startedBy: session.userId,
                startedAt,
            });

            return privateJson({ data: { id: executionId, status: 'in_progress' } }, 201);
        } catch (error) {
            if (error instanceof Error && error.message === 'procedure_not_found') {
                return privateJson({ error: 'procedure_not_found' }, 404);
            }

            throw error;
        }
    }

    const executionStepMatch = path.match(/^\/api\/painel\/execucoes\/([A-Za-z0-9_-]{1,128})\/etapas\/([A-Za-z0-9_-]{1,128})$/);
    if (executionStepMatch && request.method === 'PATCH') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId || !env.OPERATIONS_DB) {
            return privateJson({ error: organizationId ? 'operational_data_unavailable' : 'organization_id_required' }, organizationId ? 503 : 400);
        }

        const executionId = executionStepMatch[1];
        const executionStepId = executionStepMatch[2];
        if (!executionId || !executionStepId) {
            return privateJson({ error: 'execution_step_invalid' }, 400);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const authorization = new D1OperationalAuthorization(env.OPERATIONS_DB, memberships);
        if (!await authorization.canAccessExecution(session.userId, organizationId, executionId)) {
            return privateJson({ error: 'execution_access_denied' }, 403);
        }

        let body: Record<string, unknown>;
        try {
            const parsed = await request.json<unknown>();
            body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
        } catch {
            return privateJson({ error: 'execution_step_invalid' }, 400);
        }

        const status = body.status;
        if (status !== 'pending' && status !== 'completed' && status !== 'skipped') {
            return privateJson({ error: 'execution_step_invalid' }, 400);
        }

        const note = body.note === undefined || body.note === null ? null : typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : undefined;
        if (note === undefined) {
            return privateJson({ error: 'execution_step_invalid' }, 400);
        }

        const updated = await new D1OperationalRepository(env.OPERATIONS_DB).updateExecutionStep({
            organizationId,
            executionId,
            executionStepId,
            status,
            note,
            updatedAt: new Date().toISOString(),
        });

        return updated ? privateJson({ data: { id: executionStepId, status } }) : privateJson({ error: 'execution_step_not_found' }, 404);
    }

    const executionDetailMatch = path.match(/^\/api\/painel\/execucoes\/([A-Za-z0-9_-]{1,128})$/);
    if (executionDetailMatch && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const executionId = executionDetailMatch[1];
        if (!executionId) {
            return privateJson({ error: 'execution_not_found' }, 404);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const authorization = new D1OperationalAuthorization(env.OPERATIONS_DB, memberships);
        if (!await authorization.canAccessExecution(session.userId, organizationId, executionId)) {
            return privateJson({ error: 'execution_access_denied' }, 403);
        }

        const execution = await new D1OperationalRepository(env.OPERATIONS_DB).findExecution(organizationId, executionId);

        return execution ? privateJson({ data: execution }) : privateJson({ error: 'execution_not_found' }, 404);
    }

    const procedureDetailMatch = path.match(/^\/api\/painel\/procedimentos\/([A-Za-z0-9_-]{1,128})$/);
    if (procedureDetailMatch && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const procedureId = procedureDetailMatch[1];
        if (!procedureId) {
            return privateJson({ error: 'procedure_not_found' }, 404);
        }

        const procedure = await new D1OperationalRepository(env.OPERATIONS_DB).findPublishedProcedure(organizationId, procedureId);

        return procedure ? privateJson({ data: procedure }) : privateJson({ error: 'procedure_not_found' }, 404);
    }

    const checklistDetailMatch = path.match(/^\/api\/painel\/checklists\/([A-Za-z0-9_-]{1,128})$/);
    if (checklistDetailMatch && request.method === 'GET') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const memberships = new D1MembershipRepository(env.OPERATIONS_DB);
        if (!await memberships.canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const checklistId = checklistDetailMatch[1];
        if (!checklistId) {
            return privateJson({ error: 'checklist_not_found' }, 404);
        }

        const checklist = await new D1OperationalRepository(env.OPERATIONS_DB).findPublishedChecklist(organizationId, checklistId);

        return checklist ? privateJson({ data: checklist }) : privateJson({ error: 'checklist_not_found' }, 404);
    }

    if (path === '/api/painel/suporte/chamados' && request.method === 'POST') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        let body: Record<string, unknown>;
        try {
            const parsed = await request.json<unknown>();
            body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
        } catch {
            return privateJson({ error: 'support_ticket_invalid' }, 400);
        }

        const organizationId = optionalOrganizationId(body.organization_id);
        if (organizationId === undefined) {
            return privateJson({ error: 'support_ticket_invalid' }, 400);
        }

        if (organizationId && !await new D1MembershipRepository(env.OPERATIONS_DB).canAccessOrganization(session.userId, organizationId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        try {
            const ticket = validateSupportTicket({
                id: crypto.randomUUID(),
                userId: session.userId,
                organizationId,
                title: typeof body.title === 'string' ? body.title : '',
                description: typeof body.description === 'string' ? body.description : '',
                category: body.category as 'bug' | 'content' | 'account' | 'other',
                priority: body.priority as 'low' | 'normal' | 'high',
                route: path,
                correlationId: null,
                sessionContext: {
                    user_agent: request.headers.get('User-Agent') ?? '',
                    route: path,
                    app_version: typeof body.app_version === 'string' ? body.app_version : '',
                },
                createdAt: new Date().toISOString(),
            });

            await new D1SupportTicketRepository(env.OPERATIONS_DB).create(ticket);

            return privateJson({ data: { id: ticket.id, status: 'open' } }, 201);
        } catch {
            return privateJson({ error: 'support_ticket_invalid' }, 400);
        }
    }

    if (path === '/api/painel/evidencias' && request.method === 'POST') {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        if (!env.OPERATIONS_DB || !env.EVIDENCE_BUCKET) {
            return privateJson({ error: 'evidence_storage_unavailable' }, 503);
        }

        const form = await request.formData();
        const organizationId = optionalOrganizationId(form.get('organization_id'));
        const executionStepId = typeof form.get('execution_step_id') === 'string' ? String(form.get('execution_step_id')) : '';
        const upload = form.get('file');
        const note = typeof form.get('note') === 'string' ? String(form.get('note')).trim().slice(0, 2000) : null;

        if (!organizationId || !/^[A-Za-z0-9_-]{1,128}$/.test(executionStepId) || !upload || typeof (upload as File).arrayBuffer !== 'function') {
            return privateJson({ error: 'evidence_invalid' }, 400);
        }

        const file = upload as File;
        if (file.size < 1 || file.size > 10 * 1024 * 1024) {
            return privateJson({ error: 'evidence_invalid' }, 400);
        }

        const bytes = new Uint8Array(await file.arrayBuffer());
        const mimeType = detectEvidenceMimeType(bytes);
        if (!mimeType) {
            return privateJson({ error: 'evidence_invalid' }, 400);
        }

        const evidenceAuthorization = new D1EvidenceAuthorization(
            env.OPERATIONS_DB,
            new D1MembershipRepository(env.OPERATIONS_DB),
        );
        if (!await evidenceAuthorization.canUpload(session.userId, organizationId, executionStepId)) {
            return privateJson({ error: 'organization_access_denied' }, 403);
        }

        const evidenceId = crypto.randomUUID();
        const validated = validateEvidenceUpload({
            organizationId,
            executionStepId,
            evidenceId,
            originalName: file.name,
            mimeType,
            sizeBytes: bytes.byteLength,
            checksum: await sha256Checksum(bytes),
        });
        const evidence = {
            id: validated.evidenceId,
            organizationId: validated.organizationId,
            executionStepId: validated.executionStepId,
            uploadedBy: session.userId,
            storageKey: validated.storageKey,
            originalName: validated.originalName,
            mimeType: validated.mimeType,
            sizeBytes: validated.sizeBytes,
            checksum: validated.checksum,
            note,
            status: 'available' as const,
        };
        const createdAt = new Date().toISOString();

        await env.EVIDENCE_BUCKET.put(validated.storageKey, bytes, {
            httpMetadata: { contentType: validated.mimeType },
            customMetadata: { checksum: validated.checksum },
        });

        try {
            await new D1EvidenceRepository(env.OPERATIONS_DB).create(evidence, createdAt);
        } catch (error) {
            await env.EVIDENCE_BUCKET.delete(validated.storageKey);
            throw error;
        }

        return privateJson({ data: { id: evidence.id, status: evidence.status } }, 201);
    }

    if (request.method === 'GET' && evidenceIdFrom(path)) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        const organizationId = organizationIdFrom(url);
        if (!organizationId) {
            return privateJson({ error: 'organization_id_required' }, 400);
        }

        if (!env.OPERATIONS_DB || !env.EVIDENCE_BUCKET) {
            return privateJson({ error: 'evidence_storage_unavailable' }, 503);
        }

        const evidenceId = evidenceIdFrom(path) as string;
        const authorization = new D1EvidenceAuthorization(env.OPERATIONS_DB, new D1MembershipRepository(env.OPERATIONS_DB));
        if (!await authorization.canDownload(session.userId, organizationId, evidenceId)) {
            return privateJson({ error: 'evidence_not_found' }, 404);
        }

        const evidence = await new D1EvidenceRepository(env.OPERATIONS_DB).findAvailable(organizationId, evidenceId);
        if (!evidence) {
            return privateJson({ error: 'evidence_not_found' }, 404);
        }

        const object = await env.EVIDENCE_BUCKET.get(evidence.storageKey);
        if (!object) {
            return privateJson({ error: 'evidence_not_found' }, 404);
        }

        const response = new Response(object.body, {
            headers: {
                'Content-Type': evidence.mimeType,
                'Content-Length': String(evidence.sizeBytes),
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(evidence.originalName)}`,
                'Cache-Control': 'private, no-store',
            },
        });

        return withSecurityHeaders(response);
    }

    if (request.method === 'GET' && ticketIdFrom(path)) {
        const session = await privateApiSession(request, env);
        if (!session) {
            return privateJson({ error: 'authentication_required' }, 401);
        }

        if (!env.OPERATIONS_DB) {
            return privateJson({ error: 'operational_data_unavailable' }, 503);
        }

        const ticket = await new D1SupportTicketRepository(env.OPERATIONS_DB).findForUser(session.userId, ticketIdFrom(path) as string);

        return ticket ? privateJson({ data: ticket }) : privateJson({ error: 'support_ticket_not_found' }, 404);
    }

    if (path === '/') {
        const courses = await courseRepository.listCourses();

        return withSecurityHeaders(html(renderLearningHome(courses)));
    }

    if (path === '/como-funciona') {
        return withSecurityHeaders(html(renderComoFunciona()));
    }

    if (path === '/cursos') {
        const courses = await courseRepository.listCourses();
        const category = url.searchParams.get('categoria') ?? undefined;

        return withSecurityHeaders(html(renderCourseCatalog(courses, category)));
    }

    const lessonPageMatch = path.match(/^\/cursos\/([^/]+)\/aulas\/([^/]+)$/);
    if (lessonPageMatch && lessonPageMatch[1] && lessonPageMatch[2]) {
        return withSecurityHeaders(await handleLessonDetail(lessonPageMatch[1], lessonPageMatch[2], courseRepository));
    }

    if (path.startsWith('/cursos/')) {
        const slug = path.slice('/cursos/'.length).replace(/\/$/, '');

        if (slug === '') {
            return withSecurityHeaders(html(renderCourseCatalog(await courseRepository.listCourses())));
        }

        return withSecurityHeaders(await handleCourseDetail(slug, courseRepository));
    }

    if (path === '/entrar' && request.method === 'GET') {
        if ((env.AUTH_DB && await authenticateRequest(request, env)) || (!env.AUTH_DB && await isAuthenticated(request, env))) {
            return redirect('/painel');
        }

        return withSecurityHeaders(html(renderLoginPage({ realAuthEnabled: Boolean(env.AUTH_DB) })));
    }

    if (path === '/entrar' && request.method === 'POST') {
        const form = await request.formData();
        const email = String(form.get('email') ?? '').trim().toLowerCase();
        const password = String(form.get('password') ?? '');
        const realAuthEnabled = Boolean(env.AUTH_DB);

        const realToken = await loginWithD1(email, password, env);

        if (env.AUTH_DB && !realToken) {
            return withSecurityHeaders(html(renderLoginPage({ hasError: true, realAuthEnabled }), 422));
        }

        if (!env.AUTH_DB && (email !== env.DEMO_EMAIL.toLowerCase() || password !== env.DEMO_PASSWORD)) {
            return withSecurityHeaders(html(renderLoginPage({ hasError: true, realAuthEnabled }), 422));
        }

        const token = realToken ?? await sessionToken(env.DEMO_EMAIL, env.SESSION_SECRET);
        const cookie = realToken ? sessionCookie(realToken) : `obrapro_preview=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;

        return redirect('/painel', cookie);
    }

    if (path === '/sair' && request.method === 'POST') {
        await logoutFromD1(request, env);

        return redirect('/', env.AUTH_DB ? sessionCookie('', 0) : 'obrapro_preview=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    }

    if (path === '/painel') {
        const authenticated = env.AUTH_DB
            ? await authenticateRequest(request, env)
            : await isAuthenticated(request, env);

        if (!authenticated) {
            return redirect('/entrar');
        }

        const dashboardUrl = new URL('/dashboard.html', request.url);

        return withSecurityHeaders(await env.ASSETS.fetch(new Request(dashboardUrl, request)));
    }

    if (path === '/admin') {
        const authenticated = env.AUTH_DB
            ? await authenticateRequest(request, env)
            : await isAuthenticated(request, env);

        if (!authenticated) {
            return redirect('/entrar');
        }

        return withSecurityHeaders(html(renderAdminPanel()));
    }

    if (path === '/dashboard.html') {
        return new Response('Not found', { status: 404 });
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
}

/**
 * Rotas publicas renderizadas pelo Worker (nao os assets estaticos) que devem
 * cair na pagina de erro sanitizada em vez de vazar uma excecao nao tratada
 * quando o repositorio de dados (mock hoje, D1 depois) falhar.
 */
const renderedRoutePrefixes = ['/', '/como-funciona', '/cursos', '/admin'];

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        try {
            return await route(request, env);
        } catch (error) {
            const url = new URL(request.url);
            console.error(`Falha ao processar ${url.pathname}:`, error);

            if (url.pathname.startsWith('/api/painel/')) {
                return privateJson({ error: 'internal_error' }, 500);
            }

            if (renderedRoutePrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
                return withSecurityHeaders(html(renderServerError(url.pathname), 500));
            }

            return withSecurityHeaders(new Response('Erro interno', { status: 500 }));
        }
    },
};
