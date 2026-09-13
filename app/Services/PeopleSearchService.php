<?php

namespace App\Services;

use App\Enums\PeopleView;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PeopleSearchService
{
    public function search(User $viewer, PeopleView $view, ?string $term = null, int $perPage = 12): LengthAwarePaginator
    {
        $normalizedTerm = ltrim(mb_strtolower(trim((string) $term)), '@');
        $query = $this->baseQuery($viewer);

        match ($view) {
            PeopleView::Followers => $query->whereHas(
                'following',
                fn (Builder $query) => $query->whereKey($viewer->id),
            ),
            PeopleView::Following => $query->whereHas(
                'followers',
                fn (Builder $query) => $query->whereKey($viewer->id),
            ),
            PeopleView::Discover => null,
        };

        if ($normalizedTerm !== '') {
            $query
                ->where(fn (Builder $query) => $query
                    ->whereLike('name', "%{$normalizedTerm}%")
                    ->orWhereLike('username', "%{$normalizedTerm}%"))
                ->orderByRaw(
                    'CASE WHEN LOWER(username) = ? THEN 0 WHEN LOWER(username) LIKE ? THEN 1 WHEN LOWER(name) LIKE ? THEN 2 ELSE 3 END',
                    [$normalizedTerm, "{$normalizedTerm}%", "{$normalizedTerm}%"],
                );
        }

        if ($view === PeopleView::Discover) {
            $query
                ->orderByDesc('shared_titles_count')
                ->orderByDesc('mutual_connections_count')
                ->orderByDesc('follows_viewer')
                ->orderBy('followed_by_viewer');
        }

        return $query
            ->orderByDesc('followers_count')
            ->orderByDesc('posts_count')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return Collection<int, User>
     */
    public function suggestions(User $viewer, int $limit = 5): Collection
    {
        $followingIds = $viewer->following()->pluck('users.id');

        return $this->baseQuery($viewer)
            ->where('users.is_private', false)
            ->whereNotIn('users.id', $followingIds)
            ->orderByDesc('shared_titles_count')
            ->orderByDesc('mutual_connections_count')
            ->orderByDesc('followers_count')
            ->orderBy('users.name')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    public function pendingRequests(User $viewer, int $limit = 20): Collection
    {
        return $this->baseQuery($viewer)
            ->whereHas(
                'pendingFollowing',
                fn (Builder $query) => $query->whereKey($viewer->id),
            )
            ->orderBy('users.name')
            ->limit($limit)
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    public function present(User $viewer, User $user): array
    {
        $viewer->loadMissing('shelfEntries.subject');
        $user->loadMissing('shelfEntries.subject');

        // baseQuery() computes followed_by_viewer with withExists, which mirrors
        // canViewContentFrom() without issuing another query per presented user.
        $canViewCulture = (bool) $user->followed_by_viewer || ! $user->is_private;
        $viewerSubjectIds = $viewer->shelfEntries->pluck('subject_id');
        $sharedEntries = $canViewCulture
            ? $user->shelfEntries->whereIn('subject_id', $viewerSubjectIds)->take(3)
            : collect();
        $currentEntry = $canViewCulture
            ? $user->shelfEntries->first(fn ($entry) => $entry->status->value === 'current')
            : null;

        $sharedSubjects = $sharedEntries->map(fn ($entry) => [
            'id' => $entry->subject->id,
            'name' => $entry->subject->name,
            'slug' => $entry->subject->slug,
            'type' => $entry->subject->type->value,
            'type_label' => $entry->subject->type->label(),
            'image_url' => $entry->subject->image_url,
        ])->values();

        $recommendationReason = match (true) {
            $sharedSubjects->count() >= 2 => 'Suggested because you both shelved '.$sharedSubjects->pluck('name')->take(2)->join(' and ').'.',
            $sharedSubjects->count() === 1 => 'Suggested because you both shelved '.$sharedSubjects->first()['name'].'.',
            $currentEntry !== null => $currentEntry->status->labelFor($currentEntry->subject->type).' '.$currentEntry->subject->name.' now.',
            default => null,
        };

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'is_private' => (bool) $user->is_private,
            'followers_count' => (int) $user->followers_count,
            'posts_count' => (int) $user->posts_count,
            'is_following' => (bool) $user->followed_by_viewer,
            'follows_you' => (bool) $user->follows_viewer,
            'follow_request_pending' => (bool) $user->follow_request_pending,
            'incoming_follow_request' => (bool) $user->incoming_follow_request,
            'shared_titles_count' => $canViewCulture ? (int) $user->shared_titles_count : 0,
            'mutual_connections_count' => (int) $user->mutual_connections_count,
            'shared_subjects' => $sharedSubjects,
            'current_activity' => $currentEntry ? [
                'label' => $currentEntry->status->labelFor($currentEntry->subject->type),
                'subject' => [
                    'id' => $currentEntry->subject->id,
                    'name' => $currentEntry->subject->name,
                    'slug' => $currentEntry->subject->slug,
                    'type' => $currentEntry->subject->type->value,
                    'type_label' => $currentEntry->subject->type->label(),
                    'image_url' => $currentEntry->subject->image_url,
                ],
            ] : null,
            'recommendation_reason' => $recommendationReason,
        ];
    }

    private function baseQuery(User $viewer): Builder
    {
        $viewer->loadMissing('shelfEntries.subject');
        $viewerSubjectIds = $viewer->shelfEntries->pluck('subject_id');
        $viewerFollowingIds = $viewer->following()->pluck('users.id');

        return User::query()
            ->select(['users.id', 'users.name', 'users.username', 'users.bio', 'users.avatar_path', 'users.is_private'])
            ->whereKeyNot($viewer->id)
            ->with([
                'shelfEntries' => fn ($query) => $query
                    ->select(['id', 'user_id', 'subject_id', 'status', 'favorite', 'rating', 'progress'])
                    ->with('subject:id,name,slug,type,image_url')
                    ->orderByRaw("CASE WHEN status = 'current' THEN 0 ELSE 1 END")
                    ->latest('updated_at'),
            ])
            ->withCount([
                'followers',
                'posts as posts_count' => fn (Builder $query) => $query->whereNotNull('published_at'),
                'shelfEntries as shared_titles_count' => fn (Builder $query) => $viewerSubjectIds->isEmpty()
                    ? $query->whereRaw('1 = 0')
                    : $query->whereIn('subject_id', $viewerSubjectIds),
                'followers as mutual_connections_count' => fn (Builder $query) => $viewerFollowingIds->isEmpty()
                    ? $query->whereRaw('1 = 0')
                    : $query->whereIn('users.id', $viewerFollowingIds),
            ])
            ->withExists([
                'followers as followed_by_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
                'following as follows_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
                'pendingFollowers as follow_request_pending' => fn (Builder $query) => $query->whereKey($viewer->id),
                'pendingFollowing as incoming_follow_request' => fn (Builder $query) => $query->whereKey($viewer->id),
            ]);
    }
}
