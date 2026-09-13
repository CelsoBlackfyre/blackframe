<?php

namespace App\Http\Controllers;

use App\Enums\ProfileConnectionList;
use App\Http\Requests\ShowConnectionsRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ProfileConnectionsController extends Controller
{
    public function __invoke(ShowConnectionsRequest $request, User $user): Response
    {
        $viewer = $request->user();
        $list = $request->enum('list', ProfileConnectionList::class) ?? ProfileConnectionList::Followers;
        $canViewConnections = $viewer->canViewContentFrom($user);

        $user->loadCount(['followers', 'following']);

        return Inertia::render('profiles/connections', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'is_private' => (bool) $user->is_private,
                'is_self' => $viewer->is($user),
                'can_view_connections' => $canViewConnections,
                'counts' => [
                    'followers' => (int) $user->followers_count,
                    'following' => (int) $user->following_count,
                ],
            ],
            'filters' => ['list' => $list->value],
            'connections' => $canViewConnections ? $this->connections($viewer, $user, $list) : null,
        ]);
    }

    private function connections(User $viewer, User $profile, ProfileConnectionList $list): LengthAwarePaginator
    {
        $query = $list === ProfileConnectionList::Followers
            ? $profile->followers()
            : $profile->following();

        return $query
            ->select(['users.id', 'users.name', 'users.username', 'users.bio', 'users.avatar_path', 'users.is_private'])
            ->withExists([
                'followers as followed_by_viewer' => fn ($query) => $query->whereKey($viewer->id),
                'following as follows_viewer' => fn ($query) => $query->whereKey($viewer->id),
                'pendingFollowers as follow_request_pending' => fn ($query) => $query->whereKey($viewer->id),
            ])
            ->orderByPivot('created_at', 'desc')
            ->orderBy('users.name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $connection) => [
                'id' => $connection->id,
                'name' => $connection->name,
                'username' => $connection->username,
                'bio' => $connection->bio,
                'avatar_url' => $connection->avatar_url,
                'is_private' => (bool) $connection->is_private,
                'is_viewer' => $connection->is($viewer),
                'is_following' => (bool) $connection->followed_by_viewer,
                'follows_you' => (bool) $connection->follows_viewer,
                'follow_request_pending' => (bool) $connection->follow_request_pending,
            ]);
    }
}
