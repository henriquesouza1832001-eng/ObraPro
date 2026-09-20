PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    organization_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'bug' CHECK (category IN ('bug', 'content', 'account', 'other')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    route TEXT,
    correlation_id TEXT,
    session_context_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_org_status
    ON support_tickets (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_created
    ON support_tickets (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_support_tickets_correlation
    ON support_tickets (correlation_id);
