<?php

namespace App\Http\Controllers;

use App\Enums\MembershipStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request): View
    {
        $membership = $request->user()->organizationMemberships()
            ->with('organization')
            ->where('status', MembershipStatus::Active)
            ->whereHas('organization', fn (Builder $query): Builder => $query->where('is_active', true))
            ->first();

        return view('dashboard', ['organization' => $membership?->organization]);
    }
}
