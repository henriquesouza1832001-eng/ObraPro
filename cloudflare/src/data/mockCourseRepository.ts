import type { Course, CourseModule, CourseRepository } from './course';

/**
 * Conteudo editorial inicial de demonstracao (nao e catalogo comercial final).
 * Espelha o catalogo ja publicado nas paginas estaticas de cloudflare/public,
 * apenas tornando os dados tipados e consultaveis por uma unica fonte.
 * Substituir por um repositorio D1 quando o schema estiver disponivel.
 */
const courses: Course[] = [
    { slug: 'planejamento-da-obra', category: 'Planejamento', title: 'Planejamento da obra do zero', description: 'Planeje orçamento, etapas, materiais e decisões antes de começar.', accessType: 'free', priceCents: null, modulesCount: 3, durationMinutes: 54 },
    { slug: 'fundacoes-seguras', category: 'Fundações', title: 'Fundações: o começo certo', description: 'Entenda sondagem, locação, escavação e cuidados antes da concretagem.', accessType: 'premium', priceCents: 2990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'estrutura-de-concreto', category: 'Estrutura', title: 'Estrutura de concreto sem mistério', description: 'Aprenda a acompanhar formas, armação, concretagem e cura.', accessType: 'premium', priceCents: 4990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'alvenaria-na-pratica', category: 'Alvenaria', title: 'Alvenaria na prática', description: 'Levante paredes alinhadas, niveladas e bem amarradas.', accessType: 'premium', priceCents: 2990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'telhado-e-cobertura', category: 'Cobertura', title: 'Telhado e cobertura', description: 'Escolha materiais e acompanhe a montagem com segurança.', accessType: 'premium', priceCents: 2990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'instalacoes-hidraulicas', category: 'Hidráulica', title: 'Instalações hidráulicas', description: 'Organize água, esgoto, testes e pontos da obra.', accessType: 'premium', priceCents: 3990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'instalacoes-eletricas', category: 'Elétrica', title: 'Instalações elétricas residenciais', description: 'Conheça circuitos, quadro, conduítes e testes.', accessType: 'premium', priceCents: 3990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'revestimentos-e-pisos', category: 'Acabamentos', title: 'Revestimentos, pisos e pintura', description: 'Prepare superfícies e acompanhe acabamentos.', accessType: 'premium', priceCents: 2990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'portas-janelas-e-impermeabilizacao', category: 'Proteção', title: 'Esquadrias e impermeabilização', description: 'Evite infiltrações em portas, janelas e áreas molhadas.', accessType: 'premium', priceCents: 2990, modulesCount: 3, durationMinutes: 54 },
    { slug: 'seguranca-e-qualidade-no-canteiro', category: 'Gestão', title: 'Segurança e qualidade no canteiro', description: 'Crie rotinas simples de EPI, conferência e evidências.', accessType: 'free', priceCents: null, modulesCount: 3, durationMinutes: 54 },
];

const moduleTitles = ['Entenda antes de executar', 'Faça por etapas', 'Confira e registre'];
const lessonTitles: Array<{ title: string; durationMinutes: number }> = [
    { title: 'O que você precisa saber', durationMinutes: 6 },
    { title: 'Passo a passo da execução', durationMinutes: 8 },
    { title: 'Checklist de conferência', durationMinutes: 10 },
];

export function courseModules(): CourseModule[] {
    return moduleTitles.map((title) => ({ title, lessons: lessonTitles }));
}

export class MockCourseRepository implements CourseRepository {
    async listCourses(): Promise<Course[]> {
        return courses;
    }

    async findCourseBySlug(slug: string): Promise<Course | null> {
        return courses.find((course) => course.slug === slug) ?? null;
    }
}
