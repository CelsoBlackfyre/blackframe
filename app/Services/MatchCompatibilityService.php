<?php

namespace App\Services;

use App\Enums\MatchDecisionType;
use App\Models\User;
use App\Models\UserSubject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class MatchCompatibilityService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function discover(User $viewer, int $limit = 12): Collection
    {
        $viewer->loadMissing('shelfEntries.subject');
        $viewerSubjectIds = $viewer->shelfEntries->pluck('subject_id');

        if ($viewerSubjectIds->isEmpty()) {
            return collect();
        }

        return $this->candidateQuery($viewer)
            ->whereDoesntHave(
                'receivedMatchDecisions',
                fn (Builder $query) => $query->where('user_id', $viewer->id),
            )
            ->whereHas(
                'shelfEntries',
                fn (Builder $query) => $query->whereIn('subject_id', $viewerSubjectIds),
            )
            ->get()
            ->map(fn (User $candidate) => $this->present($viewer, $candidate))
            ->sortByDesc(fn (array $candidate) => [$candidate['compatibility']['score'], $candidate['compatibility']['shared_count']])
            ->take($limit)
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function connections(User $viewer): Collection
    {
        $viewer->loadMissing('shelfEntries.subject');

        return $this->connectionsQuery($viewer)
            ->get()
            ->map(fn (User $candidate) => $this->present($viewer, $candidate))
            ->sortByDesc(fn (array $candidate) => [$candidate['compatibility']['score'], $candidate['compatibility']['shared_count']])
            ->values();
    }

    public function connectionsCount(User $viewer): int
    {
        return $this->connectionsQuery($viewer)->count();
    }

    private function connectionsQuery(User $viewer): Builder
    {
        return $this->candidateQuery($viewer)
            ->whereHas(
                'matchDecisions',
                fn (Builder $query) => $query
                    ->where('target_user_id', $viewer->id)
                    ->where('decision', MatchDecisionType::Connect->value),
            )
            ->whereHas(
                'receivedMatchDecisions',
                fn (Builder $query) => $query
                    ->where('user_id', $viewer->id)
                    ->where('decision', MatchDecisionType::Connect->value),
            );
    }

    public function sharesShelfTitle(User $viewer, User $candidate): bool
    {
        return UserSubject::query()
            ->where('user_id', $candidate->id)
            ->sharedWith($viewer)
            ->exists();
    }

    public function isVisibleTo(User $viewer, User $candidate): bool
    {
        return $viewer->canViewContentFrom($candidate);
    }

    private function candidateQuery(User $viewer): Builder
    {
        return User::query()
            ->select(['users.id', 'users.name', 'users.username', 'users.bio', 'users.avatar_path', 'users.is_private'])
            ->whereKeyNot($viewer->id)
            ->where(fn (Builder $query) => $query
                ->where('users.is_private', false)
                ->orWhereHas(
                    'followers',
                    fn (Builder $followers) => $followers->whereKey($viewer->id),
                ))
            ->with([
                'shelfEntries' => fn ($query) => $query
                    ->select(['id', 'user_id', 'subject_id', 'status', 'favorite', 'rating'])
                    ->with('subject:id,name,slug,type,image_url'),
            ])
            ->withExists([
                'followers as followed_by_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
                'following as follows_viewer' => fn (Builder $query) => $query->whereKey($viewer->id),
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(User $viewer, User $candidate): array
    {
        $viewerEntries = $viewer->shelfEntries->keyBy('subject_id');
        $candidateEntries = $candidate->shelfEntries->keyBy('subject_id');
        $sharedIds = $viewerEntries->keys()->intersect($candidateEntries->keys());
        $unionCount = $viewerEntries->keys()->merge($candidateEntries->keys())->unique()->count();

        $shared = $sharedIds->map(function (int $subjectId) use ($viewerEntries, $candidateEntries): array {
            $viewerEntry = $viewerEntries->get($subjectId);
            $candidateEntry = $candidateEntries->get($subjectId);
            $subject = $viewerEntry->subject;

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'slug' => $subject->slug,
                'type' => $subject->type->value,
                'type_label' => $subject->type->label(),
                'image_url' => $subject->image_url,
                'viewer_status' => $viewerEntry->status->value,
                'candidate_status' => $candidateEntry->status->value,
                'both_favorite' => $viewerEntry->favorite && $candidateEntry->favorite,
                'same_status' => $viewerEntry->status === $candidateEntry->status,
                'rating_gap' => $viewerEntry->rating !== null && $candidateEntry->rating !== null
                    ? round(abs((float) $viewerEntry->rating - (float) $candidateEntry->rating), 1)
                    : null,
            ];
        });

        $sharedCount = $shared->count();
        $sharedFavorites = $shared->where('both_favorite', true)->count();
        $sameStatus = $shared->where('same_status', true)->count();
        $viewerFavoriteCount = max(1, $viewer->shelfEntries->where('favorite', true)->count());
        $ratedPairs = $shared->whereNotNull('rating_gap');
        $ratingCloseness = $ratedPairs->isEmpty()
            ? 0
            : $ratedPairs->avg(fn (array $item) => max(0, 1 - ($item['rating_gap'] / 9)));

        $score = (int) round(min(100,
            (55 * ($unionCount > 0 ? $sharedCount / $unionCount : 0))
            + (20 * ($sharedFavorites / $viewerFavoriteCount))
            + (15 * ($sharedCount > 0 ? $sameStatus / $sharedCount : 0))
            + (10 * $ratingCloseness)
        ));

        $orderedShared = $shared
            ->sortByDesc(fn (array $item) => [$item['both_favorite'], $item['same_status']])
            ->values();

        return [
            'id' => $candidate->id,
            'name' => $candidate->name,
            'username' => $candidate->username,
            'bio' => $candidate->bio,
            'avatar_url' => $candidate->avatar_url,
            'is_following' => (bool) $candidate->followed_by_viewer,
            'follows_you' => (bool) $candidate->follows_viewer,
            'compatibility' => [
                'score' => $score,
                'shared_count' => $sharedCount,
                'shared_favorites_count' => $sharedFavorites,
                'same_status_count' => $sameStatus,
                'rated_pairs_count' => $ratedPairs->count(),
                'type_affinities' => $orderedShared->pluck('type_label')->unique()->take(3)->values(),
                'shared_subjects' => $orderedShared->take(5)->values(),
            ],
        ];
    }
}
