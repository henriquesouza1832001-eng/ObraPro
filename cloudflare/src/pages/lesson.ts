import type { Course, CourseModule } from '../data/course';
import { escapeHtml, publicPage } from './layout';

export interface FlatLesson {
    moduleTitle: string;
    id: string;
    title: string;
    durationMinutes: number;
}

export function flattenLessons(modules: CourseModule[]): FlatLesson[] {
    return modules.flatMap((module) => module.lessons.map((lesson) => ({ moduleTitle: module.title, ...lesson })));
}

const lessonStyles = `.back{color:#1267e8;font-weight:800}.lesson-head{padding:20px 5vw 4px}.lesson-head .eyebrow{color:#f47b20;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.lesson-head h1{font-size:clamp(22px,3.6vw,30px);line-height:1.2;margin:8px 0 4px;color:#10233f;max-width:820px}.lesson-head p{color:#5b6a72;font-size:13.5px;margin:0}.layout{max-width:760px;margin:0 auto;padding:16px 5vw 34px;display:flex;flex-direction:column;gap:18px}.progress-row{display:flex;align-items:center;gap:8px;font-size:13px;color:#10233f;background:#eef5ff;border-radius:999px;padding:8px 14px;align-self:flex-start}.lesson-status{padding:16px;border-radius:7px;background:#eef5ff;color:#10233f;font-size:14px}.lesson-status.is-error{background:#fef2f2;color:#991b1b}.lesson-section{background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:20px}.lesson-section h2{font-size:16px;margin:0 0 10px}.lesson-section p{color:#374151;line-height:1.6;white-space:pre-line}.lesson-section ul,.lesson-section ol{margin:0;padding-left:20px;color:#374151;line-height:1.7}.safety-box{background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid #f47b20;color:#7c3a0a}.safety-box h2{display:flex;align-items:center;gap:8px;color:#7c3a0a}.lesson-nav{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:8px}.lesson-nav a{padding:12px 16px;border-radius:6px;border:1px solid #d9e0dd;font-weight:800;color:#10233f}.lesson-nav a:focus-visible,.back:focus-visible{outline:3px solid #1267e8;outline-offset:2px}`;

