import type { Course } from '../data/course';
import { escapeHtml, publicPage } from './layout';
import { categoryAccent, categoryKey, presentationTitle } from './courses';

/**
 * Home publica de aprendizagem, fiel ao mockup do responsavel: saudacao, busca
 * e categorias coloridas por etapa da construcao. Usa somente dados reais do
 * CourseRepository (o mesmo contrato ja consumido por /cursos); nenhum
 * endpoint novo foi criado. Aula com video/manual, passo a passo, checklist
 * opcional, matricula e progresso exigem um contrato de conteudo de aula que
 * ainda nao existe e nao foram inventados aqui.
 */
const homeStyles = `.home-hero{padding:44px 5vw 34px;background:#10233f;color:#fff}.home-hero .eyebrow{color:#ffb04c;font-size:12px;font-weight:800;letter-spacing:.06em}.home-hero h1{font-size:clamp(26px,4.4vw,38px);line-height:1.15;margin:12px 0 8px;font-weight:800}.home-hero p{color:#c6d3e6;font-size:15.5px;max-width:640px}
.search{margin-top:22px;max-width:720px;position:relative}.search input{width:100%;min-height:50px;border-radius:8px;border:none;background:#fff;padding:0 44px;font-size:16px;color:#10233f}.search svg{position:absolute;top:15px;left:14px;color:#8a97a3}.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.hero-actions a{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:7px;font-weight:800;font-size:14px}.hero-actions .primary{background:#f47b20;color:#10233f}.hero-actions .secondary{border:1px solid #ffffff55;color:#fff}
.categories{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:26px;max-width:920px}
@media(min-width:640px){.categories{grid-template-columns:repeat(3,1fr)}}
.category-card{display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:8px;color:#fff;min-height:112px;transition:.15s}
.category-card:hover{transform:translateY(-2px)}
.category-card:focus-visible,.section-title a:focus-visible,#home-search:focus-visible{outline:3px solid #ffb04c;outline-offset:2px}
.category-card small{font-size:11px;opacity:.85;line-height:1.3}
.category-card span.count{font-size:11px;opacity:.85;margin-top:auto}
.category-card.outline{color:#10233f;background:#fff}
.section-title{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:38px 0 14px;flex-wrap:wrap}
.section-note{display:block;color:#60706a;font-size:12px;margin-top:4px}
.section-title h2{font-size:19px;margin:0}
.section-title a{color:#1267e8;font-weight:700;font-size:14px}
.course-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.course-row .card{display:flex;flex-direction:column;padding:16px;border:1px solid #e4dcc8;border-radius:8px;background:#fff;border-top:3px solid #d9e0dd}
.course-row .card h3{font-size:15px;margin:10px 0 6px}
.course-row .card p{color:#60706a;font-size:13px;line-height:1.5;flex:1}
.course-row .tag{align-self:flex-start;padding:5px 8px;border-radius:5px;background:#eef5ff;color:#1267e8;font-size:11px;font-weight:800}
.course-row .markers{display:flex;gap:10px;color:#60706a;font-size:12px;border-top:1px solid #f4f6f5;padding-top:10px;margin-top:auto}
.empty-search{display:none;margin-top:16px;padding:20px;border:1px dashed #d9c9a3;border-radius:8px;color:#60706a;text-align:center}
.continue-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.continue-card{display:flex;flex-direction:column;padding:16px;border:1px solid #e4dcc8;border-radius:8px;background:#fff}
.continue-card h3{font-size:15px;margin:0 0 8px}
.continue-card .progress-bar{height:6px;background:#eef1f0;border-radius:999px;overflow:hidden;margin-top:8px}
.continue-card .progress-bar span{display:block;height:100%;background:#1267e8}
.continue-card small{color:#60706a;font-size:12px;margin-top:6px}
.journey{max-width:1100px;margin:34px auto 0;padding:22px;border:1px solid #dfe5ea;border-radius:14px;background:#fff;box-shadow:0 4px 14px #10233f0b}.journey-head{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap}.journey-head h2{font-size:clamp(20px,3vw,26px);margin:0;color:#10233f}.journey-head p{margin:6px 0 0;color:#60706a;font-size:14px}.journey-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.journey-step{padding:14px;border-radius:10px;background:#f4f8ff;border:1px solid #d7e5f7}.journey-step strong{display:block;color:#10233f;font-size:14px}.journey-step span{display:block;margin-top:5px;color:#60706a;font-size:12px;line-height:1.45}@media(max-width:760px){.journey{margin-left:5vw;margin-right:5vw;padding:18px}.journey-steps{grid-template-columns:repeat(2,1fr)}}@media(max-width:430px){.journey-steps{grid-template-columns:1fr}}`;

