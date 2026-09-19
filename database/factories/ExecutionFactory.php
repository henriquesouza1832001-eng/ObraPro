<?php

namespace Database\Factories;

use App\Models\Execution;
use App\Models\Procedure;
use App\Models\User;
use App\Models\Work;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Execution>
 */
class ExecutionFactory extends Factory
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
            'procedure_id' => Procedure::factory(),
            'started_by' => User::factory(),
            'status' => 'in_progress',
            'started_at' => now(),
            'completed_at' => null,
        ];
    }
}
