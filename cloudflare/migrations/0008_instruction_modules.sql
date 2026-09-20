CREATE TABLE IF NOT EXISTS instruction_modules (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

ALTER TABLE courses ADD COLUMN instruction_module_id TEXT REFERENCES instruction_modules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_instruction_module
    ON courses (instruction_module_id, is_published, is_featured);
