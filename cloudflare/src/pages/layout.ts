/**
 * Estilo e cabecalho compartilhados pelas paginas publicas renderizadas pelo Worker
 * (cursos, detalhe de curso e como funciona). Mantem a paleta e a tipografia do mockup.
 */
export const sharedStyles = `*{box-sizing:border-box}body{margin:0;background:#f4f7f6;color:#10233f;font-family:Arial,sans-serif}header{background:#fff;border-bottom:1px solid #d9e0dd;padding:18px 5vw;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}.brand{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:900}.mark{display:grid;place-items:center;width:40px;height:40px;border-radius:7px;background:#f47b20;color:#fff}a{color:inherit;text-decoration:none}nav.top{display:flex;align-items:center;gap:20px;font-weight:700;font-size:14px}nav.top a:focus-visible,.login:focus-visible,.cta:focus-visible,.card:focus-visible{outline:3px solid #1267e8;outline-offset:2px}.login{padding:12px 18px;border-radius:6px;background:#1267e8;color:#fff;font-weight:800}.hero{padding:58px 5vw;background:#10233f;color:#fff}.hero>*{max-width:920px;margin-left:auto;margin-right:auto}.eyebrow{color:#fdc99f;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.hero h1{font-size:clamp(34px,5vw,58px);line-height:1.05;margin-top:16px;margin-bottom:18px}.hero p{font-size:18px;line-height:1.6;color:#dce5ef}.content{max-width:1200px;margin:auto;padding:42px 5vw}.page-head{max-width:1200px;margin:0 auto;padding:28px 5vw 6px}.page-head .eyebrow{color:#f47b20;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.page-head h1{font-size:clamp(22px,3.4vw,30px);line-height:1.2;margin:8px 0 6px;color:#10233f}.page-head p{color:#5b6a72;font-size:14.5px;max-width:680px;margin:0}@media(max-width:560px){header{padding:14px 5vw}.hero{padding:42px 5vw}.content{padding-top:30px}.page-head{padding-top:20px}.login{padding:10px 12px;font-size:13px}}`;

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
