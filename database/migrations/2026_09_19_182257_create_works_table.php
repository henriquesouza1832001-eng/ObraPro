<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('works', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 180);
            $table->string('slug', 180);
            $table->string('status', 32)->default('planning');
            $table->string('city', 120)->nullable();
            $table->string('state', 2)->nullable();
            $table->date('planned_start_at')->nullable();
            $table->date('planned_end_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'slug']);
            $table->index(['organization_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('works');
    }
};
