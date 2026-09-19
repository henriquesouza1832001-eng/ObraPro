const encoder = new TextEncoder();

function securityHeaders(response) {
    const secured = new Response(response.body, response);
    secured.headers.set('X-Content-Type-Options', 'nosniff');
    secured.headers.set('X-Frame-Options', 'DENY');
    secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    secured.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return secured;
}

function redirect(location, cookie = null) {
    const headers = { Location: location };

    if (cookie) {
        headers['Set-Cookie'] = cookie;
    }

    return new Response(null, { status: 303, headers });
}

async function sessionToken(email, secret) {
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

async function isAuthenticated(request, env) {
    const cookie = request.headers.get('Cookie') ?? '';
    const match = cookie.match(/(?:^|;\s*)obrapro_preview=([a-f0-9]{64})(?:;|$)/);

    if (!match) {
        return false;
    }

    return match[1] === await sessionToken(env.DEMO_EMAIL, env.SESSION_SECRET);
}

function loginPage(hasError = false) {
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

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/') {
            const homeUrl = new URL('/index.html', request.url);

            return securityHeaders(await env.ASSETS.fetch(new Request(homeUrl, request)));
        }

        if (url.pathname === '/cursos' || url.pathname.startsWith('/cursos/')) {
            const coursesUrl = new URL('/courses.html', request.url);

            return securityHeaders(await env.ASSETS.fetch(new Request(coursesUrl, request)));
        }

        if (url.pathname === '/entrar' && request.method === 'GET') {
            if (await isAuthenticated(request, env)) {
                return redirect('/painel');
            }

            return securityHeaders(new Response(loginPage(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }));
        }

        if (url.pathname === '/entrar' && request.method === 'POST') {
            const form = await request.formData();
            const email = String(form.get('email') ?? '').trim().toLowerCase();
            const password = String(form.get('password') ?? '');

            if (email !== env.DEMO_EMAIL.toLowerCase() || password !== env.DEMO_PASSWORD) {
                return securityHeaders(new Response(loginPage(true), {
                    status: 422,
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
                }));
            }

            const token = await sessionToken(env.DEMO_EMAIL, env.SESSION_SECRET);

            return redirect('/painel', `obrapro_preview=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
        }

        if (url.pathname === '/sair' && request.method === 'POST') {
            return redirect('/', 'obrapro_preview=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
        }

        if (url.pathname === '/painel') {
            if (! await isAuthenticated(request, env)) {
                return redirect('/entrar');
            }

            const dashboardUrl = new URL('/dashboard.html', request.url);

            return securityHeaders(await env.ASSETS.fetch(new Request(dashboardUrl, request)));
        }

        if (url.pathname === '/dashboard.html') {
            return new Response('Not found', { status: 404 });
        }

        return securityHeaders(await env.ASSETS.fetch(request));
    },
};
