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

        return Inertia::render('posts/create', [
            'initialFormat' => $request->query('type') === 'text' ? 'text' : 'image',
        ]);
    }

    public function store(StorePostRequest $request, MediaService $mediaService, SubjectResolver $subjects): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data, $mediaService, $subjects): void {
            $subject = $subjects->resolve($data['subject_id'] ?? null, $data['subject_reference'] ?? null, $request->user());

            $post = $request->user()->posts()->create([
                'caption' => $data['caption'] ?? null,
                'location' => $data['location'] ?? null,
                'type' => $data['type'],
                'published_at' => now(),
            ]);

            if ($data['type'] === 'image') {
                $mediaService->storePostImage($post, $request->file('media'), $data['alt_text']);
            }

            if ($subject) {
                $post->subjects()->attach($subject);
            }
        });

        $destination = $data['type'] === 'text' ? 'pulse' : 'feed';

        return to_route($destination)->with('success', $data['type'] === 'text' ? 'Your Pulse post is live.' : 'Your photo is live.');
    }

    public function destroy(Post $post, MediaService $mediaService): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $message = $post->type === 'text' ? 'Your Pulse message was deleted.' : 'Your photo was deleted.';

        DB::transaction(function () use ($post, $mediaService): void {
            $mediaService->deletePostMedia($post);
            $post->delete();
        });

        return back()->with('success', $message);
    }
}
