import type { Env } from '../env';
import { D1SessionStore } from './sessionStore';

/**
 * `auth/realSession.ts` (Codex) expoe apenas `authenticateRequest` -> boolean,
 * sem o `userId` da sessao. Rotas que precisam saber QUEM esta autenticado
 * (ex.: anexar um chamado de suporte ao usuario certo) usam este helper, que
 * consome o `D1SessionStore` ja publicado pelo Codex em vez de duplicar
 * logica de autenticacao. O nome do cookie precisa ficar em sincronia com
 * `realSession.ts` ("obrapro_session"); nao ha logica de autorizacao aqui,
 * apenas leitura de uma sessao ja validada pelo Codex.
 */
const cookieName = 'obrapro_session';

function cookieValue(request: Request): string | null {
    const match = (request.headers.get('Cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));

    return match?.[1] ?? null;
}

export async function getAuthenticatedUserId(request: Request, env: Env): Promise<string | null> {
    if (!env.AUTH_DB) {
        return null;
    }

    const token = cookieValue(request);

    if (!token) {
        return null;
    }

    const session = await new D1SessionStore(env.AUTH_DB).find(token, new Date().toISOString());

    return session?.userId ?? null;
}
