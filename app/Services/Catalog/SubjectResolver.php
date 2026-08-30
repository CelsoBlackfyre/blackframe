<?php

namespace App\Services\Catalog;

use App\Enums\SubjectType;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use JsonException;

class SubjectResolver
{
    public function resolve(?int $subjectId, ?string $reference, User $user): ?Subject
    {
        if ($subjectId) {
            return Subject::query()->findOrFail($subjectId);
        }

        if (! filled($reference)) {
            return null;
        }

        try {
            $payload = json_decode(Crypt::decryptString($reference), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException) {
            throw ValidationException::withMessages([
                'subject_reference' => 'Search for the title again before continuing.',
            ]);
        }

        $data = Validator::make($payload, [
            'version' => ['required', 'integer', Rule::in([1])],
            'source' => ['required', Rule::in(['openlibrary', 'tvmaze', 'jikan', 'wikidata', 'tmdb'])],
            'source_id' => ['required', 'string', 'max:160'],
            'source_url' => ['nullable', 'url:http,https', 'max:2000'],
            'name' => ['required', 'string', 'max:160'],
            'type' => ['required', Rule::enum(SubjectType::class)],
            'description' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'url:http,https', 'max:2000'],
        ])->validate();

        return DB::transaction(function () use ($data, $user): Subject {
            $external = Subject::query()
                ->where('source', $data['source'])
                ->where('source_id', $data['source_id'])
                ->first();

            if ($external) {
                return $external;
            }

            $existing = Subject::query()
                ->where('type', $data['type'])
                ->whereRaw('LOWER(name) = ?', [Str::lower($data['name'])])
                ->first();

            if ($existing) {
                return $existing;
            }

            $slugBase = Str::slug($data['name']) ?: 'subject';
            $slug = Str::limit($slugBase, 130, '').'-'.$data['type'].'-'.substr(hash('sha256', $data['source'].':'.$data['source_id']), 0, 10);

            return Subject::query()->create([
                'type' => $data['type'],
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'image_url' => $data['image_url'] ?? null,
                'source' => $data['source'],
                'source_id' => $data['source_id'],
                'source_url' => $data['source_url'] ?? null,
                'imported_by' => $user->id,
                'metadata' => ['catalog_imported_at' => now()->toIso8601String()],
            ]);
        });
    }
}
