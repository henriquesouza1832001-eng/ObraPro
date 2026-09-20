<?php

namespace Tests\Feature;

use App\Enums\MembershipRole;
use App\Enums\MembershipStatus;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\Procedure;
use App\Models\User;
use App\Models\Work;
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

    public function test_admin_can_update_member_role_and_status_with_audit_event(): void
    {
        [$admin, $organization] = $this->userInOrganization(MembershipRole::Admin);
        $member = User::factory()->create();
        $membership = OrganizationMembership::factory()->for($organization)->for($member)->create();

        $this->actingAs($admin)->patch(route('organizations.members.update', [$organization, $membership]), [
            'role' => MembershipRole::Supervisor->value,
            'status' => MembershipStatus::Suspended->value,
        ])->assertRedirect();

        $this->assertDatabaseHas('organization_memberships', [
            'id' => $membership->id,
            'role' => MembershipRole::Supervisor->value,
            'status' => MembershipStatus::Suspended->value,
        ]);
        $this->assertDatabaseHas('audit_events', ['action' => 'organization.membership.updated', 'subject_id' => (string) $membership->id]);
    }

    public function test_worker_cannot_update_membership(): void
    {
        [$worker, $organization] = $this->userInOrganization(MembershipRole::Worker);
        $member = User::factory()->create();
        $membership = OrganizationMembership::factory()->for($organization)->for($member)->create();

        $this->actingAs($worker)->patch(route('organizations.members.update', [$organization, $membership]), [
            'role' => MembershipRole::Supervisor->value,
            'status' => MembershipStatus::Active->value,
        ])->assertForbidden();
    }

    public function test_last_active_owner_cannot_be_removed(): void
    {
        [$owner, $organization] = $this->userInOrganization(MembershipRole::Owner);
        $membership = $owner->organizationMemberships()->whereBelongsTo($organization)->firstOrFail();

        $this->actingAs($owner)->patch(route('organizations.members.update', [$organization, $membership]), [
            'role' => MembershipRole::Admin->value,
            'status' => MembershipStatus::Active->value,
        ])->assertStatus(422);
    }

    public function test_last_active_owner_cannot_be_suspended(): void
    {
        [$owner, $organization] = $this->userInOrganization(MembershipRole::Owner);
        $membership = $owner->organizationMemberships()->whereBelongsTo($organization)->firstOrFail();

        $this->actingAs($owner)->patch(route('organizations.members.update', [$organization, $membership]), [
            'role' => MembershipRole::Owner->value,
            'status' => MembershipStatus::Suspended->value,
        ])->assertStatus(422);
    }

    public function test_dashboard_uses_counts_from_active_organization(): void
    {
        [$user, $organization] = $this->userInOrganization(MembershipRole::Admin);
        $work = Work::factory()->for($organization)->create();
        Procedure::factory()->for($work)->count(2)->create();

        $this->actingAs($user)->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Procedimentos')
            ->assertSee('2');
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