// Camada visual da home: uma jornada unica, com contraste e ritmo consistentes.
// Mantem os contratos e os dados do catalogo; apenas reorganiza a apresentacao.
const homeVisualOverrides = `.home-hero{padding:0;background:#faf7f0;color:#10233f;border-bottom:1px solid #e4dcc8}.home-hero-inner{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;max-width:1200px;margin:0 auto;padding:58px 5vw 42px;background:linear-gradient(110deg,#fff 0%,#fffaf2 66%,#f4eadc 100%);border-radius:0 0 18px 18px}.home-hero .eyebrow{color:#c05e14}.home-hero h1{max-width:820px;font-size:clamp(32px,5vw,58px);line-height:1.02;letter-spacing:-.045em;color:#10233f}.home-hero p{font-size:18px;line-height:1.55;max-width:680px;color:#5b6a72}.search{max-width:760px;margin-top:26px}.search input{min-height:58px;border:2px solid #d9e0dd;border-radius:10px;box-shadow:0 8px 24px #10233f14}.search input:focus{outline:3px solid #ffb04c;outline-offset:3px}.hero-actions .secondary{border:1px solid #b9c5c0;color:#10233f;background:#fff}.hero-actions a:focus-visible{outline:3px solid #1267e8;outline-offset:3px}.hero-aside{align-self:start;display:grid;gap:12px}.hero-visual{height:210px;overflow:hidden;border-radius:14px;box-shadow:0 10px 24px #10233f1c;background:#e9dfd2}.hero-visual img{width:100%;height:100%;display:block;object-fit:cover;object-position:center}.hero-aside-card{padding:20px;border:1px solid #dfe5ea;border-radius:12px;background:#fff;box-shadow:0 8px 22px #10233f12;color:#10233f}.hero-aside-card strong{display:block;font-size:18px;line-height:1.25}.hero-aside-card p{margin:8px 0 0;font-size:14px;line-height:1.5}.hero-aside-card.accent{background:#eef5ff;border-color:#c8dbf7}.categories{grid-column:1/-1;gap:12px;margin-top:2px}.category-card{min-height:128px;padding:18px;border:1px solid #ffffff38;border-radius:12px;transition:transform .15s,box-shadow .15s}.category-card:hover{transform:translateY(-3px);box-shadow:0 10px 22px #07162e55}.category-card:focus-visible,.section-title a:focus-visible,.course-row .card:focus-visible,.continue-card:focus-visible{outline:3px solid #1267e8;outline-offset:3px}.section-title{max-width:1100px;margin:46px auto 16px}.section-title h2{font-size:clamp(21px,3vw,27px);letter-spacing:-.02em}.course-row,.continue-row{max-width:1100px;margin-left:auto;margin-right:auto;gap:16px}.course-row .card{min-height:250px;padding:20px;border:1px solid #dfe5ea;border-radius:10px;box-shadow:0 3px 10px #10233f0b;transition:transform .15s,box-shadow .15s}.course-row .card:hover{transform:translateY(-3px);box-shadow:0 10px 22px #10233f18}.course-row .card h3{font-size:17px;line-height:1.25}.course-row .card p{font-size:14px;line-height:1.55}.continue-card{padding:20px;border:1px solid #b8d3f2;border-radius:10px;background:#f4f8ff}.continue-card h3{font-size:17px;line-height:1.3}.home-hero+main.content{padding-top:8px}@media(max-width:760px){.home-hero-inner{display:grid;grid-template-columns:1fr;gap:20px;padding:38px 5vw 30px;border-radius:0}.hero-aside{grid-row:3}.hero-visual{height:180px}.categories{grid-column:auto;margin-top:0}}@media(max-width:639px){.home-hero h1{font-size:clamp(32px,10vw,46px)}.home-hero p{font-size:16px}.categories{gap:10px}.category-card{min-height:112px;padding:14px}.section-title{margin-top:34px}}`;

