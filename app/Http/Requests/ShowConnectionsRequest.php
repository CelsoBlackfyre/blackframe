<?php

namespace App\Http\Requests;

use App\Enums\ProfileConnectionList;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowConnectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'list' => ['required', Rule::enum(ProfileConnectionList::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'list' => strtolower((string) $this->input('list', ProfileConnectionList::Followers->value)),
        ]);
    }
}
