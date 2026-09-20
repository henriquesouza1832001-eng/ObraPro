import type { Course, CourseModule } from '../data/course';
import { publicPage } from './layout';

const catalogStyles = `.heading{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap}.heading h2{font-size:28px;margin:0}.count{padding:10px 14px;border-radius:999px;background:#e8f6ef;color:#176b4d;font-weight:800}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:18px;margin-top:28px}.card{display:flex;flex-direction:column;min-height:245px;padding:20px;border:1px solid #d9e0dd;border-radius:7px;background:#fff;box-shadow:0 8px 22px #10233f0b;transition:.2s}.card:hover{transform:translateY(-3px);border-color:#1267e8}.tag{align-self:flex-start;padding:8px 10px;border-radius:5px;background:#eef5ff;color:#1267e8;font-size:11px;font-weight:800;text-transform:uppercase}.price{color:#176b4d;font-size:13px;font-weight:800}.card h3{font-size:19px;line-height:1.25;margin:20px 0 8px}.card p{color:#60706a;line-height:1.5;font-size:14px;flex:1}.meta{border-top:1px solid #edf0ef;padding-top:14px;color:#60706a;font-size:13px;display:flex;justify-content:space-between;gap:8px}.cta{color:#1267e8;font-weight:800}.empty{margin-top:28px;padding:32px;border:1px dashed #b9c5c0;border-radius:7px;text-align:center;color:#60706a}`;

const categoryKeys = ['fundacoes', 'alvenaria', 'hidraulica', 'eletrica', 'acabamentos'] as const;

export function categoryBucket(category: string): string {
    const key = category.trim().toLowerCase();

    return (categoryKeys as readonly string[]).includes(key) ? key : 'outros';
}

export function priceLabel(course: Course): string {
    if (course.accessType === 'free' || course.priceCents === null) {
        return 'Gratuito';
    }

    return `R$ ${(course.priceCents / 100).toFixed(2).replace('.', ',')}`;
}

const arrowRightIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:inline;vertical-align:-2px"><polyline points="9 18 15 12 9 6"/></svg>';
const arrowLeftIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:inline;vertical-align:-2px"><polyline points="15 18 9 12 15 6"/></svg>';

const categoryFilterLabels: Array<{ key: string; label: string }> = [
    { key: 'fundacoes', label: 'Fundações' },
    { key: 'alvenaria', label: 'Alvenaria' },
    { key: 'hidraulica', label: 'Hidráulica' },
    { key: 'eletrica', label: 'Elétrica' },
    { key: 'acabamentos', label: 'Acabamentos' },
    { key: 'outros', label: 'Outros' },
];

function courseCard(course: Course): string {
    return `<a class="card" href="/cursos/${course.slug}"><div class="heading"><span class="tag">${course.category}</span><span class="price">${priceLabel(course)}</span></div><h3>${course.title}</h3><p>${course.description}</p><div class="meta"><span>${course.modulesCount} módulos</span><span>${course.durationMinutes} min</span><span class="cta">Ver curso ${arrowRightIcon}</span></div></a>`;
}

export function renderCourseCatalog(courses: Course[], activeCategory?: string): string {
    const filtered = activeCategory ? courses.filter((course) => categoryBucket(course.category) === activeCategory) : courses;
    const grid = filtered.length > 0
        ? `<div class="grid">${filtered.map(courseCard).join('')}</div>`
        : '<p class="empty">Nenhum curso publicado nesta categoria ainda. Volte em breve — novo conteúdo está a caminho.</p>';

    const filters = `<div class="filters"><a class="filter${!activeCategory ? ' is-active' : ''}" href="/cursos">Todos</a>${categoryFilterLabels.map(({ key, label }) => `<a class="filter${activeCategory === key ? ' is-active' : ''}" href="/cursos?categoria=${key}">${label}</a>`).join('')}</div>`;

    const body = `<section class="hero"><span class="eyebrow">Cursos ObraPro</span><h1>Do terreno ao acabamento, com clareza em cada etapa.</h1><p>Conteúdo direto, checklists e orientação prática para construir com menos erro e mais confiança. Catálogo editorial inicial, em expansão.</p></section><main class="content"><div class="heading"><div><h2>Trilhas para sua obra</h2><p>Comece pelo conteúdo gratuito e avance no seu ritmo.</p></div><span class="count">${filtered.length} cursos publicados</span></div>${filters}${grid}</main>`;

    return publicPage({ title: 'Cursos de obra | ObraPro', activePath: '/cursos', body, extraStyles: `${catalogStyles}.filters{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.filter{padding:9px 14px;border-radius:999px;border:1px solid #d9e0dd;font-weight:700;font-size:13px;color:#10233f}.filter.is-active{background:#10233f;color:#fff;border-color:#10233f}.filter:focus-visible{outline:3px solid #1267e8;outline-offset:2px}` });
}

