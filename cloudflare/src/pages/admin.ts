import { publicPage } from './layout';

const adminStyles = `.admin-hero{padding:36px 5vw;background:#10233f;color:#fff}.admin-hero h1{font-size:clamp(24px,4vw,32px);margin:0 0 6px}.admin-hero p{color:#dce5ef;font-size:14px;margin:0}.admin-content{max-width:1100px;margin:0 auto;padding:32px 5vw;display:flex;flex-direction:column;gap:28px}.admin-status{padding:16px;border-radius:7px;background:#eef5ff;color:#10233f;font-size:14px}.admin-status.is-error{background:#fef2f2;color:#991b1b}.admin-section{background:#fff;border:1px solid #d9e0dd;border-radius:7px;padding:20px}.admin-section h2{font-size:18px;margin:0 0 14px}.admin-module{border-top:1px solid #edf0ef;padding-top:14px;margin-top:14px}.admin-module:first-of-type{border-top:none;padding-top:0;margin-top:0}.admin-module-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.admin-module-head h3{margin:0;font-size:15px}.badge{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase}.badge.on{background:#e8f6ef;color:#176b4d}.badge.off{background:#f1f3f5;color:#60706a}.admin-course-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 0;border-top:1px solid #f4f6f5}.admin-course-row .info{color:#60706a;font-size:13px}.toggle-button{padding:8px 14px;border-radius:6px;border:1px solid #d9e0dd;background:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}.toggle-button:disabled{opacity:.6;cursor:default}.toggle-button:focus-visible{outline:3px solid #1267e8;outline-offset:2px}table.audit{width:100%;border-collapse:collapse;font-size:13px}table.audit th,table.audit td{text-align:left;padding:8px 10px;border-bottom:1px solid #edf0ef;vertical-align:top}table.audit th{color:#60706a;font-weight:700}.field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.field label{font-weight:700;font-size:13px;color:#10233f}.field input,.field textarea{border:1px solid #d9e0dd;border-radius:6px;padding:10px;font-family:inherit;font-size:14px}.field textarea{min-height:70px;resize:vertical}.field small{color:#60706a;font-size:12px}.inline-form{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}.version-card{border:1px solid #d9e0dd;border-radius:7px;padding:14px;margin-top:12px}.version-card .version-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.version-card pre{white-space:pre-wrap;font-family:inherit;font-size:13px;color:#374151;margin:8px 0}.badge.draft{background:#fff7ed;color:#92400e}.badge.archived{background:#f1f3f5;color:#60706a}`;

