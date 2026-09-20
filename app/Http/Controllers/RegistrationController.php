<?php

namespace App\Http\Controllers;

use App\Enums\MembershipRole;
use App\Enums\MembershipStatus;
use App\Http\Requests\RegisterRequest;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class RegistrationController extends Controller
{
    public function create(): View
    {
        return view('auth.register');
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::query()->create(['name' => $request->validated('name'), 'email' => $request->validated('email'), 'password' => $request->validated('password')]);
            $organization = Organization::query()->create(['name' => $request->validated('organization'), 'slug' => str($request->validated('organization'))->slug().'-'.str()->random(6)]);
            (new OrganizationMembership)->forceFill([
                'organization_id' => $organization->id, 'user_id' => $user->id,
                'role' => MembershipRole::Owner, 'status' => MembershipStatus::Active,
            ])->save();

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
