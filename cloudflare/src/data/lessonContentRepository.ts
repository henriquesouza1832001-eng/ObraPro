export interface LessonContent {
    lessonId: string;
    version: number;
    body: string;
    materials: string[];
    tools: string[];
    steps: string[];
    safetyNotes: string;
}

interface LessonContentRow {
    lesson_id: string;
    version: number;
    body: string;
    materials_json: string;
    tools_json: string;
    steps_json: string;
    safety_notes: string;
}

function stringList(value: string): string[] {
    try {
        const parsed: unknown = JSON.parse(value);

        return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
    } catch {
        return [];
    }
}

function mapContent(row: LessonContentRow): LessonContent {
    return {
        lessonId: row.lesson_id,
        version: row.version,
        body: row.body,
        materials: stringList(row.materials_json),
        tools: stringList(row.tools_json),
        steps: stringList(row.steps_json),
        safetyNotes: row.safety_notes,
    };
}

export class D1LessonContentRepository {
    public constructor(private readonly database: D1Database) { }

    public async findPublished(lessonId: string): Promise<LessonContent | null> {
        const row = await this.database.prepare(`
            SELECT lesson_id, version, body, materials_json, tools_json, steps_json, safety_notes
            FROM lesson_content_versions
            WHERE lesson_id = ? AND status = 'published' AND published_at IS NOT NULL
            ORDER BY version DESC
            LIMIT 1
        `).bind(lessonId).first<LessonContentRow>();

        return row ? mapContent(row) : null;
    }

    public async findPublishedForCourse(courseSlug: string, lessonId: string): Promise<LessonContent | null> {
        const row = await this.database.prepare(`
            SELECT lcv.lesson_id, lcv.version, lcv.body, lcv.materials_json,
                lcv.tools_json, lcv.steps_json, lcv.safety_notes
            FROM lesson_content_versions AS lcv
            INNER JOIN lessons AS l ON l.id = lcv.lesson_id
            INNER JOIN course_modules AS cm ON cm.id = l.course_module_id
            INNER JOIN courses AS c ON c.id = cm.course_id
            WHERE c.slug = ? AND c.is_published = 1 AND lcv.lesson_id = ?
                AND lcv.status = 'published' AND lcv.published_at IS NOT NULL
            ORDER BY lcv.version DESC
            LIMIT 1
        `).bind(courseSlug, lessonId).first<LessonContentRow>();

        return row ? mapContent(row) : null;
    }
}
