<?php

namespace Database\Factories;

use App\Models\Evidence;
use App\Models\ExecutionStep;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evidence>
 */
class EvidenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'execution_step_id' => ExecutionStep::factory(),
            'uploaded_by' => User::factory(),
            'storage_key' => 'evidence/'.$this->faker->uuid.'.jpg',
            'original_name' => 'evidencia.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'checksum' => hash('sha256', $this->faker->uuid),
            'note' => $this->faker->sentence(),
            'status' => 'available',
        ];
    }
}
