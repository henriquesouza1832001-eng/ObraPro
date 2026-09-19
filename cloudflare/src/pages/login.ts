/**
 * Tela de login/cadastro do Worker (card CF3-C1/C2).
 *
 * A pagina e puramente visual: quem decide se as credenciais sao validas e o
 * Worker (via loginWithD1 ou o fallback de demonstracao em auth/demoSession.ts),
 * nunca o frontend. Nenhum segredo, token ou regra de autorizacao vive aqui.
 *
 * Cadastro (criacao de conta) ainda nao tem contrato de dominio publicado pelo
 * Codex (nao ha endpoint para criar usuario/organizacao no Worker). Por isso a
 * secao de cadastro fica como chamada informativa para o catalogo publico, em
 * vez de um formulario que enviaria dados para um endpoint inexistente.
 */
const styles = `*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f7f6;color:#10233f;font-family:Arial,sans-serif}.panel{width:min(100%,440px);border:1px solid #d9e0dd;background:#fff;padding:28px;border-radius:8px;box-shadow:0 18px 50px #10233f14}.brand{display:flex;align-items:center;gap:12px;font-size:22px;font-weight:900}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:6px;background:#f47b20}h1{margin:28px 0 6px;font-size:28px}p{color:#60706a;line-height:1.5}.field{display:grid;gap:7px;margin-top:18px}label{font-size:14px;font-weight:700}input{width:100%;min-height:48px;border:1px solid #b9c5c0;border-radius:6px;padding:0 13px;font-size:16px}input:focus-visible{outline:3px solid #1267e8;outline-offset:1px}button{width:100%;min-height:50px;margin-top:22px;border:0;border-radius:6px;background:#176b4d;color:#fff;font-size:16px;font-weight:800;cursor:pointer}button:focus-visible{outline:3px solid #10233f;outline-offset:2px}.error{padding:12px;border-radius:6px;background:#fff1f0;color:#a92c22;font-size:14px;border:1px solid #f3b9b3;margin-top:16px}.note{margin-top:18px;font-size:12px;text-align:center;color:#60706a}.signup{margin-top:24px;padding-top:20px;border-top:1px solid #edf0ef;text-align:center}.signup a{color:#1267e8;font-weight:800}.signup a:focus-visible{outline:3px solid #1267e8;outline-offset:2px;border-radius:3px}`;

export interface LoginPageOptions {
    hasError?: boolean;
    realAuthEnabled?: boolean;
}

export function renderLoginPage(options: LoginPageOptions = {}): string {
    const { hasError = false, realAuthEnabled = false } = options;

    const error = hasError
        ? '<p class="error" role="alert" id="login-error">Não foi possível entrar com esses dados. Confira o e-mail e a senha e tente novamente.</p>'
        : '';

    const heading = realAuthEnabled ? 'Entrar no ObraPro' : 'Acesso de demonstração';
    const intro = realAuthEnabled
        ? 'Entre com a conta da sua organização para acessar o painel.'
        : 'Entre para visualizar o painel administrativo do mockup.';
    const note = realAuthEnabled
        ? ''
        : '<p class="note">Ambiente de demonstração. Não utilize credenciais pessoais.</p>';

    return `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#10233f">
    <title>${heading} | ObraPro</title>
    <style>${styles}</style>
</head>
<body>
    <main class="panel">
        <div class="brand"><span class="mark" aria-hidden="true">⛑</span>ObraPro</div>
        <h1>${heading}</h1>
        <p>${intro}</p>
        ${error}
        <form method="POST" action="/entrar" aria-describedby="${hasError ? 'login-error' : ''}">
            <div class="field">
                <label for="email">E-mail</label>
                <input id="email" name="email" type="email" autocomplete="username" autofocus required>
            </div>
            <div class="field">
                <label for="password">Senha</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required>
            </div>
            <button type="submit">Entrar</button>
        </form>
        ${note}
        <div class="signup">
            <p>Ainda não tem conta? <a href="/cursos">Conheça o catálogo gratuito</a> antes de assinar um plano.</p>
        </div>
    </main>
</body>
</html>`;
}