export function renderLessonDetail(course: Course, lesson: FlatLesson, prev: FlatLesson | null, next: FlatLesson | null): string {
    const safeCourseSlug = encodeURIComponent(course.slug);
    const navLinks = `<nav class="lesson-nav" aria-label="Navegação entre aulas">${prev ? `<a href="/cursos/${safeCourseSlug}/aulas/${encodeURIComponent(prev.id)}">← ${escapeHtml(prev.title)}</a>` : '<span></span>'}${next ? `<a href="/cursos/${safeCourseSlug}/aulas/${encodeURIComponent(next.id)}">${escapeHtml(next.title)} →</a>` : '<span></span>'}</nav>`;

    const body = `<a class="back" style="display:block;padding:12px 5vw;background:#fff;border-bottom:1px solid #d9e0dd" href="/cursos/${safeCourseSlug}">← ${escapeHtml(course.title)}</a>
<div class="lesson-head"><span class="eyebrow">${escapeHtml(lesson.moduleTitle)}</span><h1>${escapeHtml(lesson.title)}</h1><p>${lesson.durationMinutes} min · ${escapeHtml(course.title)}</p></div>
<main class="layout">
    <div class="progress-row" id="lesson-progress-row" hidden><label><input type="checkbox" id="lesson-complete-check" disabled> Marcar esta aula como concluída</label></div>
    <p class="lesson-status" id="lesson-status" role="status" aria-live="polite">Carregando conteúdo da aula...</p>
    <section class="lesson-section" id="lesson-body-section" hidden><h2>Conteúdo</h2><p id="lesson-body"></p></section>
    <section class="lesson-section" id="lesson-materials-section" hidden><h2>Materiais</h2><ul id="lesson-materials"></ul></section>
    <section class="lesson-section" id="lesson-tools-section" hidden><h2>Ferramentas</h2><ul id="lesson-tools"></ul></section>
    <section class="lesson-section" id="lesson-steps-section" hidden><h2>Passo a passo</h2><ol id="lesson-steps"></ol></section>
    <section class="lesson-section safety-box" id="lesson-safety-section" hidden><h2><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2 2 20h20L12 2z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg> Aviso técnico ObraPro</h2><p id="lesson-safety"></p></section>
    ${navLinks}
</main>
<script>(function(){
    var courseSlug = ${JSON.stringify(course.slug)};
    var lessonId = ${JSON.stringify(lesson.id)};
    var status = document.getElementById('lesson-status');
    var sections = {
        body: document.getElementById('lesson-body-section'),
        materials: document.getElementById('lesson-materials-section'),
        tools: document.getElementById('lesson-tools-section'),
        steps: document.getElementById('lesson-steps-section'),
        safety: document.getElementById('lesson-safety-section')
    };
    var progressRow = document.getElementById('lesson-progress-row');
    var completeCheck = document.getElementById('lesson-complete-check');

    function fillList(el, items) {
        el.innerHTML = '';
        items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            el.appendChild(li);
        });
    }

    function showError(message) {
        status.hidden = false;
        status.classList.add('is-error');
        status.textContent = message;
    }

    function loadProgress() {
        fetch('/api/cursos/' + encodeURIComponent(courseSlug) + '/progresso', { credentials: 'same-origin' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (payload) {
                if (!payload || !payload.data) return;
                var completed = payload.data.completedLessonIds || [];
                completeCheck.checked = completed.indexOf(lessonId) !== -1;
                completeCheck.disabled = false;
                progressRow.hidden = false;
            })
            .catch(function () {});
    }

    completeCheck.addEventListener('change', function () {
        var wasChecked = completeCheck.checked;
        completeCheck.disabled = true;
        fetch('/api/cursos/' + encodeURIComponent(courseSlug) + '/aulas/' + encodeURIComponent(lessonId) + '/progresso', { method: 'POST', credentials: 'same-origin' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (payload) {
                completeCheck.disabled = false;
                if (!payload || !payload.data) { completeCheck.checked = !wasChecked; }
            })
            .catch(function () {
                completeCheck.disabled = false;
                completeCheck.checked = !wasChecked;
            });
    });

    fetch('/api/cursos/' + encodeURIComponent(courseSlug) + '/aulas/' + encodeURIComponent(lessonId) + '/conteudo', { credentials: 'same-origin' })
        .then(function (res) {
            if (res.status === 401) { showError('Entre na sua conta para acessar esta aula.'); return null; }
            if (res.status === 403) { showError('Você precisa se matricular no curso para acessar esta aula.'); return null; }
            if (res.status === 404) { showError('O conteúdo desta aula ainda não foi publicado.'); return null; }
            if (!res.ok) { showError('Não foi possível carregar o conteúdo agora. Tente novamente.'); return null; }
            return res.json();
        })
        .then(function (payload) {
            if (!payload || !payload.data) return;
            var data = payload.data;
            status.hidden = true;

            if (data.body) {
                document.getElementById('lesson-body').textContent = data.body;
                sections.body.hidden = false;
            }
            if (data.materials && data.materials.length) {
                fillList(document.getElementById('lesson-materials'), data.materials);
                sections.materials.hidden = false;
            }
            if (data.tools && data.tools.length) {
                fillList(document.getElementById('lesson-tools'), data.tools);
                sections.tools.hidden = false;
            }
            if (data.steps && data.steps.length) {
                fillList(document.getElementById('lesson-steps'), data.steps);
                sections.steps.hidden = false;
            }
            if (data.safetyNotes) {
                document.getElementById('lesson-safety').textContent = data.safetyNotes;
                sections.safety.hidden = false;
            }

            loadProgress();
        })
        .catch(function () {
            showError('Não foi possível carregar o conteúdo agora. Tente novamente.');
        });
})();</script>`;

    return publicPage({ title: `${lesson.title} | ${course.title} | ObraPro`, activePath: '/cursos', body, extraStyles: lessonStyles });
}

export function renderLessonNotFound(course: Course): string {
    const body = `<main class="content" style="text-align:center;padding-top:80px"><h1>Aula não encontrada</h1><p style="color:#60706a;margin-top:8px">Esse link pode estar desatualizado.</p><a class="button" style="display:inline-block;margin-top:24px" href="/cursos/${encodeURIComponent(course.slug)}">Voltar ao curso</a></main>`;

    return publicPage({ title: `Aula não encontrada | ${course.title} | ObraPro`, activePath: '/cursos', body, extraStyles: '.button{padding:14px 22px;background:#1267e8;color:#fff;border-radius:6px;font-weight:800}.button:focus-visible{outline:3px solid #1267e8;outline-offset:2px}' });
}
