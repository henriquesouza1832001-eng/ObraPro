import { publicPage } from './layout';

/**
 * Conteudo editorial inicial (S5-07 em docs/SPRINTS.md). Explica o produto
 * para quem chega por link do Instagram, sem exigir cadastro. Nao descreve
 * nenhuma regra comercial fixa: precos e planos continuam no catalogo.
 */
const styles = `.steps{max-width:1000px;margin:0 auto;padding:42px 5vw;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}.step{background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:24px}.step .num{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:999px;background:#eef5ff;color:#1267e8;font-weight:900}.step h2{font-size:19px;margin:14px 0 8px}.step p{color:#60706a;line-height:1.5;font-size:14px}.cta-row{max-width:1000px;margin:0 auto 60px;padding:0 5vw;display:flex;gap:14px;flex-wrap:wrap}.cta-row a{padding:14px 22px;border-radius:6px;font-weight:800}.cta-primary{background:#1267e8;color:#fff}.cta-secondary{background:#fff;border:1px solid #d9e0dd;color:#10233f}.note{max-width:1000px;margin:0 auto 40px;padding:0 5vw;color:#60706a;font-size:13px}`;

export function renderComoFunciona(): string {
    const body = `<section class="hero"><span class="eyebrow">Como funciona</span><h1>Do primeiro acesso à obra bem feita, em passos simples.</h1><p>O ObraPro combina conteúdo gratuito, cursos e acompanhamento de obra em um só lugar — sem exigir cadastro para conhecer o produto.</p></section>
<section class="steps" aria-label="Passos do ObraPro">
    <article class="step"><span class="num" aria-hidden="true">1</span><h2>Explore o catálogo</h2><p>Veja cursos organizados por etapa da construção, com duração e nível indicados antes de qualquer cadastro.</p></article>
    <article class="step"><span class="num" aria-hidden="true">2</span><h2>Aprenda no seu ritmo</h2><p>Assista aulas curtas com passo a passo, materiais necessários e alertas de segurança.</p></article>
    <article class="step"><span class="num" aria-hidden="true">3</span><h2>Acompanhe a execução</h2><p>No painel, gestores e times seguem procedimentos, checklists e evidências de cada etapa da obra.</p></article>
    <article class="step"><span class="num" aria-hidden="true">4</span><h2>Registre com confiança</h2><p>Cheklists e evidências ficam organizados por obra, sem substituir o responsável técnico.</p></article>
</section>
<div class="cta-row"><a class="cta-primary" href="/cursos">Ver cursos gratuitos</a><a class="cta-secondary" href="/entrar">Entrar no painel</a></div>
<p class="note">Conteúdo de demonstração da versão inicial do ObraPro. Preços, planos e regras de acesso são definidos no painel administrativo e podem mudar.</p>`;

    return publicPage({ title: 'Como funciona | ObraPro', activePath: '/como-funciona', body, extraStyles: styles });
}
