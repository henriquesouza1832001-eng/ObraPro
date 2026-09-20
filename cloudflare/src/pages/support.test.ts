import { describe, expect, it } from 'vitest';
import { renderSupportForm, renderSupportConfirmation, renderSupportNotFound } from './support';

describe('renderSupportForm', () => {
    it('renderiza o formulario com campos rotulados e acessiveis', () => {
        const html = renderSupportForm();

        expect(html).toContain('for="title"');
        expect(html).toContain('for="description"');
        expect(html).toContain('for="category"');
        expect(html).toContain('for="priority"');
        expect(html).toContain('action="/chamados"');
        expect(html).toContain('method="POST"');
    });

    it('funciona sem JavaScript: o formulario faz POST normal por padrao', () => {
        const html = renderSupportForm();

        expect(html).toContain('<form id="support-form" method="POST" action="/chamados"');
    });

    it('mostra erro acessivel quando ha mensagem de validacao', () => {
        const html = renderSupportForm({ errorMessage: 'Preencha o título e a descrição antes de enviar.' });

        expect(html).toContain('role="alert"');
        expect(html).toContain('aria-describedby="support-error"');
        expect(html).toContain('Preencha o título e a descrição antes de enviar.');
    });

    it('inclui a fila offline-friendly com os estados pendente/enviando/concluido/falha', () => {
        const html = renderSupportForm();

        expect(html).toContain('obrapro_pending_tickets');
        expect(html).toContain("addEventListener('online'");
        expect(html).toContain('pendente');
        expect(html).toContain('enviando');
        expect(html).toContain('concluido');
        expect(html).toContain('falha');
    });

    it('nao expoe segredo, token ou id de usuario no HTML', () => {
        const html = renderSupportForm();

        expect(html).not.toMatch(/SESSION_SECRET|DEMO_PASSWORD|obrapro_session|user_id/i);
    });
});

describe('renderSupportConfirmation e renderSupportNotFound', () => {
    it('confirmacao mostra o numero de referencia e o status do chamado', () => {
        const html = renderSupportConfirmation('ticket-123', 'open');

        expect(html).toContain('ticket-123');
        expect(html).toContain('aberto');
    });

    it('chamado inexistente mostra mensagem clara sem vazar detalhe interno', () => {
        const html = renderSupportNotFound();

        expect(html).toContain('Chamado não encontrado');
        expect(html).not.toMatch(/SQL|D1|undefined|Error/);
    });
});
