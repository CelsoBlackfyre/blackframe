<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Subject;
use App\Services\FeedService;
use App\Services\PeopleSearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function __invoke(Request $request, FeedService $feedService, PeopleSearchService $peopleSearch): Response
    {
        $viewer = $request->user();

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

        $suggestions = $peopleSearch->suggestions($viewer)
            ->map(fn ($user) => $peopleSearch->present($viewer, $user));

        $currentShelf = $viewer->shelfEntries()
            ->with('subject:id,name,slug,type,image_url')
            ->where('status', 'current')
            ->latest('updated_at')
            ->limit(3)
            ->get()
            ->map(fn ($entry) => [
                'id' => $entry->id,
                'status_label' => $entry->status->labelFor($entry->subject->type),
                'progress' => $entry->progress,
                'subject' => [
                    'id' => $entry->subject->id,
                    'name' => $entry->subject->name,
                    'slug' => $entry->subject->slug,
                    'type' => $entry->subject->type->value,
                    'type_label' => $entry->subject->type->label(),
                    'image_url' => $entry->subject->image_url,
                ],
            ]);

        $activation = [
            'shelf_count' => $viewer->shelfEntries()->count(),
            'following_count' => $viewer->following()->count(),
            'published_posts_count' => $viewer->posts()->whereNotNull('published_at')->count(),
        ];

        return Inertia::render('feed/index', [
            'posts' => $posts,
            'suggestions' => $suggestions,
            'current_shelf' => $currentShelf,
            'activation' => $activation,
        ]);
    }
}
