<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(),
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(14),
            'category' => 'Geral',
            'level' => 'beginner',
            'access_type' => 'free',
            'price_cents' => null,
            'duration_minutes' => 45,
            'is_published' => true,
            'is_featured' => false,
        ];
    }
}
