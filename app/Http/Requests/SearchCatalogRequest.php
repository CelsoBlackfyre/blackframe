<?php

namespace App\Http\Requests;

use App\Enums\SubjectType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchCatalogRequest extends FormRequest
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
            'query' => ['required', 'string', 'min:2', 'max:80'],
            'type' => ['nullable', Rule::enum(SubjectType::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'query' => trim((string) $this->input('query')),
            'type' => $this->input('type') === 'all' ? null : $this->input('type'),
        ]);
    }
}
