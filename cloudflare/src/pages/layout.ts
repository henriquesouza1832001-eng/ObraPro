/**
 * Estilo e cabecalho compartilhados pelas paginas publicas renderizadas pelo Worker
 * (cursos, detalhe de curso e como funciona). Mantem a paleta e a tipografia do mockup.
 */
export const sharedStyles = `*{box-sizing:border-box}body{margin:0;background:#faf7f0;color:#10233f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:400}h1,h2,h3,strong,b{font-weight:800}header{background:#10233f;padding:16px 5vw;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:3px solid #f47b20}.brand{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:800;color:#fff}.mark{display:grid;place-items:center;width:36px;height:36px;border-radius:7px;background:#f47b20;color:#10233f}a{color:inherit;text-decoration:none}nav.top{display:flex;align-items:center;gap:18px;font-weight:600;font-size:14px;color:#dce5ef}nav.top a[aria-current="page"]{color:#fff;box-shadow:inset 0 -2px 0 #f47b20;padding-bottom:2px}nav.top a:focus-visible,.login:focus-visible,.cta:focus-visible,.card:focus-visible{outline:3px solid #ffb04c;outline-offset:2px}.login{padding:10px 16px;border-radius:6px;background:#f47b20;color:#10233f;font-weight:800}.hero{padding:58px 5vw;background:#10233f;color:#fff}.hero>*{max-width:920px;margin-left:auto;margin-right:auto}.eyebrow{color:#f47b20;font-size:12px;font-weight:800;letter-spacing:.06em}.hero .eyebrow{color:#ffb04c}.hero h1{font-size:clamp(30px,5vw,48px);line-height:1.08;margin-top:14px;margin-bottom:16px;font-weight:800}.hero p{font-size:17px;line-height:1.6;color:#dce5ef}.content{max-width:1200px;margin:auto;padding:36px 5vw}.page-head{max-width:1200px;margin:0 auto;padding:26px 5vw 14px;border-bottom:2px dashed #e4dcc8}.page-head .eyebrow{color:#b3560f}.page-head h1{font-size:clamp(21px,3.2vw,28px);line-height:1.2;margin:8px 0 6px;color:#10233f;font-weight:800}.page-head p{color:#5b6a72;font-size:14.5px;max-width:680px;margin:0}footer.site-footer{margin-top:40px;border-top:1px solid #e4dcc8;background:#fff;padding:28px 5vw;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center}footer.site-footer nav{display:flex;gap:18px;flex-wrap:wrap;justify-content:center;font-weight:700;font-size:13.5px;color:#10233f}footer.site-footer nav a:focus-visible{outline:3px solid #1267e8;outline-offset:2px;border-radius:3px}footer.site-footer p{margin:0;color:#5b6a72;font-size:12px;max-width:640px;line-height:1.5}@media(max-width:560px){header{padding:12px 5vw}.hero{padding:38px 5vw}.content{padding-top:26px}.page-head{padding-top:18px}.login{padding:9px 12px;font-size:13px}footer.site-footer{padding:22px 5vw}}`;

const sharedVisualOverrides = `button,input,select,textarea{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #ffb04c;outline-offset:3px}button{min-height:44px}.content{width:100%}.site-footer a{min-height:32px;display:inline-flex;align-items:center}.site-footer a:hover{color:#1267e8}@media(max-width:720px){header{align-items:flex-start}nav.top{width:100%;justify-content:space-between;gap:8px;overflow-x:auto;padding-bottom:2px}nav.top a{white-space:nowrap}.hero h1{font-size:clamp(30px,9vw,44px)}}`;

export function escapeHtml(value: string | number): string {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character] ?? character);
}

/**
 * Serializa um valor para uso dentro de um bloco <script> inline server-renderizado.
 * JSON.stringify sozinho nao escapa "<", entao um valor contendo "</script>" fecharia
 * a tag prematuramente e permitiria injetar HTML/JS arbitrario no meio do documento
 * (a analise HTML do "</script>" acontece antes do parser JS ver a string). Escapar
 * "<" para "<" mantem o valor JS identico e elimina esse vetor.
 */
export function jsStringLiteral(value: string): string {
    return JSON.stringify(value).replace(/</g, '\\u003C');
}

export function publicHeader(activePath: string): string {
    const link = (href: string, label: string): string => {
        const isActive = href === activePath;

        return `<a href="${href}"${isActive ? ' aria-current="page"' : ''}>${label}</a>`;
    };

    return `<header><a class="brand" href="/"><span class="mark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"/></svg></span><span>ObraPro</span></a><nav class="top" aria-label="Navegação principal">${link('/', 'Início')}${link('/como-funciona', 'Como funciona')}${link('/cursos', 'Cursos')}<a class="header-search" href="/cursos" aria-label="Buscar cursos"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></a><a class="login" href="/entrar">Entrar</a><a class="header-cta" href="/cursos?acesso=free">Começar gratuitamente</a></nav></header>`;
}

export function publicFooter(): string {
    return `<footer class="site-footer" role="contentinfo"><nav aria-label="Rodapé"><a href="/">Início</a><a href="/como-funciona">Como funciona</a><a href="/cursos">Cursos</a><a href="/entrar">Entrar</a></nav><p>ObraPro ensina construção civil com aulas curtas e passo a passo. Conteúdo educativo — não substitui projeto ou responsável técnico. © ObraPro.</p></footer>`;
}

export function publicPage(options: { title: string; activePath: string; body: string; extraStyles?: string }): string {
    return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#10233f"><title>${escapeHtml(options.title)}</title><style>${sharedStyles}${sharedVisualOverrides}${options.extraStyles ?? ''}</style></head>
<body>${publicHeader(options.activePath)}${options.body}${publicFooter()}</body></html>`;
}
