export interface QuizQuestion {
    id: string;
    position: number;
    prompt: string;
    options: string[];
}

export interface PublishedQuiz {
    id: string;
    courseSlug: string;
    passPercentage: number;
    maxAttempts: number;
    questions: QuizQuestion[];
}

export interface QuizAttemptResult {
    attemptNumber: number;
    scorePercentage: number;
    passed: boolean;
    attemptsRemaining: number;
    courseCompleted: boolean;
    certificateId: string | null;
}

export interface CertificateSummary {
    id: string;
    verificationCode: string;
    courseSlug: string;
    courseTitle: string;
    studentName: string;
    durationMinutes: number;
    quizScorePercentage: number;
    status: 'active' | 'revoked';
    issuedAt: string;
    revokedAt: string | null;
}

interface QuizRow {
    quiz_id: string;
    course_slug: string;
    pass_percentage: number;
    max_attempts: number;
    question_id: string;
    question_position: number;
    prompt: string;
    options_json: string;
    correct_option: number;
}

export class D1CourseQuizRepository {
    public constructor(private readonly database: D1Database) { }

    public async findPublishedForUser(userId: string, courseSlug: string): Promise<PublishedQuiz | null> {
        const rows = await this.database.prepare(`
            SELECT q.id AS quiz_id, c.slug AS course_slug, q.pass_percentage, q.max_attempts,
                   qq.id AS question_id, qq.position AS question_position, qq.prompt,
                   qq.options_json, qq.correct_option
            FROM course_quizzes AS q
            INNER JOIN courses AS c ON c.id = q.course_id AND c.is_published = 1
            INNER JOIN course_enrollments AS e ON e.course_id = c.id
                AND e.user_id = ? AND e.status IN ('active', 'completed')
            INNER JOIN quiz_questions AS qq ON qq.quiz_id = q.id
            WHERE c.slug = ? AND q.status = 'published'
            ORDER BY qq.position ASC
        `).bind(userId, courseSlug).all<QuizRow>();

        if (rows.results.length === 0) {
            return null;
        }

        const first = rows.results[0];
        if (!first) return null;
        return {
            id: first.quiz_id,
            courseSlug: first.course_slug,
            passPercentage: Number(first.pass_percentage),
            maxAttempts: Number(first.max_attempts),
            questions: rows.results.map((row) => ({
                id: row.question_id,
                position: Number(row.question_position),
                prompt: row.prompt,
                options: JSON.parse(row.options_json) as string[],
            })),
        };
    }

