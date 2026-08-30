<?php

namespace App\Http\Requests;

use App\Enums\MatchView;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexMatchesRequest extends FormRequest
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
            'view' => ['required', Rule::enum(MatchView::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'view' => strtolower((string) $this->input('view', MatchView::Discover->value)),
        ]);
    }
}
