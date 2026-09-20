CREATE TABLE IF NOT EXISTS course_enrollments (
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('free', 'included', 'purchased')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'completed')),
    enrolled_at TEXT NOT NULL,
    completed_at TEXT,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_status
    ON course_enrollments (user_id, status);
