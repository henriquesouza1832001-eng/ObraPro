export type WorkStatus = 'planning' | 'active' | 'completed' | 'archived';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ExecutionStatus = 'in_progress' | 'completed' | 'cancelled';
export type ExecutionStepStatus = 'pending' | 'completed' | 'skipped';

export interface Work {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    status: WorkStatus;
    city: string | null;
    state: string | null;
    plannedStartAt: string | null;
    plannedEndAt: string | null;
}

export interface Procedure {
    id: string;
    organizationId: string;
    workId: string | null;
    slug: string;
    title: string;
    summary: string;
    stage: string;
    version: number;
    status: ContentStatus;
    approvedBy: string | null;
    approvedAt: string | null;
}

export interface PublishedProcedureSummary {
    id: string;
    organizationId: string;
    workId: string | null;
    slug: string;
    title: string;
    summary: string;
    stage: string;
    version: number;
}

export interface PublishedProcedureDetails extends PublishedProcedureSummary {
    steps: ProcedureStep[];
}

export interface ProcedureStep {
    id: string;
    procedureId: string;
    position: number;
    title: string;
    instruction: string;
    safetyNote: string | null;
    whenToCallProfessional: string | null;
    materials: string[];
}

export interface Checklist {
    id: string;
    organizationId: string;
    procedureId: string;
    title: string;
    status: ContentStatus;
}

export interface PublishedChecklistSummary {
    id: string;
    organizationId: string;
    procedureId: string;
    title: string;
}

export interface PublishedChecklistDetails extends PublishedChecklistSummary {
    items: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    checklistId: string;
    position: number;
    label: string;
    whatGoodLooksLike: string | null;
    commonError: string | null;
}

export interface Execution {
    id: string;
    organizationId: string;
    workId: string;
    procedureId: string;
    startedBy: string;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
}

export interface ExecutionStep {
    id: string;
    executionId: string;
    procedureStepId: string;
    status: ExecutionStepStatus;
    note: string | null;
    completedAt: string | null;
}
