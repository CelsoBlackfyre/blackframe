<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function index(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        return response()->json($post->comments()
            ->whereHas('user')
            ->with('user:id,name,username,avatar_path')
            ->reorder('id', 'desc')
            ->paginate(20)
            ->through(fn (Comment $comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'published_at' => $comment->created_at->diffForHumans(short: true),
                'can_delete' => in_array($request->user()->id, [$comment->user_id, $post->user_id], true),
                'author' => [
                    'name' => $comment->user->name,
                    'username' => $comment->user->username,
                    'avatar_url' => $comment->user->avatar_url,
                ],
            ]));
    }

    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return back();
    }

    public function destroy(Request $request, Post $post, Comment $comment): RedirectResponse
    {
        Gate::authorize('interact', $post);
        abort_unless($comment->post_id === $post->id, 404);
        abort_unless(in_array($request->user()->id, [$comment->user_id, $post->user_id], true), 403);

        $comment->delete();

        return back();
    }
}
