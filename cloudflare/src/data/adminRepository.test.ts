import { describe, expect, it } from 'vitest';
import { D1AdminRepository } from './adminRepository';

describe('D1AdminRepository', () => {
    it('groups catalog courses under instruction modules', async () => {
        const database = {
            prepare: (sql: string) => ({
                all: async <T>() => ({
                    results: [
                        { module_id: 'module-20', module_slug: 'modulo-20', module_title: 'Modulo 20', module_description: 'Base', module_position: 1, module_published: 0, course_id: 'course-1', course_slug: 'curso-1', course_title: 'Curso 1', course_category: 'Fundacoes', course_access_type: 'free', course_duration_minutes: 60, course_published: 0, lessons_count: 4, lesson_id: 'lesson-1', lesson_title: 'Preparar a area', lesson_module_title: 'Fundamentos', lesson_position: 1, lesson_duration_minutes: 15 },
                        { module_id: 'module-20', module_slug: 'modulo-20', module_title: 'Modulo 20', module_description: 'Base', module_position: 1, module_published: 0, course_id: 'course-1', course_slug: 'curso-1', course_title: 'Curso 1', course_category: 'Fundacoes', course_access_type: 'free', course_duration_minutes: 60, course_published: 0, lessons_count: 4, lesson_id: 'lesson-2', lesson_title: 'Conferir medidas', lesson_module_title: 'Fundamentos', lesson_position: 2, lesson_duration_minutes: 15 },
                    ] as T[],
                    success: true,
                    meta: {} as D1Meta & Record<string, unknown>,
                }),
            }),
        } as unknown as D1Database;

        await expect(new D1AdminRepository(database).listCatalog()).resolves.toEqual([{
            id: 'module-20',
            slug: 'modulo-20',
            title: 'Modulo 20',
            description: 'Base',
            position: 1,
            published: false,
            courses: [{
                id: 'course-1',
                slug: 'curso-1',
                title: 'Curso 1',
                category: 'Fundacoes',
                accessType: 'free',
                durationMinutes: 60,
                published: false,
                lessonsCount: 4,
                lessons: [
                    { id: 'lesson-1', title: 'Preparar a area', moduleTitle: 'Fundamentos', position: 1, durationMinutes: 15 },
                    { id: 'lesson-2', title: 'Conferir medidas', moduleTitle: 'Fundamentos', position: 2, durationMinutes: 15 },
                ],
            }],
        }]);
    });

    it('clamps audit event limit and parses metadata', async () => {
        const database = {
            prepare: (sql: string) => ({
                bind: (limit: number) => ({
                    all: async <T>() => {
                        expect(limit).toBe(100);

                        return { results: [{ id: 'event-1', actor_user_id: 'user-1', action: 'publish', resource_type: 'course', resource_id: 'course-1', metadata_json: '{"published":true}', created_at: '2026-09-20T00:00:00Z' }] as T[], success: true, meta: {} as D1Meta & Record<string, unknown> };
                    },
                }),
            }),
        } as unknown as D1Database;

        await expect(new D1AdminRepository(database).listAuditEvents(999)).resolves.toEqual([{
            id: 'event-1', actorUserId: 'user-1', action: 'publish', resourceType: 'course', resourceId: 'course-1', metadata: { published: true }, createdAt: '2026-09-20T00:00:00Z',
        }]);
    });
});
