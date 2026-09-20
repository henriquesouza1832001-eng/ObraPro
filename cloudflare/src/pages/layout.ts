/**
 * Estilo e cabecalho compartilhados pelas paginas publicas renderizadas pelo Worker
 * (cursos, detalhe de curso e como funciona). Mantem a paleta e a tipografia do mockup.
 */
export const sharedStyles = `*{box-sizing:border-box}body{margin:0;background:#faf7f0;color:#10233f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:400}h1,h2,h3,strong,b{font-weight:800}header{background:#10233f;padding:16px 5vw;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:3px solid #f47b20}.brand{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:800;color:#fff}.mark{display:grid;place-items:center;width:36px;height:36px;border-radius:7px;background:#f47b20;color:#10233f}a{color:inherit;text-decoration:none}nav.top{display:flex;align-items:center;gap:18px;font-weight:600;font-size:14px;color:#dce5ef}nav.top a[aria-current="page"]{color:#fff;box-shadow:inset 0 -2px 0 #f47b20;padding-bottom:2px}nav.top a:focus-visible,.login:focus-visible,.cta:focus-visible,.card:focus-visible{outline:3px solid #ffb04c;outline-offset:2px}.login{padding:10px 16px;border-radius:6px;background:#f47b20;color:#10233f;font-weight:800}.hero{padding:58px 5vw;background:#10233f;color:#fff}.hero>*{max-width:920px;margin-left:auto;margin-right:auto}.eyebrow{color:#f47b20;font-size:12px;font-weight:800;letter-spacing:.06em}.hero .eyebrow{color:#ffb04c}.hero h1{font-size:clamp(30px,5vw,48px);line-height:1.08;margin-top:14px;margin-bottom:16px;font-weight:800}.hero p{font-size:17px;line-height:1.6;color:#dce5ef}.content{max-width:1200px;margin:auto;padding:36px 5vw}.page-head{max-width:1200px;margin:0 auto;padding:26px 5vw 14px;border-bottom:2px dashed #e4dcc8}.page-head .eyebrow{color:#c05e14}.page-head h1{font-size:clamp(21px,3.2vw,28px);line-height:1.2;margin:8px 0 6px;color:#10233f;font-weight:800}.page-head p{color:#5b6a72;font-size:14.5px;max-width:680px;margin:0}@media(max-width:560px){header{padding:12px 5vw}.hero{padding:38px 5vw}.content{padding-top:26px}.page-head{padding-top:18px}.login{padding:9px 12px;font-size:13px}}`;

export function publicHeader(activePath: string): string {
    const link = (href: string, label: string): string => {
        const isActive = href === activePath;

        return `<a href="${href}"${isActive ? ' aria-current="page"' : ''}>${label}</a>`;
    };

    return `<header><a class="brand" href="/"><span class="mark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3a7 7 0 0 0-7 7v3H4v3h16v-3h-1v-3a7 7 0 0 0-7-7z"/><rect x="9" y="18" width="6" height="2" rx="1"/></svg></span><span>ObraPro</span></a><nav class="top" aria-label="Navegação principal">${link('/', 'Início')}${link('/como-funciona', 'Como funciona')}${link('/cursos', 'Cursos')}<a class="login" href="/entrar">Entrar</a></nav></header>`;
}

export function publicPage(options: { title: string; activePath: string; body: string; extraStyles?: string }): string {
    return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#10233f"><title>${options.title}</title><style>${sharedStyles}${options.extraStyles ?? ''}</style></head>
<body>${publicHeader(options.activePath)}${options.body}</body></html>`;
}
