import { publicPage } from './layout';

const certificateStyles = `.cert-hero{padding:36px 5vw;background:#10233f;color:#fff}.cert-hero h1{font-size:clamp(24px,4vw,32px);margin:0 0 6px}.cert-hero p{color:#dce5ef;font-size:14px;margin:0}.cert-content{max-width:760px;margin:0 auto;padding:32px 5vw}.cert-box{background:#fff;border:1px solid #e4dcc8;border-radius:8px;padding:24px}.cert-box h2{font-size:17px;margin:0 0 10px}.cert-box p{color:#5b6a72;font-size:14.5px;line-height:1.6;margin:0 0 16px}.criteria{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px}.criteria li{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #edf0ef;border-radius:7px}.criteria .num{display:grid;place-items:center;width:28px;height:28px;border-radius:999px;background:#eef5ff;color:#1267e8;font-weight:800;font-size:13px;flex-shrink:0}.criteria strong{display:block;color:#10233f;margin-bottom:2px}.criteria span{color:#5b6a72;font-size:13.5px}.cert-note{margin-top:18px;font-size:12.5px;color:#8a97a3}`;

export function renderCertificatesBlocked(): string {
    const body = `<section class="cert-hero"><h1>Meus certificados</h1><p>Acompanhe o que falta para emitir o certificado de conclusão de cada curso.</p></section>
<main class="cert-content">
    <div class="cert-box">
        <h2>Como funciona a emissão</h2>
        <p>O ObraPro emite um certificado próprio de conclusão de curso livre — não é um diploma, não tem reconhecimento do MEC e não substitui habilitação profissional. Para emitir, o curso precisa atender aos dois critérios abaixo:</p>
        <ol class="criteria">
            <li><span class="num">1</span><div><strong>Concluir 100% das aulas do curso</strong><span>Todas as aulas do curso marcadas como concluídas.</span></div></li>
            <li><span class="num">2</span><div><strong>Ser aprovado no quiz final</strong><span>Nota mínima de 75%, com até 4 tentativas. Após a quarta reprovação, é preciso revisar o curso antes de tentar novamente.</span></div></li>
        </ol>
        <p class="cert-note">Esta área ainda não emite certificados: o quiz final e a emissão verificável estão em desenvolvimento. Assim que estiverem disponíveis, seus certificados aparecerão aqui automaticamente.</p>
    </div>
</main>`;

    return publicPage({ title: 'Meus certificados | ObraPro', activePath: '/certificados', body, extraStyles: certificateStyles });
}
