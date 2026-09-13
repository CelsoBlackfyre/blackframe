<?php

namespace App\Services;

use App\Enums\MatchDecisionType;
use App\Models\Conversation;
use App\Models\MatchDecision;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class DirectConversationService
{
    public function canStart(User $viewer, User $other): bool
    {
        if ($viewer->is($other)) {
            return false;
        }

        return MatchDecision::query()
            ->where('user_id', $viewer->id)
            ->where('target_user_id', $other->id)
            ->where('decision', MatchDecisionType::Connect->value)
            ->exists()
            && MatchDecision::query()
                ->where('user_id', $other->id)
                ->where('target_user_id', $viewer->id)
                ->where('decision', MatchDecisionType::Connect->value)
                ->exists();
    }

    public function findOrCreate(User $viewer, User $other): Conversation
    {
        // Two users starting a conversation at the same moment can both miss the
        // firstOrCreate SELECT; the unique direct_key index then rejects one
        // insert, and retrying re-runs the SELECT against the winner's row.
        return retry(
            times: 2,
            callback: fn (): Conversation => DB::transaction(function () use ($viewer, $other): Conversation {
                $conversation = Conversation::query()->firstOrCreate([
                    'direct_key' => $this->directKey($viewer, $other),
                ]);

                $conversation->participants()->syncWithoutDetaching([
                    $viewer->id => ['last_read_at' => now(), 'unread_count' => 0],
                    $other->id => ['last_read_at' => null, 'unread_count' => 0],
                ]);

                return $conversation;
            }),
            when: fn (Throwable $exception): bool => $exception instanceof UniqueConstraintViolationException,
            sleepMilliseconds: 50,
        );
    }

    public function send(Conversation $conversation, User $author, string $body): Message
    {
        return DB::transaction(function () use ($conversation, $author, $body): Message {
            $message = $conversation->messages()->create([
                'user_id' => $author->id,
                'body' => trim($body),
            ]);

            $conversation->update(['last_message_at' => $message->created_at]);

            DB::table('conversation_user')
                ->where('conversation_id', $conversation->id)
                ->where('user_id', '!=', $author->id)
                ->increment('unread_count');

            DB::table('conversation_user')
                ->where('conversation_id', $conversation->id)
                ->where('user_id', $author->id)
                ->update([
                    'last_read_at' => $message->created_at,
                    'unread_count' => 0,
                    'updated_at' => now(),
                ]);

            return $message;
        });
    }

    public function markRead(Conversation $conversation, User $viewer): void
    {
        DB::table('conversation_user')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $viewer->id)
            ->update([
                'last_read_at' => now(),
                'unread_count' => 0,
                'updated_at' => now(),
            ]);
    }

    private function directKey(User $first, User $second): string
    {
        return collect([$first->id, $second->id])->sort()->implode(':');
    }
}
