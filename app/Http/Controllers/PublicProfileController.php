<?php

namespace App\Http\Controllers;

use App\Enums\ProfileView;
use App\Http\Requests\ShowProfileRequest;
use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserSubject;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class PublicProfileController extends Controller
{
    public function __invoke(ShowProfileRequest $request, User $user): Response
    {
        $viewer = $request->user();
        $tab = ProfileView::from($request->string('tab')->toString());
        $isSelf = $viewer->is($user);
        $isFollowing = ! $isSelf && $viewer->following()->whereKey($user->id)->exists();
        $followsYou = ! $isSelf && $user->following()->whereKey($viewer->id)->exists();
        $followRequestPending = ! $isSelf && $viewer->pendingFollowing()->whereKey($user->id)->exists();
        $incomingFollowRequest = ! $isSelf && $user->pendingFollowing()->whereKey($viewer->id)->exists();
        $canViewContent = $viewer->canViewContentFrom($user);

        $user->loadCount([
            'followers',
            'following',
            'posts as posts_count' => fn (Builder $query) => $query->whereNotNull('published_at'),
            'posts as visual_posts_count' => fn (Builder $query) => $query
                ->whereNotNull('published_at')
                ->whereIn('type', ['image', 'carousel']),
            'posts as pulse_posts_count' => fn (Builder $query) => $query
                ->whereNotNull('published_at')
                ->where('type', 'text'),
            'shelfEntries as shelf_count',
        ]);

        $sharedSubjects = $canViewContent ? $this->sharedSubjects($viewer, $user, $isSelf) : collect();
        $currentActivity = $canViewContent ? $this->currentActivity($user) : null;
        $posts = $canViewContent && $tab === ProfileView::Posts ? $this->visualPosts($viewer, $user) : null;
        $pulse = $canViewContent && $tab === ProfileView::Pulse ? $this->pulsePosts($viewer, $user) : null;
        $shelf = $canViewContent && $tab === ProfileView::Shelf ? $this->shelf($user) : null;

        return Inertia::render('profiles/show', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'website' => $user->website,
                'avatar_url' => $user->avatar_url,
                'is_private' => (bool) $user->is_private,
                'is_self' => $isSelf,
                'is_following' => $isFollowing,
                'follows_you' => $followsYou,
                'follow_request_pending' => $followRequestPending,
                'incoming_follow_request' => $incomingFollowRequest,
                'can_view_content' => $canViewContent,
                'joined_at' => $user->created_at->format('F Y'),
                'counts' => [
                    'posts' => (int) $user->posts_count,
                    'visual_posts' => (int) $user->visual_posts_count,
                    'pulse_posts' => (int) $user->pulse_posts_count,
                    'shelf' => (int) $user->shelf_count,
                    'followers' => (int) $user->followers_count,
                    'following' => (int) $user->following_count,
                ],
                'shared_subjects' => $sharedSubjects,
                'current_activity' => $currentActivity,
            ],
            'filters' => ['tab' => $tab->value],
            'posts' => $posts,
            'pulse' => $pulse,
            'shelf' => $shelf,
        ]);
    }

    private function visualPosts(User $viewer, User $profile)
    {
        return $this->postQuery($viewer, $profile)
            ->whereIn('type', ['image', 'carousel'])
            ->with([
                'media',
                'comments' => fn ($query) => $query->with('user:id,name,username')->limit(2),
            ])
            ->paginate(6)
            ->withQueryString()
            ->through(fn (Post $post) => $this->presentVisualPost($post));
    }

    private function pulsePosts(User $viewer, User $profile)
    {
        return $this->postQuery($viewer, $profile)
            ->where('type', 'text')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'body' => $post->caption,
                'published_at' => $post->published_at?->diffForHumans(short: true),
                'author' => $this->presentAuthor($post->user),
                'likes_count' => $post->likes_count,
                'comments_count' => $post->comments_count,
                'liked_by_viewer' => $post->liked_by_viewer,
                'subjects' => $post->subjects->map(fn (Subject $subject) => $this->presentSubject($subject)),
            ]);
    }

    private function postQuery(User $viewer, User $profile): Builder
    {
        return Post::query()
            ->whereBelongsTo($profile)
            ->whereNotNull('published_at')
            ->with(['user:id,name,username,avatar_path', 'subjects:id,name,slug,type'])
            ->withCount(['likes', 'comments'])
            ->withExists([
                'likes as liked_by_viewer' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->latest('published_at');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentVisualPost(Post $post): array
    {
        return [
            'id' => $post->id,
            'caption' => $post->caption,
            'location' => $post->location,
            'published_at' => $post->published_at?->diffForHumans(short: true),
            'author' => $this->presentAuthor($post->user),
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
            'subjects' => $post->subjects->map(fn (Subject $subject) => $this->presentSubject($subject)),
            'comments' => $post->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author' => [
                    'name' => $comment->user->name,
                    'username' => $comment->user->username,
                ],
            ]),
        ];
    }

    private function shelf(User $profile)
    {
        return $profile->shelfEntries()
            ->with('subject:id,name,slug,type,image_url')
            ->orderByRaw("CASE WHEN status = 'current' THEN 0 WHEN favorite THEN 1 ELSE 2 END")
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (UserSubject $entry) => [
                'id' => $entry->id,
                'status' => $entry->status->value,
                'status_label' => $entry->status->labelFor($entry->subject->type),
                'favorite' => $entry->favorite,
                'rating' => $entry->rating === null ? null : (float) $entry->rating,
                'progress' => $entry->progress,
                'subject' => $this->presentSubject($entry->subject, true),
            ]);
    }

    private function sharedSubjects(User $viewer, User $profile, bool $isSelf)
    {
        $entries = $profile->shelfEntries()
            ->with('subject:id,name,slug,type,image_url')
            ->when(
                ! $isSelf,
                fn ($query) => $query->whereIn(
                    'subject_id',
                    UserSubject::query()->select('subject_id')->where('user_id', $viewer->id),
                ),
            )
            ->orderByDesc('favorite')
            ->latest('updated_at')
            ->limit(5)
            ->get();

        return $entries->map(fn (UserSubject $entry) => $this->presentSubject($entry->subject, true))->values();
    }

    private function currentActivity(User $profile): ?array
    {
        $entry = $profile->shelfEntries()
            ->with('subject:id,name,slug,type,image_url')
            ->where('status', 'current')
            ->latest('updated_at')
            ->first();

        if (! $entry) {
            return null;
        }

        return [
            'label' => $entry->status->labelFor($entry->subject->type),
            'progress' => $entry->progress,
            'subject' => $this->presentSubject($entry->subject, true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentAuthor(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentSubject(Subject $subject, bool $includeImage = false): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'slug' => $subject->slug,
            'type' => $subject->type->value,
            'type_label' => $subject->type->label(),
            ...($includeImage ? ['image_url' => $subject->image_url] : []),
        ];
    }
}
