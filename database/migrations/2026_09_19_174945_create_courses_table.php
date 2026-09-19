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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 180)->unique();
            $table->string('title', 180);
            $table->text('description');
            $table->string('category', 80);
            $table->string('level', 32)->default('beginner');
            $table->string('access_type', 32)->default('free');
            $table->unsignedInteger('price_cents')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->index(['is_published', 'is_featured']);
            $table->index(['category', 'is_published']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
