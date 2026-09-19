<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('type', 64)->index();
            $table->string('severity', 16)->index();
            $table->uuid('correlation_id')->nullable()->index();
            $table->string('actor_id', 64)->nullable()->index();
            $table->string('organization_id', 64)->nullable()->index();
            $table->json('metadata');
            $table->timestamp('occurred_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
