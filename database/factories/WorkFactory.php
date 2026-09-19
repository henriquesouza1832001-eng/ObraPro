<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Work;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Work>
 */
class WorkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => $this->faker->sentence(3),
            'slug' => $this->faker->unique()->slug(),
            'status' => 'planning',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
            'planned_start_at' => now()->toDateString(),
            'planned_end_at' => now()->addMonths(8)->toDateString(),
        ];
    }
}
