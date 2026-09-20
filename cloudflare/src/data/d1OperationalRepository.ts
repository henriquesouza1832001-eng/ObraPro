import type { ChecklistItem, PublishedChecklistDetails, PublishedChecklistSummary, PublishedProcedureDetails, PublishedProcedureSummary, ProcedureStep, Work, WorkStatus } from '../domain/operational';

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

interface ProcedureStepRow {
    id: string;
    procedure_id: string;
    position: number;
    title: string;
    instruction: string;
    safety_note: string | null;
    when_to_call_professional: string | null;
    materials_json: string | null;
}

interface ChecklistItemRow {
    id: string;
    checklist_id: string;
    position: number;
    label: string;
    what_good_looks_like: string | null;
    common_error: string | null;
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

    public async findPublishedProcedure(organizationId: string, procedureId: string): Promise<PublishedProcedureDetails | null> {
        const procedure = await this.database.prepare(`
            SELECT id, organization_id, work_id, slug, title, summary, stage, version
            FROM procedures
            WHERE id = ? AND organization_id = ? AND status = 'published'
            ORDER BY version DESC
            LIMIT 1
        `).bind(procedureId, organizationId).first<ProcedureRow>();

        if (!procedure) {
            return null;
        }

        const steps = await this.database.prepare(`
            SELECT id, procedure_id, position, title, instruction, safety_note,
                when_to_call_professional, materials_json
            FROM procedure_steps
            WHERE procedure_id = ?
            ORDER BY position ASC
        `).bind(procedure.id).all<ProcedureStepRow>();

        return {
            id: procedure.id,
            organizationId: procedure.organization_id,
            workId: procedure.work_id,
            slug: procedure.slug,
            title: procedure.title,
            summary: procedure.summary,
            stage: procedure.stage,
            version: procedure.version,
            steps: steps.results.map((step): ProcedureStep => ({
                id: step.id,
                procedureId: step.procedure_id,
                position: step.position,
                title: step.title,
                instruction: step.instruction,
                safetyNote: step.safety_note,
                whenToCallProfessional: step.when_to_call_professional,
                materials: parseMaterials(step.materials_json),
            })),
        };
    }

    public async findPublishedChecklist(organizationId: string, checklistId: string): Promise<PublishedChecklistDetails | null> {
        const checklist = await this.database.prepare(`
            SELECT id, organization_id, procedure_id, title
            FROM checklists
            WHERE id = ? AND organization_id = ? AND status = 'published'
            LIMIT 1
        `).bind(checklistId, organizationId).first<ChecklistRow>();

        if (!checklist) {
            return null;
        }

        const items = await this.database.prepare(`
            SELECT id, checklist_id, position, label, what_good_looks_like, common_error
            FROM checklist_items
            WHERE checklist_id = ?
            ORDER BY position ASC
        `).bind(checklist.id).all<ChecklistItemRow>();

        return {
            id: checklist.id,
            organizationId: checklist.organization_id,
            procedureId: checklist.procedure_id,
            title: checklist.title,
            items: items.results.map((item): ChecklistItem => ({
                id: item.id,
                checklistId: item.checklist_id,
                position: item.position,
                label: item.label,
                whatGoodLooksLike: item.what_good_looks_like,
                commonError: item.common_error,
            })),
        };
    }
}

function parseMaterials(value: string | null): string[] {
    if (!value) {
        return [];
    }

    try {
        const materials = JSON.parse(value) as unknown;

        return Array.isArray(materials) && materials.every((item) => typeof item === 'string') ? materials : [];
    } catch {
        return [];
    }
}
