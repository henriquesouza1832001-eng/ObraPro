<?php

namespace App\Http\Controllers;

use App\Enums\MembershipStatus;
use App\Models\Execution;
use App\Models\Work;
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

        $organization = $membership?->organization;
        $works = $organization ? Work::query()->whereBelongsTo($organization)->orderBy('name')->get() : collect();
        $executions = $organization ? Execution::query()->whereIn('work_id', $works->modelKeys()) : Execution::query()->whereKey(0);

        return view('dashboard', [
            'organization' => $organization,
            'works' => $works,
            'procedureCount' => $organization ? $organization->works()->withCount('procedures')->get()->sum('procedures_count') : 0,
            'executionCount' => (clone $executions)->count(),
            'completedExecutionCount' => (clone $executions)->where('status', 'completed')->count(),
            'activeExecutionCount' => (clone $executions)->where('status', 'in_progress')->count(),
        ]);
    }
}
