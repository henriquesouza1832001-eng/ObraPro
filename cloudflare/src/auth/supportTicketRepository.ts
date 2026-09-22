import type { CreateSupportTicketInput, SupportTicket } from '../domain/support';

export class D1SupportTicketRepository {
    public constructor(private readonly database: D1Database) { }

    public async create(input: CreateSupportTicketInput): Promise<void> {
        await this.database.prepare(`
            INSERT INTO support_tickets (
                id, user_id, organization_id, title, description, category, priority,
                route, correlation_id, session_context_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            input.id,
            input.userId,
            input.organizationId,
            input.title,
            input.description,
            input.category,
            input.priority,
            input.route,
            input.correlationId,
            JSON.stringify(input.sessionContext),
            input.createdAt,
            input.createdAt,
        ).run();
    }

    public async findForUser(userId: string, ticketId: string): Promise<SupportTicket | null> {
        const row = await this.database.prepare(`
            SELECT id, user_id, organization_id, title, description, category, priority,
                   status, route, correlation_id, session_context_json, created_at, updated_at
            FROM support_tickets
            WHERE id = ? AND user_id = ?
            LIMIT 1
        `).bind(ticketId, userId).first<Record<string, unknown>>();

        if (!row) {
            return null;
        }

        return {
            id: String(row.id),
            userId: String(row.user_id),
            organizationId: row.organization_id ? String(row.organization_id) : null,
            title: String(row.title),
            description: String(row.description),
            category: row.category as SupportTicket['category'],
            priority: row.priority as SupportTicket['priority'],
            status: row.status as SupportTicket['status'],
            route: row.route ? String(row.route) : null,
            correlationId: row.correlation_id ? String(row.correlation_id) : null,
            sessionContext: JSON.parse(String(row.session_context_json ?? '{}')) as SupportTicket['sessionContext'],
            createdAt: String(row.created_at),
            updatedAt: String(row.updated_at),
        };
    }

    public async listForUser(userId: string, limit = 50): Promise<Array<Omit<SupportTicket, 'userId' | 'sessionContext'>>> {
        const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
        const result = await this.database.prepare(`
            SELECT id, user_id, organization_id, title, description, category, priority,
                   status, route, correlation_id, session_context_json, created_at, updated_at
            FROM support_tickets
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `).bind(userId, safeLimit).all<Record<string, unknown>>();

        return result.results.map((row) => ({
            id: String(row.id),
            organizationId: row.organization_id ? String(row.organization_id) : null,
            title: String(row.title),
            description: String(row.description),
            category: row.category as SupportTicket['category'],
            priority: row.priority as SupportTicket['priority'],
            status: row.status as SupportTicket['status'],
            route: row.route ? String(row.route) : null,
            correlationId: row.correlation_id ? String(row.correlation_id) : null,
            createdAt: String(row.created_at),
            updatedAt: String(row.updated_at),
        }));
    }
}
