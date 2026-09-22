import type { Course, CourseModule } from '../data/course';
import { escapeHtml, publicPage } from './layout';

const catalogStyles = `.heading{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap}.heading h2{font-size:20px;margin:0}.count{padding:8px 12px;border-radius:999px;background:#e8f6ef;color:#176b4d;font-weight:800;font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px;margin-top:20px}.card{display:flex;flex-direction:column;min-height:230px;padding:18px;border:1px solid #e4dcc8;border-top:4px solid #94a3b8;border-radius:8px;background:#fff;transition:.15s}.card:hover{border-color:#1267e8;border-top-color:#1267e8}.card:focus-visible{outline:3px solid #1267e8;outline-offset:2px}.tag{align-self:flex-start;padding:6px 9px;border-radius:5px;background:#eef5ff;color:#1267e8;font-size:11px;font-weight:800}.access-tag{background:#e8f6ef;color:#176b4d}.access-tag.is-premium{background:#fff7ed;color:#92400e}.price{color:#176b4d;font-size:13px;font-weight:800}.card h3{font-size:18px;line-height:1.25;margin:14px 0 6px}.card p{color:#60706a;line-height:1.5;font-size:14px;flex:1}.meta{border-top:1px solid #edf0ef;padding-top:12px;color:#60706a;font-size:13px;display:flex;justify-content:space-between;gap:8px}.cta{color:#1267e8;font-weight:800}.empty{margin-top:20px;padding:28px;border:1px dashed #d9c9a3;border-radius:7px;text-align:center;color:#60706a}`;

export const categoryAccent: Record<string, string> = {
    fundacoes: '#2563eb',
    alvenaria: '#f47b20',
    hidraulica: '#0891b2',
    eletrica: '#f5b301',
    acabamentos: '#9333ea',
    estrutura: '#334155',
    vedacoes: '#0f766e',
    esquadrias: '#c2410c',
    pintura: '#7c3aed',
    instalacoes: '#0284c7',
    infraestrutura: '#15803d',
    pavimentacao: '#57534e',
    comissionamento: '#be123c',
    planejamento: '#1d4ed8',
    cobertura: '#0369a1',
    gestao: '#166534',
    protecao: '#a16207',
};

