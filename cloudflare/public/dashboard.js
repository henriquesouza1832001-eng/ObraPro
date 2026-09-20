(() => {
    const state = { organizations: [], works: [], realData: false };
    const views = [...document.querySelectorAll('[data-dashboard-view]')];
    const navigation = [...document.querySelectorAll('[data-dashboard-go]')];
    const header = document.querySelector('header');
    const syncStatus = document.createElement('p');

    syncStatus.className = 'mx-5 mt-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 lg:mx-8';
    syncStatus.setAttribute('role', 'status');
    header?.insertAdjacentElement('afterend', syncStatus);

    function message(text, kind = 'info') {
        syncStatus.textContent = text;
        syncStatus.className = 'mx-5 mt-4 rounded-md border px-4 py-3 text-sm lg:mx-8';
        syncStatus.style.cssText = kind === 'error'
            ? 'border-color:#f3b9b3;background:#fff1f0;color:#a92c22'
            : kind === 'demo'
                ? 'border-color:#f3d9a3;background:#fff7e6;color:#8a5a00'
                : 'border-color:#b7e2cb;background:#e8f6ef;color:#176b4d';
    }

    function showView(name) {
        views.forEach((view) => view.classList.toggle('hidden', view.dataset.dashboardView !== name));
        navigation.forEach((button) => {
            const active = button.dataset.dashboardGo === name;
            button.classList.toggle('font-bold', active);
            button.classList.toggle('text-action', active);
            button.setAttribute('aria-current', active ? 'page' : 'false');
        });
    }

    function escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = String(value ?? '');
        return element.innerHTML;
    }

    function renderWorks(works) {
        const section = document.querySelector('[data-dashboard-view="works"]');
        const summary = section?.querySelector('p');
        const grid = section?.querySelector('.mt-6.grid');
        if (!grid || !summary) return;

        summary.textContent = works.length === 1 ? '1 obra disponivel' : `${works.length} obras disponiveis`;
        if (works.length === 0) {
            grid.innerHTML = '<p class="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">Ainda nao ha obras ativas nesta organizacao.</p>';
            return;
        }

        grid.innerHTML = works.map((work) => {
            const location = [work.city, work.state].filter(Boolean).join(', ') || 'Localizacao nao informada';
            const status = { active: 'Em execucao', planning: 'Planejamento', completed: 'Concluida', archived: 'Arquivada' }[work.status] || 'Sem status';
            return `<article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><span class="text-xs font-bold uppercase text-brand">${escapeHtml(status)}</span><h3 class="mt-2 text-lg font-black">${escapeHtml(work.name)}</h3><p class="text-sm text-slate-500">${escapeHtml(location)}</p><p class="mt-6 text-sm text-slate-500">Os detalhes de execucao aparecem quando os procedimentos desta obra forem publicados.</p></article>`;
        }).join('');
    }

    function renderOverview(works) {
        const cards = [...document.querySelectorAll('[data-dashboard-view="overview"] section:first-child article')];
        const counts = [
            ['Obras ativas', works.filter((work) => work.status === 'active').length],
            ['Em planejamento', works.filter((work) => work.status === 'planning').length],
            ['Concluidas', works.filter((work) => work.status === 'completed').length],
            ['Arquivadas', works.filter((work) => work.status === 'archived').length],
        ];
        cards.forEach((card, index) => {
            const [label, value] = counts[index] || [];
            const text = card.querySelector('p');
            const number = card.querySelector('strong');
            if (text) text.textContent = label;
            if (number) number.textContent = String(value);
        });
    }

    function renderUnsupportedViews() {
        ['procedures', 'checklists', 'issues'].forEach((name) => {
            const section = document.querySelector(`[data-dashboard-view="${name}"]`);
            if (!section) return;
            const heading = section.querySelector('h2')?.textContent || 'Este recurso';
            section.innerHTML = `<div class="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 class="text-2xl font-black">${escapeHtml(heading)}</h2><p class="mt-3 text-slate-600">Esta area sera ligada aos dados publicados da sua obra na proxima etapa. Nenhum numero ilustrativo e exibido como dado real.</p></div>`;
        });
    }

    function updateHeader(organization, works) {
        const title = document.querySelector('header h1');
        const location = document.querySelector('header p:last-of-type');
        if (title) title.textContent = organization.name;
        if (location) location.textContent = works[0] ? [works[0].city, works[0].state].filter(Boolean).join(', ') || 'Obra selecionada' : 'Nenhuma obra ativa';
    }

    function updateOrganizations(organizations) {
        const select = document.querySelector('#support-organization');
        if (!select) return;
        organizations.forEach((organization) => {
            const option = document.createElement('option');
            option.value = organization.id;
            option.textContent = organization.name;
            select.append(option);
        });
    }

    async function requestJson(url, options) {
        const response = await fetch(url, { credentials: 'same-origin', ...options });
        let body = {};
        try { body = await response.json(); } catch (_) { }
        if (!response.ok) throw { status: response.status, body };
        return body;
    }

    async function loadPanel() {
        try {
            const organizationsResult = await requestJson('/api/painel/organizacoes');
            const organization = organizationsResult.data?.[0];
            if (!organization) {
                state.realData = true;
                renderWorks([]);
                renderOverview([]);
                renderUnsupportedViews();
                message('Sua conta esta ativa, mas ainda nao participa de uma organizacao.', 'info');
                return;
            }
            const worksResult = await requestJson(`/api/painel/obras?organization_id=${encodeURIComponent(organization.id)}`);
            state.organizations = organizationsResult.data;
            state.works = worksResult.data || [];
            state.realData = true;
            updateOrganizations(state.organizations);
            updateHeader(organization, state.works);
            renderWorks(state.works);
            renderOverview(state.works);
            renderUnsupportedViews();
            message('Dados da sua organizacao carregados com seguranca.', 'success');
        } catch (error) {
            if (error.status === 401) {
                message('Voce esta vendo uma demonstracao. Dados operacionais reais aparecem apos login com uma conta da organizacao.', 'demo');
                return;
            }
            message('Nao foi possivel carregar os dados agora. Tente atualizar a pagina.', 'error');
        }
    }

    function showSupportStatus(text, kind = 'info') {
        const status = document.querySelector('#support-status');
        if (!status) return;
        status.textContent = text;
        status.className = 'mt-4 rounded-md border p-3 text-sm';
        status.style.cssText = kind === 'error'
            ? 'border-color:#f3b9b3;background:#fff1f0;color:#a92c22'
            : 'border-color:#b7e2cb;background:#e8f6ef;color:#176b4d';
        status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }

    function configureSupport() {
        const form = document.querySelector('#support-form');
        if (!form) return;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!state.realData) {
                showSupportStatus('Chamados estao disponiveis somente para contas conectadas a uma organizacao.', 'error');
                return;
            }
            const submit = form.querySelector('button[type="submit"]');
            const data = new FormData(form);
            submit.disabled = true;
            showSupportStatus('Enviando chamado...');
            try {
                const result = await requestJson('/api/painel/suporte/chamados', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(data.entries())),
                });
                form.reset();
                showSupportStatus(`Chamado registrado. Referencia: ${result.data.id}`);
            } catch (_) {
                showSupportStatus('Nao foi possivel enviar agora. Confira sua conexao e tente novamente.', 'error');
            } finally {
                submit.disabled = false;
            }
        });
    }

    navigation.forEach((button) => button.addEventListener('click', () => showView(button.dataset.dashboardGo)));
    configureSupport();
    showView('overview');
    loadPanel();
})();
