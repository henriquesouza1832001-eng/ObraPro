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
        Schema::create('procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug', 180);
            $table->string('title', 180);
            $table->text('summary');
            $table->string('stage', 80);
            $table->unsignedSmallInteger('version')->default(1);
            $table->string('status', 32)->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->unique(['work_id', 'slug', 'version']);
            $table->index(['work_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procedures');
    }
};
