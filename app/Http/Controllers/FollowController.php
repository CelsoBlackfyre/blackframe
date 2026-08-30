<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot follow yourself.');

        $request->user()->following()->syncWithoutDetaching($user->id);

        return back()->with('success', 'You are now following '.$user->username.'.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->user()->following()->detach($user->id);

        return back()->with('success', 'You unfollowed '.$user->username.'.');
    }
}
