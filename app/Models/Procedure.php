<?php

namespace App\Models;

use Database\Factories\ProcedureFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'title', 'summary', 'stage', 'version', 'status', 'approved_by', 'approved_at'])]
class Procedure extends Model
{
    /** @use HasFactory<ProcedureFactory> */
    use HasFactory;

    /** @return BelongsTo<Work, $this> */
    public function work(): BelongsTo
    {
        return $this->belongsTo(Work::class);
    }

    /** @return HasMany<ProcedureStep, $this> */
    public function steps(): HasMany
    {
        return $this->hasMany(ProcedureStep::class)->orderBy('position');
    }

    /** @return HasMany<Checklist, $this> */
    public function checklists(): HasMany
    {
        return $this->hasMany(Checklist::class);
    }

    protected function casts(): array
    {
        return ['approved_at' => 'datetime', 'version' => 'integer'];
    }
}
