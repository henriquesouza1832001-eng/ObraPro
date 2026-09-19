PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
    ON auth_sessions (user_id, revoked_at, expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry
    ON auth_sessions (expires_at);
