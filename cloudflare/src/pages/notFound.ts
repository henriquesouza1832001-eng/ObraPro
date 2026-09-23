import { escapeHtml, publicPage } from './layout';

const styles = '.error-box{max-width:640px;margin:0 auto;padding:80px 5vw;text-align:center}.error-box h1{font-size:clamp(28px,5vw,40px);margin-bottom:8px}.error-box p{color:#60706a;line-height:1.5}.actions{margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.actions a{padding:12px 20px;border-radius:6px;font-weight:800}.primary{background:#1267e8;color:#fff}.secondary{background:#fff;border:1px solid #d9e0dd;color:#10233f}';

export function renderNotFound(pathname = ''): string {
    const safePath = escapeHtml(pathname || '/');
    const body = `<main class="error-box"><p class="eyebrow">Página não encontrada</p><h1>Esse caminho não existe</h1><p>O endereço pode estar desatualizado ou ter sido digitado incorretamente. Volte ao catálogo para continuar aprendendo.</p><div class="actions"><a class="primary" href="/cursos">Ver cursos</a><a class="secondary" href="${safePath}">Tentar novamente</a></div></main>`;

    return publicPage({ title: 'Página não encontrada | Obra Mais', activePath: '', body, extraStyles: styles });
}
