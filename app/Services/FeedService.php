<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class FeedService
{
    public function for(User $viewer, int $perPage = 8): LengthAwarePaginator
    {
        return $this->timelineFor($viewer)
            ->whereIn('type', ['image', 'carousel'])
            ->with([
                'user:id,name,username,avatar_path',
                'media',
                'subjects:id,name,slug,type',
                'comments' => fn ($query) => $query->with('user:id,name,username')->limit(2),
            ])
            ->withCount(['likes', 'comments'])
            ->withExists([
                'likes as liked_by_viewer' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->latest('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function pulseFor(User $viewer, int $perPage = 12): LengthAwarePaginator
    {
        return $this->timelineFor($viewer)
            ->where('type', 'text')
            ->with(['user:id,name,username,avatar_path', 'subjects:id,name,slug,type'])
            ->withCount(['likes', 'comments'])
            ->withExists([
                'likes as liked_by_viewer' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->latest('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    private function timelineFor(User $viewer): Builder
    {
        $visibleUserIds = $viewer->following()->pluck('users.id')->push($viewer->id);

        return Post::query()
            ->whereIn('user_id', $visibleUserIds)
            ->whereNotNull('published_at');
    }
}
