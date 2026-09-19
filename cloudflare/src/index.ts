import type { Env } from './env';
import { withSecurityHeaders, redirect } from './http/security';
import { isAuthenticated, loginPage, sessionToken } from './auth/demoSession';
import { MockCourseRepository, courseModules } from './data/mockCourseRepository';
import type { CourseRepository } from './data/course';
import { renderCourseCatalog, renderCourseDetail, renderCourseNotFound } from './pages/courses';
import { renderComoFunciona } from './pages/comoFunciona';

const courseRepository: CourseRepository = new MockCourseRepository();

function html(body: string, status = 200): Response {
    return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=UTF-8' } });
}

async function handleCourseDetail(slug: string): Promise<Response> {
    const course = await courseRepository.findCourseBySlug(slug);

    if (!course) {
        return html(renderCourseNotFound(), 404);
    }

    return html(renderCourseDetail(course, courseModules()));
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
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

            return withSecurityHeaders(await handleCourseDetail(slug));
        }

        if (path === '/entrar' && request.method === 'GET') {
            if (await isAuthenticated(request, env)) {
                return redirect('/painel');
            }

            return withSecurityHeaders(html(loginPage()));
        }

        if (path === '/entrar' && request.method === 'POST') {
            const form = await request.formData();
            const email = String(form.get('email') ?? '').trim().toLowerCase();
            const password = String(form.get('password') ?? '');

            if (email !== env.DEMO_EMAIL.toLowerCase() || password !== env.DEMO_PASSWORD) {
                return withSecurityHeaders(html(loginPage(true), 422));
            }

            const token = await sessionToken(env.DEMO_EMAIL, env.SESSION_SECRET);

            return redirect('/painel', `obrapro_preview=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
        }

        if (path === '/sair' && request.method === 'POST') {
            return redirect('/', 'obrapro_preview=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
        }

        if (path === '/painel') {
            if (!await isAuthenticated(request, env)) {
                return redirect('/entrar');
            }

            const dashboardUrl = new URL('/dashboard.html', request.url);

            return withSecurityHeaders(await env.ASSETS.fetch(new Request(dashboardUrl, request)));
        }

        if (path === '/dashboard.html') {
            return new Response('Not found', { status: 404 });
        }

        return withSecurityHeaders(await env.ASSETS.fetch(request));
    },
};
