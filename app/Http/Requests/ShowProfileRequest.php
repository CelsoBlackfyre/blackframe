<?php

namespace App\Http\Requests;

use App\Enums\ProfileView;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowProfileRequest extends FormRequest
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
            'tab' => ['required', Rule::enum(ProfileView::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tab' => strtolower((string) $this->input('tab', ProfileView::Posts->value)),
        ]);
    }
}
