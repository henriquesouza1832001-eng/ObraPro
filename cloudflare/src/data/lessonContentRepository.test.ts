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
});
