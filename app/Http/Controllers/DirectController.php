<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use App\Models\UserSubject;
use App\Services\DirectConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DirectController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->render($request->user());
    }

    public function show(
        Request $request,
        Conversation $conversation,
        DirectConversationService $direct,
    ): Response {
        $viewer = $request->user();
        Gate::authorize('view', $conversation);
        $direct->markRead($conversation, $viewer);

        return $this->render($viewer, $conversation);
    }

    private function render(User $viewer, ?Conversation $activeConversation = null): Response
    {
        $conversations = $viewer->conversations()
            ->with([
                'participants:id,name,username,bio,avatar_path',
                'latestMessage.author:id,name,username,avatar_path',
            ])
            ->orderByRaw('conversations.last_message_at desc nulls last')
            ->orderByDesc('conversations.id')
            ->get()
            ->filter(fn (Conversation $conversation) => $this->otherParticipant($conversation, $viewer) !== null)
            ->map(fn (Conversation $conversation) => $this->presentConversation($conversation, $viewer))
            ->values();

        $active = null;

        if ($activeConversation) {
            $activeConversation->load('participants:id,name,username,bio,avatar_path');
            $other = $this->otherParticipant($activeConversation, $viewer);

            if ($other) {
                $messages = $activeConversation->messages()
                    ->with('author:id,name,username,avatar_path')
                    ->latest('id')
                    ->limit(100)
                    ->get()
                    ->reverse()
                    ->values();

                $active = [
                    'id' => $activeConversation->id,
                    'person' => $this->presentPerson($other),
                    'messages' => $messages->map(fn ($message) => [
                        'id' => $message->id,
                        'body' => $message->body,
                        'created_at' => $message->created_at->toIso8601String(),
                        'is_mine' => $message->user_id === $viewer->id,
                        'author' => $this->presentPerson($message->author),
                    ])->values(),
                    'shared_subjects' => $this->sharedSubjects($viewer, $other),
                ];
            }
        }

        return Inertia::render('direct/index', [
            'conversations' => $conversations,
            'active' => $active,
        ]);
    }

    private function otherParticipant(Conversation $conversation, User $viewer): ?User
    {
        return $conversation->participants->first(fn (User $participant) => ! $participant->is($viewer));
    }

    /**
     * @return array<string, mixed>
     */
    private function presentConversation(Conversation $conversation, User $viewer): array
    {
        $other = $this->otherParticipant($conversation, $viewer);
        $latest = $conversation->latestMessage;

        return [
            'id' => $conversation->id,
            'person' => $this->presentPerson($other),
            'last_message' => $latest ? [
                'body' => $latest->body,
                'created_at' => $latest->created_at->toIso8601String(),
                'is_mine' => $latest->user_id === $viewer->id,
            ] : null,
            'unread_count' => (int) $conversation->pivot->unread_count,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentPerson(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function sharedSubjects(User $viewer, User $other): Collection
    {
        if (! $viewer->canViewContentFrom($other)) {
            return collect();
        }

        return UserSubject::query()
            ->where('user_id', $other->id)
            ->sharedWith($viewer)
            ->with('subject:id,name,slug,type,image_url')
            ->limit(3)
            ->get()
            ->map(fn (UserSubject $entry) => [
                'id' => $entry->subject->id,
                'name' => $entry->subject->name,
                'type_label' => $entry->subject->type->label(),
                'image_url' => $entry->subject->image_url,
            ]);
    }
}
