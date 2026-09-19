<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_events', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('action', 100)->index();
            $table->string('actor_id', 64)->nullable()->index();
            $table->string('organization_id', 64)->nullable()->index();
            $table->string('subject_type', 100)->nullable();
            $table->string('subject_id', 64)->nullable();
            $table->string('result', 32);
            $table->uuid('correlation_id')->nullable()->index();
            $table->json('metadata');
            $table->timestamp('occurred_at')->index();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
    }
};
