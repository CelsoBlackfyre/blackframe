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
                'target' => __('You cannot match with your own profile.'),
            ]);
        }

        if (! $compatibility->isVisibleTo($viewer, $user)) {
            throw ValidationException::withMessages([
                'target' => __('This private profile is not available for matching.'),
            ]);
        }

        if (! $compatibility->sharesShelfTitle($viewer, $user)) {
            throw ValidationException::withMessages([
                'target' => __('This profile does not share a shelf title with you yet.'),
            ]);
        }

        $decision = $request->enum('decision', MatchDecisionType::class) ?? abort(400, __('Invalid match decision.'));

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
                ? __('You and :name matched.', ['name' => $user->name])
                : ($decision === MatchDecisionType::Connect
                    ? __('Connection sent to :name.', ['name' => $user->name])
                    : __('Passed on :name for now.', ['name' => $user->name])),
        );
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->user()
            ->matchDecisions()
            ->where('target_user_id', $user->id)
            ->delete();

        return back()->with('success', __('Your choice for :name was undone.', ['name' => $user->name]));
    }
}
