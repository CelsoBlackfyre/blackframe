<?php

namespace App\Http\Controllers;

use App\Enums\MatchDecisionType;
use App\Http\Requests\StoreMatchDecisionRequest;
use App\Models\User;
use App\Services\MatchCompatibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MatchDecisionController extends Controller
{
    public function store(
        StoreMatchDecisionRequest $request,
        User $user,
        MatchCompatibilityService $compatibility,
    ): RedirectResponse {
        $viewer = $request->user();

        if ($viewer->is($user)) {
            throw ValidationException::withMessages([
                'target' => 'You cannot match with your own profile.',
            ]);
        }

        if (! $compatibility->isVisibleTo($viewer, $user)) {
            throw ValidationException::withMessages([
                'target' => 'This private profile is not available for matching.',
            ]);
        }

        if (! $compatibility->sharesShelfTitle($viewer, $user)) {
            throw ValidationException::withMessages([
                'target' => 'This profile does not share a shelf title with you yet.',
            ]);
        }

        $decision = $request->enum('decision', MatchDecisionType::class) ?? abort(400, 'Invalid match decision.');

        $viewer->matchDecisions()->updateOrCreate(
            ['target_user_id' => $user->id],
            ['decision' => $decision],
        );

        $isMutual = $decision === MatchDecisionType::Connect
            && $user->matchDecisions()
                ->where('target_user_id', $viewer->id)
                ->where('decision', MatchDecisionType::Connect->value)
                ->exists();

        return back()->with(
            'success',
            $isMutual
                ? "You and {$user->name} matched."
                : ($decision === MatchDecisionType::Connect
                    ? "Connection sent to {$user->name}."
                    : "Passed on {$user->name} for now."),
        );
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->user()
            ->matchDecisions()
            ->where('target_user_id', $user->id)
            ->delete();

        return back()->with('success', "Your choice for {$user->name} was undone.");
    }
}
