(() => {
    const state = { organizations: [], works: [], procedures: [], realData: false };
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
        ['issues'].forEach((name) => {
            const section = document.querySelector(`[data-dashboard-view="${name}"]`);
            if (!section) return;
            const heading = section.querySelector('h2')?.textContent || 'Este recurso';
            section.innerHTML = `<div class="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 class="text-2xl font-black">${escapeHtml(heading)}</h2><p class="mt-3 text-slate-600">Esta area sera ligada aos dados publicados da sua obra na proxima etapa. Nenhum numero ilustrativo e exibido como dado real.</p></div>`;
        });
    }

    function renderListState(container, kind, text) {
        if (!container) return;
        const styles = {
            loading: 'border-slate-200 bg-white text-slate-500',
            empty: 'border-dashed border-slate-300 bg-white text-slate-600',
            error: 'border-red-200 bg-red-50 text-red-700',
            demo: 'border-amber-200 bg-amber-50 text-amber-800',
        };
        container.innerHTML = `<p class="rounded-md border p-6 text-sm ${styles[kind] || styles.empty}" role="${kind === 'error' ? 'alert' : 'status'}">${escapeHtml(text)}</p>`;
    }

    const stageLabels = { fundacoes: 'Fundacoes', alvenaria: 'Alvenaria', hidraulica: 'Hidraulica', eletrica: 'Eletrica', acabamentos: 'Acabamentos' };

    function stageLabel(stage) {
        return stageLabels[String(stage ?? '').toLowerCase()] || (stage ? escapeHtml(stage) : 'Outros');
    }

    function renderProcedures(procedures) {
        const container = document.querySelector('#procedures-list');
        const summary = document.querySelector('#procedures-summary');
        if (!container) return;
        if (summary) summary.textContent = procedures.length === 1 ? '1 procedimento publicado' : `${procedures.length} procedimentos publicados`;
        if (procedures.length === 0) {
            renderListState(container, 'empty', 'Nenhum procedimento publicado ainda nesta organizacao.');
            return;
        }
        const groups = new Map();
        procedures.forEach((procedure) => {
            const key = procedure.stage || 'outros';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(procedure);
        });
        container.innerHTML = [...groups.entries()].map(([stage, items]) => `
            <div class="mb-6"><h3 class="mb-3 text-sm font-bold uppercase text-slate-500">${stageLabel(stage)}</h3><div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                ${items.map((procedure) => `<article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><h4 class="text-lg font-black">${escapeHtml(procedure.title)}</h4><p class="mt-2 text-sm text-slate-500">${escapeHtml(procedure.summary)}</p><button class="touch-button mt-4 bg-action text-white" type="button" data-open-procedure="${escapeHtml(procedure.id)}">Ver passo a passo</button></article>`).join('')}
            </div></div>
        `).join('');
    }

    function renderChecklists(checklists) {
        const container = document.querySelector('#checklists-list');
        const summary = document.querySelector('#checklists-summary');
        if (!container) return;
        if (summary) summary.textContent = checklists.length === 1 ? '1 checklist publicado' : `${checklists.length} checklists publicados`;
        if (checklists.length === 0) {
            renderListState(container, 'empty', 'Nenhum checklist publicado ainda nesta organizacao.');
            return;
        }
        container.innerHTML = checklists.map((checklist) => `<article class="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"><h3 class="font-bold">${escapeHtml(checklist.title)}</h3><button class="touch-button bg-action text-white" type="button" data-open-checklist="${escapeHtml(checklist.id)}">Ver itens</button></article>`).join('');
    }

    const operationalErrorMessages = {
        authentication_required: 'Sua sessao expirou. Atualize a pagina e entre novamente.',
        operational_data_unavailable: 'O servico operacional esta indisponivel no momento. Tente novamente em instantes.',
        organization_access_denied: 'Voce nao tem acesso a esta organizacao.',
        organization_id_required: 'Selecione uma organizacao antes de continuar.',
        procedure_not_found: 'Este procedimento nao existe ou nao esta mais publicado.',
        checklist_not_found: 'Este checklist nao existe ou nao esta mais publicado.',
        work_access_denied: 'Voce nao tem acesso a obra selecionada.',
        execution_invalid: 'Selecione uma obra valida antes de iniciar a execucao.',
        execution_access_denied: 'Voce nao tem acesso a esta execucao.',
        execution_step_not_found: 'Esta etapa nao foi encontrada na execucao.',
        execution_step_invalid: 'Nao foi possivel atualizar esta etapa. Tente novamente.',
    };

    function operationalErrorMessageFor(error) {
        const code = error && typeof error === 'object' ? error.body?.error : undefined;
        return (code && operationalErrorMessages[code]) || 'Nao foi possivel completar a acao agora. Confira sua conexao e tente novamente.';
    }

    async function loadOperationalCatalog(organizationId) {
        const proceduresContainer = document.querySelector('#procedures-list');
        const checklistsContainer = document.querySelector('#checklists-list');
        renderListState(proceduresContainer, 'loading', 'Carregando procedimentos...');
        renderListState(checklistsContainer, 'loading', 'Carregando checklists...');
        try {
            const result = await requestJson(`/api/painel/procedimentos?organization_id=${encodeURIComponent(organizationId)}`);
            state.procedures = result.data || [];
            renderProcedures(state.procedures);
        } catch (error) {
            renderListState(proceduresContainer, 'error', operationalErrorMessageFor(error));
        }
        try {
            const result = await requestJson(`/api/painel/checklists?organization_id=${encodeURIComponent(organizationId)}`);
            renderChecklists(result.data || []);
        } catch (error) {
            renderListState(checklistsContainer, 'error', operationalErrorMessageFor(error));
        }
    }

    function procedureDetailStatus(text, kind = 'info') {
        const box = document.querySelector('#procedure-detail-status');
        if (!box) return;
        const styles = { error: 'border-red-200 bg-red-50 text-red-700', success: 'border-emerald-200 bg-emerald-50 text-emerald-800', info: 'border-slate-200 bg-white text-slate-600' };
        box.className = `mt-4 rounded-md border p-3 text-sm ${styles[kind] || styles.info}`;
        box.textContent = text;
        box.classList.remove('hidden');
        box.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }

    async function openProcedure(id) {
        const organization = state.organizations.find((item) => item.id === document.querySelector('#dashboard-organization')?.value) || state.organizations[0];
        const content = document.querySelector('#procedure-detail-content');
        if (!content || !organization) return;
        showView('procedure-detail');
        content.innerHTML = '<p class="text-sm text-slate-500">Carregando procedimento...</p>';
        try {
            const result = await requestJson(`/api/painel/procedimentos/${encodeURIComponent(id)}?organization_id=${encodeURIComponent(organization.id)}`);
            const procedure = result.data;
            const workOptions = state.works.map((work) => `<option value="${escapeHtml(work.id)}">${escapeHtml(work.name)}</option>`).join('');
            content.innerHTML = `
                <span class="text-xs font-bold uppercase text-brand">${stageLabel(procedure.stage)}</span>
                <h2 class="mt-2 text-2xl font-black">${escapeHtml(procedure.title)}</h2>
                <p class="mt-2 text-sm text-slate-500">${escapeHtml(procedure.summary)}</p>
                <ol class="mt-6 grid gap-4">${procedure.steps.map((step) => `
                    <li class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 class="font-bold">${step.position}. ${escapeHtml(step.title)}</h3>
                        <p class="mt-1 text-sm text-slate-600">${escapeHtml(step.instruction)}</p>
                        ${step.materials.length ? `<p class="mt-2 text-xs font-bold uppercase text-slate-500">Materiais: ${step.materials.map(escapeHtml).join(', ')}</p>` : ''}
                        ${step.safetyNote ? `<p class="mt-2 rounded-md bg-amber-50 p-2 text-xs font-bold text-amber-800">Seguranca: ${escapeHtml(step.safetyNote)}</p>` : ''}
                        ${step.whenToCallProfessional ? `<p class="mt-2 text-xs text-slate-500">Chame um profissional se: ${escapeHtml(step.whenToCallProfessional)}</p>` : ''}
                    </li>`).join('')}</ol>
                <div class="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 class="font-bold">Iniciar execucao</h3>
                    ${state.works.length === 0
                        ? '<p class="mt-2 text-sm text-slate-500">Nenhuma obra disponivel nesta organizacao para iniciar uma execucao.</p>'
                        : `<label class="mt-2 grid gap-2 text-sm font-bold" for="execution-work">Obra<select class="min-h-12 rounded-md border border-slate-300 bg-white px-3 font-normal text-ink" id="execution-work">${workOptions}</select></label>
                           <button class="touch-button mt-4 bg-action text-white" type="button" id="start-execution" data-procedure-id="${escapeHtml(procedure.id)}">Iniciar execucao</button>`}
                    <p class="mt-4 hidden rounded-md border p-3 text-sm" id="procedure-detail-status"></p>
                </div>`;
        } catch (error) {
            content.innerHTML = `<p class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">${escapeHtml(operationalErrorMessageFor(error))}</p>`;
        }
    }

    async function openChecklist(id) {
        const organization = state.organizations.find((item) => item.id === document.querySelector('#dashboard-organization')?.value) || state.organizations[0];
        const content = document.querySelector('#checklist-detail-content');
        if (!content || !organization) return;
        showView('checklist-detail');
        content.innerHTML = '<p class="text-sm text-slate-500">Carregando checklist...</p>';
        try {
            const result = await requestJson(`/api/painel/checklists/${encodeURIComponent(id)}?organization_id=${encodeURIComponent(organization.id)}`);
            const checklist = result.data;
            content.innerHTML = `
                <h2 class="text-2xl font-black">${escapeHtml(checklist.title)}</h2>
                <p class="mt-2 text-sm text-slate-500">Referencia de qualidade. A confirmacao de cada etapa da obra e feita no passo a passo do procedimento.</p>
                <div class="mt-6 grid gap-3">${checklist.items.map((item) => `
                    <article class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 class="font-bold">${item.position}. ${escapeHtml(item.label)}</h3>
                        ${item.whatGoodLooksLike ? `<p class="mt-1 text-sm text-emerald-700">Resultado esperado: ${escapeHtml(item.whatGoodLooksLike)}</p>` : ''}
                        ${item.commonError ? `<p class="mt-1 text-sm text-amber-700">Erro comum: ${escapeHtml(item.commonError)}</p>` : ''}
                    </article>`).join('')}</div>`;
        } catch (error) {
            content.innerHTML = `<p class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">${escapeHtml(operationalErrorMessageFor(error))}</p>`;
        }
    }

    async function startExecution(procedureId, workId) {
        const organization = state.organizations.find((item) => item.id === document.querySelector('#dashboard-organization')?.value) || state.organizations[0];
        if (!organization) return;
        const button = document.querySelector('#start-execution');
        if (button) button.disabled = true;
        procedureDetailStatus('Iniciando execucao...');
        try {
            const result = await requestJson('/api/painel/execucoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization_id: organization.id, work_id: workId, procedure_id: procedureId }),
            });
            procedureDetailStatus(`Execucao iniciada. Referencia: ${result.data.id}. O acompanhamento etapa a etapa depende de um proximo contrato de leitura da execucao, ainda nao publicado.`, 'success');
        } catch (error) {
            procedureDetailStatus(operationalErrorMessageFor(error), 'error');
        } finally {
            if (button) button.disabled = false;
        }
    }

    function updateHeader(organization, works) {
        const title = document.querySelector('header h1');
        const location = document.querySelector('header p:last-of-type');
        if (title) title.textContent = organization.name;
        if (location) location.textContent = works[0] ? [works[0].city, works[0].state].filter(Boolean).join(', ') || 'Obra selecionada' : 'Nenhuma obra ativa';
    }

    function updateOrganizations(organizations) {
        const dashboardSelect = document.querySelector('#dashboard-organization');
        const supportSelect = document.querySelector('#support-organization');
        if (dashboardSelect) {
            dashboardSelect.innerHTML = '';
            dashboardSelect.classList.toggle('hidden', organizations.length < 2);
        }
        if (supportSelect) supportSelect.innerHTML = '<option value="">Sem organizacao relacionada</option>';
        organizations.forEach((organization) => {
            [dashboardSelect, supportSelect].filter(Boolean).forEach((select) => {
                const option = document.createElement('option');
                option.value = organization.id;
                option.textContent = organization.name;
                select.append(option);
            });
        });
    }

    async function requestJson(url, options) {
        const response = await fetch(url, { credentials: 'same-origin', ...options });
        let body = {};
        try { body = await response.json(); } catch (_) { }
        if (!response.ok) throw { status: response.status, body };
        return body;
    }

    async function loadOrganization(organization) {
        const worksResult = await requestJson(`/api/painel/obras?organization_id=${encodeURIComponent(organization.id)}`);
        state.works = worksResult.data || [];
        updateHeader(organization, state.works);
        renderWorks(state.works);
        renderOverview(state.works);
        const dashboardSelect = document.querySelector('#dashboard-organization');
        if (dashboardSelect) dashboardSelect.value = organization.id;
        await loadOperationalCatalog(organization.id);
    }

    async function loadPanel() {
        try {
            const organizationsResult = await requestJson('/api/painel/organizacoes');
            const organization = organizationsResult.data?.[0];
            if (!organization) {
                state.realData = true;
                renderWorks([]);
                renderOverview([]);
                renderProcedures([]);
                renderChecklists([]);
                renderUnsupportedViews();
                message('Sua conta esta ativa, mas ainda nao participa de uma organizacao.', 'info');
                return;
            }
            state.organizations = organizationsResult.data;
            state.realData = true;
            updateOrganizations(state.organizations);
            await loadOrganization(organization);
            renderUnsupportedViews();
            message('Dados da sua organizacao carregados com seguranca.', 'success');
        } catch (error) {
            if (error.status === 401) {
                renderListState(document.querySelector('#procedures-list'), 'demo', 'Voce esta vendo uma demonstracao. Procedimentos reais aparecem apos login com uma conta da organizacao.');
                renderListState(document.querySelector('#checklists-list'), 'demo', 'Voce esta vendo uma demonstracao. Checklists reais aparecem apos login com uma conta da organizacao.');
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

    const supportErrorMessages = {
        authentication_required: 'Sua sessao expirou. Atualize a pagina e entre novamente para abrir o chamado.',
        operational_data_unavailable: 'O servico de chamados esta indisponivel no momento. Tente novamente em instantes.',
        organization_access_denied: 'Voce nao tem acesso a organizacao selecionada. Escolha outra ou deixe em branco.',
        support_ticket_invalid: 'Verifique o titulo e a descricao do chamado antes de enviar.',
    };

    function supportErrorMessageFor(error) {
        const code = error && typeof error === 'object' ? error.body?.error : undefined;
        return (code && supportErrorMessages[code]) || 'Nao foi possivel enviar agora. Confira sua conexao e tente novamente.';
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
            if (!form.checkValidity()) {
                form.reportValidity();
                showSupportStatus('Preencha o titulo e a descricao do chamado antes de enviar.', 'error');
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
            } catch (error) {
                showSupportStatus(supportErrorMessageFor(error), 'error');
            } finally {
                submit.disabled = false;
            }
        });
    }

    navigation.forEach((button) => button.addEventListener('click', () => showView(button.dataset.dashboardGo)));
    document.addEventListener('click', (event) => {
        const openProcedureButton = event.target.closest('[data-open-procedure]');
        if (openProcedureButton) {
            openProcedure(openProcedureButton.dataset.openProcedure);
            return;
        }
        const openChecklistButton = event.target.closest('[data-open-checklist]');
        if (openChecklistButton) {
            openChecklist(openChecklistButton.dataset.openChecklist);
            return;
        }
        const startButton = event.target.closest('#start-execution');
        if (startButton) {
            const workSelect = document.querySelector('#execution-work');
            if (workSelect && workSelect.value) {
                startExecution(startButton.dataset.procedureId, workSelect.value);
            }
        }
    });
    document.querySelector('#dashboard-organization')?.addEventListener('change', async (event) => {
        const organization = state.organizations.find((item) => item.id === event.target.value);
        if (!organization) return;
        message('Carregando dados da organizacao...', 'success');
        try {
            await loadOrganization(organization);
            message('Dados da sua organizacao carregados com seguranca.', 'success');
        } catch (_) {
            message('Nao foi possivel trocar de organizacao agora. Tente novamente.', 'error');
        }
    });
    configureSupport();
    showView('overview');
    loadPanel();
})();
