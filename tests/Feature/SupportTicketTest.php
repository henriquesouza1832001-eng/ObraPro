<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_open_ticket_with_sanitized_session_context(): void
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();
        OrganizationMembership::factory()->for($organization)->for($user)->admin()->create();

        $this->actingAs($user)->post(route('support-tickets.store'), [
            'title' => 'Botao nao funciona',
            'description' => 'O botao de salvar nao responde.',
            'category' => 'bug',
            'priority' => 'high',
        ])->assertRedirect();

        $ticket = SupportTicket::query()->firstOrFail();
        $this->assertSame($user->id, $ticket->user_id);
        $this->assertSame($organization->id, $ticket->organization_id);
        $this->assertSame('painel/suporte/chamados', $ticket->route);
        $this->assertArrayHasKey('user_agent', $ticket->session_context);
        $this->assertArrayNotHasKey('password', $ticket->session_context);
    }

    public function test_anonymous_user_cannot_open_ticket(): void
    {
        $this->post(route('support-tickets.store'))->assertRedirect('/entrar');
    }
}
