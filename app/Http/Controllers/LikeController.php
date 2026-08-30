<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LikeController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('interact', $post);

        $post->likes()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return back();
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('interact', $post);

        $post->likes()->where('user_id', $request->user()->id)->delete();

        return back();
    }
}
