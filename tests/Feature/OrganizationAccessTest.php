<?php

namespace Tests\Feature;

use App\Enums\MembershipRole;
use App\Enums\MembershipStatus;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class OrganizationAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_user_is_redirected_from_platform_security(): void
    {
        $this->get('/painel/seguranca')->assertRedirect('/entrar');
    }

    public function test_organization_admin_cannot_view_platform_security(): void
    {
        [$user] = $this->userInOrganization(MembershipRole::Admin);

        $this->actingAs($user)->get('/painel/seguranca')->assertForbidden();
    }

    public function test_super_admin_can_view_platform_security(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get('/painel/seguranca')
            ->assertOk()
            ->assertSee('Seguranca da plataforma');
    }

    public function test_super_admin_has_no_implicit_access_to_customer_organization(): void
    {
        $user = User::factory()->superAdmin()->create();
        $organization = Organization::factory()->create();

        $this->assertFalse(Gate::forUser($user)->allows('view', $organization));
    }

    public function test_active_member_can_only_view_their_organization(): void
    {
        [$user, $organization] = $this->userInOrganization(MembershipRole::Worker);
        $otherOrganization = Organization::factory()->create();

        $this->assertTrue(Gate::forUser($user)->allows('view', $organization));
        $this->assertFalse(Gate::forUser($user)->allows('view', $otherOrganization));
    }

    public function test_suspended_member_cannot_view_organization(): void
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();
        OrganizationMembership::factory()->for($organization)->for($user)->suspended()->create();

        $this->assertFalse(Gate::forUser($user)->allows('view', $organization));
    }

    public function test_member_cannot_view_inactive_organization(): void
    {
        [$user, $organization] = $this->userInOrganization(MembershipRole::Admin);
        $organization->forceFill(['is_active' => false])->save();

        $this->assertFalse(Gate::forUser($user)->allows('view', $organization));
        $this->assertFalse(Gate::forUser($user)->allows('update', $organization));
    }

    public function test_only_owner_and_admin_can_update_organization(): void
    {
        foreach (MembershipRole::cases() as $role) {
            [$user, $organization] = $this->userInOrganization($role);

            $this->assertSame(
                in_array($role, [MembershipRole::Owner, MembershipRole::Admin], true),
                Gate::forUser($user)->allows('update', $organization),
                "Unexpected authorization result for {$role->value}",
            );
        }
    }

    public function test_dashboard_shows_security_link_only_to_super_admin(): void
    {
        $regularUser = User::factory()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($regularUser)->get('/painel')->assertDontSee('Seguranca da plataforma');
        $this->actingAs($superAdmin)->get('/painel')->assertSee('Seguranca da plataforma');
    }

    /** @return array{User, Organization} */
    private function userInOrganization(MembershipRole $role): array
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create();

        OrganizationMembership::factory()->for($organization)->for($user)->create([
            'role' => $role,
            'status' => MembershipStatus::Active,
        ]);

        return [$user, $organization];
    }
}
