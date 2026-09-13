<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

// The authenticated user is injected as the first callback argument and must
// stay untyped; only the channel placeholders get model bindings.
Broadcast::channel('App.Models.User.{id}', function ($user, int $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversation}', function ($user, Conversation $conversation) {
    return $user->can('view', $conversation);
});
