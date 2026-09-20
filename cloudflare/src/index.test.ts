import { describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import worker from './index';
import { hashPassword } from './auth/password';

interface FakeSessionRow {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
    revoked_at: string | null;
    created_at: string;
    last_seen_at: string;
}

/**
 * D1Database minimo o bastante para exercitar userRepository.ts e sessionStore.ts
 * (do Codex) atraves das rotas publicas /entrar, /painel e /sair (deste arquivo).
 * Nao reimplementa a logica deles; apenas guarda linhas em memoria para as
 * mesmas consultas SQL que o codigo real ja executa.
 */
function createFakeAuthDatabase(user: { id: string; name: string; email: string; passwordHash: string }): NonNullable<Env['AUTH_DB']> {
    const sessions = new Map<string, FakeSessionRow>();

    return {
        prepare(sql: string) {
            const bound = { args: [] as unknown[] };

            const api = {
                bind: (...args: unknown[]) => {
                    bound.args = args;

                    return api;
                },
                first: async <T>(): Promise<T | null> => {
                    if (sql.includes('FROM users')) {
                        const [email] = bound.args as [string];

                        return (email === user.email ? { id: user.id, name: user.name, email: user.email, password_hash: user.passwordHash, is_super_admin: 0 } : null) as T | null;
                    }

                    if (sql.includes('FROM auth_sessions')) {
                        const [tokenHash, now] = bound.args as [string, string];
                        const row = sessions.get(tokenHash);

                        if (!row || row.revoked_at || row.expires_at <= now) {
                            return null;
                        }

                        return row as unknown as T;
                    }

                    return null;
                },
                run: async () => {
                    if (sql.includes('INSERT INTO auth_sessions')) {
                        const [id, userId, tokenHash, expiresAt, now] = bound.args as [string, string, string, string, string, string];

                        sessions.set(tokenHash, { id, user_id: userId, token_hash: tokenHash, expires_at: expiresAt, revoked_at: null, created_at: now, last_seen_at: now });
                    }

                    if (sql.includes('UPDATE auth_sessions SET revoked_at')) {
                        const [now, , tokenHash] = bound.args as [string, string, string];
                        const row = sessions.get(tokenHash);

                        if (row) {
                            row.revoked_at = now;
                        }
                    }

                    if (sql.includes('UPDATE auth_sessions SET last_seen_at')) {
                        for (const row of sessions.values()) {
                            row.last_seen_at = String(bound.args[0]);
                        }
                    }

                    return {} as unknown;
                },
            };

            return api;
        },
    } as unknown as NonNullable<Env['AUTH_DB']>;
}

function cookieFromSetCookie(response: Response): string {
    const setCookie = response.headers.get('Set-Cookie') ?? '';

    return setCookie.split(';')[0] ?? '';
}

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

describe('login/logout real via D1 (CF3-C1/C2)', () => {
    it('GET /entrar sem binding AUTH_DB mostra a tela de demonstracao', async () => {
        const response = await worker.fetch(get('/entrar'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('Acesso de demonstração');
    });

    it('GET /entrar com binding AUTH_DB mostra a tela real, sem o aviso de demonstracao', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const response = await worker.fetch(get('/entrar'), baseEnv({ AUTH_DB: authDb }));
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('Entrar no ObraPro');
        expect(body).not.toContain('Ambiente de demonstração');
    });

    it('POST /entrar com credenciais corretas autentica, define cookie de sessao e redireciona para /painel', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });

        const response = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);

        expect(response.status).toBe(303);
        expect(response.headers.get('Location')).toBe('/painel');
        expect(response.headers.get('Set-Cookie')).toContain('obrapro_session=');
        expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    });

    it('POST /entrar com senha incorreta retorna 422 com mensagem generica e acessivel, sem cookie de sessao', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-errada' });

        const response = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), baseEnv({ AUTH_DB: authDb }));
        const body = await response.text();

        expect(response.status).toBe(422);
        expect(response.headers.get('Set-Cookie')).toBeNull();
        expect(body).toContain('role="alert"');
        expect(body).toContain('Não foi possível entrar com esses dados.');
    });

    it('GET /painel com sessao valida retorna o painel; sem sessao redireciona para /entrar', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });

        const loginResponse = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);
        const cookie = cookieFromSetCookie(loginResponse);

        const semSessao = await worker.fetch(get('/painel'), env);

        expect(semSessao.status).toBe(303);
        expect(semSessao.headers.get('Location')).toBe('/entrar');

        const comSessao = await worker.fetch(new Request('https://obrapro.test/painel', { headers: { Cookie: cookie } }), env);

        expect(comSessao.status).toBe(200);
    });

    it('POST /sair revoga a sessao: acessar /painel depois com o mesmo cookie volta a exigir login', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });

        const loginResponse = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);
        const cookie = cookieFromSetCookie(loginResponse);

        await worker.fetch(new Request('https://obrapro.test/sair', { method: 'POST', headers: { Cookie: cookie } }), env);

        const depoisDoLogout = await worker.fetch(new Request('https://obrapro.test/painel', { headers: { Cookie: cookie } }), env);

        expect(depoisDoLogout.status).toBe(303);
        expect(depoisDoLogout.headers.get('Location')).toBe('/entrar');
    });
});
