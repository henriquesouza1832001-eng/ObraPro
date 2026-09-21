export interface CourseProgress {
    completedLessonIds: string[];
    completedCount: number;
    totalLessons: number;
}

export interface CourseProgressSummary {
    courseSlug: string;
    courseTitle: string;
    completedCount: number;
    totalLessons: number;
    lastActivityAt: string | null;
}

export class D1CourseProgressRepository {
    public constructor(private readonly database: D1Database) { }

    public async getProgress(userId: string, courseSlug: string): Promise<CourseProgress | null> {
        const course = await this.database.prepare(`
            SELECT c.id
            FROM courses AS c
            INNER JOIN course_enrollments AS e ON e.course_id = c.id
            WHERE c.slug = ? AND c.is_published = 1
                AND e.user_id = ? AND e.status IN ('active', 'completed')
            LIMIT 1
        `).bind(courseSlug, userId).first<{ id: string }>();

        if (!course) {
            return null;
        }

        const result = await this.database.prepare(`
            SELECT l.id AS lesson_id,
                CASE WHEN p.lesson_id IS NULL THEN 0 ELSE 1 END AS completed
            FROM lessons AS l
            INNER JOIN course_modules AS cm ON cm.id = l.course_module_id
            INNER JOIN course_enrollments AS e ON e.course_id = cm.course_id
            LEFT JOIN course_lesson_progress AS p
                ON p.lesson_id = l.id AND p.user_id = ?
            WHERE cm.course_id = ? AND e.user_id = ? AND e.status IN ('active', 'completed')
            ORDER BY cm.position ASC, l.position ASC
        `).bind(userId, course.id, userId).all<{ lesson_id: string; completed: number }>();

        const completedLessonIds = result.results.filter((row) => row.completed === 1).map((row) => row.lesson_id);

        return {
            completedLessonIds,
            completedCount: completedLessonIds.length,
            totalLessons: result.results.length,
        };
    }

    public async completeLesson(userId: string, courseSlug: string, lessonId: string, completedAt: string): Promise<CourseProgress | null> {
        const lesson = await this.database.prepare(`
            SELECT c.id AS course_id
            FROM lessons AS l
            INNER JOIN course_modules AS cm ON cm.id = l.course_module_id
            INNER JOIN courses AS c ON c.id = cm.course_id
            INNER JOIN course_enrollments AS e ON e.course_id = c.id
            WHERE c.slug = ? AND c.is_published = 1 AND l.id = ?
                AND e.user_id = ? AND e.status IN ('active', 'completed')
            LIMIT 1
        `).bind(courseSlug, lessonId, userId).first<{ course_id: string }>();

        if (!lesson) {
            return null;
        }

        await this.database.prepare(`
            INSERT INTO course_lesson_progress (user_id, lesson_id, course_id, completed_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed_at = excluded.completed_at
        `).bind(userId, lessonId, lesson.course_id, completedAt).run();

        return this.getProgress(userId, courseSlug);
    }

    public async listProgressSummaries(userId: string, limit = 20): Promise<CourseProgressSummary[]> {
        const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
        const result = await this.database.prepare(`
            SELECT c.slug AS course_slug, c.title AS course_title,
                   COUNT(DISTINCT l.id) AS total_lessons,
                   COUNT(DISTINCT CASE WHEN p.lesson_id IS NOT NULL THEN l.id END) AS completed_count,
                   MAX(CASE WHEN p.completed_at IS NOT NULL THEN p.completed_at ELSE e.enrolled_at END) AS last_activity_at
            FROM course_enrollments AS e
            INNER JOIN courses AS c ON c.id = e.course_id AND c.is_published = 1
            LEFT JOIN course_modules AS cm ON cm.course_id = c.id
            LEFT JOIN lessons AS l ON l.course_module_id = cm.id
            LEFT JOIN course_lesson_progress AS p ON p.user_id = e.user_id AND p.course_id = c.id AND p.lesson_id = l.id
            WHERE e.user_id = ? AND e.status IN ('active', 'completed')
            GROUP BY c.id, c.slug, c.title
            ORDER BY last_activity_at DESC, c.title ASC
            LIMIT ?
        `).bind(userId, safeLimit).all<{ course_slug: string; course_title: string; completed_count: number; total_lessons: number; last_activity_at: string | null }>();

        return result.results.map((row) => ({
            courseSlug: String(row.course_slug),
            courseTitle: String(row.course_title),
            completedCount: Number(row.completed_count),
            totalLessons: Number(row.total_lessons),
            lastActivityAt: row.last_activity_at ? String(row.last_activity_at) : null,
        }));
    }
}