const marketingStyles = `.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}header{padding:8px 3.5vw;min-height:55px;border-bottom:0}.brand{font-size:25px;letter-spacing:-.03em}.brand .mark{background:transparent;border-radius:0;color:#ff7415;width:38px}.brand .pro{color:#ff7415}nav.top{gap:30px}.header-search{display:grid;place-items:center;color:#dce5ef;margin-left:auto}.header-cta{padding:11px 22px;border-radius:8px;background:#ff7415;color:#fff;font-weight:800}.home-hero-inner{max-width:1280px;padding:0 3.5vw 34px;grid-template-columns:minmax(0,1.05fr) minmax(380px,1fr);gap:0;border-radius:0;background:#fff}.hero-copy{padding:48px 12px 20px 0}.hero-copy .eyebrow{font-size:12px;letter-spacing:.11em;color:#465a78}.hero-copy h1{font-size:clamp(38px,4.4vw,60px);max-width:650px;margin:14px 0 8px}.hero-copy p{max-width:540px;font-size:18px;line-height:1.35}.search{display:flex;max-width:690px;margin-top:22px;border:1px solid #cfd9e2;background:#fff;border-radius:9px;box-shadow:0 5px 16px #10233f10;padding:0 5px 0 40px}.search input{min-height:50px;border:0;box-shadow:none;padding:0 10px}.search:after{content:'Buscar';display:grid;place-items:center;align-self:center;min-width:110px;height:40px;background:#1267e8;color:#fff;border-radius:7px;font-weight:800}.hero-actions{margin-top:14px}.hero-actions .primary{background:#ff7415;color:#fff;padding:0 22px}.hero-actions .secondary{padding:0 22px}.hero-aside{position:relative;min-height:350px;padding:18px 0 0 0;display:flex;flex-direction:column;gap:12px}.hero-visual{position:absolute;inset:0 0 0 0;height:auto;border-radius:0;box-shadow:none;background:#eadfce}.hero-visual img{opacity:.78}.hero-aside-card{position:relative;margin-left:auto;width:min(340px,88%);z-index:1}.hero-aside-card.accent{margin-top:0}.hero-aside-card.quote{background:#eef1f5;border:0;font-style:italic}.hero-aside-card.quote strong{font-weight:500}.hero-aside-card.quote p{font-size:18px}.marketing-section{max-width:1280px;margin:0 auto;padding:18px 3.5vw}.marketing-section .section-title{margin:0 0 12px}.marketing-section .section-title h2{font-size:25px}.marketing-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px}.trail-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.trail-row .category-card{min-height:102px;color:#10233f;justify-content:center;padding:16px;background:#fff;border:1px solid #dfe5ea!important;box-shadow:0 3px 12px #10233f0b}.trail-row .category-card strong{font-size:15px}.trail-row .category-card small{color:#60706a}.goal-card,.progress-card{background:#fff;border:1px solid #dfe5ea;border-radius:12px;padding:20px;box-shadow:0 3px 12px #10233f0b}.goal-card{background:#fff5e8}.goal-card h3,.progress-card h3{margin:0 0 8px;font-size:17px}.goal-card p,.progress-card p{margin:0;color:#60706a;font-size:14px;line-height:1.5}.progress-card{margin-top:12px}.progress-card .metric{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #edf0f2;font-size:13px}.progress-card .metric:last-child{border:0}.spotlight .course-row{grid-template-columns:repeat(4,1fr)}.spotlight .course-row .card{min-height:270px}.spotlight .course-row .card:nth-child(n+5){display:none}.home-hero+main.content{padding:18px 0 36px}@media(max-width:900px){.home-hero-inner{grid-template-columns:1fr}.hero-aside{min-height:300px;margin-top:10px}.marketing-grid{grid-template-columns:1fr}.trail-row{grid-template-columns:repeat(2,1fr)}.spotlight .course-row{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){header{padding:8px 5vw;gap:12px}nav.top{order:3;width:100%;justify-content:space-between;gap:14px;overflow-x:auto}nav.top a[aria-current="page"]{padding:8px 0 6px}.header-cta{padding:9px 13px;font-size:12px}}@media(max-width:560px){.home-hero-inner{padding:0 5vw 26px}.hero-copy{padding:32px 0 10px}.hero-aside{min-height:280px}.hero-aside-card{width:92%;padding:16px}.hero-copy h1{font-size:clamp(36px,11vw,50px)}.search:after{min-width:78px}.marketing-section{padding:16px 5vw}.trail-row{grid-template-columns:1fr}.spotlight .course-row{grid-template-columns:1fr}.spotlight .course-row .card:nth-child(n+5){display:flex}}`;

