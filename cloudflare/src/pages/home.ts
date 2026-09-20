import type { Course } from '../data/course';
import { escapeHtml, publicPage } from './layout';
import { categoryAccent, categoryKey, priceLabel } from './courses';

/**
 * Home publica de aprendizagem, fiel ao mockup do responsavel: saudacao, busca
 * e categorias coloridas por etapa da construcao. Usa somente dados reais do
 * CourseRepository (o mesmo contrato ja consumido por /cursos); nenhum
 * endpoint novo foi criado. Aula com video/manual, passo a passo, checklist
 * opcional, matricula e progresso exigem um contrato de conteudo de aula que
 * ainda nao existe e nao foram inventados aqui.
 */
const homeStyles = `.home-hero{padding:44px 5vw 34px;background:#10233f;color:#fff}.home-hero .eyebrow{color:#ffb04c;font-size:12px;font-weight:800;letter-spacing:.06em}.home-hero h1{font-size:clamp(26px,4.4vw,38px);line-height:1.15;margin:12px 0 8px;font-weight:800}.home-hero p{color:#c6d3e6;font-size:15.5px;max-width:640px}
.search{margin-top:22px;max-width:560px;position:relative}.search input{width:100%;min-height:50px;border-radius:8px;border:none;background:#fff;padding:0 44px;font-size:16px;color:#10233f}.search svg{position:absolute;top:15px;left:14px;color:#8a97a3}
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
.empty-search{display:none;margin-top:16px;padding:20px;border:1px dashed #d9c9a3;border-radius:8px;color:#60706a;text-align:center}`;

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

        return `<a class="card" style="border-top-color:${accent}" href="/cursos/${encodeURIComponent(course.slug)}" data-course-title="${escapeHtml(course.title.toLocaleLowerCase('pt-BR'))}"><span class="tag">${escapeHtml(course.category)}</span><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p><div class="markers"><span>${course.modulesCount} módulos</span><span>${course.durationMinutes} min</span></div></a>`;
    }).join('')}</div>`;
}

export function renderLearningHome(courses: Course[]): string {
    const counts: Record<string, number> = {};
    const labels = new Map<string, { label: string; count: number }>();
    courses.forEach((course) => {
        const key = categoryKey(course.category);
        counts[key] = (counts[key] ?? 0) + 1;
        labels.set(key, { label: course.category, count: counts[key] });
    });

    const freeCourses = courses.filter((course) => course.accessType === 'free');
    const premiumCourses = courses.filter((course) => course.accessType === 'premium');
    const categoryLabels = [...labels.entries()]
        .sort((left, right) => right[1].count - left[1].count || left[1].label.localeCompare(right[1].label, 'pt-BR'))
        .slice(0, 8)
        .map(([key, value]) => ({ key, label: value.label, tagline: `Aprenda ${value.label.toLocaleLowerCase('pt-BR')} por etapas` }));
    const freePreview = freeCourses.slice(0, 6);
    const premiumPreview = premiumCourses.slice(0, 6);

    const body = `
        <section class="home-hero">
            <span class="eyebrow">Passo a passo. Obra bem feita.</span>
            <h1>Olá! O que você quer aprender hoje?</h1>
            <p>Escolha uma etapa da construção e aprenda com aulas simples, visuais e práticas.</p>
            <label class="search">
                <span class="sr-only">Buscar curso ou aula</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="search" id="home-search" placeholder="Buscar curso ou aula...">
            </label>
            <div class="categories">${categoryLabels.map(({ key, label, tagline }) => categoryCard(key, label, tagline, counts[key] ?? 0)).join('')}</div>
        </section>
        <main class="content" style="padding-top:0">
            ${freeCourses.length > 0 ? `<div class="section-title"><div><h2>Cursos gratuitos para começar</h2><small class="section-note">${freeCourses.length} cursos disponíveis</small></div><a href="/cursos?acesso=free">Ver todos</a></div>${courseRow(freePreview)}` : ''}
            ${premiumCourses.length > 0 ? `<div class="section-title"><div><h2>Cursos completos e premium</h2><small class="section-note">${premiumCourses.length} cursos disponíveis</small></div><a href="/cursos?acesso=premium">Ver todos</a></div>${courseRow(premiumPreview)}` : ''}
            ${courses.length === 0 ? '<p class="empty" style="margin-top:24px;padding:32px;border:1px dashed #b9c5c0;border-radius:7px;text-align:center;color:#60706a">Nenhum curso publicado no momento. Volte em breve — novo conteúdo está a caminho.</p>' : ''}
            <p class="empty-search" id="home-empty-search">Nenhum curso encontrado para essa busca.</p>
        </main>
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
        })();</script>`;

    return publicPage({ title: 'ObraPro | Aprenda a construir com clareza', activePath: '/', body, extraStyles: homeStyles });
}
