import { describe, expect, it } from 'vitest';
import { validateSupportTicket } from './support';

const input = {
    id: 'ticket-1',
    userId: 'user-1',
    organizationId: 'org-1',
    title: 'Botao nao responde',
    description: 'O checklist nao abriu depois do toque.',
    category: 'bug' as const,
    priority: 'normal' as const,
    route: '/painel/checklists',
    correlationId: 'corr-1',
    sessionContext: {
        user_agent: 'Mozilla/5.0',
        route: '/painel/checklists',
        password: 'nao deve entrar',
    },
    createdAt: '2026-09-19T21:10:00-03:00',
};

describe('validateSupportTicket', () => {
    it('limita o contexto a campos diagnosticos permitidos', () => {
        const ticket = validateSupportTicket(input);

        expect(ticket.sessionContext).toEqual({ userAgent: 'Mozilla/5.0', route: '/painel/checklists' });
        expect(ticket.sessionContext).not.toHaveProperty('password');
    });

    it('rejeita texto vazio ou acima do limite', () => {
        expect(() => validateSupportTicket({ ...input, title: ' ' })).toThrow('support_ticket_required_fields');
        expect(() => validateSupportTicket({ ...input, description: 'x'.repeat(5001) })).toThrow('support_ticket_text_too_long');
    });
});
