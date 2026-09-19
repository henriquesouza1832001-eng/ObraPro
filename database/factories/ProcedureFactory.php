<?php

namespace Database\Factories;

use App\Models\Procedure;
use App\Models\Work;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Procedure>
 */
class ProcedureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'work_id' => Work::factory(),
            'slug' => fake()->unique()->slug(),
            'title' => fake()->sentence(4),
            'summary' => fake()->sentence(12),
            'stage' => 'Alvenaria',
            'version' => 1,
            'status' => 'published',
            'approved_by' => null,
            'approved_at' => null,
        ];
    }
}
