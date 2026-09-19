<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExecutionStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->belongsToOrganization($this->route('execution')->work->organization) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:pending,completed'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
