<?php

namespace App\Http\Controllers;

use App\Enums\ShelfStatus;
use App\Http\Requests\StoreShelfEntryRequest;
use App\Http\Requests\UpdateShelfEntryRequest;
use App\Models\Subject;
use App\Models\UserSubject;
use App\Services\Catalog\SubjectResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ShelfController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = $request->user()
            ->shelfEntries()
            ->with('subject.parent:id,name')
            ->latest('updated_at')
            ->get()
            ->map(fn (UserSubject $entry) => [
                'id' => $entry->id,
                'status' => $entry->status->value,
                'status_label' => $entry->status->labelFor($entry->subject->type),
                'favorite' => $entry->favorite,
                'rating' => $entry->rating === null ? null : (float) $entry->rating,
                'progress' => $entry->progress,
                'subject' => $this->subjectData($entry->subject),
            ]);

        return Inertia::render('shelf/index', [
            'entries' => $entries,
            'statusOptions' => collect(ShelfStatus::cases())->map(fn (ShelfStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ]),
            'stats' => [
                'total' => $entries->count(),
                'current' => $entries->where('status', ShelfStatus::Current->value)->count(),
                'completed' => $entries->where('status', ShelfStatus::Completed->value)->count(),
                'backlog' => $entries->where('status', ShelfStatus::Backlog->value)->count(),
                'favorites' => $entries->where('favorite', true)->count(),
            ],
        ]);
    }

    public function store(StoreShelfEntryRequest $request, SubjectResolver $subjects): RedirectResponse
    {
        $data = $request->validated();
        $subject = $subjects->resolve($data['subject_id'] ?? null, $data['subject_reference'] ?? null, $request->user());

        $request->user()->shelfEntries()->updateOrCreate(
            ['subject_id' => $subject->id],
            [
                'status' => $data['status'],
                'favorite' => $data['favorite'],
                'rating' => $data['rating'],
                'progress' => $data['progress'],
            ],
        );

        return back()->with('success', __(':name is now on your Geek Shelf.', ['name' => $subject->name]));
    }

    public function update(UpdateShelfEntryRequest $request, UserSubject $shelfEntry): RedirectResponse
    {
        Gate::authorize('update', $shelfEntry);

        $shelfEntry->update($request->validated());

        return back()->with('success', __(':name was updated.', ['name' => $shelfEntry->subject->name]));
    }

    public function destroy(Request $request, UserSubject $shelfEntry): RedirectResponse
    {
        Gate::authorize('delete', $shelfEntry);

        $subjectName = $shelfEntry->subject->name;
        $shelfEntry->delete();

        return back()->with('success', __(':name was removed from your Geek Shelf.', ['name' => $subjectName]));
    }

    /**
     * @return array<string, mixed>
     */
    private function subjectData(Subject $subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'slug' => $subject->slug,
            'type' => $subject->type->value,
            'type_label' => $subject->type->label(),
            'description' => $subject->description,
            'image_url' => $subject->image_url,
            'parent' => $subject->parent?->name,
        ];
    }
}
