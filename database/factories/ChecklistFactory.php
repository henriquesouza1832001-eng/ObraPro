<?php

namespace Database\Factories;

use App\Models\Checklist;
use App\Models\Procedure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Checklist>
 */
class ChecklistFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'procedure_id' => Procedure::factory(),
            'title' => 'Checklist de conferência',
            'status' => 'published',
        ];
    }
}
