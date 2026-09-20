import type { Course, CourseModule, CourseRepository } from './course';

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

interface ModuleRow {
    module_id: string;
    module_title: string;
    module_description: string;
    module_position: number;
    lesson_id: string;
    lesson_title: string;
    lesson_position: number;
    duration_minutes: number;
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

    public async findModulesByCourseSlug(slug: string): Promise<CourseModule[]> {
        const result = await this.database.prepare(`
            SELECT cm.id AS module_id, cm.title AS module_title, cm.description AS module_description,
                cm.position AS module_position, l.id AS lesson_id, l.title AS lesson_title,
                l.position AS lesson_position, l.duration_minutes
            FROM course_modules AS cm
            INNER JOIN courses AS c ON c.id = cm.course_id
            LEFT JOIN lessons AS l ON l.course_module_id = cm.id
            WHERE c.slug = ? AND c.is_published = 1
            ORDER BY cm.position ASC, l.position ASC
        `).bind(slug).all<ModuleRow>();

        const modules = new Map<string, CourseModule>();
        for (const row of result.results) {
            const module = modules.get(row.module_id) ?? {
                title: row.module_title,
                lessons: [],
            };

            if (row.lesson_id) {
                module.lessons.push({
                    title: row.lesson_title,
                    durationMinutes: row.duration_minutes,
                });
            }

            modules.set(row.module_id, module);
        }

        return [...modules.values()];
    }
}
