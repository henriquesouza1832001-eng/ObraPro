import { describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import worker from './index';
import { hashPassword } from './auth/password';
import { renderLessonDetail } from './pages/lesson';
import type { Course } from './data/course';

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

function createFakeOperationsDatabase(): NonNullable<Env['OPERATIONS_DB']> {
    return {
        prepare(sql: string) {
            const bound = { args: [] as unknown[] };

            const api = {
                bind: (...args: unknown[]) => {
                    bound.args = args;

                    return api;
                },
                all: async <T>(): Promise<D1Result<T>> => {
                    if (sql.includes('INNER JOIN organizations')) {
                        return {
                            results: [{ id: 'org-1', name: 'Residencial das Flores', slug: 'residencial-das-flores', role: 'owner' }] as T[],
                            success: true,
                            meta: {} as D1Meta & Record<string, unknown>,
                        };
                    }

                    if (sql.includes('JOIN procedure_steps')) {
                        const [executionId] = bound.args as [string];

                        return (executionId === 'execution-1' ? {
                            results: [
                                { id: 'execution-step-1', procedure_step_id: 'procedure-step-1', status: 'pending', note: null, completed_at: null, position: 1, title: 'Preparar area', instruction: 'Limpe e nivele a base.', safety_note: 'Use luvas.', when_to_call_professional: null, materials_json: '["Nivel","Colher de pedreiro"]' },
                                { id: 'execution-step-2', procedure_step_id: 'procedure-step-2', status: 'pending', note: null, completed_at: null, position: 2, title: 'Assentar primeira fiada', instruction: 'Alinhe os blocos com o fio de nylon.', safety_note: null, when_to_call_professional: 'Se a parede sair fora de prumo.', materials_json: null },
                            ] as T[],
                            success: true,
                            meta: {} as D1Meta & Record<string, unknown>,
                        } : { results: [] as T[], success: true, meta: {} as D1Meta & Record<string, unknown> });
                    }

                    if (sql.includes('FROM works')) {
                        return {
                            results: [{
                                id: 'work-1',
                                organization_id: String(bound.args[0]),
                                name: 'Residencial das Flores',
                                slug: 'residencial-das-flores',
                                status: 'active',
                                city: 'Belo Horizonte',
                                state: 'MG',
                                planned_start_at: null,
                                planned_end_at: null,
                            }] as T[],
                            success: true,
                            meta: {} as D1Meta & Record<string, unknown>,
                        };
                    }

                    return { results: [], success: true, meta: {} as D1Meta & Record<string, unknown> };
                },
                first: async <T>(): Promise<T | null> => {
                    if (sql.includes('FROM organization_memberships')) {
                        const [userId, organizationId] = bound.args as [string, string];

                        return (userId === 'user-1' && organizationId === 'org-1' ? { id: 'membership-1' } : null) as T | null;
                    }

                    if (sql.includes('FROM execution_steps')) {
                        const [executionStepId, organizationId] = bound.args as [string, string];

                        return (executionStepId === 'execution-step-1' && organizationId === 'org-1' ? { id: executionStepId } : null) as T | null;
                    }

                    if (sql.includes('FROM executions')) {
                        const [executionId, organizationId] = bound.args as [string, string];
                        const executions: Record<string, { organization_id: string; work_id: string; procedure_id: string; started_by: string }> = {
                            'execution-1': { organization_id: 'org-1', work_id: 'work-1', procedure_id: 'procedure-1', started_by: 'user-1' },
                            'execution-2': { organization_id: 'org-2', work_id: 'work-2', procedure_id: 'procedure-2', started_by: 'user-2' },
                        };
                        const execution = executions[executionId];

                        return (execution && execution.organization_id === organizationId ? {
                            id: executionId,
                            organization_id: execution.organization_id,
                            work_id: execution.work_id,
                            procedure_id: execution.procedure_id,
                            started_by: execution.started_by,
                            status: 'in_progress',
                            started_at: '2026-09-20T08:00:00.000Z',
                            completed_at: null,
                        } : null) as T | null;
                    }

                    return null;
                },
                run: async () => ({}),
            };

            return api;
        },
    } as unknown as NonNullable<Env['OPERATIONS_DB']>;
}

function createFakeEvidenceBucket(): NonNullable<Env['EVIDENCE_BUCKET']> {
    const objects = new Map<string, Uint8Array>();

    return {
        put: async (key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null) => {
            if (value instanceof Uint8Array) {
                objects.set(key, value);
            }

            return null;
        },
        get: async (key: string) => {
            const object = objects.get(key);

            return object ? { body: new Blob([object]).stream() } : null;
        },
        delete: async (key: string) => { objects.delete(key); },
    } as unknown as NonNullable<Env['EVIDENCE_BUCKET']>;
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
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('/api/cursos/progresso?limit=6');
        expect(body).toContain('id="continue-section" hidden');
    });

    it('GET /health retorna status ok em JSON', async () => {
        const response = await worker.fetch(get('/health'), baseEnv());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toContain('application/json');
        expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
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
        expect(body).toContain('cursos encontrados');
    });

    it('GET /cursos aplica busca editorial sem expor cursos fora do resultado', async () => {
        const response = await worker.fetch(get('/cursos?busca=planejamento'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('1 curso encontrado');
        expect(body).toContain('planejamento-da-obra');
        expect(body).not.toContain('fundacoes-seguras');
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

    it('GET /cursos/:slug/aulas/:lessonId valido retorna 200 com a pagina da aula', async () => {
        const response = await worker.fetch(get('/cursos/planejamento-da-obra/aulas/mock-lesson-1-1'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('O que você precisa saber');
        expect(body).toContain('var lessonId = "mock-lesson-1-1"');
    });

    it('GET /cursos/:slug/aulas/:lessonId com aula inexistente retorna 404 real', async () => {
        const response = await worker.fetch(get('/cursos/planejamento-da-obra/aulas/aula-que-nao-existe'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(404);
        expect(body).toContain('Aula não encontrada');
    });

    it('renderLessonDetail escapa titulos/metadados vindos de dados reais (curso, aula, modulo, navegacao) para evitar XSS armazenado', () => {
        const maliciousCourse: Course = {
            slug: 'curso-teste',
            category: 'Teste',
            title: '<script>alert(1)</script>',
            description: 'desc',
            accessType: 'free',
            priceCents: null,
            modulesCount: 1,
            durationMinutes: 10,
        };
        const maliciousLesson = { moduleTitle: '<img src=x onerror=alert(2)>', id: 'l1', title: '"><script>alert(3)</script>', durationMinutes: 5 };
        const maliciousPrev = { moduleTitle: 'm', id: 'l0', title: '<b>prev</b>', durationMinutes: 5 };
        const maliciousNext = { moduleTitle: 'm', id: 'l2', title: '<b>next</b>', durationMinutes: 5 };

        const html = renderLessonDetail(maliciousCourse, maliciousLesson, maliciousPrev, maliciousNext);

        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).not.toContain('<img src=x onerror=alert(2)>');
        expect(html).not.toContain('"><script>alert(3)</script>');
        expect(html).not.toContain('<b>prev</b>');
        expect(html).not.toContain('<b>next</b>');
        expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('GET /cursos/:slug/aulas/:lessonId com curso inexistente retorna 404 real', async () => {
        const response = await worker.fetch(get('/cursos/slug-que-nao-existe/aulas/mock-lesson-1-1'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(404);
        expect(body).toContain('Curso não encontrado');
    });

    it('todas as respostas renderizadas trazem os headers de seguranca minimos', async () => {
        const response = await worker.fetch(get('/cursos'), baseEnv());

        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
        expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
        expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
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

    it('GET / com D1 falhando tambem retorna 500 sanitizado (home usa o catalogo real)', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const brokenDatabase = {
            prepare: () => {
                throw new Error('falha interna de banco');
            },
        } as unknown as NonNullable<Env['COURSES_DB']>;

        const response = await worker.fetch(get('/'), baseEnv({ COURSES_DB: brokenDatabase }));
        const body = await response.text();

        expect(response.status).toBe(500);
        expect(body).not.toContain('falha interna de banco');

        consoleErrorSpy.mockRestore();
    });

    it('rotas independentes do repositorio continuam funcionando durante a falha do D1', async () => {
        const brokenDatabase = {
            prepare: () => {
                throw new Error('falha interna de banco');
            },
        } as unknown as NonNullable<Env['COURSES_DB']>;
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const [health, comoFunciona] = await Promise.all([
            worker.fetch(get('/health'), baseEnv({ COURSES_DB: brokenDatabase })),
            worker.fetch(get('/como-funciona'), baseEnv({ COURSES_DB: brokenDatabase })),
        ]);

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

    it('GET /admin com sessao valida retorna o painel administrativo; sem sessao redireciona para /entrar', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });

        const loginResponse = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);
        const cookie = cookieFromSetCookie(loginResponse);

        const semSessao = await worker.fetch(get('/admin'), env);

        expect(semSessao.status).toBe(303);
        expect(semSessao.headers.get('Location')).toBe('/entrar');

        const comSessao = await worker.fetch(new Request('https://obrapro.test/admin', { headers: { Cookie: cookie } }), env);
        const body = await comSessao.text();

        expect(comSessao.status).toBe(200);
        expect(body).toContain('Painel administrativo');
        expect(body).toContain('/api/admin/catalogo');
        expect(body).toContain('Conteúdo editorial de aula');
        expect(body).toContain("'/api/admin/aulas/' + encodeURIComponent(lessonId) + '/conteudo'");
        expect(body).toContain('id="lesson-content-select"');
        expect(body).not.toContain('id="lesson-content-id"');
    });

    it('GET /certificados com sessao valida mostra o estado bloqueado com os criterios; sem sessao redireciona para /entrar', async () => {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });

        const loginResponse = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);
        const cookie = cookieFromSetCookie(loginResponse);

        const semSessao = await worker.fetch(get('/certificados'), env);

        expect(semSessao.status).toBe(303);
        expect(semSessao.headers.get('Location')).toBe('/entrar');

        const comSessao = await worker.fetch(new Request('https://obrapro.test/certificados', { headers: { Cookie: cookie } }), env);
        const body = await comSessao.text();

        expect(comSessao.status).toBe(200);
        expect(body).toContain('Meus certificados');
        expect(body).toContain('Concluir 100% das aulas do curso');
        expect(body).toContain('Nota mínima de 75%');
        expect(body).toContain("fetch('/api/certificados'");
        expect(body).not.toContain('QR');
    });

    it('GET /certificados/verificar/:codigo renderiza a pagina publica de verificacao sem exigir sessao', async () => {
        const response = await worker.fetch(get('/certificados/verificar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), baseEnv());
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toContain('Verificando certificado');
        expect(body).toContain("fetch('/api/certificados/verificar/' + encodeURIComponent(code))");
        expect(body).toContain('id="cert-print"');
        expect(body).toContain('Copiar link de verificação');
        expect(body).toContain('id="cert-revoked-banner"');
        expect(body).toContain('não é um arquivo protegido nem tem marca d\'água própria');
        expect(body).not.toContain('QR');
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

describe('API operacional por tenant', () => {
    async function authenticatedEnv(): Promise<{ env: Env; cookie: string }> {
        const authDb = createFakeAuthDatabase({ id: 'user-1', name: 'Ana', email: 'ana@example.com', passwordHash: await hashPassword('senha-super-secreta') });
        const env = baseEnv({ AUTH_DB: authDb, OPERATIONS_DB: createFakeOperationsDatabase() });
        const form = new URLSearchParams({ email: 'ana@example.com', password: 'senha-super-secreta' });
        const loginResponse = await worker.fetch(new Request('https://obrapro.test/entrar', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), env);

        return { env, cookie: cookieFromSetCookie(loginResponse) };
    }

    it('bloqueia anônimo e nunca permite cache de resposta privada', async () => {
        const response = await worker.fetch(get('/api/painel/organizacoes'), baseEnv());

        expect(response.status).toBe(401);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toEqual({ error: 'authentication_required' });
    });

    it.each([
        '/api/painel/procedimentos?organization_id=org-1',
        '/api/painel/procedimentos/procedure-1?organization_id=org-1',
        '/api/painel/checklists?organization_id=org-1',
        '/api/painel/checklists/checklist-1?organization_id=org-1',
        '/api/painel/execucoes',
        '/api/painel/execucoes/execution-1?organization_id=org-1',
        '/api/painel/execucoes/execution-1/etapas/step-1?organization_id=org-1',
    ])('bloqueia anonimo na rota operacional %s', async (path) => {
        const method = path === '/api/painel/execucoes' ? 'POST' : path.includes('/etapas/') ? 'PATCH' : 'GET';
        const response = await worker.fetch(new Request(`https://obrapro.test${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'GET' ? undefined : JSON.stringify({ status: 'completed' }),
        }), baseEnv());

        expect(response.status).toBe(401);
    });

    it('lista somente organizacoes ativas e obras do tenant autorizado', async () => {
        const { env, cookie } = await authenticatedEnv();
        const organizationsResponse = await worker.fetch(new Request('https://obrapro.test/api/painel/organizacoes', { headers: { Cookie: cookie } }), env);
        const worksResponse = await worker.fetch(new Request('https://obrapro.test/api/painel/obras?organization_id=org-1', { headers: { Cookie: cookie } }), env);

        await expect(organizationsResponse.json()).resolves.toEqual({ data: [{ id: 'org-1', name: 'Residencial das Flores', slug: 'residencial-das-flores', role: 'owner' }] });
        await expect(worksResponse.json()).resolves.toMatchObject({ data: [{ id: 'work-1', organizationId: 'org-1', status: 'active' }] });
    });

    it('nega leitura de obras quando o usuario troca o organization_id', async () => {
        const { env, cookie } = await authenticatedEnv();
        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/obras?organization_id=org-2', { headers: { Cookie: cookie } }), env);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'organization_access_denied' });
    });

    it('sanitiza falha inesperada da API privada e preserva no-store', async () => {
        const { env, cookie } = await authenticatedEnv();
        const brokenOperationsDatabase = {
            prepare: () => { throw new Error('falha interna do banco'); },
        } as unknown as NonNullable<Env['OPERATIONS_DB']>;
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/organizacoes', { headers: { Cookie: cookie } }), {
            ...env,
            OPERATIONS_DB: brokenOperationsDatabase,
        });

        expect(response.status).toBe(500);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toEqual({ error: 'internal_error' });

        consoleErrorSpy.mockRestore();
    });

    it('abre chamado com contexto sanitizado e bloqueia organizacao de outro tenant', async () => {
        const { env, cookie } = await authenticatedEnv();
        const accepted = await worker.fetch(new Request('https://obrapro.test/api/painel/suporte/chamados', {
            method: 'POST',
            headers: { Cookie: cookie, 'Content-Type': 'application/json', 'User-Agent': 'ObraPro test' },
            body: JSON.stringify({
                organization_id: 'org-1',
                title: 'Botao nao responde',
                description: 'O checklist nao abriu.',
                category: 'bug',
                priority: 'normal',
                password: 'nao pode persistir',
            }),
        }), env);
        const denied = await worker.fetch(new Request('https://obrapro.test/api/painel/suporte/chamados', {
            method: 'POST',
            headers: { Cookie: cookie, 'Content-Type': 'application/json' },
            body: JSON.stringify({ organization_id: 'org-2', title: 'Erro', description: 'Erro', category: 'bug', priority: 'normal' }),
        }), env);

        expect(accepted.status).toBe(201);
        expect(accepted.headers.get('Cache-Control')).toBe('no-store');
        await expect(accepted.json()).resolves.toMatchObject({ data: { status: 'open' } });
        expect(denied.status).toBe(403);
    });

    it('consulta execucao com etapas ordenadas para o tenant autorizado', async () => {
        const { env, cookie } = await authenticatedEnv();
        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/execucoes/execution-1?organization_id=org-1', { headers: { Cookie: cookie } }), env);

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toMatchObject({
            data: {
                id: 'execution-1',
                organizationId: 'org-1',
                status: 'in_progress',
                steps: [
                    { id: 'execution-step-1', position: 1, title: 'Preparar area', status: 'pending' },
                    { id: 'execution-step-2', position: 2, title: 'Assentar primeira fiada', status: 'pending' },
                ],
            },
        });
    });

    it('nao distingue execucao inexistente de acesso negado (evita vazar existencia do ID)', async () => {
        const { env, cookie } = await authenticatedEnv();
        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/execucoes/execucao-inexistente?organization_id=org-1', { headers: { Cookie: cookie } }), env);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'execution_access_denied' });
    });

    it('bloqueia consulta de execucao de outro tenant', async () => {
        const { env, cookie } = await authenticatedEnv();
        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/execucoes/execution-2?organization_id=org-1', { headers: { Cookie: cookie } }), env);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'execution_access_denied' });
    });

    it('aceita evidencia PNG somente para etapa do tenant ativo', async () => {
        const { env, cookie } = await authenticatedEnv();
        const form = new FormData();
        form.set('organization_id', 'org-1');
        form.set('execution_step_id', 'execution-step-1');
        form.set('file', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])], 'parede.png', { type: 'image/png' }));

        const response = await worker.fetch(new Request('https://obrapro.test/api/painel/evidencias', {
            method: 'POST',
            headers: { Cookie: cookie },
            body: form,
        }), { ...env, EVIDENCE_BUCKET: createFakeEvidenceBucket() });

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ data: { status: 'available' } });
    });
});

describe('contratos de quiz e certificado', () => {
    it('rejeita mutacao API cross-site antes de qualquer escrita', async () => {
        const response = await worker.fetch(new Request('https://obrapro.test/api/certificados', {
            method: 'POST',
            headers: { Origin: 'https://atacante.test', 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        }), baseEnv());

        expect(response.status).toBe(403);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toEqual({ error: 'csrf_rejected' });
    });

    it.each([
        '/api/cursos/planejamento-da-obra/quiz',
        '/api/certificados',
        '/api/admin/certificados/certificate-1/revogacao',
    ])('exige sessao para %s', async (path) => {
        const response = await worker.fetch(new Request(`https://obrapro.test${path}`, {
            method: path.includes('/revogacao') ? 'PATCH' : 'GET',
            headers: path.includes('/revogacao') ? { 'Content-Type': 'application/json' } : undefined,
            body: path.includes('/revogacao') ? JSON.stringify({ revoked: true }) : undefined,
        }), baseEnv());

        expect(response.status).toBe(401);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toEqual({ error: 'authentication_required' });
    });

    it('mantem a verificacao publica sob contrato mesmo sem o banco de cursos', async () => {
        const response = await worker.fetch(get('/api/certificados/verificar/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), baseEnv());

        expect(response.status).toBe(503);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
});
