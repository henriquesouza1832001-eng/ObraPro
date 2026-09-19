<?php

namespace App\Services;

use App\Contracts\SecurityTelemetry;
use App\Enums\SecurityEventType;
use App\Jobs\DeliverSecurityEvent;
use App\Models\SecurityEvent;
use Illuminate\Support\Arr;
use InvalidArgumentException;

class DatabaseSecurityTelemetry implements SecurityTelemetry
{
    private const ALLOWED_METADATA = [
        'route',
        'method',
        'reason',
        'result',
        'resource_type',
        'resource_id',
    ];

    public function record(
        SecurityEventType $type,
        string $severity = 'info',
        array $metadata = [],
        ?string $actorId = null,
        ?string $organizationId = null,
    ): SecurityEvent {
        if (! in_array($severity, ['debug', 'info', 'notice', 'warning', 'error', 'critical'], true)) {
            throw new InvalidArgumentException('Invalid security event severity.');
        }

        $event = SecurityEvent::query()->create([
            'type' => $type->value,
            'severity' => $severity,
            'correlation_id' => app()->bound('correlation_id') ? app('correlation_id') : null,
            'actor_id' => $actorId,
            'organization_id' => $organizationId,
            'metadata' => Arr::only($metadata, self::ALLOWED_METADATA),
            'occurred_at' => now(),
        ]);

        DeliverSecurityEvent::dispatch($event->id)->afterCommit();

        return $event;
    }
}
