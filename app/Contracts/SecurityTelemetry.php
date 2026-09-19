<?php

namespace App\Contracts;

use App\Enums\SecurityEventType;
use App\Models\SecurityEvent;

interface SecurityTelemetry
{
    /** @param array<string, scalar|null> $metadata */
    public function record(
        SecurityEventType $type,
        string $severity = 'info',
        array $metadata = [],
        ?string $actorId = null,
        ?string $organizationId = null,
    ): SecurityEvent;
}