const referenceStyles = `.reference-home{background:#f5f5f5;color:#1a1a1a}.reference-home .hero-band{background:#1a2332}.reference-home .hero{max-width:1280px;margin:0 auto;min-height:280px;display:grid;grid-template-columns:1fr 1fr;background:#1a2332;color:#fff;overflow:hidden}.reference-home .hero-left{padding:32px;display:flex;flex-direction:column;justify-content:center}.reference-home .hero-eyebrow{color:#9ca3af;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}.reference-home .hero h1{font-size:clamp(32px,3.2vw,46px);line-height:1.1;margin:0 0 10px;color:#fff}.reference-home .hero-sub{color:#c5ccd5;font-size:14px;line-height:1.5;margin:0 0 18px}.reference-home .search-bar{display:flex;max-width:620px;margin:0 0 16px}.reference-home .search-bar input{flex:1;min-height:44px;border:0;border-radius:6px 0 0 6px;padding:0 14px;color:#10233f}.reference-home .search-bar button{border:0;background:#2563eb;color:#fff;padding:0 20px;border-radius:0 6px 6px 0;font-weight:800}.reference-home .hero-actions{display:flex;gap:12px}.reference-home .hero-actions a{display:inline-flex;align-items:center;min-height:42px;border-radius:6px;padding:0 18px;font-weight:800;font-size:13px}.reference-home .hero-actions .primary{background:#f97316;color:#fff}.reference-home .hero-actions .secondary{border:2px solid #fff;color:#fff;background:transparent}.reference-home .hero-img{position:relative;min-height:280px;overflow:hidden;background:#334155}.reference-home .hero-img img{width:100%;height:100%;object-fit:cover;opacity:.7}.reference-home .hero-img:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#1a2332 0%,transparent 40%)}.reference-home .hero-slogan{position:absolute;right:28px;bottom:28px;z-index:1;color:#fff;font:italic 22px/1.4 Georgia,serif;text-align:right;text-shadow:0 1px 4px #000}.reference-home .reference-layout{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:0}.reference-home .main-content{padding:24px 24px 40px 32px;background:#f5f5f5}.reference-home .sidebar{padding:0 24px 24px 0;background:#f5f5f5}.reference-home .section-header{display:flex;justify-content:space-between;align-items:center;margin:0 0 14px}.reference-home .section-title{font-size:16px;font-weight:800;color:#1a1a1a}.reference-home .section-link{color:#2563eb;font-size:13px;font-weight:700}.reference-home .continue-card,.reference-home .trilha-card,.reference-home .curso-card,.reference-home .side-card{background:#fff;border-radius:10px;box-shadow:0 1px 4px #0000000f}.reference-home .continue-card{padding:16px;display:flex;align-items:center;gap:16px;margin-bottom:24px}.reference-home .continue-thumb{width:80px;height:56px;border-radius:6px;object-fit:cover;background:#c8a96e;display:grid;place-items:center;flex:none}.reference-home .continue-info{flex:1}.reference-home .continue-cat,.reference-home .curso-cat{color:#f97316;font-size:11px;font-weight:800;text-transform:uppercase}.reference-home .continue-title{font-size:15px;font-weight:800;margin:3px 0}.reference-home .continue-meta,.reference-home .curso-meta,.reference-home .curso-desc{font-size:11px;color:#6b7280}.reference-home .ref-progress{height:6px;background:#e5e7eb;border-radius:4px;margin-top:8px;overflow:hidden}.reference-home .ref-progress span{display:block;height:100%;background:#22c55e}.reference-home .btn-continue{background:#2563eb;color:#fff;border:0;padding:10px 16px;border-radius:6px;font-weight:800;white-space:nowrap}.reference-home .trilhas-grid,.reference-home .cursos-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}.reference-home .trilha-card{padding:14px 16px;display:flex;align-items:center;gap:12px;min-height:84px}.reference-home .trilha-icon{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;font-size:22px;flex:none}.reference-home .trilha-name{font-size:14px;font-weight:800}.reference-home .trilha-desc{font-size:11px;color:#6b7280;line-height:1.3;margin-top:2px}.reference-home .trilha-arrow{margin-left:auto;color:#9ca3af;font-size:18px}.reference-home .curso-card{overflow:hidden;display:flex;flex-direction:column}.reference-home .curso-thumb{height:80px;display:grid;place-items:center;font-size:32px;background:linear-gradient(135deg,#78716c,#57534e)}.reference-home .curso-body{padding:12px;display:flex;flex-direction:column;flex:1}.reference-home .curso-title{font-size:13px;font-weight:800;line-height:1.3;margin:4px 0 6px}.reference-home .curso-meta{display:flex;gap:9px;margin-bottom:6px}.reference-home .curso-desc{line-height:1.4;flex:1;margin-bottom:10px}.reference-home .btn-ver{width:100%;border:1.5px solid #2563eb;background:#fff;color:#2563eb;padding:8px;border-radius:6px;font-weight:800}.reference-home .side-stack{padding-top:16px}.reference-home .side-card{padding:14px 16px;margin-bottom:12px}.reference-home .streak{display:flex;gap:12px;align-items:flex-start}.reference-home .streak strong{font-size:20px}.reference-home .side-label{font-size:11px;color:#6b7280}.reference-home .dots{display:flex;gap:4px;margin-top:6px}.reference-home .dot{width:13px;height:13px;border-radius:50%;background:#e5e7eb}.reference-home .dot.on{background:#f97316}.reference-home .cert{display:flex;align-items:center;gap:12px}.reference-home .cert-icon{width:38px;height:38px;display:grid;place-items:center;background:#dcfce7;border-radius:8px}.reference-home .quote{background:#1a2332;color:#fff;font:italic 14px/1.5 Georgia,serif}.reference-home .quote i{display:block;color:#f97316;font-size:28px;line-height:1}.reference-home .goal{background:#fff7ed}.reference-home .side-card h3{font-size:15px;margin:0 0 6px}.reference-home .side-card p{font-size:12px;color:#6b7280;line-height:1.5;margin:0}.reference-home .metric{display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;padding:9px 0;font-size:12px;color:#6b7280}.reference-home .metric strong{color:#1a1a1a}.reference-home .empty-search{display:none;padding:16px;text-align:center;color:#6b7280}@media(max-width:900px){.reference-home .hero{grid-template-columns:1fr}.reference-home .hero-img{min-height:220px}.reference-home .reference-layout{grid-template-columns:1fr}.reference-home .sidebar{padding:0 24px 24px 32px}.reference-home .trilhas-grid,.reference-home .cursos-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.reference-home .hero-left{padding:28px 5vw}.reference-home .main-content,.reference-home .sidebar{padding:20px 5vw}.reference-home .trilhas-grid,.reference-home .cursos-grid{grid-template-columns:1fr}.reference-home .continue-card{align-items:flex-start;flex-wrap:wrap}.reference-home .continue-card .btn-continue{width:100%}}`;

