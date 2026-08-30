<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use App\Services\FeedService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function __invoke(Request $request, FeedService $feedService): Response
    {
        $viewer = $request->user();
        $followingIds = $viewer->following()->pluck('users.id');

        $posts = $feedService->for($viewer)->through(fn (Post $post) => [
            'id' => $post->id,
            'caption' => $post->caption,
            'location' => $post->location,
            'published_at' => $post->published_at?->diffForHumans(short: true),
            'author' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'username' => $post->user->username,
                'avatar_url' => $post->user->avatar_url,
            ],
            'media' => $post->media->map(fn ($media) => [
                'id' => $media->id,
                'url' => $media->url,
                'alt_text' => $media->alt_text ?: 'Photo shared by '.$post->user->name,
                'width' => $media->width,
                'height' => $media->height,
            ]),
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
            'comments' => $post->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author' => [
                    'name' => $comment->user->name,
                    'username' => $comment->user->username,
                ],
            ]),
        ]);

        $suggestions = User::query()
            ->whereKeyNot($viewer->id)
            ->whereNotIn('id', $followingIds)
            ->withCount(['followers', 'posts'])
            ->orderByDesc('followers_count')
            ->limit(5)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'followers_count' => $user->followers_count,
                'posts_count' => $user->posts_count,
            ]);

        return Inertia::render('feed/index', [
            'posts' => $posts,
            'suggestions' => $suggestions,
        ]);
    }
}
