export type SupportCategory = 'bug' | 'content' | 'account' | 'other';
export type SupportPriority = 'low' | 'normal' | 'high';
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportSessionContext {
    [key: string]: string | undefined;
    userAgent?: string;
    route?: string;
    correlationId?: string;
    appVersion?: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    organizationId: string | null;
    title: string;
    description: string;
    category: SupportCategory;
    priority: SupportPriority;
    status: SupportStatus;
    route: string | null;
    correlationId: string | null;
    sessionContext: SupportSessionContext;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupportTicketInput {
    id: string;
    userId: string;
    organizationId: string | null;
    title: string;
    description: string;
    category: SupportCategory;
    priority: SupportPriority;
    route: string | null;
    correlationId: string | null;
    sessionContext: Record<string, unknown>;
    createdAt: string;
}

const contextKeys = {
    userAgent: 'user_agent',
    route: 'route',
    correlationId: 'correlation_id',
    appVersion: 'app_version',
} as const;

export function sanitizeSupportContext(input: Record<string, unknown>): SupportSessionContext {
    const context: SupportSessionContext = {};

    for (const [property, key] of Object.entries(contextKeys) as [keyof typeof contextKeys, typeof contextKeys[keyof typeof contextKeys]][]) {
        const value = input[key];
        if (typeof value === 'string' && value.length > 0) {
            context[property] = value.slice(0, 255);
        }
    }

    return context;
}

export function validateSupportTicket(input: CreateSupportTicketInput): CreateSupportTicketInput {
    if (!input.id || !input.userId || !input.title.trim() || !input.description.trim()) {
        throw new Error('support_ticket_required_fields');
    }

    if (input.title.length > 160 || input.description.length > 5000) {
        throw new Error('support_ticket_text_too_long');
    }

    return {
        ...input,
        title: input.title.trim(),
        description: input.description.trim(),
        route: input.route?.slice(0, 255) ?? null,
        sessionContext: sanitizeSupportContext(input.sessionContext),
    };
}