    public async submit(userId: string, courseSlug: string, answers: Record<string, unknown>, submittedAt: string): Promise<QuizAttemptResult | null> {
        const rows = await this.database.prepare(`
            SELECT q.id AS quiz_id, q.pass_percentage, q.max_attempts, qq.id AS question_id, qq.correct_option
            FROM course_quizzes AS q
            INNER JOIN courses AS c ON c.id = q.course_id AND c.is_published = 1
            INNER JOIN course_enrollments AS e ON e.course_id = c.id
                AND e.user_id = ? AND e.status IN ('active', 'completed')
            INNER JOIN quiz_questions AS qq ON qq.quiz_id = q.id
            WHERE c.slug = ? AND q.status = 'published'
            ORDER BY qq.position ASC
        `).bind(userId, courseSlug).all<{ quiz_id: string; pass_percentage: number; max_attempts: number; question_id: string; correct_option: number }>();
        if (!rows.results.length) return null;
        const first = rows.results[0];
        if (!first) return null;
        const used = await this.database.prepare('SELECT COUNT(*) AS count FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?').bind(first.quiz_id, userId).first<{ count: number }>();
        const attemptNumber = Number(used?.count ?? 0) + 1;
        if (attemptNumber > Number(first.max_attempts)) return { attemptNumber: Number(first.max_attempts), scorePercentage: 0, passed: false, attemptsRemaining: 0, courseCompleted: false, certificateId: null };
        const correct = rows.results.filter((row) => answers[row.question_id] === row.correct_option).length;
        const scorePercentage = Math.round((correct / rows.results.length) * 100);
        const passed = scorePercentage >= Number(first.pass_percentage);
        const course = await this.database.prepare(`SELECT c.id, c.title, c.duration_minutes, COUNT(l.id) AS total_lessons,
                COUNT(p.lesson_id) AS completed_lessons
            FROM courses AS c
            INNER JOIN course_modules AS cm ON cm.course_id = c.id
            INNER JOIN lessons AS l ON l.course_module_id = cm.id
            LEFT JOIN course_lesson_progress AS p ON p.course_id = c.id AND p.lesson_id = l.id AND p.user_id = ?
            WHERE c.slug = ? AND c.is_published = 1
            GROUP BY c.id, c.title, c.duration_minutes`).bind(userId, courseSlug).first<{ id: string; title: string; duration_minutes: number; total_lessons: number; completed_lessons: number }>();
        const courseCompleted = Boolean(course && Number(course.total_lessons) > 0 && Number(course.total_lessons) === Number(course.completed_lessons));
        const attemptId = crypto.randomUUID();
        await this.database.prepare(`INSERT INTO quiz_attempts (id, quiz_id, user_id, attempt_number, score_percentage, passed, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(attemptId, first.quiz_id, userId, attemptNumber, scorePercentage, passed ? 1 : 0, submittedAt).run();
        let certificateId: string | null = null;
        if (passed && courseCompleted && course) {
            certificateId = crypto.randomUUID();
            const verificationCode = crypto.randomUUID().replaceAll('-', '');
            const inserted = await this.database.prepare(`INSERT OR IGNORE INTO certificates
                (id, course_id, user_id, quiz_attempt_id, verification_code, course_title_snapshot, duration_minutes_snapshot, quiz_score_percentage, status, issued_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`)
                .bind(certificateId, course.id, userId, attemptId, verificationCode, course.title, course.duration_minutes, scorePercentage, submittedAt).run();
            if (inserted.meta.changes !== 1) {
                const existing = await this.database.prepare('SELECT id FROM certificates WHERE course_id = ? AND user_id = ?').bind(course.id, userId).first<{ id: string }>();
                certificateId = existing?.id ?? null;
            }
        }
        return { attemptNumber, scorePercentage, passed, attemptsRemaining: Math.max(Number(first.max_attempts) - attemptNumber, 0), courseCompleted, certificateId };
    }

    public async listCertificates(userId: string): Promise<CertificateSummary[]> {
        const result = await this.database.prepare(`SELECT c.id, c.verification_code, co.slug AS course_slug,
                c.course_title_snapshot, u.name AS student_name, c.duration_minutes_snapshot,
                c.quiz_score_percentage, c.status, c.issued_at, c.revoked_at
            FROM certificates AS c INNER JOIN courses AS co ON co.id = c.course_id
            INNER JOIN users AS u ON u.id = c.user_id WHERE c.user_id = ? ORDER BY c.issued_at DESC`).bind(userId).all<Record<string, unknown>>();
        return result.results.map((row) => this.mapCertificate(row));
    }

    public async verifyCertificate(code: string): Promise<CertificateSummary | null> {
        const row = await this.database.prepare(`SELECT c.id, c.verification_code, co.slug AS course_slug,
                c.course_title_snapshot, u.name AS student_name, c.duration_minutes_snapshot,
                c.quiz_score_percentage, c.status, c.issued_at, c.revoked_at
            FROM certificates AS c INNER JOIN courses AS co ON co.id = c.course_id
            INNER JOIN users AS u ON u.id = c.user_id WHERE c.verification_code = ? LIMIT 1`).bind(code).first<Record<string, unknown>>();
        return row ? this.mapCertificate(row) : null;
    }

    private mapCertificate(row: Record<string, unknown>): CertificateSummary {
        return { id: String(row.id), verificationCode: String(row.verification_code), courseSlug: String(row.course_slug), courseTitle: String(row.course_title_snapshot), studentName: String(row.student_name), durationMinutes: Number(row.duration_minutes_snapshot), quizScorePercentage: Number(row.quiz_score_percentage), status: row.status as 'active' | 'revoked', issuedAt: String(row.issued_at), revokedAt: row.revoked_at ? String(row.revoked_at) : null };
    }
}
