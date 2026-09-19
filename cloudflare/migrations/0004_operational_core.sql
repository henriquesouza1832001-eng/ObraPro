PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    city TEXT,
    state TEXT,
    planned_start_at TEXT,
    planned_end_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (organization_id, slug),
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_works_org_status
    ON works (organization_id, status);

CREATE TABLE IF NOT EXISTS procedures (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    work_id TEXT,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    stage TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    approved_by TEXT,
    approved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (organization_id, work_id, slug, version),
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT,
    FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_procedures_org_status
    ON procedures (organization_id, status);

CREATE TABLE IF NOT EXISTS procedure_steps (
    id TEXT PRIMARY KEY NOT NULL,
    procedure_id TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    title TEXT NOT NULL,
    instruction TEXT NOT NULL,
    safety_note TEXT,
    when_to_call_professional TEXT,
    materials_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (procedure_id, position),
    FOREIGN KEY (procedure_id) REFERENCES procedures (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checklists (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    procedure_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT,
    FOREIGN KEY (procedure_id) REFERENCES procedures (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checklists_org_status
    ON checklists (organization_id, status);

CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY NOT NULL,
    checklist_id TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    label TEXT NOT NULL,
    what_good_looks_like TEXT,
    common_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (checklist_id, position),
    FOREIGN KEY (checklist_id) REFERENCES checklists (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    work_id TEXT NOT NULL,
    procedure_id TEXT NOT NULL,
    started_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT,
    FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE RESTRICT,
    FOREIGN KEY (procedure_id) REFERENCES procedures (id) ON DELETE RESTRICT,
    FOREIGN KEY (started_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_executions_org_status
    ON executions (organization_id, status);

CREATE TABLE IF NOT EXISTS execution_steps (
    id TEXT PRIMARY KEY NOT NULL,
    execution_id TEXT NOT NULL,
    procedure_step_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    note TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (execution_id, procedure_step_id),
    FOREIGN KEY (execution_id) REFERENCES executions (id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_step_id) REFERENCES procedure_steps (id) ON DELETE RESTRICT
);
