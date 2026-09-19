<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportTicket>
 */
class SupportTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), 'organization_id' => Organization::factory(),
            'title' => 'Botao nao responde', 'description' => 'Descricao do problema.',
            'category' => 'bug', 'priority' => 'normal', 'status' => 'open',
            'route' => '/painel', 'correlation_id' => fake()->uuid(),
            'session_context' => ['locale' => 'pt-BR'],
        ];
    }
}
