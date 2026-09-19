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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_module_id')->constrained()->cascadeOnDelete();
            $table->string('title', 180);
            $table->text('summary');
            $table->unsignedSmallInteger('duration_minutes')->default(8);
            $table->boolean('is_free')->default(false);
            $table->unsignedSmallInteger('position')->default(1);
            $table->timestamps();
            $table->unique(['course_module_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
