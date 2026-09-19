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

export function loginPage(hasError = false): string {
    const error = hasError
        ? '<p class="error" role="alert">Nao foi possivel entrar com esses dados.</p>'
        : '';

    return `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Entrar | ObraPro</title>
    <style>
        *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f7f6;color:#10233f;font-family:Arial,sans-serif}.panel{width:min(100%,420px);border:1px solid #d9e0dd;background:#fff;padding:28px;border-radius:8px;box-shadow:0 18px 50px #10233f14}.brand{display:flex;align-items:center;gap:12px;font-size:22px;font-weight:900}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:6px;background:#f47b20}h1{margin:28px 0 6px;font-size:28px}p{color:#60706a;line-height:1.5}.field{display:grid;gap:7px;margin-top:18px}label{font-size:14px;font-weight:700}input{width:100%;min-height:48px;border:1px solid #b9c5c0;border-radius:6px;padding:0 13px;font-size:16px}button{width:100%;min-height:50px;margin-top:22px;border:0;border-radius:6px;background:#176b4d;color:#fff;font-size:16px;font-weight:800;cursor:pointer}.error{padding:10px;border-radius:6px;background:#fff1f0;color:#a92c22;font-size:14px}.note{margin-top:18px;font-size:12px;text-align:center}
    </style>
</head>
<body><main class="panel"><div class="brand"><span class="mark">⛑</span>ObraPro</div><h1>Acesso de demonstração</h1><p>Entre para visualizar o painel administrativo do mockup.</p>${error}<form method="POST" action="/entrar"><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="username" required></div><div class="field"><label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="current-password" required></div><button type="submit">Entrar</button></form><p class="note">Ambiente de demonstração. Não utilize credenciais pessoais.</p></main></body>
</html>`;
}
