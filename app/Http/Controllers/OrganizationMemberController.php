<?php

namespace App\Http\Controllers;

use App\Enums\MembershipRole;
use App\Http\Requests\UpdateOrganizationMemberRequest;
use App\Models\AuditEvent;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

class OrganizationMemberController extends Controller
{
    public function index(Organization $organization): View
    {
        Gate::authorize('view', $organization);

        return view('organizations.members', [
            'organization' => $organization,
            'memberships' => $organization->memberships()->with('user')->orderBy('created_at')->get(),
        ]);
    }

    public function update(UpdateOrganizationMemberRequest $request, Organization $organization, OrganizationMembership $membership): RedirectResponse
    {
        abort_unless($membership->organization_id === $organization->id, 404);

        $validated = $request->validated();
        $isLastOwner = $membership->role === MembershipRole::Owner
            && $validated['role'] !== MembershipRole::Owner->value
            && $organization->memberships()->where('role', MembershipRole::Owner)->where('status', 'active')->count() === 1;

        abort_if($isLastOwner, 422, 'A organizacao precisa manter um Owner ativo.');
        $membership->update($validated);
        AuditEvent::query()->create([
            'action' => 'organization.membership.updated', 'actor_id' => (string) $request->user()->getKey(),
            'organization_id' => (string) $organization->getKey(), 'subject_type' => OrganizationMembership::class,
            'subject_id' => (string) $membership->getKey(), 'result' => 'success',
            'metadata' => ['role' => $validated['role'], 'status' => $validated['status']], 'occurred_at' => now(),
        ]);

        return back()->with('status', 'Membro atualizado.');
    }
}
