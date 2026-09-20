import type { PublishedChecklistSummary, PublishedProcedureSummary, Work, WorkStatus } from '../domain/operational';

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

interface ProcedureRow {
    id: string;
    organization_id: string;
    work_id: string | null;
    slug: string;
    title: string;
    summary: string;
    stage: string;
    version: number;
}

interface ChecklistRow {
    id: string;
    organization_id: string;
    procedure_id: string;
    title: string;
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

    public async listPublishedProcedures(organizationId: string): Promise<PublishedProcedureSummary[]> {
        const result = await this.database.prepare(`
            SELECT id, organization_id, work_id, slug, title, summary, stage, version
            FROM procedures
            WHERE organization_id = ? AND status = 'published'
            ORDER BY stage ASC, title ASC, version DESC
        `).bind(organizationId).all<ProcedureRow>();

        return result.results.map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            workId: row.work_id,
            slug: row.slug,
            title: row.title,
            summary: row.summary,
            stage: row.stage,
            version: row.version,
        }));
    }

    public async listPublishedChecklists(organizationId: string): Promise<PublishedChecklistSummary[]> {
        const result = await this.database.prepare(`
            SELECT id, organization_id, procedure_id, title
            FROM checklists
            WHERE organization_id = ? AND status = 'published'
            ORDER BY title ASC
        `).bind(organizationId).all<ChecklistRow>();

        return result.results.map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            procedureId: row.procedure_id,
            title: row.title,
        }));
    }
}
