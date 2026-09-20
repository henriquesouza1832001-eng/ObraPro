<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartExecutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->belongsToOrganization($this->route('work')->organization) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [];
    }
}
