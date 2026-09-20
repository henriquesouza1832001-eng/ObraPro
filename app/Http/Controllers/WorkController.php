<?php

namespace App\Http\Controllers;

use App\Enums\MembershipStatus;
use App\Models\Work;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

class WorkController extends Controller
{
    public function index(Request $request): View
    {
        Gate::authorize('viewAny', Work::class);

        $organizationIds = $request->user()->organizations()
            ->where('organizations.is_active', true)
            ->wherePivot('status', MembershipStatus::Active)
            ->pluck('organizations.id');

        $works = Work::query()
            ->whereIn('organization_id', $organizationIds)
            ->with('organization:id,name')
            ->orderBy('name')
            ->get();

        return view('works.index', ['works' => $works]);
    }

    public function show(Request $request, Work $work): View
    {
        abort_unless($request->user()->belongsToOrganization($work->organization), 404);

        $work->load('procedures.steps', 'procedures.checklists.items');

        return view('works.show', ['work' => $work]);
    }
}
