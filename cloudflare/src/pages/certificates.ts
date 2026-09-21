import { escapeHtml, publicPage } from './layout';

const certificateStyles = `.cert-hero{padding:36px 5vw;background:#10233f;color:#fff}.cert-hero h1{font-size:clamp(24px,4vw,32px);margin:0 0 6px}.cert-hero p{color:#dce5ef;font-size:14px;margin:0}.cert-content{max-width:760px;margin:0 auto;padding:32px 5vw}.cert-box{background:#fff;border:1px solid #e4dcc8;border-radius:8px;padding:24px}.cert-box h2{font-size:17px;margin:0 0 10px}.cert-box p{color:#5b6a72;font-size:14.5px;line-height:1.6;margin:0 0 16px}.criteria{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px}.criteria li{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #edf0ef;border-radius:7px}.criteria .num{display:grid;place-items:center;width:28px;height:28px;border-radius:999px;background:#eef5ff;color:#1267e8;font-weight:800;font-size:13px;flex-shrink:0}.criteria strong{display:block;color:#10233f;margin-bottom:2px}.criteria span{color:#5b6a72;font-size:13.5px}.cert-note{margin-top:18px;font-size:12.5px;color:#8a97a3}.cert-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}.cert-card{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px;border:1px solid #e4dcc8;border-radius:8px;background:#fff;flex-wrap:wrap}.cert-card strong{display:block;color:#10233f;font-size:15px}.cert-card span{color:#5b6a72;font-size:13px}.cert-card .badge{font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px}.badge-active{background:#eafaf0;color:#1b8a4a}.badge-revoked{background:#fdeceb;color:#c0392b}.cert-card a.button{padding:9px 16px;border-radius:6px;background:#f47b20;color:#10233f;font-weight:800;font-size:13px}#cert-status{color:#5b6a72;font-size:14px}.cert-doc{max-width:640px;margin:40px auto;padding:40px;background:#fff;border:2px solid #10233f;border-radius:10px;text-align:center}.cert-doc .eyebrow{color:#c05e14;font-weight:800;font-size:12px;letter-spacing:.06em}.cert-doc h1{font-size:26px;margin:12px 0 4px;color:#10233f}.cert-doc .course{font-size:18px;color:#1267e8;font-weight:800;margin:10px 0}.cert-doc dl{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;text-align:left;margin:22px 0;font-size:13.5px;color:#5b6a72}.cert-doc dt{font-weight:700;color:#10233f}.cert-doc .actions{display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap}.cert-doc button,.cert-doc a.button{padding:10px 18px;border-radius:6px;font-weight:800;font-size:13.5px;border:1px solid #10233f;background:#fff;color:#10233f;cursor:pointer}.cert-doc a.button{background:#f47b20;color:#10233f;border-color:#f47b20}@media print{header,.actions,.cert-note-verif{display:none!important}.cert-doc{border:none;margin:0}}`;

const legalNote = 'O ObraPro emite um certificado próprio de conclusão de curso livre — não é um diploma, não tem reconhecimento do MEC e não substitui habilitação profissional.';

export function renderCertificatesBlocked(): string {
    const body = `<section class="cert-hero"><h1>Meus certificados</h1><p>Acompanhe o que falta para emitir o certificado de conclusão de cada curso.</p></section>
<main class="cert-content">
    <div class="cert-box" id="cert-explainer">
        <h2>Como funciona a emissão</h2>
        <p>${legalNote} Para emitir, o curso precisa atender aos dois critérios abaixo:</p>
        <ol class="criteria">
            <li><span class="num">1</span><div><strong>Concluir 100% das aulas do curso</strong><span>Todas as aulas do curso marcadas como concluídas.</span></div></li>
            <li><span class="num">2</span><div><strong>Ser aprovado no quiz final</strong><span>Nota mínima de 75%, com até 4 tentativas. Após a quarta reprovação, é preciso revisar o curso antes de tentar novamente.</span></div></li>
        </ol>
        <p class="cert-note">A emissão é automática: assim que você concluir as aulas e passar no quiz, o certificado aparece aqui, sem precisar pedir nada.</p>
    </div>
    <div class="cert-box" id="cert-list-box" hidden style="margin-top:20px">
        <h2>Certificados emitidos</h2>
        <p id="cert-status" role="status" aria-live="polite">Carregando seus certificados...</p>
        <ul class="cert-list" id="cert-list"></ul>
    </div>
</main>
<script>(function(){
    var listBox = document.getElementById('cert-list-box');
    var list = document.getElementById('cert-list');
    var status = document.getElementById('cert-status');

    function renderCard(cert) {
        var li = document.createElement('li');
        li.className = 'cert-card';
        var badge = cert.status === 'active' ? '<span class="badge badge-active">Válido</span>' : '<span class="badge badge-revoked">Revogado</span>';
        var issued = new Date(cert.issuedAt);
        var issuedLabel = isNaN(issued.getTime()) ? '' : issued.toLocaleDateString('pt-BR');
        li.innerHTML = '<div><strong></strong><span></span></div>';
        li.querySelector('strong').textContent = cert.courseTitle;
        li.querySelector('span').textContent = 'Emitido em ' + issuedLabel + ' · nota ' + cert.quizScorePercentage + '%';
        var right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        right.style.gap = '10px';
        right.innerHTML = badge;
        var link = document.createElement('a');
        link.className = 'button';
        link.href = '/certificados/verificar/' + encodeURIComponent(cert.verificationCode);
        link.textContent = 'Ver certificado';
        right.appendChild(link);
        li.appendChild(right);
        list.appendChild(li);
    }

    fetch('/api/certificados', { credentials: 'same-origin' })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (payload) {
            var data = payload && payload.data ? payload.data : [];
            if (!data.length) { return; }
            listBox.hidden = false;
            status.hidden = true;
            data.forEach(renderCard);
        })
        .catch(function () {});
})();</script>`;

    return publicPage({ title: 'Meus certificados | ObraPro', activePath: '/certificados', body, extraStyles: certificateStyles });
}

