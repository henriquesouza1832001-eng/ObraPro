(() => {
    const support = location.pathname === '/tira-duvidas';
    const status = document.getElementById('student-status');
    const list = document.getElementById('student-items');
    const endpoint = support ? '/api/painel/suporte/chamados' : '/api/cursos/progresso?limit=50';
    async function request(path, options) {
        const response = await fetch(path, { credentials: 'same-origin', ...options });
        if (response.status === 401) throw new Error('Sua sessão expirou. Entre novamente para continuar.');
        if (!response.ok) throw new Error('Não foi possível concluir agora. Tente novamente.');
        return response.json();
    }
    function element(tag, text, parent) {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.appendChild(node);
        return node;
    }
    async function load() {
        try {
            const payload = await request(endpoint);
            const items = Array.isArray(payload.data) ? payload.data : [];
            list.replaceChildren();
            status.textContent = items.length ? '' : support ? 'Você ainda não enviou dúvidas.' : 'Seu primeiro passo começa no catálogo. Escolha um curso e faça sua matrícula gratuita.';
            items.forEach(item => {
                const card = element('article', '', list);
                card.className = 'student-card';
                element('h2', support ? item.title : item.courseTitle, card);
                if (support) {
                    element('p', item.description, card);
                    const labels = { open: 'Recebida', in_progress: 'Em acompanhamento', resolved: 'Resolvida', closed: 'Encerrada' };
                    element('p', labels[item.status] || 'Em acompanhamento', card);
                } else {
                    const total = Number(item.totalLessons) || 0;
                    const done = Number(item.completedCount) || 0;
                    element('p', `${done} de ${total} aulas concluídas`, card);
                    const progress = element('progress', '', card);
                    progress.max = Math.max(1, total);
                    progress.value = done;
                    progress.setAttribute('aria-label', 'Progresso do curso');
                    const link = element('a', total > 0 && done === total ? 'Revisar curso e avaliação' : 'Continuar curso', card);
                    link.href = '/cursos/' + encodeURIComponent(item.courseSlug);
                }
            });
        } catch (error) { status.textContent = error.message; }
    }
    document.getElementById('question-form')?.addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('button');
        const feedback = document.getElementById('send-status');
        const fields = new FormData(form);
        button.disabled = true;
        feedback.textContent = 'Enviando sua dúvida...';
        try {
            await request('/api/painel/suporte/chamados', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: fields.get('title'), description: fields.get('description'), category: 'content', priority: 'normal', organization_id: null }) });
            feedback.textContent = 'Dúvida recebida! Você pode acompanhá-la abaixo.';
            form.reset();
            await load();
        } catch (error) { feedback.textContent = error.message; }
        finally { button.disabled = false; }
    });
    load();
})();
