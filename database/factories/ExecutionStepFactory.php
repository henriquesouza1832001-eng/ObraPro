<?php

namespace Database\Factories;

use App\Models\Execution;
use App\Models\ExecutionStep;
use App\Models\ProcedureStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExecutionStep>
 */
class ExecutionStepFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'execution_id' => Execution::factory(),
            'procedure_step_id' => ProcedureStep::factory(),
            'status' => 'pending',
            'note' => null,
            'completed_at' => null,
        ];
    }
}
