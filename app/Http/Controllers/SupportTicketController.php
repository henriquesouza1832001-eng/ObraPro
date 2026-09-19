<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupportTicketRequest;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;

class SupportTicketController extends Controller
{
    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $organization = $request->user()->organizations()->wherePivot('status', 'active')->first();

        SupportTicket::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'organization_id' => $organization?->id,
            'route' => $request->path(),
            'correlation_id' => $request->attributes->get('correlation_id'),
            'session_context' => ['user_agent' => mb_substr((string) $request->userAgent(), 0, 255)],
        ]);

        return back()->with('status', 'Chamado aberto para analise.');
    }
}
