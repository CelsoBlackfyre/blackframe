<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FollowController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        $viewer = $request->user();

        if ($viewer->is($user)) {
            throw ValidationException::withMessages([
                'person' => __('You cannot follow yourself.'),
            ]);
        }

        $existing = DB::table('follows')
            ->where('follower_id', $viewer->id)
            ->where('following_id', $user->id)
            ->first();

        if ($existing?->accepted_at !== null) {
            return back();
        }

        if ($existing && ! $user->is_private) {
            DB::table('follows')
                ->where('follower_id', $viewer->id)
                ->where('following_id', $user->id)
                ->update([
                    'accepted_at' => now(),
                    'updated_at' => now(),
                ]);
        } elseif (! $existing) {
            DB::table('follows')->insertOrIgnore([
                'follower_id' => $viewer->id,
                'following_id' => $user->id,
                'accepted_at' => $user->is_private ? null : now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($user->is_private) {
            return back()->with('success', __('Follow request sent to :username.', ['username' => $user->username]));
        }

        return back()->with('success', __('You are now following :username.', ['username' => $user->username]));
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        DB::table('follows')
            ->where('follower_id', $request->user()->id)
            ->where('following_id', $user->id)
            ->delete();

        return back()->with('success', __('Your relationship with :username was removed.', ['username' => $user->username]));
    }

    public function accept(Request $request, User $user): RedirectResponse
    {
        $updated = DB::table('follows')
            ->where('follower_id', $user->id)
            ->where('following_id', $request->user()->id)
            ->whereNull('accepted_at')
            ->update([
                'accepted_at' => now(),
                'updated_at' => now(),
            ]);

        if ($updated === 0) {
            $exists = DB::table('follows')
                ->where('follower_id', $user->id)
                ->where('following_id', $request->user()->id)
                ->exists();

            abort_unless($exists, 404);

            return back();
        }

        return back()->with('success', __('You accepted :username\'s follow request.', ['username' => $user->username]));
    }

    public function decline(Request $request, User $user): RedirectResponse
    {
        $deleted = DB::table('follows')
            ->where('follower_id', $user->id)
            ->where('following_id', $request->user()->id)
            ->whereNull('accepted_at')
            ->delete();

        abort_unless($deleted === 1, 404);

        return back()->with('success', __('Follow request declined.'));
    }
}
