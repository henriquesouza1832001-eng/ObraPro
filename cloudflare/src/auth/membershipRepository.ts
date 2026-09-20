import type { ActiveOrganization, MembershipRole, OrganizationMembership } from '../domain/identity';

interface MembershipRow {
    id: string;
    organization_id: string;
    user_id: string;
    role: MembershipRole;
    status: 'invited' | 'active' | 'suspended';
}

interface ActiveOrganizationRow {
    id: string;
    name: string;
    slug: string;
    role: MembershipRole;
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
            SELECT m.id
            FROM organization_memberships AS m
            INNER JOIN organizations AS o ON o.id = m.organization_id
            WHERE m.user_id = ? AND m.organization_id = ? AND m.status = 'active' AND o.is_active = 1
            LIMIT 1
        `).bind(userId, organizationId).first<{ id: string }>();

        return row !== null;
    }

    public async listActiveOrganizationsForUser(userId: string): Promise<ActiveOrganization[]> {
        const result = await this.database.prepare(`
            SELECT o.id, o.name, o.slug, m.role
            FROM organization_memberships AS m
            INNER JOIN organizations AS o ON o.id = m.organization_id
            WHERE m.user_id = ? AND m.status = 'active' AND o.is_active = 1
            ORDER BY o.name ASC
        `).bind(userId).all<ActiveOrganizationRow>();

        return result.results.map((row) => ({ id: row.id, name: row.name, slug: row.slug, role: row.role }));
    }
}
