export interface AdminCatalogModule {
    id: string;
    slug: string;
    title: string;
    description: string;
    position: number;
    published: boolean;
    courses: AdminCatalogCourse[];
}

export interface AdminCatalogCourse {
    id: string;
    slug: string;
    title: string;
    category: string;
    accessType: 'free' | 'premium';
    durationMinutes: number;
    published: boolean;
    lessonsCount: number;
}

export interface AdminAuditEvent {
    id: string;
    actorUserId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

interface CatalogRow {
    module_id: string;
    module_slug: string;
    module_title: string;
    module_description: string;
    module_position: number;
    module_published: number;
    course_id: string | null;
    course_slug: string | null;
    course_title: string | null;
    course_category: string | null;
    course_access_type: 'free' | 'premium' | null;
    course_duration_minutes: number | null;
    course_published: number | null;
    lessons_count: number | null;
}

interface AuditRow {
    id: string;
    actor_user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    metadata_json: string;
    created_at: string;
}

function metadata(value: string): Record<string, unknown> {
    try {
        const parsed: unknown = JSON.parse(value);

        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

export class D1AdminRepository {
    public constructor(private readonly database: D1Database) { }

    public async listCatalog(): Promise<AdminCatalogModule[]> {
        const result = await this.database.prepare(`
            SELECT im.id AS module_id, im.slug AS module_slug, im.title AS module_title,
                im.description AS module_description, im.position AS module_position,
                im.is_published AS module_published, c.id AS course_id, c.slug AS course_slug,
                c.title AS course_title, c.category AS course_category,
                c.access_type AS course_access_type, c.duration_minutes AS course_duration_minutes,
                c.is_published AS course_published, COUNT(l.id) AS lessons_count
            FROM instruction_modules AS im
            LEFT JOIN courses AS c ON c.instruction_module_id = im.id
            LEFT JOIN course_modules AS cm ON cm.course_id = c.id
            LEFT JOIN lessons AS l ON l.course_module_id = cm.id
            GROUP BY im.id, c.id
            ORDER BY im.position ASC, c.title ASC
        `).all<CatalogRow>();

        const modules = new Map<string, AdminCatalogModule>();
        for (const row of result.results) {
            const module = modules.get(row.module_id) ?? {
                id: row.module_id,
                slug: row.module_slug,
                title: row.module_title,
                description: row.module_description,
                position: row.module_position,
                published: row.module_published === 1,
                courses: [],
            };

            if (row.course_id && row.course_slug && row.course_title && row.course_category && row.course_access_type) {
                module.courses.push({
                    id: row.course_id,
                    slug: row.course_slug,
                    title: row.course_title,
                    category: row.course_category,
                    accessType: row.course_access_type,
                    durationMinutes: row.course_duration_minutes ?? 0,
                    published: row.course_published === 1,
                    lessonsCount: row.lessons_count ?? 0,
                });
            }

            modules.set(row.module_id, module);
        }

        return [...modules.values()];
    }

    public async listAuditEvents(limit = 50): Promise<AdminAuditEvent[]> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const result = await this.database.prepare(`
            SELECT id, actor_user_id, action, resource_type, resource_id, metadata_json, created_at
            FROM admin_audit_events
            ORDER BY created_at DESC
            LIMIT ?
        `).bind(safeLimit).all<AuditRow>();

        return result.results.map((row) => ({
            id: row.id,
            actorUserId: row.actor_user_id,
            action: row.action,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            metadata: metadata(row.metadata_json),
            createdAt: row.created_at,
        }));
    }

    public async recordAuditEvent(input: Omit<AdminAuditEvent, 'metadata'> & { metadata?: Record<string, unknown> }): Promise<void> {
        await this.database.prepare(`
            INSERT INTO admin_audit_events
                (id, actor_user_id, action, resource_type, resource_id, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            input.id,
            input.actorUserId,
            input.action,
            input.resourceType,
            input.resourceId,
            JSON.stringify(input.metadata ?? {}),
            input.createdAt,
        ).run();
    }
}