const referenceHeaderStyles = `header .brand .mark{background:#f97316!important;color:#fff!important;border-radius:6px!important;width:30px!important;height:30px!important}`;
const referenceIconStyles = `.reference-home .section-title{display:inline-flex;align-items:center;gap:7px}.reference-home .section-icon{color:#2563eb;flex:none}`;

const categoryStyle: Record<string, { bg: string; icon: string }> = {
    fundacoes: {
        bg: '#2563eb',
        icon: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M2 13l10 5 10-5"/>',
    },
    alvenaria: {
        bg: '#f47b20',
        icon: '<rect x="3" y="4" width="7" height="4"/><rect x="14" y="4" width="7" height="4"/><rect x="3" y="10" width="7" height="4"/><rect x="14" y="10" width="7" height="4"/><rect x="3" y="16" width="7" height="4"/><rect x="14" y="16" width="7" height="4"/>',
    },
    hidraulica: {
        bg: '#0891b2',
        icon: '<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/>',
    },
    eletrica: {
        bg: '#f5b301',
        icon: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
    },
    acabamentos: {
        bg: '#9333ea',
        icon: '<rect x="3" y="3" width="8" height="8" rx="1"/><path d="M11 7h6a2 2 0 0 1 2 2v2H11z"/><path d="M14 11v6a2 2 0 0 1-4 0v-2"/>',
    },
};

