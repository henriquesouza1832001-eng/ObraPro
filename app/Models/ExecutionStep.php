<?php

namespace App\Models;

use Database\Factories\ExecutionStepFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['procedure_step_id', 'status', 'note', 'completed_at'])]
class ExecutionStep extends Model
{
    /** @use HasFactory<ExecutionStepFactory> */
    use HasFactory;

    /** @return BelongsTo<Execution, $this> */
    public function execution(): BelongsTo
    {
        return $this->belongsTo(Execution::class);
    }

    /** @return BelongsTo<ProcedureStep, $this> */
    public function procedureStep(): BelongsTo
    {
        return $this->belongsTo(ProcedureStep::class);
    }

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }
}
