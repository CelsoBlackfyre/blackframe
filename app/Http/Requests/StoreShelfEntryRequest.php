<?php

namespace App\Http\Requests;

use App\Enums\ShelfStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShelfEntryRequest extends FormRequest
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
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id', 'required_without:subject_reference'],
            'subject_reference' => ['nullable', 'string', 'max:10000', 'required_without:subject_id'],
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
