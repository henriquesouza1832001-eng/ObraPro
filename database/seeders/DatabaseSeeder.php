<?php

namespace Database\Seeders;

use App\Enums\MembershipRole;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\Procedure;
use App\Models\ProcedureStep;
use App\Models\User;
use App\Models\Work;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CourseCatalogSeeder::class);

        $organization = Organization::factory()->create([
            'name' => 'Obra Residencial das Flores',
            'slug' => 'residencial-das-flores',
        ]);

        $admin = User::factory()->create([
            'name' => 'Administrador de Demonstracao',
            'email' => 'admin@example.com',
        ]);

        OrganizationMembership::factory()->for($organization)->for($admin)->create([
            'role' => MembershipRole::Admin,
        ]);

        $work = Work::query()->updateOrCreate(['organization_id' => $organization->id, 'slug' => 'residencial-das-flores'], [
            'name' => 'Residencial das Flores', 'status' => 'active', 'city' => 'Belo Horizonte', 'state' => 'MG',
        ]);
        $procedure = Procedure::query()->updateOrCreate(['work_id' => $work->id, 'slug' => 'alvenaria-primeira-fiada', 'version' => 1], [
            'title' => 'Execução da primeira fiada', 'summary' => 'Confira materiais, alinhamento e segurança antes de avançar.', 'stage' => 'Alvenaria', 'status' => 'published', 'approved_by' => $admin->id, 'approved_at' => now(),
        ]);

        foreach ([
            ['title' => 'Preparar a frente de trabalho', 'instruction' => 'Confira o projeto, limpe a base e separe blocos, argamassa, nível e trena.', 'materials' => ['Blocos', 'Argamassa', 'Nível', 'Trena']],
            ['title' => 'Assentar e alinhar os blocos', 'instruction' => 'Aplique a argamassa, assente os blocos e confira nível, prumo e alinhamento.', 'materials' => ['Colher de pedreiro', 'Linha', 'Nível']],
            ['title' => 'Conferir antes de continuar', 'instruction' => 'Registre a conferência e corrija desvios antes de iniciar a próxima fiada.', 'materials' => ['Checklist', 'Câmera']],
        ] as $position => $step) {
            ProcedureStep::query()->updateOrCreate(['procedure_id' => $procedure->id, 'position' => $position + 1], $step + ['safety_note' => 'Use os EPIs indicados e pare se houver risco ou dúvida estrutural.', 'when_to_call_professional' => 'Chame o responsável técnico em caso de divergência do projeto.']);
        }

        $checklist = Checklist::query()->updateOrCreate(['procedure_id' => $procedure->id, 'title' => 'Checklist da primeira fiada'], ['status' => 'published']);
        foreach (['Argamassa no traço indicado', 'Blocos alinhados e nivelados', 'Prumo conferido', 'Área segura e limpa'] as $position => $label) {
            ChecklistItem::query()->updateOrCreate(['checklist_id' => $checklist->id, 'position' => $position + 1], ['label' => $label, 'what_good_looks_like' => 'Conferência registrada antes de liberar a próxima etapa.', 'common_error' => 'Avançar sem corrigir o desvio.']);
        }
    }
}
