PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS course_quizzes (
    id TEXT PRIMARY KEY NOT NULL,
    course_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    pass_percentage INTEGER NOT NULL DEFAULT 75 CHECK (pass_percentage BETWEEN 1 AND 100),
    max_attempts INTEGER NOT NULL DEFAULT 4 CHECK (max_attempts BETWEEN 1 AND 4),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (course_id, version),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_quizzes_one_published
    ON course_quizzes (course_id) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY NOT NULL,
    quiz_id TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    prompt TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_option INTEGER NOT NULL CHECK (correct_option >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (quiz_id, position),
    FOREIGN KEY (quiz_id) REFERENCES course_quizzes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_order
    ON quiz_questions (quiz_id, position);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY NOT NULL,
    quiz_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 4),
    score_percentage INTEGER NOT NULL CHECK (score_percentage BETWEEN 0 AND 100),
    passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
    submitted_at TEXT NOT NULL,
    UNIQUE (quiz_id, user_id, attempt_number),
    FOREIGN KEY (quiz_id) REFERENCES course_quizzes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz
    ON quiz_attempts (user_id, quiz_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY NOT NULL,
    course_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    quiz_attempt_id TEXT NOT NULL,
    verification_code TEXT NOT NULL UNIQUE,
    course_title_snapshot TEXT NOT NULL,
    duration_minutes_snapshot INTEGER NOT NULL CHECK (duration_minutes_snapshot > 0),
    quiz_score_percentage INTEGER NOT NULL CHECK (quiz_score_percentage BETWEEN 75 AND 100),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    issued_at TEXT NOT NULL,
    revoked_at TEXT,
    UNIQUE (course_id, user_id),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_certificates_verification
    ON certificates (verification_code, status);