const detailStyles = `.back{color:#1267e8;font-weight:800}.hero-detail{background:#10233f;color:#fff;padding:54px 5vw}.hero-inner,.detail-content{max-width:1080px;margin:auto}.tag{display:inline-block;padding:8px 10px;border-radius:5px;background:#eef5ff;color:#1267e8;font-size:11px;font-weight:800;text-transform:uppercase}.hero-detail h1{font-size:clamp(34px,5vw,58px);line-height:1.05;max-width:820px;margin:20px 0 16px}.hero-detail p{max-width:760px;color:#dce5ef;font-size:18px;line-height:1.6}.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;padding:38px 5vw}.module-card{background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:20px;margin-top:14px}.module-card h2{margin:6px 0 8px;font-size:20px}.module-card p,.lesson{color:#60706a;line-height:1.5}.lesson{border-top:1px solid #edf0ef;padding-top:12px;margin-top:12px}.lesson strong{color:#10233f}.aside{height:max-content;background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:22px}.button{display:block;text-align:center;background:#1267e8;color:#fff;border-radius:6px;padding:14px;font-weight:800;margin-top:20px}@media(max-width:760px){.layout{grid-template-columns:1fr;padding-top:28px}.hero-detail{padding:42px 5vw}}`;

export function renderCourseDetail(course: Course, modules: CourseModule[]): string {
    const moduleList = modules.map((module, index) => `<article class="module-card"><small>Módulo ${index + 1}</small><h2>${module.title}</h2><p>Orientação curta, exemplos práticos e pontos de atenção para esta etapa.</p>${module.lessons.map((lesson) => `<div class="lesson"><strong>${lesson.title}</strong> · ${lesson.durationMinutes} min</div>`).join('')}</article>`).join('');

    const body = `<a class="back" style="display:block;padding:12px 5vw;background:#fff;border-bottom:1px solid #d9e0dd" href="/cursos">${arrowLeftIcon} Todos os cursos</a><section class="hero-detail"><div class="hero-inner"><span class="tag">${course.category} · ${priceLabel(course)}</span><h1>${course.title}</h1><p>${course.description}</p></div></section><main class="layout"><section class="detail-content"><h2>Conteúdo do curso</h2>${moduleList}</section><aside class="aside"><strong>Acesso ObraPro</strong><h2>Aprenda no seu ritmo</h2><p>Conteúdo direto, com módulos curtos e checklists para acompanhar sua obra.</p><a class="button" href="/entrar">Começar agora</a><small>Estudo educativo. Não substitui projeto ou responsável técnico.</small></aside></main>`;

    return publicPage({ title: `${course.title} | ObraPro`, activePath: '/cursos', body, extraStyles: detailStyles });
}

export function renderCourseNotFound(): string {
    const body = `<main class="content" style="text-align:center;padding-top:80px"><h1>Curso não encontrado</h1><p style="color:#60706a;margin-top:8px">Esse link pode estar desatualizado ou o curso ainda não foi publicado.</p><a class="button" style="display:inline-block;margin-top:24px" href="/cursos">Voltar ao catálogo</a></main>`;

    return publicPage({ title: 'Curso não encontrado | ObraPro', activePath: '/cursos', body, extraStyles: '.button{padding:14px 22px;background:#1267e8;color:#fff;border-radius:6px;font-weight:800}' });
}
