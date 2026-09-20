CREATE TABLE IF NOT EXISTS lesson_content_versions (
    id TEXT PRIMARY KEY NOT NULL,
    lesson_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    body TEXT NOT NULL,
    materials_json TEXT NOT NULL DEFAULT '[]',
    tools_json TEXT NOT NULL DEFAULT '[]',
    steps_json TEXT NOT NULL DEFAULT '[]',
    safety_notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (lesson_id, version),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lesson_content_public
    ON lesson_content_versions (lesson_id, status, version DESC);
