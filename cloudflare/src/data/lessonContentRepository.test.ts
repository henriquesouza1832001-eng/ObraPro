import { describe, expect, it } from 'vitest';
import { D1LessonContentRepository } from './lessonContentRepository';

describe('D1LessonContentRepository', () => {
    it('returns only published content attached to the requested published course', async () => {
        const database = {
            prepare: (sql: string) => ({
                bind: (...args: unknown[]) => ({
                    first: async <T>() => {
                        expect(sql).toContain("c.is_published = 1");
                        expect(sql).toContain("lcv.status = 'published'");
                        expect(args).toEqual(['curso-teste', 'lesson-1']);

                        return {
                            lesson_id: 'lesson-1',
                            version: 2,
                            body: 'Conteudo revisado.',
                            materials_json: '["Argamassa"]',
                            tools_json: '["Colher"]',
                            steps_json: '["Conferir o nivel"]',
                            safety_notes: 'Use EPI.',
                        } as T;
                    },
                }),
            }),
        } as unknown as D1Database;

        await expect(new D1LessonContentRepository(database).findPublishedForCourse('curso-teste', 'lesson-1')).resolves.toEqual({
            lessonId: 'lesson-1',
            version: 2,
            body: 'Conteudo revisado.',
            materials: ['Argamassa'],
            tools: ['Colher'],
            steps: ['Conferir o nivel'],
            safetyNotes: 'Use EPI.',
        });
    });

    it('creates the next lesson content version as a draft', async () => {
        const calls: Array<{ sql: string; args: unknown[] }> = [];
        const database = {
            prepare: (sql: string) => {
                const statement = {
                    bind: (...args: unknown[]) => ({
                        first: async <T>() => {
                            if (sql.includes('SELECT id FROM lessons')) {
                                return { id: 'lesson-1' } as T;
                            }

                            return { latest_version: 2 } as T;
                        },
                        run: async () => {
                            calls.push({ sql, args });

                            return { success: true, meta: {} as D1Meta & Record<string, unknown> };
                        },
                    }),
                };

                return statement;
            },
        } as unknown as D1Database;

        await expect(new D1LessonContentRepository(database).createDraft({
            id: 'version-3', lessonId: 'lesson-1', body: 'Texto', materials: ['Argamassa'], tools: ['Colher'], steps: ['Conferir'], safetyNotes: 'EPI', createdAt: '2026-09-20T00:00:00Z',
        })).resolves.toMatchObject({ id: 'version-3', lessonId: 'lesson-1', version: 3, status: 'draft' });
        expect(calls).toHaveLength(1);
        expect(calls[0]?.args[2]).toBe(3);
        expect(calls[0]?.args[4]).toBe('["Argamassa"]');
    });

    it('publishes a version and returns its new public state', async () => {
        const database = {
            prepare: (sql: string) => ({
                bind: (...args: unknown[]) => ({
                    first: async <T>() => ({
                        id: 'version-2', lesson_id: args[0], version: 2, body: 'Revisado', materials_json: '[]', tools_json: '[]', steps_json: '[]', safety_notes: '', status: 'draft', published_at: null, created_at: '2026-09-20T00:00:00Z', updated_at: '2026-09-20T00:00:00Z',
                    } as T),
                    run: async () => ({ success: true, meta: {} as D1Meta & Record<string, unknown> }),
                }),
            }),
            batch: async () => [],
        } as unknown as D1Database;

        await expect(new D1LessonContentRepository(database).setPublication('lesson-1', 2, true, '2026-09-20T01:00:00Z')).resolves.toMatchObject({
            id: 'version-2', lessonId: 'lesson-1', version: 2, status: 'published', publishedAt: '2026-09-20T01:00:00Z',
        });
    });
});
