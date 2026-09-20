export interface LessonContent {
    lessonId: string;
    version: number;
    body: string;
    materials: string[];
    tools: string[];
    steps: string[];
    safetyNotes: string;
}

export type LessonContentStatus = 'draft' | 'published' | 'archived';

export interface LessonContentVersion extends LessonContent {
    id: string;
    status: LessonContentStatus;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface LessonContentRow {
    id?: string;
    lesson_id: string;
    version: number;
    body: string;
    materials_json: string;
    tools_json: string;
    steps_json: string;
    safety_notes: string;
    status?: LessonContentStatus;
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
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

function mapVersion(row: LessonContentRow): LessonContentVersion {
    return {
        ...mapContent(row),
        id: row.id ?? '',
        status: row.status ?? 'draft',
        publishedAt: row.published_at ?? null,
        createdAt: row.created_at ?? '',
        updatedAt: row.updated_at ?? '',
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

    public async listVersions(lessonId: string): Promise<LessonContentVersion[]> {
        const result = await this.database.prepare(`
            SELECT id, lesson_id, version, body, materials_json, tools_json, steps_json,
                safety_notes, status, published_at, created_at, updated_at
            FROM lesson_content_versions
            WHERE lesson_id = ?
            ORDER BY version DESC
        `).bind(lessonId).all<LessonContentRow>();

        return result.results.map(mapVersion);
    }

    public async createDraft(input: {
        id: string;
        lessonId: string;
        body: string;
        materials: string[];
        tools: string[];
        steps: string[];
        safetyNotes: string;
        createdAt: string;
    }): Promise<LessonContentVersion | null> {
        const lesson = await this.database.prepare('SELECT id FROM lessons WHERE id = ? LIMIT 1').bind(input.lessonId).first<{ id: string }>();

        if (!lesson) {
            return null;
        }

        const latest = await this.database.prepare(`
            SELECT COALESCE(MAX(version), 0) AS latest_version
            FROM lesson_content_versions
            WHERE lesson_id = ?
        `).bind(input.lessonId).first<{ latest_version: number }>();
        const version = (latest?.latest_version ?? 0) + 1;

        await this.database.prepare(`
            INSERT INTO lesson_content_versions
                (id, lesson_id, version, body, materials_json, tools_json, steps_json,
                 safety_notes, status, published_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?)
        `).bind(
            input.id,
            input.lessonId,
            version,
            input.body,
            JSON.stringify(input.materials),
            JSON.stringify(input.tools),
            JSON.stringify(input.steps),
            input.safetyNotes,
            input.createdAt,
            input.createdAt,
        ).run();

        return {
            id: input.id,
            lessonId: input.lessonId,
            version,
            body: input.body,
            materials: input.materials,
            tools: input.tools,
            steps: input.steps,
            safetyNotes: input.safetyNotes,
            status: 'draft',
            publishedAt: null,
            createdAt: input.createdAt,
            updatedAt: input.createdAt,
        };
    }

    public async setPublication(lessonId: string, version: number, published: boolean, updatedAt: string): Promise<LessonContentVersion | null> {
        const target = await this.database.prepare(`
            SELECT id, lesson_id, version, body, materials_json, tools_json, steps_json,
                safety_notes, status, published_at, created_at, updated_at
            FROM lesson_content_versions
            WHERE lesson_id = ? AND version = ?
            LIMIT 1
        `).bind(lessonId, version).first<LessonContentRow>();

        if (!target) {
            return null;
        }

        if (published) {
            await this.database.batch([
                this.database.prepare(`
                    UPDATE lesson_content_versions
                    SET status = 'archived', published_at = NULL, updated_at = ?
                    WHERE lesson_id = ? AND status = 'published' AND version <> ?
                `).bind(updatedAt, lessonId, version),
                this.database.prepare(`
                    UPDATE lesson_content_versions
                    SET status = 'published', published_at = ?, updated_at = ?
                    WHERE lesson_id = ? AND version = ?
                `).bind(updatedAt, updatedAt, lessonId, version),
            ]);
        } else {
            await this.database.prepare(`
                UPDATE lesson_content_versions
                SET status = 'archived', published_at = NULL, updated_at = ?
                WHERE lesson_id = ? AND version = ?
            `).bind(updatedAt, lessonId, version).run();
        }

        return {
            ...mapVersion(target),
            status: published ? 'published' : 'archived',
            publishedAt: published ? updatedAt : null,
            updatedAt,
        };
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
