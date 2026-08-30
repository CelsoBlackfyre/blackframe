<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDirectMessageRequest;
use App\Models\Conversation;
use App\Services\DirectConversationService;
use Illuminate\Http\RedirectResponse;

class DirectMessageController extends Controller
{
    public function store(
        StoreDirectMessageRequest $request,
        Conversation $conversation,
        DirectConversationService $direct,
    ): RedirectResponse {
        $direct->send($conversation, $request->user(), $request->string('body')->toString());

        return back();
    }
}
