<?php

namespace App\Http\Requests;

use App\Enums\ShelfStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShelfEntryRequest extends FormRequest
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
            'status' => ['required', Rule::enum(ShelfStatus::class)],
            'favorite' => ['required', 'boolean'],
            'rating' => ['nullable', 'numeric', 'between:1,10'],
            'progress' => ['nullable', 'string', 'max:120'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'favorite' => $this->boolean('favorite'),
            'rating' => $this->input('rating') === '' ? null : $this->input('rating'),
            'progress' => $this->input('progress') === '' ? null : $this->input('progress'),
        ]);
    }
}
