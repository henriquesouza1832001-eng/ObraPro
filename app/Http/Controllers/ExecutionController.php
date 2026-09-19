<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartExecutionRequest;
use App\Http\Requests\UpdateExecutionStepRequest;
use App\Models\Execution;
use App\Models\ExecutionStep;
use App\Models\Procedure;
use App\Models\Work;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ExecutionController extends Controller
{
    public function store(StartExecutionRequest $request, Work $work, Procedure $procedure): RedirectResponse
    {
        abort_unless($procedure->work_id === $work->id, 404);

        $execution = DB::transaction(function () use ($request, $work, $procedure): Execution {
            $procedure->load('steps');
            $execution = $work->executions()->create([
                'procedure_id' => $procedure->id,
                'started_by' => $request->user()->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            $execution->steps()->createMany($procedure->steps->map(fn ($step): array => [
                'procedure_step_id' => $step->id,
                'status' => 'pending',
            ])->all());

            return $execution;
        });

        return to_route('works.show', $work)->with('status', "Execucao #{$execution->id} iniciada.");
    }

    public function updateStep(UpdateExecutionStepRequest $request, Execution $execution, ExecutionStep $executionStep): RedirectResponse
    {
        abort_unless($executionStep->execution_id === $execution->id, 404);

        $isCompleted = $request->string('status')->value() === 'completed';
        $executionStep->update([
            'status' => $isCompleted ? 'completed' : 'pending',
            'note' => $request->validated('note'),
            'completed_at' => $isCompleted ? now() : null,
        ]);

        if ($isCompleted && $execution->steps()->where('status', '!=', 'completed')->doesntExist()) {
            $execution->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return back()->with('status', 'Etapa atualizada.');
    }

    public function reopen(Execution $execution): RedirectResponse
    {
        abort_unless(auth()->user()?->canManageOrganization($execution->work->organization), 403);
        abort_unless($execution->status === 'completed', 422);

        $execution->update(['status' => 'in_progress', 'completed_at' => null]);

        return back()->with('status', 'Execucao reaberta para conferencia.');
    }
}