function categoryCard(key: string, label: string, tagline: string, count: number): string {
    const style = categoryStyle[key] ?? { bg: categoryAccent[key] ?? '#64748b', icon: '<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>' };
    const iconMarkup = style
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${style.icon}</svg>`
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';

    return `<a class="category-card" style="background:${style.bg}" href="/cursos?categoria=${encodeURIComponent(key)}">${iconMarkup}<strong>${escapeHtml(label)}</strong><small>${escapeHtml(tagline)}</small><span class="count">${count === 1 ? '1 curso' : `${count} cursos`}</span></a>`;
}

function courseRow(courses: Course[]): string {
    return `<div class="course-row">${courses.map((course) => {
        const accent = categoryAccent[categoryKey(course.category)] ?? '#94a3b8';

        return `<a class="card" style="border-top-color:${accent}" href="/cursos/${encodeURIComponent(course.slug)}" data-course-title="${escapeHtml(course.title.toLocaleLowerCase('pt-BR'))}"><span class="tag">${escapeHtml(course.category)}</span><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p><div class="markers"><span>${course.modulesCount} ${course.modulesCount === 1 ? 'módulo' : 'módulos'}</span><span>${course.durationMinutes} min</span></div></a>`;
    }).join('')}</div>`;
}

function referenceCourseCard(course: Course, index: number): string {
    const accents = ['#78716c,#57534e', '#c8a96e,#8b6914', '#3b82f6,#1d4ed8', '#6ee7b7,#059669'];
    const icons = ['🏗️', '🧱', '⚡', '🖌️'];
    const accent = accents[index % accents.length];
    const icon = icons[index % icons.length];
    const title = presentationTitle(course.title);
    return `<a class="curso-card" href="/cursos/${encodeURIComponent(course.slug)}" data-course-title="${escapeHtml(title.toLocaleLowerCase('pt-BR'))}"><div class="curso-thumb" style="background:linear-gradient(135deg,${accent})">${icon}</div><div class="curso-body"><div class="curso-cat">${escapeHtml(course.category)}</div><div class="curso-title">${escapeHtml(title)}</div><div class="curso-meta"><span>⏱ ${course.durationMinutes} min</span><span>📋 Inicial</span></div><div class="curso-desc">${escapeHtml(course.description)}</div><div class="ref-progress"><span style="width:0%"></span></div><div class="curso-meta" style="justify-content:flex-end">0%</div><span class="btn-ver">Ver curso</span></div></a>`;
}

function referenceIcon(kind: 'trail' | 'courses' | 'goal'): string {
    const paths = {
        trail: '<path d="M4 19h16M6 16V7l6-3 6 3v9M9 19v-5h6v5"/>',
        courses: '<path d="M4 5h16v14H4zM8 9h8M8 13h6"/>',
        goal: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m16 8 4-4"/>',
    };
    return `<svg class="section-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths[kind]}</svg>`;
}

