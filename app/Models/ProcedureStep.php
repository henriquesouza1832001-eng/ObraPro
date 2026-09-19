<?php

namespace App\Models;

use Database\Factories\ProcedureStepFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['position', 'title', 'instruction', 'safety_note', 'when_to_call_professional', 'materials'])]
class ProcedureStep extends Model
{
    /** @use HasFactory<ProcedureStepFactory> */
    use HasFactory;

    /** @return BelongsTo<Procedure, $this> */
    public function procedure(): BelongsTo
    {
        return $this->belongsTo(Procedure::class);
    }

    protected function casts(): array
    {
        return ['materials' => 'array', 'position' => 'integer'];
    }
}
