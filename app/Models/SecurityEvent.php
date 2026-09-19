<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class SecurityEvent extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $fillable = [
        'type',
        'severity',
        'correlation_id',
        'actor_id',
        'organization_id',
        'metadata',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'occurred_at' => 'immutable_datetime',
        ];
    }
}
