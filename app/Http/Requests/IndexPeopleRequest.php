<?php

namespace App\Http\Requests;

use App\Enums\PeopleView;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPeopleRequest extends FormRequest
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
            'view' => ['required', Rule::enum(PeopleView::class)],
            'query' => ['nullable', 'string', 'max:80'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $query = trim((string) $this->input('query'));

        $this->merge([
            'view' => strtolower((string) $this->input('view', PeopleView::Discover->value)),
            'query' => $query === '' ? null : $query,
        ]);
    }
}
