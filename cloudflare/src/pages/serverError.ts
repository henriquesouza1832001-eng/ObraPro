import { publicPage } from './layout';

/**
 * Pagina de erro sanitizada para falhas inesperadas nas rotas publicas
 * (ex.: repositorio de dados indisponivel). Nunca expõe stack trace,
 * mensagem interna ou detalhe de infraestrutura ao visitante,
 * conforme docs/SECURITY.md ("Resposta a incidentes").
 */
const styles = '.error-box{max-width:640px;margin:0 auto;padding:80px 5vw;text-align:center}.error-box h1{font-size:28px;margin-bottom:8px}.error-box p{color:#60706a;line-height:1.5}.actions{margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.actions a{padding:12px 20px;border-radius:6px;font-weight:800}.primary{background:#1267e8;color:#fff}.secondary{background:#fff;border:1px solid #d9e0dd;color:#10233f}';

export function renderServerError(activePath: string): string {
    const body = `<main class="error-box"><h1>Não foi possível carregar esta página agora</h1><p>Algo falhou do nosso lado. Você pode tentar novamente em instantes ou voltar ao catálogo.</p><div class="actions"><a class="primary" href="${activePath}">Tentar novamente</a><a class="secondary" href="/cursos">Voltar ao catálogo</a></div></main>`;

    return publicPage({ title: 'Não foi possível carregar | ObraPro', activePath, body, extraStyles: styles });
}
