<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserSubject;

class UserSubjectPolicy
{
    public function update(User $user, UserSubject $shelfEntry): bool
    {
        return $shelfEntry->user_id === $user->id;
    }

    public function delete(User $user, UserSubject $shelfEntry): bool
    {
        return $shelfEntry->user_id === $user->id;
    }
}
