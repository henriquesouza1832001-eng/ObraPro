import type { Env } from '../env';

/**
 * Sessao de demonstracao do painel do mockup. Nao e autenticacao real:
 * serve apenas para o preview publico navegar pelo painel administrativo.
 */

const encoder = new TextEncoder();

export async function sessionToken(email: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(email));

    return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
    const cookie = request.headers.get('Cookie') ?? '';
    const match = cookie.match(/(?:^|;\s*)obrapro_preview=([a-f0-9]{64})(?:;|$)/);

    if (!match) {
        return false;
    }

    return match[1] === await sessionToken(env.DEMO_EMAIL, env.SESSION_SECRET);
}
