<?php

namespace App\Models;

use Database\Factories\WorkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'status', 'city', 'state', 'planned_start_at', 'planned_end_at'])]
class Work extends Model
{
    /** @use HasFactory<WorkFactory> */
    use HasFactory;

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return HasMany<Procedure, $this> */
    public function procedures(): HasMany
    {
        return $this->hasMany(Procedure::class);
    }

    /** @return HasMany<Execution, $this> */
    public function executions(): HasMany
    {
        return $this->hasMany(Execution::class);
    }

    protected function casts(): array
    {
        return ['planned_start_at' => 'date', 'planned_end_at' => 'date'];
    }
}
