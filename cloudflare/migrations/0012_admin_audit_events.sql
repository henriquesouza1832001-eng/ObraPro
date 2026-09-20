PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_audit_events (
    id TEXT PRIMARY KEY NOT NULL,
    actor_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created
    ON admin_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_resource
    ON admin_audit_events (resource_type, resource_id, created_at DESC);
