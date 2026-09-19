import type { Course, CourseRepository } from './course';

interface CourseRow {
    slug: string;
    category: string;
    title: string;
    description: string;
    access_type: 'free' | 'premium';
    price_cents: number | null;
    duration_minutes: number;
    module_count: number;
}

function mapCourse(row: CourseRow): Course {
    return {
        slug: row.slug,
        category: row.category,
        title: row.title,
        description: row.description,
        accessType: row.access_type,
        priceCents: row.price_cents,
        modulesCount: row.module_count,
        durationMinutes: row.duration_minutes,
    };
}

export class D1CourseRepository implements CourseRepository {
    public constructor(private readonly database: D1Database) { }

    public async listCourses(): Promise<Course[]> {
        const result = await this.database.prepare(`
            SELECT c.slug, c.category, c.title, c.description, c.access_type,
                c.price_cents, c.duration_minutes, COUNT(cm.id) AS module_count
            FROM courses AS c
            LEFT JOIN course_modules AS cm ON cm.course_id = c.id
            WHERE c.is_published = 1
            GROUP BY c.id
            ORDER BY c.is_featured DESC, c.category ASC, c.title ASC
        `).all<CourseRow>();

        return result.results.map(mapCourse);
    }

    public async findCourseBySlug(slug: string): Promise<Course | null> {
        const result = await this.database.prepare(`
            SELECT c.slug, c.category, c.title, c.description, c.access_type,
                c.price_cents, c.duration_minutes, COUNT(cm.id) AS module_count
            FROM courses AS c
            LEFT JOIN course_modules AS cm ON cm.course_id = c.id
            WHERE c.slug = ? AND c.is_published = 1
            GROUP BY c.id
            LIMIT 1
        `).bind(slug).first<CourseRow>();

        return result ? mapCourse(result) : null;
    }
}
