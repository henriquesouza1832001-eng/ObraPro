<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DeliverSecurityEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 120, 300];

    public function __construct(public readonly string $securityEventId) {}

    public function handle(): void
    {
        if (! config('services.mgl.enabled')) {
            return;
        }

        // A remote adapter is intentionally absent until the official MGL contract exists.
    }
}
