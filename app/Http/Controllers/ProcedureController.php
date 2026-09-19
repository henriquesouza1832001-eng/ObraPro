<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProcedureStatusRequest;
use App\Models\AuditEvent;
use App\Models\Procedure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ProcedureController extends Controller
{
    public function updateStatus(UpdateProcedureStatusRequest $request, Procedure $procedure): RedirectResponse
    {
        $status = $request->validated('status');
        abort_if($status === 'published' && $procedure->steps()->doesntExist(), 422, 'Um procedimento precisa ter etapas antes de ser publicado.');

        DB::transaction(function () use ($request, $procedure, $status): void {
            $procedure->update(['status' => $status, 'approved_by' => $status === 'published' ? $request->user()->id : null, 'approved_at' => $status === 'published' ? now() : null]);
            AuditEvent::query()->create([
                'action' => 'procedure.status.updated', 'actor_id' => (string) $request->user()->id,
                'organization_id' => (string) $procedure->work?->organization_id, 'subject_type' => Procedure::class,
                'subject_id' => (string) $procedure->id, 'result' => 'success', 'metadata' => ['status' => $status], 'occurred_at' => now(),
            ]);
        });

        return back()->with('status', 'Status do procedimento atualizado.');
    }
}
