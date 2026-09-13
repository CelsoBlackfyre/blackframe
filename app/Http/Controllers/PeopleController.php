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
        $view = $request->enum('view', PeopleView::class) ?? PeopleView::Discover;
        $term = $request->validated('query');

        $people = $peopleSearch->search($viewer, $view, $term)
            ->through(fn (User $user) => $peopleSearch->present($viewer, $user));
        $followRequests = $peopleSearch->pendingRequests($viewer)
            ->map(fn (User $user) => $peopleSearch->present($viewer, $user));

        return Inertia::render('people/index', [
            'people' => $people,
            'follow_requests' => $followRequests,
            'filters' => [
                'view' => $view->value,
                'query' => $term ?? '',
            ],
            'network' => [
                'followers_count' => $viewer->followers()->count(),
                'following_count' => $viewer->following()->count(),
                'follow_requests_count' => $viewer->pendingFollowers()->count(),
            ],
        ]);
    }
}
