<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectSuggestionRequest;
use App\Models\SubjectSuggestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class SubjectSuggestionController extends Controller
{
    public function store(StoreSubjectSuggestionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $normalizedName = Str::lower(Str::squish($data['name']));

        $suggestion = SubjectSuggestion::query()->firstOrCreate(
            [
                'type' => $data['type'],
                'normalized_name' => $normalizedName,
            ],
            [
                'user_id' => $request->user()->id,
                'name' => Str::squish($data['name']),
                'source_url' => $data['source_url'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ],
        );

        $message = $suggestion->wasRecentlyCreated
            ? $suggestion->name.' was sent for catalog review.'
            : $suggestion->name.' is already in the catalog review queue.';

        return back()->with('success', $message);
    }
}
