import type { Work, WorkStatus } from '../domain/operational';

interface WorkRow {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    status: WorkStatus;
    city: string | null;
    state: string | null;
    planned_start_at: string | null;
    planned_end_at: string | null;
}

function mapWork(row: WorkRow): Work {
    return {
        id: row.id,
        organizationId: row.organization_id,
        name: row.name,
        slug: row.slug,
        status: row.status,
        city: row.city,
        state: row.state,
        plannedStartAt: row.planned_start_at,
        plannedEndAt: row.planned_end_at,
    };
}

export class D1OperationalRepository {
    public constructor(private readonly database: D1Database) { }

    public async listWorks(organizationId: string): Promise<Work[]> {
        const result = await this.database.prepare(`
            SELECT id, organization_id, name, slug, status, city, state, planned_start_at, planned_end_at
            FROM works
            WHERE organization_id = ?
            ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'planning' THEN 1 ELSE 2 END, name ASC
        `).bind(organizationId).all<WorkRow>();

        return result.results.map(mapWork);
    }
}
