<?php

namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Post::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isImage = $this->input('type') === 'image';
        $captionLimit = $isImage ? 2200 : 500;

        return [
            'type' => ['required', Rule::in(['image', 'text'])],
            'caption' => [$isImage ? 'nullable' : 'required', 'string', 'max:'.$captionLimit],
            'location' => [Rule::excludeIf(! $isImage), 'nullable', 'string', 'max:120'],
            'media' => [
                Rule::excludeIf(! $isImage),
                Rule::requiredIf($isImage),
                File::image()->max('8mb'),
                'mimes:jpg,jpeg,png,webp',
            ],
            'alt_text' => [Rule::excludeIf(! $isImage), Rule::requiredIf($isImage), 'string', 'max:300'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'subject_reference' => ['nullable', 'string', 'max:10000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'caption.required' => 'Write something before publishing your text post.',
            'media.required' => 'Choose an image to publish this photo post.',
            'media.mimes' => 'Use a JPG, PNG, or WebP image.',
            'alt_text.required' => 'Describe the image so people using assistive technology can understand it.',
        ];
    }
}
