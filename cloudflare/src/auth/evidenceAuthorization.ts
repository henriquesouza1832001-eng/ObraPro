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
}
