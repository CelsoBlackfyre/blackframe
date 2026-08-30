<?php

namespace App\Http\Controllers;

use App\Enums\PeopleView;
use App\Http\Requests\IndexPeopleRequest;
use App\Models\User;
use App\Services\PeopleSearchService;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function __invoke(IndexPeopleRequest $request, PeopleSearchService $peopleSearch): Response
    {
        $viewer = $request->user();
        $view = PeopleView::from($request->string('view')->toString());
        $term = $request->validated('query');

        $people = $peopleSearch->search($viewer, $view, $term)->through(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'followers_count' => $user->followers_count,
            'posts_count' => $user->posts_count,
            'is_following' => (bool) $user->followed_by_viewer,
            'follows_you' => (bool) $user->follows_viewer,
        ]);

        return Inertia::render('people/index', [
            'people' => $people,
            'filters' => [
                'view' => $view->value,
                'query' => $term ?? '',
            ],
            'network' => [
                'followers_count' => $viewer->followers()->count(),
                'following_count' => $viewer->following()->count(),
            ],
        ]);
    }
}
