<?php

namespace Tests\Feature;

use App\Enums\MembershipRole;
use App\Enums\MembershipStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_and_is_taken_to_a_private_dashboard(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Maria Silva', 'organization' => 'Obra da Maria',
            'email' => 'maria@example.com', 'password' => 'senha-segura-123', 'password_confirmation' => 'senha-segura-123',
        ]);

        $response->assertRedirect(route('dashboard'));
        $user = User::query()->where('email', 'maria@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('organization_memberships', ['user_id' => $user->id, 'role' => MembershipRole::Owner->value, 'status' => MembershipStatus::Active->value]);
    }

    public function test_registered_account_requires_a_long_confirmed_password(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Maria Silva', 'organization' => 'Obra da Maria', 'email' => 'maria@example.com',
            'password' => 'curta', 'password_confirmation' => 'diferente',
        ])->assertSessionHasErrors('password');

        $this->assertDatabaseCount('users', 0);
    }
}
