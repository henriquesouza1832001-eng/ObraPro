import type { Env } from './env';
import { withSecurityHeaders, redirect } from './http/security';
import { isAuthenticated, sessionToken } from './auth/demoSession';
import { renderLoginPage } from './pages/login';
import { MockCourseRepository, courseModules } from './data/mockCourseRepository';
import { D1CourseRepository } from './data/d1CourseRepository';
import { authenticateRequest, loginWithD1, logoutFromD1, sessionCookie } from './auth/realSession';
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

async function handleCourseDetail(slug: string, courseRepository: CourseRepository): Promise<Response> {
    const course = await courseRepository.findCourseBySlug(slug);

    if (!course) {
        return html(renderCourseNotFound(), 404);
    }

    return html(renderCourseDetail(course, courseModules()));
}

async function route(request: Request, env: Env): Promise<Response> {
    const courseRepository = courseRepositoryFor(env);
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
        return json({ status: 'ok', service: 'obrapro-worker' });
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

            if (renderedRoutePrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
                return withSecurityHeaders(html(renderServerError(url.pathname), 500));
            }

            return withSecurityHeaders(new Response('Erro interno', { status: 500 }));
        }
    },
};
