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
        Schema::create('checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procedure_id')->constrained()->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('status', 32)->default('draft');
            $table->timestamps();
            $table->index(['procedure_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklists');
    }
};
