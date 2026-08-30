<?php

namespace App\Services;

use App\Enums\PeopleView;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PeopleSearchService
{
    public function search(User $viewer, PeopleView $view, ?string $term = null, int $perPage = 12): LengthAwarePaginator
    {
        $normalizedTerm = ltrim(mb_strtolower(trim((string) $term)), '@');

        $query = User::query()
            ->select(['users.id', 'users.name', 'users.username', 'users.bio', 'users.avatar_path'])
            ->whereKeyNot($viewer->id)
            ->withCount([
                'followers',
                'posts as posts_count' => fn (Builder $query) => $query->whereNotNull('published_at'),
            ])
            ->withExists([
                'followers as followed_by_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
                'following as follows_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
            ]);

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
}