export function renderLearningHome(courses: Course[], showContinue = false): string {
    const counts: Record<string, number> = {};
    const labels = new Map<string, { label: string; count: number }>();
    courses.forEach((course) => {
        const key = categoryKey(course.category);
        counts[key] = (counts[key] ?? 0) + 1;
        labels.set(key, { label: course.category, count: counts[key] });
    });

    const freeCourses = courses.filter((course) => course.accessType === 'free');
    const categoryLabels = [...labels.entries()]
        .sort((left, right) => right[1].count - left[1].count || left[1].label.localeCompare(right[1].label, 'pt-BR'))
        .slice(0, 8)
        .map(([key, value]) => ({ key, label: value.label, tagline: `Aprenda ${value.label.toLocaleLowerCase('pt-BR')} por etapas` }));
    const spotlightCourses = freeCourses.slice(0, 10);
    const body = `<div class="reference-home">
        <div class="hero-band"><section class="hero"><div class="hero-left">
            <div class="hero-eyebrow">Conhecimento prático. Grandes conquistas.</div>
            <h1>Olá! O que você quer<br>aprender hoje?</h1>
            <p class="hero-sub">Construção, reforma e habilidades para a vida real.<br>Do básico ao avançado, no seu ritmo.</p>
            <label class="search-bar"><span class="sr-only">Buscar cursos, temas ou habilidades</span><input type="search" id="home-search" placeholder="Busque cursos, temas ou habilidades..."><button type="button">Buscar</button></label>
            <div class="hero-actions"><a class="primary" href="/cursos?acesso=free">Começar gratuitamente</a><a class="secondary" href="/como-funciona">▶&nbsp; Ver como funciona</a></div>
        </div><div class="hero-img"><img src="/images/home-construction-hero.png" alt="Casa em construção" loading="eager"><div class="hero-slogan">Aprender<br>Construir<br><span>Realizar</span></div></div></section></div>
        <div class="reference-layout"><main class="main-content">
            <section id="continue-section" hidden><div class="section-header"><span class="section-title">Continue de onde parou</span><a href="/painel" class="section-link">Ver meus cursos →</a></div><div class="continue-row" id="continue-list"></div></section>
            <div class="section-header"><span class="section-title">${referenceIcon('trail')}Escolha uma trilha</span><a href="/cursos" class="section-link">Ver todas as trilhas →</a></div>
            <div class="trilhas-grid">${categoryLabels.slice(0, 4).map(({ key, label, tagline }) => `<a class="trilha-card" href="/cursos?categoria=${encodeURIComponent(key)}"><span class="trilha-icon" style="background:${categoryAccent[key] ?? '#eff6ff'}">${key === 'fundacoes' ? '🏗️' : key === 'alvenaria' ? '🧱' : key === 'instalacoes' ? '🔧' : '🖌️'}</span><span><span class="trilha-name">${escapeHtml(label)}</span><span class="trilha-desc">${escapeHtml(tagline)}</span></span><span class="trilha-arrow">›</span></a>`).join('')}</div>
            <div class="section-header"><span class="section-title">${referenceIcon('courses')}Cursos em destaque</span><a href="/cursos" class="section-link">Ver todos os cursos →</a></div>
            <div class="cursos-grid">${spotlightCourses.map(referenceCourseCard).join('')}</div>
            <p class="empty-search" id="home-empty-search">Nenhum curso encontrado para essa busca.</p>
        </main><aside class="sidebar"><div class="side-stack">
            <div class="side-card streak"><span style="font-size:26px">🔥</span><div><strong>Aprenda no seu ritmo</strong><div class="side-label">Aulas curtas e evolução passo a passo.</div><div class="dots"><i class="dot on"></i><i class="dot on"></i><i class="dot on"></i><i class="dot"></i><i class="dot"></i></div></div></div>
            <a class="side-card cert" href="/certificados"><span class="cert-icon">✅</span><span><strong>Certificado ao concluir</strong><span class="side-label">Complete as aulas e o quiz final.</span></span><span>›</span></a>
            <div class="side-card quote"><i>“</i>Mais que cursos,<br>habilidades para transformar<br>o seu espaço.</div>
            <div class="side-card goal"><h3>🎯 Seu objetivo</h3><p><strong>Construir mais oportunidades</strong></p><p>Aprenda no seu tempo, desenvolva habilidades reais e conquiste seus projetos.</p></div>
            <div class="side-card"><h3>📊 Seu próximo passo</h3><p>Escolha um curso, conclua as aulas e faça o quiz final.</p><div class="metric"><span>Cursos em destaque</span><strong>${spotlightCourses.length}</strong></div><div class="metric"><span>Certificado</span><strong>Após aprovação</strong></div><a href="/entrar" class="section-link">Acompanhar evolução →</a></div>
        </div></aside></div></div>
        <script>(function(){
            var input = document.getElementById('home-search');
            var empty = document.getElementById('home-empty-search');
            if (!input) return;
            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();
                var cards = document.querySelectorAll('[data-course-title]');
                var visible = 0;
                cards.forEach(function (card) {
                    var match = !query || card.getAttribute('data-course-title').indexOf(query) !== -1;
                    card.style.display = match ? '' : 'none';
                    if (match) visible++;
                });
                empty.style.display = query && visible === 0 ? 'block' : 'none';
            });
        })();
        (function () {
            var section = document.getElementById('continue-section');
            var list = document.getElementById('continue-list');
            if (!${showContinue ? 'true' : 'false'} || !section || !list) return;
            fetch('/api/cursos/progresso?limit=6', { credentials: 'same-origin' })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (payload) {
                    var summaries = payload && Array.isArray(payload.data) ? payload.data : [];
                    if (!summaries.length) return;
                    list.innerHTML = summaries.map(function (item) {
                        var total = item.totalLessons || 0;
                        var done = item.completedCount || 0;
                        var percent = total > 0 ? Math.round((done / total) * 100) : 0;
                        var href = '/cursos/' + encodeURIComponent(item.courseSlug);
                        var title = String(item.courseTitle || '');
                        var span = document.createElement('span');
                        span.textContent = title;
                        return '<a class="continue-card" href="' + href + '"><h3>' + span.innerHTML + '</h3><small>' + done + ' de ' + total + ' aulas concluídas</small><div class="progress-bar"><span style="width:' + percent + '%"></span></div></a>';
                    }).join('');
                    section.hidden = false;
                })
                .catch(function () {});
        })();</script>`;

    return publicPage({ title: 'ObraPro | Aprenda a construir com clareza', activePath: '/', body, extraStyles: `${homeStyles}${homeVisualOverrides}${marketingStyles}${referenceStyles}${referenceHeaderStyles}${referenceIconStyles}` });
}
