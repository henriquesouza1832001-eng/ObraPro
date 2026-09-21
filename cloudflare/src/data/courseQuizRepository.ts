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
        if (attemptNumber > Number(first.max_attempts)) return { attemptNumber: Number(first.max_attempts), scorePercentage: 0, passed: false, attemptsRemaining: 0 };
        const correct = rows.results.filter((row) => answers[row.question_id] === row.correct_option).length;
        const scorePercentage = Math.round((correct / rows.results.length) * 100);
        const passed = scorePercentage >= Number(first.pass_percentage);
        await this.database.prepare(`INSERT INTO quiz_attempts (id, quiz_id, user_id, attempt_number, score_percentage, passed, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(crypto.randomUUID(), first.quiz_id, userId, attemptNumber, scorePercentage, passed ? 1 : 0, submittedAt).run();
        return { attemptNumber, scorePercentage, passed, attemptsRemaining: Math.max(Number(first.max_attempts) - attemptNumber, 0) };
    }
}
