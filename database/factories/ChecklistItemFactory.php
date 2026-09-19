<?php

namespace Database\Factories;

use App\Models\Checklist;
use App\Models\ChecklistItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChecklistItem>
 */
class ChecklistItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'checklist_id' => Checklist::factory(),
            'position' => 1,
            'label' => 'Execução conferida',
            'what_good_looks_like' => 'A etapa está alinhada ao procedimento aprovado.',
            'common_error' => 'Prosseguir sem conferência final.',
        ];
    }
}