export function renderAdminPanel(): string {
    const body = `<section class="admin-hero"><h1>Painel administrativo</h1><p>Publicação de catálogo e auditoria — restrito a super administradores.</p></section>
<main class="admin-content">
    <p class="admin-status" id="admin-status" role="status" aria-live="polite">Verificando permissão...</p>
    <section class="admin-section" id="admin-catalog-section" hidden>
        <h2>Catálogo por módulo de instrução</h2>
        <div id="admin-catalog-empty" class="info" hidden>Nenhum módulo de instrução cadastrado ainda.</div>
        <div id="admin-catalog-list"></div>
    </section>
    <section class="admin-section" id="admin-audit-section" hidden>
        <h2>Auditoria de publicação</h2>
        <div id="admin-audit-empty" class="info" hidden>Nenhum evento de auditoria registrado ainda.</div>
        <table class="audit" id="admin-audit-table" hidden>
            <thead><tr><th>Quando</th><th>Ação</th><th>Recurso</th><th>Responsável</th></tr></thead>
            <tbody id="admin-audit-body"></tbody>
        </table>
    </section>
    <section class="admin-section" id="lesson-content-section" hidden>
        <h2>Conteúdo editorial de aula</h2>
        <div class="field inline-form">
            <div class="field" style="margin-bottom:0"><label for="lesson-content-id">ID da aula</label><input type="text" id="lesson-content-id" placeholder="id da aula"></div>
            <button class="toggle-button" type="button" id="lesson-content-load">Carregar versões</button>
        </div>
        <p class="admin-status" id="lesson-content-status" role="status" aria-live="polite" hidden></p>
        <div id="lesson-content-versions"></div>
        <h3 style="margin-top:22px;font-size:15px">Criar novo rascunho</h3>
        <form id="lesson-content-form">
            <div class="field"><label for="lesson-content-body">Corpo da aula</label><textarea id="lesson-content-body"></textarea></div>
            <div class="field"><label for="lesson-content-materials">Materiais</label><textarea id="lesson-content-materials"></textarea><small>Um item por linha.</small></div>
            <div class="field"><label for="lesson-content-tools">Ferramentas</label><textarea id="lesson-content-tools"></textarea><small>Um item por linha.</small></div>
            <div class="field"><label for="lesson-content-steps">Passo a passo</label><textarea id="lesson-content-steps"></textarea><small>Um passo por linha.</small></div>
            <div class="field"><label for="lesson-content-safety">Alertas de segurança</label><textarea id="lesson-content-safety"></textarea></div>
            <button class="toggle-button" type="submit">Criar rascunho</button>
        </form>
    </section>
</main>
<script>(function(){
    var status = document.getElementById('admin-status');
    var catalogSection = document.getElementById('admin-catalog-section');
    var catalogEmpty = document.getElementById('admin-catalog-empty');
    var catalogList = document.getElementById('admin-catalog-list');
    var auditSection = document.getElementById('admin-audit-section');
    var auditEmpty = document.getElementById('admin-audit-empty');
    var auditTable = document.getElementById('admin-audit-table');
    var auditBody = document.getElementById('admin-audit-body');

    function showError(message) {
        status.hidden = false;
        status.classList.add('is-error');
        status.textContent = message;
    }

    function toggleButton(kind, slug, published) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'toggle-button';
        button.textContent = published ? 'Despublicar' : 'Publicar';
        button.addEventListener('click', function () {
            button.disabled = true;
            var path = kind === 'course' ? '/api/admin/cursos/' : '/api/admin/modulos/';
            fetch(path + encodeURIComponent(slug) + '/publicacao', {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !published }),
            })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (payload) {
                    if (payload && payload.data) {
                        loadCatalog();
                        loadAudit();
                    } else {
                        button.disabled = false;
                    }
                })
                .catch(function () { button.disabled = false; });
        });

        return button;
    }

    function renderCatalog(modules) {
        catalogList.innerHTML = '';
        if (!modules.length) {
            catalogEmpty.hidden = false;
            return;
        }
        catalogEmpty.hidden = true;
        modules.forEach(function (module) {
            var wrap = document.createElement('div');
            wrap.className = 'admin-module';

            var head = document.createElement('div');
            head.className = 'admin-module-head';
            var title = document.createElement('h3');
            title.textContent = module.position + '. ' + module.title;
            var badge = document.createElement('span');
            badge.className = 'badge ' + (module.published ? 'on' : 'off');
            badge.textContent = module.published ? 'Publicado' : 'Desligado';
            head.appendChild(title);
            var headRight = document.createElement('div');
            headRight.style.display = 'flex';
            headRight.style.gap = '8px';
            headRight.style.alignItems = 'center';
            headRight.appendChild(badge);
            headRight.appendChild(toggleButton('module', module.slug, module.published));
            head.appendChild(headRight);
            wrap.appendChild(head);

            module.courses.forEach(function (course) {
                var row = document.createElement('div');
                row.className = 'admin-course-row';
                var info = document.createElement('div');
                info.innerHTML = '<strong>' + course.title + '</strong><div class="info">' + course.category + ' · ' + course.accessType + ' · ' + course.durationMinutes + ' min · ' + course.lessonsCount + ' aulas</div>';
                row.appendChild(info);
                var right = document.createElement('div');
                right.style.display = 'flex';
                right.style.gap = '8px';
                right.style.alignItems = 'center';
                var courseBadge = document.createElement('span');
                courseBadge.className = 'badge ' + (course.published ? 'on' : 'off');
                courseBadge.textContent = course.published ? 'Publicado' : 'Desligado';
                right.appendChild(courseBadge);
                right.appendChild(toggleButton('course', course.slug, course.published));
                row.appendChild(right);
                wrap.appendChild(row);
            });

            catalogList.appendChild(wrap);
        });
    }

    function renderAudit(events) {
        auditBody.innerHTML = '';
        if (!events.length) {
            auditEmpty.hidden = false;
            auditTable.hidden = true;
            return;
        }
        auditEmpty.hidden = true;
        auditTable.hidden = false;
        events.forEach(function (event) {
            var tr = document.createElement('tr');
            var cells = [event.createdAt, event.action, event.resourceType + ' · ' + event.resourceId, event.actorUserId];
            cells.forEach(function (text) {
                var td = document.createElement('td');
                td.textContent = text;
                tr.appendChild(td);
            });
            auditBody.appendChild(tr);
        });
    }

    function handleResponse(res) {
        if (res.status === 401) { showError('Sua sessão expirou. Entre novamente.'); return null; }
        if (res.status === 403) { showError('Acesso restrito a super administradores.'); return null; }
        if (!res.ok) { showError('Não foi possível carregar os dados agora. Tente novamente.'); return null; }
        return res.json();
    }

    function loadCatalog() {
        fetch('/api/admin/catalogo', { credentials: 'same-origin' })
            .then(handleResponse)
            .then(function (payload) {
                if (!payload) return;
                status.hidden = true;
                catalogSection.hidden = false;
                lessonContentSection.hidden = false;
                renderCatalog(payload.data || []);
            })
            .catch(function () { showError('Não foi possível carregar os dados agora. Tente novamente.'); });
    }

    function loadAudit() {
        fetch('/api/admin/auditoria', { credentials: 'same-origin' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (payload) {
                if (!payload) return;
                auditSection.hidden = false;
                renderAudit(payload.data || []);
            })
            .catch(function () {});
    }

    var lessonContentSection = document.getElementById('lesson-content-section');
    var lessonContentIdInput = document.getElementById('lesson-content-id');
    var lessonContentLoadButton = document.getElementById('lesson-content-load');
    var lessonContentStatus = document.getElementById('lesson-content-status');
    var lessonContentVersions = document.getElementById('lesson-content-versions');
    var lessonContentForm = document.getElementById('lesson-content-form');

    function showLessonContentMessage(message, isError) {
        lessonContentStatus.hidden = false;
        lessonContentStatus.classList.toggle('is-error', Boolean(isError));
        lessonContentStatus.textContent = message;
    }

    function linesFrom(id) {
        return document.getElementById(id).value.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line.length > 0; });
    }

    function statusBadgeClass(status) {
        if (status === 'published') return 'badge on';
        if (status === 'draft') return 'badge draft';

        return 'badge archived';
    }

    function statusLabel(status) {
        if (status === 'published') return 'Publicada';
        if (status === 'draft') return 'Rascunho';

        return 'Arquivada';
    }

    function renderVersions(lessonId, versions) {
        lessonContentVersions.innerHTML = '';
        if (!versions.length) {
            var empty = document.createElement('p');
            empty.className = 'info';
            empty.textContent = 'Nenhuma versão de conteúdo criada para esta aula ainda.';
            lessonContentVersions.appendChild(empty);
            return;
        }
        versions.forEach(function (version) {
            var card = document.createElement('div');
            card.className = 'version-card';

            var head = document.createElement('div');
            head.className = 'version-head';
            var title = document.createElement('strong');
            title.textContent = 'Versão ' + version.version;
            var badge = document.createElement('span');
            badge.className = statusBadgeClass(version.status);
            badge.textContent = statusLabel(version.status);
            head.appendChild(title);
            var headRight = document.createElement('div');
            headRight.style.display = 'flex';
            headRight.style.gap = '8px';
            headRight.style.alignItems = 'center';
            headRight.appendChild(badge);

            if (version.status !== 'published') {
                headRight.appendChild(publicationButton(lessonId, version.version, true, 'Publicar'));
            } else {
                headRight.appendChild(publicationButton(lessonId, version.version, false, 'Arquivar'));
            }
            head.appendChild(headRight);
            card.appendChild(head);

            var body = document.createElement('pre');
            body.textContent = version.body;
            card.appendChild(body);

            var meta = document.createElement('div');
            meta.className = 'info';
            meta.textContent = version.materials.length + ' materiais · ' + version.tools.length + ' ferramentas · ' + version.steps.length + ' passos' + (version.safetyNotes ? ' · com alertas de segurança' : '');
            card.appendChild(meta);

            lessonContentVersions.appendChild(card);
        });
    }

    function publicationButton(lessonId, version, published, label) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'toggle-button';
        button.textContent = label;
        button.addEventListener('click', function () {
            button.disabled = true;
            fetch('/api/admin/aulas/' + encodeURIComponent(lessonId) + '/conteudo/' + version + '/publicacao', {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: published }),
            })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (payload) {
                    button.disabled = false;
                    if (payload && payload.data) {
                        loadLessonVersions(lessonId);
                        loadAudit();
                    } else {
                        showLessonContentMessage('Não foi possível atualizar a publicação agora.', true);
                    }
                })
                .catch(function () {
                    button.disabled = false;
                    showLessonContentMessage('Não foi possível atualizar a publicação agora.', true);
                });
        });

        return button;
    }

    function loadLessonVersions(lessonId) {
        lessonContentStatus.hidden = true;
        fetch('/api/admin/aulas/' + encodeURIComponent(lessonId) + '/conteudo', { credentials: 'same-origin' })
            .then(function (res) {
                if (res.status === 401) { showLessonContentMessage('Sua sessão expirou. Entre novamente.', true); return null; }
                if (res.status === 403) { showLessonContentMessage('Acesso restrito a super administradores.', true); return null; }
                if (!res.ok) { showLessonContentMessage('Não foi possível carregar as versões agora.', true); return null; }
                return res.json();
            })
            .then(function (payload) {
                if (!payload) return;
                renderVersions(lessonId, payload.data || []);
            })
            .catch(function () { showLessonContentMessage('Não foi possível carregar as versões agora.', true); });
    }

    lessonContentLoadButton.addEventListener('click', function () {
        var lessonId = lessonContentIdInput.value.trim();
        if (!lessonId) { showLessonContentMessage('Informe o ID da aula.', true); return; }
        loadLessonVersions(lessonId);
    });

    lessonContentForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var lessonId = lessonContentIdInput.value.trim();
        if (!lessonId) { showLessonContentMessage('Informe o ID da aula antes de criar um rascunho.', true); return; }

        var payload = {
            body: document.getElementById('lesson-content-body').value,
            materials: linesFrom('lesson-content-materials'),
            tools: linesFrom('lesson-content-tools'),
            steps: linesFrom('lesson-content-steps'),
            safetyNotes: document.getElementById('lesson-content-safety').value,
        };

        var submitButton = lessonContentForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        fetch('/api/admin/aulas/' + encodeURIComponent(lessonId) + '/conteudo', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(function (res) {
                submitButton.disabled = false;
                if (res.status === 422) { showLessonContentMessage('Dados inválidos. Confira o tamanho dos campos.', true); return null; }
                if (res.status === 404) { showLessonContentMessage('Aula não encontrada.', true); return null; }
                if (!res.ok) { showLessonContentMessage('Não foi possível criar o rascunho agora.', true); return null; }
                return res.json();
            })
            .then(function (result) {
                if (!result || !result.data) return;
                showLessonContentMessage('Rascunho criado com sucesso.', false);
                lessonContentForm.reset();
                loadLessonVersions(lessonId);
                loadAudit();
            })
            .catch(function () {
                submitButton.disabled = false;
                showLessonContentMessage('Não foi possível criar o rascunho agora.', true);
            });
    });

    loadCatalog();
    loadAudit();
})();</script>`;

    return publicPage({ title: 'Painel administrativo | ObraPro', activePath: '/admin', body, extraStyles: adminStyles });
}
