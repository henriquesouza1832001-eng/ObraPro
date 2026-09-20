import type { D1MembershipRepository } from './membershipRepository';

export class D1EvidenceAuthorization {
    public constructor(
        private readonly database: D1Database,
        private readonly memberships: Pick<D1MembershipRepository, 'canAccessOrganization'>,
    ) { }

    public async canDownload(userId: string, organizationId: string, evidenceId: string): Promise<boolean> {
        if (!await this.memberships.canAccessOrganization(userId, organizationId)) {
            return false;
        }

        const row = await this.database.prepare(`
            SELECT id
            FROM evidence
            WHERE id = ? AND organization_id = ? AND status = 'available'
            LIMIT 1
        `).bind(evidenceId, organizationId).first<{ id: string }>();

        return row !== null;
    }

    public async canUpload(userId: string, organizationId: string, executionStepId: string): Promise<boolean> {
        if (!await this.memberships.canAccessOrganization(userId, organizationId)) {
            return false;
        }

        const row = await this.database.prepare(`
            SELECT execution_steps.id
            FROM execution_steps
            INNER JOIN executions ON executions.id = execution_steps.execution_id
            WHERE execution_steps.id = ? AND executions.organization_id = ?
            LIMIT 1
        `).bind(executionStepId, organizationId).first<{ id: string }>();

        return row !== null;
    }
}
