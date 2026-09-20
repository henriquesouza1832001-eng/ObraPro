export interface CourseProgress {
    completedLessonIds: string[];
    completedCount: number;
    totalLessons: number;
}

export class D1CourseProgressRepository {
    public constructor(private readonly database: D1Database) { }

    public async getProgress(userId: string, courseSlug: string): Promise<CourseProgress | null> {
        const course = await this.database.prepare(`
            SELECT c.id
            FROM courses AS c
            WHERE c.slug = ? AND c.is_published = 1
            LIMIT 1
        `).bind(courseSlug).first<{ id: string }>();

        if (!course) {
            return null;
        }

        const result = await this.database.prepare(`
            SELECT l.id AS lesson_id,
                CASE WHEN p.lesson_id IS NULL THEN 0 ELSE 1 END AS completed
            FROM lessons AS l
            INNER JOIN course_modules AS cm ON cm.id = l.course_module_id
            LEFT JOIN course_lesson_progress AS p
                ON p.lesson_id = l.id AND p.user_id = ?
            WHERE cm.course_id = ?
            ORDER BY cm.position ASC, l.position ASC
        `).bind(userId, course.id).all<{ lesson_id: string; completed: number }>();

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
            WHERE c.slug = ? AND c.is_published = 1 AND l.id = ?
            LIMIT 1
        `).bind(courseSlug, lessonId).first<{ course_id: string }>();

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
}
