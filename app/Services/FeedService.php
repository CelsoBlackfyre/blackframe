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
                'comments' => fn ($query) => $query->whereHas('user')->with('user:id,name,username')->reorder('id', 'desc')->limit(2),
            ])
            ->withCount(['likes', 'comments' => fn ($query) => $query->whereHas('user')])
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
            ->withCount(['likes', 'comments' => fn ($query) => $query->whereHas('user')])
            ->withExists([
                'likes as liked_by_viewer' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->latest('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    private function timelineFor(User $viewer): Builder
    {
        return Post::query()
            ->where(fn (Builder $query) => $query
                ->where('user_id', $viewer->id)
                ->orWhereIn('user_id', $viewer->following()->select('users.id')))
            ->whereHas('user')
            ->where('published_at', '<=', now());
    }
}
