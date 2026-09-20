PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY NOT NULL,
    organization_id TEXT NOT NULL,
    execution_step_id TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
    checksum TEXT NOT NULL CHECK (length(checksum) = 64),
    note TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'quarantined', 'deleted')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT,
    FOREIGN KEY (execution_step_id) REFERENCES execution_steps (id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_evidence_org_status
    ON evidence (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_evidence_execution_step_created
    ON evidence (execution_step_id, created_at);