export function renderCertificateVerification(code: string): string {
    const body = `<main class="cert-content">
    <div class="cert-doc" id="cert-doc" hidden>
        <span class="eyebrow">Certificado de conclusão</span>
        <h1 id="cert-student"></h1>
        <p class="course" id="cert-course"></p>
        <p id="cert-badge"></p>
        <dl>
            <div><dt>Carga horária</dt><dd id="cert-duration"></dd></div>
            <div><dt>Nota no quiz</dt><dd id="cert-score"></dd></div>
            <div><dt>Emitido em</dt><dd id="cert-issued"></dd></div>
            <div><dt>Código de verificação</dt><dd id="cert-code">${escapeHtml(code)}</dd></div>
        </dl>
        <p class="cert-note cert-note-verif">${legalNote} Esta página confirma publicamente a autenticidade deste certificado; qualquer pessoa com o código pode verificá-lo.</p>
        <div class="actions">
            <button type="button" id="cert-print">Baixar / imprimir</button>
            <button type="button" id="cert-copy">Copiar link de verificação</button>
        </div>
    </div>
    <div class="cert-box" id="cert-error" hidden>
        <h2>Certificado não encontrado</h2>
        <p>Não encontramos nenhum certificado ativo para este código. Confira se o link ou o código foi digitado corretamente.</p>
    </div>
    <div class="cert-box" id="cert-loading">
        <p role="status" aria-live="polite">Verificando certificado...</p>
    </div>
</main>
<script>(function(){
    var doc = document.getElementById('cert-doc');
    var errorBox = document.getElementById('cert-error');
    var loading = document.getElementById('cert-loading');
    var code = ${JSON.stringify(code)};

    function showError() {
        loading.hidden = true;
        errorBox.hidden = false;
    }

    fetch('/api/certificados/verificar/' + encodeURIComponent(code))
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (payload) {
            var cert = payload && payload.data ? payload.data : null;
            if (!cert) { showError(); return; }
            loading.hidden = true;
            doc.hidden = false;
            document.getElementById('cert-student').textContent = cert.studentName;
            document.getElementById('cert-course').textContent = cert.courseTitle;
            document.getElementById('cert-badge').innerHTML = cert.status === 'active' ? '<span class="badge badge-active">Válido</span>' : '<span class="badge badge-revoked">Revogado</span>';
            document.getElementById('cert-duration').textContent = cert.durationMinutes + ' min';
            document.getElementById('cert-score').textContent = cert.quizScorePercentage + '%';
            var issued = new Date(cert.issuedAt);
            document.getElementById('cert-issued').textContent = isNaN(issued.getTime()) ? cert.issuedAt : issued.toLocaleDateString('pt-BR');
        })
        .catch(showError);

    var printButton = document.getElementById('cert-print');
    if (printButton) printButton.addEventListener('click', function () { window.print(); });

    var copyButton = document.getElementById('cert-copy');
    if (copyButton) copyButton.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
                copyButton.textContent = 'Link copiado!';
                setTimeout(function () { copyButton.textContent = 'Copiar link de verificação'; }, 2000);
            }).catch(function () {});
        }
    });
})();</script>`;

    return publicPage({ title: 'Verificar certificado | ObraPro', activePath: '/certificados', body, extraStyles: certificateStyles });
}
