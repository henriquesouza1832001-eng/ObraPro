import { describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import worker from './index';

function baseEnv(overrides: Partial<Env> = {}): Env {
    return {
        ASSETS: {
            fetch: async (input: RequestInfo | URL) => {
                const url = new URL(input instanceof Request ? input.url : input.toString());

                if (url.pathname === '/dashboard.html') {
                    return new Response('<html>painel</html>', { headers: { 'Content-Type': 'text/html' } });
                }

                return new Response(`<html>${url.pathname}</html>`, { headers: { 'Content-Type': 'text/html' } });
            },
        } as unknown as Env['ASSETS'],
        DEMO_EMAIL: 'demo@example.com',
        DEMO_PASSWORD: 'demo-password',
        SESSION_SECRET: 'test-secret',
        ...overrides,
    };
}

function get(path: string): Request {
    return new Request(`https://obrapro.test${path}`);
}

describe('rotas publicas do Worker', () => {
    it('GET / retorna 200 servindo o shell publico', async () => {
        const response = await worker.fetch(get('/'), baseEnv());

        expect(response.status).toBe(200);
    });

    it('GET /health retorna status ok em JSON', async () => {
        const response = await worker.fetch(get('/health'), baseEnv());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toContain('application/json');
        expect(body).toEqual({ status: 'ok', service: 'obrapro-worker' });
    });

    it('GET /como-funciona retorna 200 com conteudo editorial', async () => {
        const response = await worker.fetch(get('/como-funciona'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('Como funciona');
    });

    it('GET /cursos lista o catalogo mockado quando nao ha binding D1', async () => {
        const response = await worker.fetch(get('/cursos'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('cursos publicados');
    });

    it('GET /cursos/:slug valido retorna 200 com o detalhe do curso', async () => {
        const response = await worker.fetch(get('/cursos/planejamento-da-obra'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('Planejamento da obra do zero');
    });

    it('GET /cursos/:slug inexistente retorna 404 real, sem redirecionar para a home', async () => {
        const response = await worker.fetch(get('/cursos/slug-que-nao-existe'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(404);
        expect(response.headers.get('Location')).toBeNull();
        expect(body).toContain('Curso não encontrado');
    });

    it('todas as respostas renderizadas trazem os headers de seguranca minimos', async () => {
        const response = await worker.fetch(get('/cursos'), baseEnv());

        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });
});

describe('falha do repositorio de cursos (D1 indisponivel)', () => {
    it('GET /cursos com D1 falhando retorna 500 sanitizado, sem vazar detalhe interno', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const brokenDatabase = {
            prepare: () => {
                throw new Error('falha interna de banco - nao deve aparecer na resposta');
            },
        } as unknown as NonNullable<Env['COURSES_DB']>;

        const response = await worker.fetch(get('/cursos'), baseEnv({ COURSES_DB: brokenDatabase }));
        const body = await response.text();

        expect(response.status).toBe(500);
        expect(body).not.toContain('falha interna de banco');
        expect(body).not.toContain('Error:');
        expect(body).toContain('Não foi possível carregar');

        consoleErrorSpy.mockRestore();
    });

    it('GET /cursos/:slug com D1 falhando tambem retorna 500 sanitizado', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const brokenDatabase = {
            prepare: () => {
                throw new Error('falha interna de banco');
            },
        } as unknown as NonNullable<Env['COURSES_DB']>;

        const response = await worker.fetch(get('/cursos/planejamento-da-obra'), baseEnv({ COURSES_DB: brokenDatabase }));

        expect(response.status).toBe(500);

        consoleErrorSpy.mockRestore();
    });

    it('rotas independentes do repositorio continuam funcionando durante a falha do D1', async () => {
        const brokenDatabase = {
            prepare: () => {
                throw new Error('falha interna de banco');
            },
        } as unknown as NonNullable<Env['COURSES_DB']>;
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const [home, health, comoFunciona] = await Promise.all([
            worker.fetch(get('/'), baseEnv({ COURSES_DB: brokenDatabase })),
            worker.fetch(get('/health'), baseEnv({ COURSES_DB: brokenDatabase })),
            worker.fetch(get('/como-funciona'), baseEnv({ COURSES_DB: brokenDatabase })),
        ]);

        expect(home.status).toBe(200);
        expect(health.status).toBe(200);
        expect(comoFunciona.status).toBe(200);

        consoleErrorSpy.mockRestore();
    });
});
