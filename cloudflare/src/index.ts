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
import { renderComoFunciona } from './pages/comoFunciona';
import { renderServerError } from './pages/serverError';

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

async function handleCourseDetail(slug: string, courseRepository: CourseRepository): Promise<Response> {
    const course = await courseRepository.findCourseBySlug(slug);

    if (!course) {
        return html(renderCourseNotFound(), 404);
    }

    return html(renderCourseDetail(course, await courseRepository.findModulesByCourseSlug(slug)));
}

async function route(request: Request, env: Env): Promise<Response> {
    const courseRepository = courseRepositoryFor(env);
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
        return json({ status: 'ok', service: 'obrapro-worker' });
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
        const homeUrl = new URL('/index.html', request.url);

        return withSecurityHeaders(await env.ASSETS.fetch(new Request(homeUrl, request)));
    }

    if (path === '/como-funciona') {
        return withSecurityHeaders(html(renderComoFunciona()));
    }

    if (path === '/cursos') {
        const courses = await courseRepository.listCourses();

        return withSecurityHeaders(html(renderCourseCatalog(courses)));
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
const renderedRoutePrefixes = ['/como-funciona', '/cursos'];

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
