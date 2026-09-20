/**
 * Modelo tipado do catalogo publico de cursos.
 * Enquanto o D1 nao esta implementado, os dados vem de um repositorio mock
 * (ver mockCourseRepository.ts) marcado explicitamente como conteudo editorial inicial.
 * O contrato abaixo e o que uma futura implementacao em D1 (fora do escopo desta tarefa,
 * a cargo do Codex) precisa satisfazer para substituir o mock sem alterar as rotas.
 */
export interface Course {
    slug: string;
    category: string;
    title: string;
    description: string;
    accessType: 'free' | 'premium';
    priceCents: number | null;
    modulesCount: number;
    durationMinutes: number;
}

export interface CourseModule {
    title: string;
    lessons: Array<{ title: string; durationMinutes: number }>;
}

export interface CourseRepository {
    listCourses(): Promise<Course[]>;
    findCourseBySlug(slug: string): Promise<Course | null>;
    findModulesByCourseSlug(slug: string): Promise<CourseModule[]>;
}
