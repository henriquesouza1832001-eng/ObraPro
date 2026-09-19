<?php

namespace Database\Factories;

use App\Models\Procedure;
use App\Models\ProcedureStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProcedureStep>
 */
class ProcedureStepFactory extends Factory
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
            'position' => 1,
            'title' => 'Preparar a frente de trabalho',
            'instruction' => 'Confira o local, separe os materiais e siga o procedimento aprovado.',
            'safety_note' => 'Use os EPIs indicados para a atividade.',
            'when_to_call_professional' => 'Pare e chame um profissional quando houver dúvida estrutural ou risco.',
            'materials' => ['Trena', 'Nivel', 'EPI'],
        ];
    }
}
