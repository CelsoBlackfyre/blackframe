<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DirectConversationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DirectConversationController extends Controller
{
    public function store(Request $request, User $user, DirectConversationService $direct): RedirectResponse
    {
        $viewer = $request->user();

        if (! $direct->canStart($viewer, $user)) {
            throw ValidationException::withMessages([
                'person' => __('Direct conversations open after both people choose Connect in Shelf Match.'),
            ]);
        }

        $conversation = $direct->findOrCreate($viewer, $user);

        return to_route('direct.show', $conversation);
    }
}
