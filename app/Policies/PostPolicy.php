<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    public function create(User $user): bool
    {
        return ! $user->trashed();
    }

    public function view(User $user, Post $post): Response
    {
        $author = $post->user;

        return $post->published_at !== null
            && $post->published_at->lte(now())
            && $author !== null
            && $user->canViewContentFrom($author)
                ? Response::allow()
                : Response::denyAsNotFound();
    }

    public function interact(User $user, Post $post): Response
    {
        return $this->view($user, $post);
    }

    public function delete(User $user, Post $post): bool
    {
        return $post->user_id === $user->id;
    }
}
