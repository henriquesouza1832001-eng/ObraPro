<?php

namespace Tests\Feature;

use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\Evidence;
use App\Models\Execution;
use App\Models\ExecutionStep;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\Procedure;
use App\Models\ProcedureStep;
use App\Models\User;
use App\Models\Work;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkProcedureTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_user_cannot_access_works(): void
    {
        $this->get('/painel/obras')->assertRedirect('/entrar');
    }

    public function test_member_sees_only_works_from_their_organization(): void
    {
        [$user, $work] = $this->workForMember();
        $otherWork = Work::factory()->create();

        $this->actingAs($user)->get('/painel/obras')->assertOk()->assertSee($work->name)->assertDontSee($otherWork->name);
    }

    public function test_member_can_open_procedure_steps_and_checklist(): void
    {
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create(['title' => 'Alvenaria de vedação']);
        ProcedureStep::factory()->for($procedure)->create(['title' => 'Conferir o nível']);
        $checklist = Checklist::factory()->for($procedure)->create();
        ChecklistItem::factory()->for($checklist)->create(['label' => 'Blocos alinhados']);

        $this->actingAs($user)->get('/painel/obras/'.$work->id)
            ->assertOk()
            ->assertSee('Alvenaria de vedação')
            ->assertSee('Conferir o nível')
            ->assertSee('Blocos alinhados');
    }

    public function test_organization_admin_can_publish_procedure_with_steps(): void
    {
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create(['status' => 'in_review']);
        ProcedureStep::factory()->for($procedure)->create();

        $this->actingAs($user)->patch(route('procedures.status.update', $procedure), ['status' => 'published'])->assertRedirect();

        $this->assertDatabaseHas('procedures', ['id' => $procedure->id, 'status' => 'published', 'approved_by' => $user->id]);
    }

    public function test_procedure_without_steps_cannot_be_published(): void
    {
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create(['status' => 'in_review']);

        $this->actingAs($user)->patch(route('procedures.status.update', $procedure), ['status' => 'published'])->assertStatus(422);
    }

    public function test_member_cannot_open_another_organizations_work(): void
    {
        [$user] = $this->workForMember();
        $otherWork = Work::factory()->create();

        $this->actingAs($user)->get('/painel/obras/'.$otherWork->id)->assertNotFound();
    }

    public function test_member_can_start_and_complete_a_procedure_execution(): void
    {
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create();
        $steps = ProcedureStep::factory()->count(2)->for($procedure)->sequence(
            ['position' => 1],
            ['position' => 2],
        )->create();

        $response = $this->actingAs($user)->post(route('executions.store', [$work, $procedure]));
        $response->assertRedirect(route('works.show', $work));
        $execution = Execution::query()->firstOrFail();

        $this->assertDatabaseHas('executions', ['id' => $execution->id, 'status' => 'in_progress']);
        $this->assertCount(2, $execution->steps);

        foreach ($steps as $step) {
            $executionStep = ExecutionStep::query()
                ->where('execution_id', $execution->id)
                ->where('procedure_step_id', $step->id)
                ->firstOrFail();

            $this->actingAs($user)->patch(route('execution-steps.update', [$execution, $executionStep]), [
                'status' => 'completed',
                'note' => 'Conferido no canteiro.',
            ])->assertRedirect();
        }

        $this->assertDatabaseHas('executions', ['id' => $execution->id, 'status' => 'completed']);
    }

    public function test_member_can_attach_private_evidence_to_an_execution_step(): void
    {
        Storage::fake('local');
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create();
        $step = ProcedureStep::factory()->for($procedure)->create();
        $execution = Execution::factory()->for($work)->for($procedure)->for($user, 'starter')->create();
        $executionStep = ExecutionStep::factory()->for($execution)->for($step, 'procedureStep')->create();
        $file = UploadedFile::fake()->create('nivel.jpg', 100, 'image/jpeg');

        $this->actingAs($user)->post(route('evidence.store', $executionStep), [
            'file' => $file,
            'note' => 'Nivel conferido.',
        ])->assertRedirect();

        $evidence = Evidence::query()->firstOrFail();
        $this->assertSame('image/jpeg', $evidence->mime_type);
        Storage::disk('local')->assertExists($evidence->storage_key);

        $this->actingAs($user)->get(route('evidence.download', $evidence))
            ->assertOk()
            ->assertHeader('Content-Disposition', 'attachment; filename=nivel.jpg');
    }

    public function test_organization_admin_can_reopen_completed_execution(): void
    {
        [$user, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create();
        $execution = Execution::factory()->for($work)->for($procedure)->create(['status' => 'completed', 'completed_at' => now()]);

        $this->actingAs($user)->patch(route('executions.reopen', $execution))->assertRedirect();

        $this->assertDatabaseHas('executions', ['id' => $execution->id, 'status' => 'in_progress', 'completed_at' => null]);
    }

    public function test_member_cannot_download_evidence_from_another_organization(): void
    {
        Storage::fake('local');
        [, $work] = $this->workForMember();
        $procedure = Procedure::factory()->for($work)->create();
        $step = ProcedureStep::factory()->for($procedure)->create();
        $execution = Execution::factory()->for($work)->for($procedure)->create();
        $executionStep = ExecutionStep::factory()->for($execution)->for($step, 'procedureStep')->create();
        $evidence = Evidence::factory()->for($executionStep)->create();
        Storage::disk('local')->put($evidence->storage_key, 'private');
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)->get(route('evidence.download', $evidence))->assertNotFound();
    }

    /** @return array{User, Work} */
    private function workForMember(): array
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create();
        OrganizationMembership::factory()->for($organization)->for($user)->admin()->create();
        $work = Work::factory()->for($organization)->create();

        return [$user, $work];
    }
}