export function categoryKey(category: string): string {
    return category.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function categoryBucket(category: string): string {
    const key = categoryKey(category);

    return categoryAccent[key] ? key : 'outros';
}

function searchKey(value: string): string {
    return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function priceLabel(course: Course): string {
    if (course.accessType === 'free' || course.priceCents === null) {
        return 'Gratuito';
    }

    return `R$ ${(course.priceCents / 100).toFixed(2).replace('.', ',')}`;
}

const arrowRightIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:inline;vertical-align:-2px"><polyline points="9 18 15 12 9 6"/></svg>';
const arrowLeftIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:inline;vertical-align:-2px"><polyline points="15 18 9 12 15 6"/></svg>';

function categoryFilterLabels(courses: Course[]): Array<{ key: string; label: string }> {
    const labels = new Map<string, string>();
    courses.forEach((course) => labels.set(categoryKey(course.category), course.category));

    return [...labels.entries()]
        .map(([key, label]) => ({ key, label }))
        .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
}

function courseCard(course: Course): string {
    const moduleBadge = course.instructionModule ? `<span class="module-badge">${escapeHtml(course.instructionModule.title)}</span>` : '';
    const accessTag = course.accessType === 'free'
        ? '<span class="tag access-tag">Gratuito</span>'
        : '<span class="tag access-tag is-premium">Premium</span>';
    const accent = categoryAccent[categoryBucket(course.category)] ?? '#94a3b8';
    const searchable = searchKey(`${course.title} ${course.description} ${course.category}`);

    return `<a class="card" data-course-card data-course-search="${escapeHtml(searchable)}" style="border-top-color:${accent}" href="/cursos/${encodeURIComponent(course.slug)}"><div class="heading"><span class="tag">${escapeHtml(course.category)}</span>${accessTag}</div><h3>${escapeHtml(course.title)}</h3>${moduleBadge}<p>${escapeHtml(course.description)}</p><div class="meta"><span>${course.modulesCount} módulos</span><span>${course.durationMinutes} min</span><span class="cta">Ver curso ${arrowRightIcon}</span></div></a>`;
}

export function renderCourseCatalog(courses: Course[], activeCategory?: string, activeAccess?: string, activeSearch?: string): string {
    const normalizedSearch = searchKey(activeSearch?.trim() ?? '');
    const byCategory = activeCategory ? courses.filter((course) => categoryKey(course.category) === activeCategory) : courses;
    const filtered = activeAccess ? byCategory.filter((course) => course.accessType === activeAccess) : byCategory;
    const bySearch = normalizedSearch ? filtered.filter((course) => searchKey(`${course.title} ${course.description} ${course.category}`).includes(normalizedSearch)) : filtered;
    const grid = bySearch.length > 0
        ? `<div class="grid" id="course-grid">${bySearch.map(courseCard).join('')}</div>`
        : '<p class="empty">Nenhum curso publicado com esses filtros ainda. Volte em breve — novo conteúdo está a caminho.</p>';

    const linkFor = (category?: string, access?: string): string => {
        const params = new URLSearchParams();
        if (category) params.set('categoria', category);
        if (access) params.set('acesso', access);
        if (activeSearch) params.set('busca', activeSearch);

        return `/cursos${params.toString() ? `?${params.toString()}` : ''}`;
    };
    const categories = categoryFilterLabels(courses);
    const filters = `<div class="filters" aria-label="Filtrar por categoria"><a class="filter${!activeCategory ? ' is-active' : ''}" href="${linkFor(undefined, activeAccess)}">Todos</a>${categories.map(({ key, label }) => `<a class="filter${activeCategory === key ? ' is-active' : ''}" href="${linkFor(key, activeAccess)}">${escapeHtml(label)}</a>`).join('')}</div>`;
    const accessFilters = `<div class="filters" aria-label="Filtrar por acesso"><a class="filter${!activeAccess ? ' is-active' : ''}" href="${linkFor(activeCategory, undefined)}">Todos os acessos</a><a class="filter${activeAccess === 'free' ? ' is-active' : ''}" href="${linkFor(activeCategory, 'free')}">Gratuito</a><a class="filter${activeAccess === 'premium' ? ' is-active' : ''}" href="${linkFor(activeCategory, 'premium')}">Premium</a></div>`;
    const searchForm = `<form class="catalog-search" method="get" action="/cursos" role="search"><label for="course-search">Buscar curso ou etapa</label><div class="search-row"><input id="course-search" name="busca" type="search" value="${escapeHtml(activeSearch ?? '')}" placeholder="Ex.: fundação, pintura, elétrica"><input type="hidden" name="categoria" value="${escapeHtml(activeCategory ?? '')}"><input type="hidden" name="acesso" value="${escapeHtml(activeAccess ?? '')}"><button type="submit">Buscar</button></div></form>`;
    const loadMore = bySearch.length > 24 ? '<button class="load-more" id="load-more-courses" type="button">Mostrar mais cursos</button>' : '';

    const body = `<div class="page-head"><span class="eyebrow">Catálogo</span><h1>Escolha o que você quer aprender a fazer</h1><p>Encontre uma etapa, veja o caminho completo e comece pela aula certa.</p></div><main class="content catalog-content">${searchForm}<div class="heading"><h2 id="course-result-count" aria-live="polite">${bySearch.length} ${bySearch.length === 1 ? 'curso encontrado' : 'cursos encontrados'}</h2></div>${filters}${accessFilters}${grid}${loadMore}</main><script>(function(){var input=document.getElementById('course-search');var cards=Array.prototype.slice.call(document.querySelectorAll('[data-course-card]'));var result=document.getElementById('course-result-count');var more=document.getElementById('load-more-courses');var pageSize=24;var expanded=false;function fold(value){return (value||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}function apply(){var query=fold(input&&input.value);var visible=0;var matches=0;cards.forEach(function(card){var match=!query||fold(card.getAttribute('data-course-search')).indexOf(query)!==-1;if(match)matches++;var show=match&&(expanded||visible<pageSize);card.hidden=!show;if(show)visible++;});if(result)result.textContent=matches+' '+(matches===1?'curso encontrado':'cursos encontrados');if(more)more.hidden=matches<=pageSize||expanded;}if(input)input.addEventListener('input',function(){expanded=false;apply();});if(more)more.addEventListener('click',function(){expanded=true;apply();});apply();})();</script>`;

    return publicPage({ title: 'Cursos de obra | ObraPro', activePath: '/cursos', body, extraStyles: `${catalogStyles}.catalog-content{padding-top:24px}.catalog-search{max-width:760px;margin-bottom:24px}.catalog-search label{display:block;font-weight:800;font-size:13px;margin-bottom:8px}.search-row{display:flex;gap:8px}.search-row input[type="search"]{min-width:0;flex:1;border:1px solid #cfd9d5;border-radius:7px;padding:12px 14px;font:inherit;color:#10233f;background:#fff}.search-row input[type="hidden"]{display:none}.search-row button,.load-more{border:0;border-radius:6px;padding:12px 16px;background:#1267e8;color:#fff;font:inherit;font-weight:800;cursor:pointer}.search-row button:focus-visible,.load-more:focus-visible{outline:3px solid #ffb04c;outline-offset:2px}.grid [hidden]{display:none}.filters{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.filter{padding:8px 13px;border-radius:999px;border:1px solid #d9e0dd;font-weight:700;font-size:13px;color:#10233f}.filter.is-active{background:#10233f;color:#fff;border-color:#10233f}.filter:focus-visible{outline:3px solid #1267e8;outline-offset:2px}.module-badge{align-self:flex-start;margin-top:8px;font-size:11px;font-weight:700;color:#60706a}.load-more{display:block;margin:24px auto 0;background:#fff;color:#1267e8;border:1px solid #1267e8}@media(max-width:560px){.search-row{display:grid}.search-row button{width:100%}}` });
}

const detailStyles = `.back{color:#1267e8;font-weight:800}.detail-inner,.detail-content{max-width:1080px;margin:auto}.tag{display:inline-block;padding:6px 9px;border-radius:5px;background:#eef5ff;color:#1267e8;font-size:11px;font-weight:800;text-transform:uppercase}.module-tag{background:#f4f7f6;color:#5b6a72;margin-right:8px}.detail-inner h1{font-size:clamp(24px,3.6vw,32px);line-height:1.2;max-width:820px;margin:12px 0 10px;color:#10233f}.detail-inner p{max-width:760px;color:#5b6a72;font-size:15px;line-height:1.6}.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;padding:8px 5vw 38px}.module-card{background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:0;margin-top:12px;overflow:hidden}.module-card summary{cursor:pointer;padding:16px 18px;font-weight:800;font-size:15px;color:#10233f;list-style:none;display:flex;justify-content:space-between;gap:12px}.module-card summary::-webkit-details-marker{display:none}.module-card summary:focus-visible{outline:3px solid #1267e8;outline-offset:-3px}.module-card[open] summary{border-bottom:1px solid #edf0ef}.module-card .lessons{padding:4px 18px 8px}.lesson{color:#60706a;line-height:1.5;padding:10px 0;border-top:1px solid #f4f6f5;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lesson:first-child{border-top:none}.lesson a{color:#10233f}.lesson strong{color:#10233f;font-weight:700}.aside{height:max-content;background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:20px}.button{display:block;width:100%;text-align:center;background:#1267e8;color:#fff;border:none;border-radius:6px;padding:13px;font-weight:800;margin-top:18px;font-size:15px;cursor:pointer;font-family:inherit}.button:disabled{opacity:.6;cursor:default}.back:focus-visible,.button:focus-visible,.lesson-check:focus-visible{outline:3px solid #1267e8;outline-offset:2px}.progress-box{margin-top:14px}.progress-bar{height:8px;background:#eef1f0;border-radius:999px;overflow:hidden;margin-top:6px}.progress-bar span{display:block;height:100%;background:#1267e8}.access-status{margin-top:14px;font-size:13px;color:#60706a}@media(max-width:760px){.layout{grid-template-columns:1fr}}`;

export function renderCourseDetail(course: Course, modules: CourseModule[]): string {
    const safeCourseSlug = encodeURIComponent(course.slug);
    const moduleList = modules.map((module, index) => `<details class="module-card"${index === 0 ? ' open' : ''}><summary>Módulo ${index + 1}: ${escapeHtml(module.title)}<span>${module.lessons.length} ${module.lessons.length === 1 ? 'aula' : 'aulas'}</span></summary><div class="lessons">${module.lessons.map((lesson) => `<div class="lesson"><input type="checkbox" class="lesson-check" data-lesson-id="${escapeHtml(lesson.id)}" aria-label="Marcar aula concluída: ${escapeHtml(lesson.title)}" disabled><a href="/cursos/${safeCourseSlug}/aulas/${encodeURIComponent(lesson.id)}"><strong>${escapeHtml(lesson.title)}</strong></a><span>· ${lesson.durationMinutes} min</span></div>`).join('')}</div></details>`).join('');

    const moduleTag = course.instructionModule ? `<span class="tag module-tag">Módulo ${course.instructionModule.position}: ${escapeHtml(course.instructionModule.title)}</span>` : '';

    const body = `<a class="back" style="display:block;padding:12px 5vw;background:#fff;border-bottom:1px solid #d9e0dd" href="/cursos">${arrowLeftIcon} Todos os cursos</a><div class="detail-inner" style="padding:24px 5vw 0">${moduleTag}<span class="tag">${escapeHtml(course.category)}</span><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(course.description)}</p></div><main class="layout"><section class="detail-content"><h2 style="font-size:16px;color:#5b6a72;margin:0 0 4px">Currículo do curso</h2>${moduleList}</section><aside class="aside"><strong>${priceLabel(course)}</strong><p style="color:#60706a;font-size:13px;margin-top:4px">Aulas curtas e passo a passo para você aprender fazendo.</p><a class="button" id="course-cta-login" href="/entrar">Começar agora</a><button class="button" id="course-cta-enroll" type="button" hidden>Matricular-se gratuitamente</button><p class="access-status" id="course-access-status" role="status" aria-live="polite">Verificando seu acesso...</p><div id="course-progress" class="progress-box" hidden><strong id="course-progress-text"></strong><div class="progress-bar"><span id="course-progress-fill" style="width:0"></span></div></div><a class="button" id="course-quiz-link" href="/cursos/${encodeURIComponent(course.slug)}/quiz" hidden>Fazer quiz final</a><small>Estudo educativo. Não substitui projeto ou responsável técnico.</small></aside></main>
<script>(function(){
    var slug = ${JSON.stringify(course.slug)};
    var progressBox = document.getElementById('course-progress');
    var progressText = document.getElementById('course-progress-text');
    var progressFill = document.getElementById('course-progress-fill');
    var loginCta = document.getElementById('course-cta-login');
    var enrollButton = document.getElementById('course-cta-enroll');
    var accessStatus = document.getElementById('course-access-status');
    var quizLink = document.getElementById('course-quiz-link');
    var lessonChecks = document.querySelectorAll('.lesson-check');

    function renderProgress(data) {
        if (!progressBox || !data) return;
        var total = data.totalLessons || 0;
        var done = data.completedCount || 0;
        if (total === 0) return;
        progressText.textContent = done + ' de ' + total + ' aulas concluídas';
        progressFill.style.width = Math.round((done / total) * 100) + '%';
        progressBox.hidden = false;
        var completed = data.completedLessonIds || [];
        lessonChecks.forEach(function (check) {
            check.checked = completed.indexOf(check.getAttribute('data-lesson-id')) !== -1;
        });
    }

    function loadProgress() {
        fetch('/api/cursos/' + encodeURIComponent(slug) + '/progresso', { credentials: 'same-origin' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (payload) { if (payload && payload.data) renderProgress(payload.data); })
            .catch(function () {});
    }

    function enableLessonChecks(enabled) {
        lessonChecks.forEach(function (check) { check.disabled = !enabled; });
    }

    function renderAccess(access) {
        if (!accessStatus) return;
        if (loginCta) loginCta.hidden = true;
        if (enrollButton) enrollButton.hidden = true;
        if (!access) {
            accessStatus.textContent = '';
            enableLessonChecks(false);
            return;
        }
        if (access.enrolled) {
            if (quizLink) quizLink.hidden = false;
            accessStatus.textContent = 'Você está matriculado. Continue de onde parou.';
            enableLessonChecks(true);
            loadProgress();
        } else if (access.accessType === 'free') {
            accessStatus.textContent = 'Curso gratuito — matricule-se para acompanhar seu progresso.';
            if (enrollButton) enrollButton.hidden = false;
            enableLessonChecks(false);
        } else {
            accessStatus.textContent = 'Conteúdo premium ainda não liberado para sua conta.';
            enableLessonChecks(false);
        }
    }

    function loadAccess() {
        fetch('/api/cursos/' + encodeURIComponent(slug) + '/acesso', { credentials: 'same-origin' })
            .then(function (res) {
                if (res.status === 401) {
                    if (accessStatus) accessStatus.textContent = 'Entre para começar este curso.';
                    if (loginCta) loginCta.hidden = false;
                    return null;
                }
                return res.ok ? res.json() : null;
            })
            .then(function (payload) {
                if (payload === null) return;
                if (!payload || !payload.data) {
                    if (accessStatus) accessStatus.textContent = 'Não foi possível verificar seu acesso agora.';
                    if (loginCta) loginCta.hidden = false;
                    return;
                }
                renderAccess(payload.data);
            })
            .catch(function () {
                if (accessStatus) accessStatus.textContent = 'Não foi possível verificar seu acesso agora.';
                if (loginCta) loginCta.hidden = false;
            });
    }

    if (enrollButton) {
        enrollButton.addEventListener('click', function () {
            enrollButton.disabled = true;
            fetch('/api/cursos/' + encodeURIComponent(slug) + '/matricula', { method: 'POST', credentials: 'same-origin' })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (payload) {
                    enrollButton.disabled = false;
                    if (payload && payload.data) {
                        renderAccess(payload.data);
                    } else if (accessStatus) {
                        accessStatus.textContent = 'Não foi possível concluir a matrícula agora. Tente novamente.';
                    }
                })
                .catch(function () {
                    enrollButton.disabled = false;
                    if (accessStatus) accessStatus.textContent = 'Não foi possível concluir a matrícula agora. Tente novamente.';
                });
        });
    }

    lessonChecks.forEach(function (check) {
        check.addEventListener('change', function () {
            var lessonId = check.getAttribute('data-lesson-id');
            var wasChecked = check.checked;
            check.disabled = true;
            fetch('/api/cursos/' + encodeURIComponent(slug) + '/aulas/' + encodeURIComponent(lessonId) + '/progresso', { method: 'POST', credentials: 'same-origin' })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (payload) {
                    check.disabled = false;
                    if (payload && payload.data) {
                        renderProgress(payload.data);
                    } else {
                        check.checked = !wasChecked;
                    }
                })
                .catch(function () {
                    check.disabled = false;
                    check.checked = !wasChecked;
                });
        });
    });

    loadAccess();
})();</script>`;

    return publicPage({ title: `${course.title} | ObraPro`, activePath: '/cursos', body, extraStyles: detailStyles });
}

export function renderCourseNotFound(): string {
    const body = `<main class="content" style="text-align:center;padding-top:80px"><h1>Curso não encontrado</h1><p style="color:#60706a;margin-top:8px">Esse link pode estar desatualizado ou o curso ainda não foi publicado.</p><a class="button" style="display:inline-block;margin-top:24px" href="/cursos">Voltar ao catálogo</a></main>`;

    return publicPage({ title: 'Curso não encontrado | ObraPro', activePath: '/cursos', body, extraStyles: '.button{padding:14px 22px;background:#1267e8;color:#fff;border-radius:6px;font-weight:800}.button:focus-visible{outline:3px solid #1267e8;outline-offset:2px}' });
}
