<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvidenceRequest;
use App\Models\Evidence;
use App\Models\ExecutionStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EvidenceController extends Controller
{
    public function store(StoreEvidenceRequest $request, ExecutionStep $executionStep): RedirectResponse
    {
        $file = $request->file('file');
        $storageKey = $file->store('evidence/'.$executionStep->execution_id, 'local');

        Evidence::query()->create([
            'execution_step_id' => $executionStep->id,
            'uploaded_by' => $request->user()->id,
            'storage_key' => $storageKey,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'checksum' => hash_file('sha256', $file->getRealPath()),
            'note' => $request->validated('note'),
        ]);

        return back()->with('status', 'Evidencia registrada.');
    }

    public function download(Evidence $evidence): StreamedResponse
    {
        abort_unless(auth()->user()?->belongsToOrganization($evidence->executionStep->execution->work->organization), 404);

        return response()->streamDownload(
            fn (): mixed => print Storage::disk('local')->get($evidence->storage_key),
            $evidence->original_name,
            ['Content-Type' => $evidence->mime_type]
        );
    }
}
