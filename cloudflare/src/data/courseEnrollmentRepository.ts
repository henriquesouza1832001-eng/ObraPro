export type CourseAccess = 'free' | 'included' | 'purchased';

export interface CourseAccessResult {
    courseSlug: string;
    accessType: CourseAccess | null;
    enrolled: boolean;
    status: 'active' | 'revoked' | 'completed' | null;
}

interface CourseRow {
    id: string;
    access_type: 'free' | 'premium';
}

interface EnrollmentRow {
    access_type: CourseAccess;
    status: 'active' | 'revoked' | 'completed';
}

export class D1CourseEnrollmentRepository {
    public constructor(private readonly database: D1Database) { }

    public async accessFor(userId: string, courseSlug: string): Promise<CourseAccessResult | null> {
        const course = await this.database.prepare(`
            SELECT id, access_type
            FROM courses
            WHERE slug = ? AND is_published = 1
            LIMIT 1
        `).bind(courseSlug).first<CourseRow>();

        if (!course) {
            return null;
        }

        const enrollment = await this.database.prepare(`
            SELECT access_type, status
            FROM course_enrollments
            WHERE user_id = ? AND course_id = ?
            LIMIT 1
        `).bind(userId, course.id).first<EnrollmentRow>();

        return {
            courseSlug,
            accessType: enrollment?.access_type ?? (course.access_type === 'free' ? 'free' : null),
            enrolled: enrollment?.status === 'active' || enrollment?.status === 'completed',
            status: enrollment?.status ?? null,
        };
    }

    public async enrollFree(userId: string, courseSlug: string, enrolledAt: string): Promise<CourseAccessResult | null> {
        const course = await this.database.prepare(`
            SELECT id
            FROM courses
            WHERE slug = ? AND access_type = 'free' AND is_published = 1
            LIMIT 1
        `).bind(courseSlug).first<{ id: string }>();

        if (!course) {
            return null;
        }

        await this.database.prepare(`
            INSERT INTO course_enrollments (user_id, course_id, access_type, status, enrolled_at)
            VALUES (?, ?, 'free', 'active', ?)
            ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'active'
        `).bind(userId, course.id, enrolledAt).run();

        return this.accessFor(userId, courseSlug);
    }
}
