import type { MembershipRole, OrganizationMembership } from '../domain/identity';

interface MembershipRow {
    id: string;
    organization_id: string;
    user_id: string;
    role: MembershipRole;
    status: 'invited' | 'active' | 'suspended';
}

function mapMembership(row: MembershipRow): OrganizationMembership {
    return { id: row.id, organizationId: row.organization_id, userId: row.user_id, role: row.role, status: row.status };
}

export class D1MembershipRepository {
    public constructor(private readonly database: D1Database) { }

    public async listActiveForUser(userId: string): Promise<OrganizationMembership[]> {
        const result = await this.database.prepare(`
            SELECT id, organization_id, user_id, role, status
            FROM organization_memberships
            WHERE user_id = ? AND status = 'active'
            ORDER BY organization_id ASC
        `).bind(userId).all<MembershipRow>();

        return result.results.map(mapMembership);
    }

    public async canAccessOrganization(userId: string, organizationId: string): Promise<boolean> {
        const row = await this.database.prepare(`
            SELECT id
            FROM organization_memberships
            WHERE user_id = ? AND organization_id = ? AND status = 'active'
            LIMIT 1
        `).bind(userId, organizationId).first<{ id: string }>();

        return row !== null;
    }
}
