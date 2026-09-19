<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Database\Seeder;

class CourseCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            ['planejamento-da-obra', 'Planejamento da obra do zero', 'Planeje orçamento, etapas, materiais e decisões antes de começar.', 'Planejamento', 'free', null, true],
            ['fundacoes-seguras', 'Fundações: o começo certo', 'Entenda sondagem, locação, escavação e cuidados antes da concretagem.', 'Fundações', 'premium', 2990, true],
            ['estrutura-de-concreto', 'Estrutura de concreto sem mistério', 'Aprenda a acompanhar formas, armação, concretagem e cura.', 'Estrutura', 'premium', 4990, true],
            ['alvenaria-na-pratica', 'Alvenaria na prática', 'Passo a passo para levantar paredes alinhadas, niveladas e bem amarradas.', 'Alvenaria', 'premium', 2990, true],
            ['telhado-e-cobertura', 'Telhado e cobertura', 'Escolha materiais, entenda inclinação e acompanhe a montagem com segurança.', 'Cobertura', 'premium', 2990, false],
            ['instalacoes-hidraulicas', 'Instalações hidráulicas', 'Organize água, esgoto, testes e pontos sem perder a sequência da obra.', 'Hidráulica', 'premium', 3990, true],
            ['instalacoes-eletricas', 'Instalações elétricas residenciais', 'Conheça circuitos, quadro, conduítes e testes com orientação responsável.', 'Elétrica', 'premium', 3990, true],
            ['revestimentos-e-pisos', 'Revestimentos, pisos e pintura', 'Prepare superfícies e acompanhe acabamentos com menos retrabalho.', 'Acabamentos', 'premium', 2990, false],
            ['portas-janelas-e-impermeabilizacao', 'Esquadrias e impermeabilização', 'Evite infiltrações e problemas em portas, janelas, áreas molhadas e lajes.', 'Proteção', 'premium', 2990, false],
            ['seguranca-e-qualidade-no-canteiro', 'Segurança e qualidade no canteiro', 'Crie rotinas simples de EPI, conferência, evidência e não conformidade.', 'Gestão', 'free', null, true],
        ];

        foreach ($courses as [$slug, $title, $description, $category, $accessType, $priceCents, $featured]) {
            $course = Course::query()->updateOrCreate(['slug' => $slug], [
                'title' => $title, 'description' => $description, 'category' => $category,
                'level' => 'beginner', 'access_type' => $accessType, 'price_cents' => $priceCents,
                'duration_minutes' => 54, 'is_published' => true, 'is_featured' => $featured,
            ]);

            foreach ([
                ['Entenda antes de executar', 'O que observar, quais materiais separar e quais riscos evitar.'],
                ['Faça por etapas', 'Uma sequência visual e objetiva para acompanhar no ritmo da obra.'],
                ['Confira e registre', 'Checklist final para confirmar qualidade e guardar evidências.'],
            ] as $modulePosition => [$moduleTitle, $moduleDescription]) {
                $module = CourseModule::query()->updateOrCreate(
                    ['course_id' => $course->id, 'position' => $modulePosition + 1],
                    ['title' => $moduleTitle, 'description' => $moduleDescription],
                );

                foreach (['O que você precisa saber', 'Passo a passo da execução', 'Checklist de conferência'] as $lessonPosition => $lessonTitle) {
                    Lesson::query()->updateOrCreate(
                        ['course_module_id' => $module->id, 'position' => $lessonPosition + 1],
                        ['title' => $lessonTitle, 'summary' => 'Orientação curta, exemplos práticos e pontos de atenção para esta etapa.', 'duration_minutes' => 6 + $lessonPosition * 2, 'is_free' => $accessType === 'free' || $lessonPosition === 0],
                    );
                }
            }
        }
    }
}
