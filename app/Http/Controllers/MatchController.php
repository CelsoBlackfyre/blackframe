<?php

namespace App\Http\Controllers;

use App\Enums\MatchView;
use App\Http\Requests\IndexMatchesRequest;
use App\Services\MatchCompatibilityService;
use Inertia\Inertia;
use Inertia\Response;

class MatchController extends Controller
{
    public function __invoke(IndexMatchesRequest $request, MatchCompatibilityService $compatibility): Response
    {
        $viewer = $request->user();
        $view = $request->enum('view', MatchView::class) ?? MatchView::Discover;
        $candidates = $view === MatchView::Connections
            ? $compatibility->connections($viewer)
            : $compatibility->discover($viewer);

        return Inertia::render('matches/index', [
            'candidates' => $candidates,
            'filters' => ['view' => $view->value],
            'summary' => [
                'shelf_count' => $viewer->shelfEntries()->count(),
                'remaining_count' => $view === MatchView::Discover ? $candidates->count() : null,
                'connections_count' => $view === MatchView::Connections
                    ? $candidates->count()
                    : $compatibility->connectionsCount($viewer),
            ],
            'score_model' => [
                ['label' => 'Collection overlap', 'weight' => 55],
                ['label' => 'Shared favorites', 'weight' => 20],
                ['label' => 'Same shelf status', 'weight' => 15],
                ['label' => 'Rating closeness', 'weight' => 10],
            ],
        ]);
    }
}
