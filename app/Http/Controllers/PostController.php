<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Services\Catalog\SubjectResolver;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function create(Request $request): Response
    {
        Gate::authorize('create', Post::class);

        return Inertia::render('posts/create');
    }

    public function store(StorePostRequest $request, MediaService $mediaService, SubjectResolver $subjects): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data, $mediaService, $subjects): void {
            $post = $request->user()->posts()->create([
                'caption' => $data['caption'] ?? null,
                'location' => $data['location'] ?? null,
                'type' => $data['type'],
                'published_at' => now(),
            ]);

            if ($data['type'] === 'image') {
                $mediaService->storePostImage($post, $request->file('media'), $data['alt_text']);
            }

            $subject = $subjects->resolve($data['subject_id'] ?? null, $data['subject_reference'] ?? null, $request->user());

            if ($subject) {
                $post->subjects()->attach($subject);
            }
        });

        $destination = $data['type'] === 'text' ? 'pulse' : 'feed';

        return to_route($destination)->with('success', $data['type'] === 'text' ? 'Your Pulse post is live.' : 'Your photo is live.');
    }
}
