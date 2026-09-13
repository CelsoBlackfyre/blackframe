<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class MessageSent implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  Collection<int, User>  $recipients
     */
    public function __construct(
        public Message $message,
        public Conversation $conversation,
        public Collection $recipients,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('conversation.'.$this->conversation->id)];

        foreach ($this->recipients as $recipient) {
            $channels[] = new PrivateChannel('App.Models.User.'.$recipient->id);
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $author = $this->message->author;

        return [
            'id' => $this->message->id,
            'conversation_id' => $this->conversation->id,
            'body' => $this->message->body,
            'created_at' => $this->message->created_at->toIso8601String(),
            'author' => [
                'id' => $author->id,
                'name' => $author->name,
                'username' => $author->username,
                'avatar_url' => $author->avatar_url,
            ],
        ];
    }
}
