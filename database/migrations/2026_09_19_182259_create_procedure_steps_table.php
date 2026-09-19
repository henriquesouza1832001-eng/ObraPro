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
        Schema::create('procedure_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procedure_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');
            $table->string('title', 180);
            $table->text('instruction');
            $table->text('safety_note')->nullable();
            $table->text('when_to_call_professional')->nullable();
            $table->json('materials')->nullable();
            $table->timestamps();
            $table->unique(['procedure_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procedure_steps');
    }
};
