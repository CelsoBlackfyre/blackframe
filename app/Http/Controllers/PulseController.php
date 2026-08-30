<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Subject;
use App\Services\FeedService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PulseController extends Controller
{
    public function __invoke(Request $request, FeedService $feedService): Response
    {
        $posts = $feedService->pulseFor($request->user())->through(fn (Post $post) => [
            'id' => $post->id,
            'body' => $post->caption,
            'published_at' => $post->published_at?->diffForHumans(short: true),
            'author' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'username' => $post->user->username,
                'avatar_url' => $post->user->avatar_url,
            ],
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'liked_by_viewer' => $post->liked_by_viewer,
            'subjects' => $post->subjects->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'slug' => $subject->slug,
                'type' => $subject->type->value,
                'type_label' => $subject->type->label(),
            ]),
        ]);

        return Inertia::render('pulse/index', [
            'posts' => $posts,
        ]);
    }
}
