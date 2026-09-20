import { publicPage } from './layout';

/**
 * Tela de abertura/acompanhamento de chamado (CF5-C1) com fila
 * offline-friendly (CF5-C2, conforme docs/PWA.md): quando o envio falha por
 * rede, o chamado fica pendente no dispositivo e e reenviado sozinho quando a
 * conexao volta. Nenhum segredo, token ou regra de autorizacao fica no HTML;
 * quem decide se o usuario pode abrir o chamado e o Worker (getAuthenticatedUserId).
 */
const styles = `.form-card{max-width:640px;margin:0 auto;padding:42px 5vw}.form-card h1{font-size:28px;margin-bottom:8px}.form-card p{color:#60706a;line-height:1.5}.field{display:grid;gap:7px;margin-top:18px}label{font-size:14px;font-weight:700}input,textarea,select{width:100%;border:1px solid #b9c5c0;border-radius:6px;padding:12px 13px;font-size:16px;font-family:inherit}input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #1267e8;outline-offset:1px}textarea{min-height:140px;resize:vertical}button{min-height:50px;margin-top:22px;border:0;border-radius:6px;background:#176b4d;color:#fff;font-size:16px;font-weight:800;cursor:pointer;padding:0 24px}button:focus-visible{outline:3px solid #10233f;outline-offset:2px}.error{padding:12px;border-radius:6px;background:#fff1f0;color:#a92c22;font-size:14px;border:1px solid #f3b9b3;margin-top:16px}.status{margin-top:16px;padding:12px;border-radius:6px;font-size:14px;display:none}.status.is-visible{display:block}.status[data-state="pendente"]{background:#fff7e6;color:#8a5a00;border:1px solid #f3d9a3}.status[data-state="enviando"]{background:#eef5ff;color:#1267e8;border:1px solid #b9d3f7}.status[data-state="falha"]{background:#fff1f0;color:#a92c22;border:1px solid #f3b9b3}.status[data-state="concluido"]{background:#e8f6ef;color:#176b4d;border:1px solid #b7e2cb}.confirm{max-width:640px;margin:0 auto;padding:80px 5vw;text-align:center}.confirm .badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#e8f6ef;color:#176b4d;font-weight:800;font-size:13px;margin-bottom:16px}`;

const offlineQueueScript = `<script>
(function () {
    var form = document.getElementById('support-form');
    var status = document.getElementById('support-status');
    if (!form || !status) return;
    var STORAGE_KEY = 'obrapro_pending_tickets';

    function readQueue() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
    }
    function writeQueue(items) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
    }
    function setStatus(state, message) {
        status.textContent = message;
        status.dataset.state = state;
        status.classList.add('is-visible');
        status.setAttribute('role', state === 'falha' ? 'alert' : 'status');
    }
    async function sendTicket(payload) {
        var body = new URLSearchParams(payload);
        var response = await fetch('/chamados', { method: 'POST', body: body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        if (!response.ok && response.status !== 303) throw new Error('falha no envio');
        return response;
    }
    async function flushQueue() {
        var queue = readQueue();
        if (queue.length === 0) return;
        setStatus('enviando', 'Enviando ' + queue.length + ' chamado(s) pendente(s)...');
        var remaining = [];
        for (var i = 0; i < queue.length; i++) {
            try { await sendTicket(queue[i]); } catch (e) { remaining.push(queue[i]); }
        }
        writeQueue(remaining);
        if (remaining.length === 0) setStatus('concluido', 'Chamado(s) enviado(s) com sucesso.');
        else setStatus('falha', remaining.length + ' chamado(s) ainda pendente(s). Tentaremos novamente quando a conexao melhorar.');
    }
    window.addEventListener('online', flushQueue);
    if (navigator.onLine) flushQueue();
    if (readQueue().length > 0) setStatus('pendente', readQueue().length + ' chamado(s) aguardando envio.');

    form.addEventListener('submit', function (event) {
        if (navigator.onLine) return;
        event.preventDefault();
        var data = new FormData(form);
        var payload = { title: data.get('title'), description: data.get('description'), category: data.get('category'), priority: data.get('priority') };
        var queue = readQueue();
        queue.push(payload);
        writeQueue(queue);
        setStatus('pendente', 'Sem conexao agora. O chamado sera enviado automaticamente quando a internet voltar.');
        form.reset();
    });
})();
</script>`;

export interface SupportFormOptions {
    errorMessage?: string;
}

export function renderSupportForm(options: SupportFormOptions = {}): string {
    const error = options.errorMessage
        ? `<p class="error" role="alert" id="support-error">${options.errorMessage}</p>`
        : '';

    const body = `<main class="form-card">
        <h1>Abrir chamado</h1>
        <p>Conte o que aconteceu. Nossa equipe responde pelo mesmo e-mail da sua conta.</p>
        ${error}
        <form id="support-form" method="POST" action="/chamados" aria-describedby="${options.errorMessage ? 'support-error' : ''}">
            <div class="field">
                <label for="title">Título</label>
                <input id="title" name="title" type="text" maxlength="160" required>
            </div>
            <div class="field">
                <label for="category">Categoria</label>
                <select id="category" name="category">
                    <option value="bug">Erro no sistema</option>
                    <option value="content">Conteúdo do curso</option>
                    <option value="account">Minha conta</option>
                    <option value="other">Outro assunto</option>
                </select>
            </div>
            <div class="field">
                <label for="priority">Prioridade</label>
                <select id="priority" name="priority">
                    <option value="low">Baixa</option>
                    <option value="normal" selected>Normal</option>
                    <option value="high">Alta</option>
                </select>
            </div>
            <div class="field">
                <label for="description">Descreva o problema</label>
                <textarea id="description" name="description" maxlength="5000" required></textarea>
            </div>
            <button type="submit">Enviar chamado</button>
        </form>
        <p class="status" id="support-status" data-state=""></p>
    </main>
    ${offlineQueueScript}`;

    return publicPage({ title: 'Abrir chamado | ObraPro', activePath: '/chamados', body, extraStyles: styles });
}

export function renderSupportConfirmation(ticketId: string, status: string): string {
    const body = `<main class="confirm">
        <span class="badge">Chamado registrado</span>
        <h1>Recebemos seu chamado</h1>
        <p>Número de referência: <strong>${ticketId}</strong></p>
        <p>Status atual: ${status === 'open' ? 'aberto' : status}</p>
        <p>Você pode voltar a esta página a qualquer momento para acompanhar.</p>
        <a class="brand" href="/cursos">Voltar ao catálogo</a>
    </main>`;

    return publicPage({ title: 'Chamado registrado | ObraPro', activePath: '/chamados', body, extraStyles: styles });
}

export function renderSupportNotFound(): string {
    const body = `<main class="confirm"><h1>Chamado não encontrado</h1><p>Verifique o link ou abra um novo chamado.</p><a class="brand" href="/chamados">Abrir chamado</a></main>`;

    return publicPage({ title: 'Chamado não encontrado | ObraPro', activePath: '/chamados', body, extraStyles: styles });
}
