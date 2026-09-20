import { describe, expect, it } from 'vitest';
import type { Course } from '../data/course';
import { renderCourseCatalog } from './courses';

function course(index: number, category = 'Instalacoes'): Course {
    return {
        slug: `treinamento-${index}`,
        category,
        title: `Treinamento ${index}`,
        description: 'Guia de estudo por etapas.',
        accessType: 'free',
        priceCents: null,
        modulesCount: 1,
        durationMinutes: 60,
        instructionModule: null,
    };
}

describe('catalogo publico escalavel', () => {
    it('descobre categorias reais e limita a primeira pagina com mostrar mais', () => {
        const html = renderCourseCatalog([...Array.from({ length: 30 }, (_, index) => course(index)), course(31, 'Pintura')]);

        expect(html).toContain('Instalacoes');
        expect(html).toContain('Pintura');
        expect(html).toContain('id="load-more-courses"');
        expect(html.match(/class="card" data-course-card/g)).toHaveLength(31);
        expect(html).toContain('Buscar curso ou etapa');
    });

    it('escapa campos editoriais antes de renderizar HTML', () => {
        const malicious = course(1);
        malicious.title = '<img src=x onerror=alert(1)>';
        malicious.description = '<script>alert(1)</script>';

        const html = renderCourseCatalog([malicious]);

        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
});
