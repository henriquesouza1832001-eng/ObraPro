<?php

namespace App\Models;

use Database\Factories\EvidenceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['execution_step_id', 'uploaded_by', 'storage_key', 'original_name', 'mime_type', 'size_bytes', 'checksum', 'note', 'status'])]
class Evidence extends Model
{
    /** @use HasFactory<EvidenceFactory> */
    use HasFactory;

    /** @return BelongsTo<ExecutionStep, $this> */
    public function executionStep(): BelongsTo
    {
        return $this->belongsTo(ExecutionStep::class);
    }

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected function casts(): array
    {
        return ['size_bytes' => 'integer'];
    }
}
