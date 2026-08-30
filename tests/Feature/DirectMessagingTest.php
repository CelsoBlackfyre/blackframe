<?php

namespace Tests\Feature;

use App\Enums\MatchDecisionType;
use App\Models\Conversation;
use App\Models\Subject;
use App\Models\User;
use App\Services\DirectConversationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DirectMessagingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_direct_messaging(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::query()->create(['direct_key' => '1:2']);

        $this->get('/direct')->assertRedirect('/login');
        $this->get("/direct/{$conversation->id}")->assertRedirect('/login');
        $this->post("/direct/{$user->id}")->assertRedirect('/login');
        $this->post("/direct/{$conversation->id}/messages", ['body' => 'Hello'])->assertRedirect('/login');
    }

    public function test_only_mutual_shelf_matches_can_start_an_idempotent_conversation(): void
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($viewer)
            ->post("/direct/{$other->id}")
            ->assertSessionHasErrors('person');

        $this->connectMutually($viewer, $other);

        $this->actingAs($viewer)->post("/direct/{$other->id}")->assertRedirect();
        $this->actingAs($viewer)->post("/direct/{$other->id}")->assertRedirect();

        $conversation = Conversation::query()->sole();
        $this->assertDatabaseCount('conversations', 1);
        $this->assertDatabaseCount('conversation_user', 2);
        $this->assertDatabaseHas('conversation_user', ['conversation_id' => $conversation->id, 'user_id' => $viewer->id]);
        $this->assertDatabaseHas('conversation_user', ['conversation_id' => $conversation->id, 'user_id' => $other->id]);
    }

    public function test_only_participants_can_open_a_conversation(): void
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();
        $outsider = User::factory()->create();
        $conversation = $this->conversationBetween($viewer, $other);

        $this->actingAs($outsider)
            ->get("/direct/{$conversation->id}")
            ->assertForbidden();

        $this->actingAs($viewer)
            ->get("/direct/{$conversation->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('direct/index')
                ->where('active.id', $conversation->id)
                ->where('active.person.id', $other->id)
                ->has('conversations', 1)
            );
    }

    public function test_participants_can_send_validated_messages_and_unread_counts_are_updated(): void
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();
        $outsider = User::factory()->create();
        $conversation = $this->conversationBetween($viewer, $other);

        $this->actingAs($viewer)
            ->post("/direct/{$conversation->id}/messages", ['body' => '   '])
            ->assertSessionHasErrors('body');

        $this->actingAs($viewer)
            ->post("/direct/{$conversation->id}/messages", ['body' => '  We should compare our endings.  '])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'user_id' => $viewer->id,
            'body' => 'We should compare our endings.',
        ]);
        $this->assertDatabaseHas('conversation_user', [
            'conversation_id' => $conversation->id,
            'user_id' => $viewer->id,
            'unread_count' => 0,
        ]);
        $this->assertDatabaseHas('conversation_user', [
            'conversation_id' => $conversation->id,
            'user_id' => $other->id,
            'unread_count' => 1,
        ]);

        $this->actingAs($outsider)
            ->post("/direct/{$conversation->id}/messages", ['body' => 'Not allowed'])
            ->assertForbidden();
    }

    public function test_opening_a_conversation_marks_messages_read_and_preserves_shelf_context(): void
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();
        $subject = Subject::factory()->create(['name' => 'Shared World']);
        $viewer->shelfEntries()->create(['subject_id' => $subject->id, 'status' => 'current']);
        $other->shelfEntries()->create(['subject_id' => $subject->id, 'status' => 'completed']);
        $conversation = $this->conversationBetween($viewer, $other);

        app(DirectConversationService::class)->send($conversation, $other, 'What did you think?');

        $this->actingAs($viewer)
            ->get("/direct/{$conversation->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('direct.unread_count', 0)
                ->has('active.messages', 1)
                ->where('active.messages.0.body', 'What did you think?')
                ->where('active.messages.0.is_mine', false)
                ->has('active.shared_subjects', 1)
                ->where('active.shared_subjects.0.name', 'Shared World')
            );

        $this->assertDatabaseHas('conversation_user', [
            'conversation_id' => $conversation->id,
            'user_id' => $viewer->id,
            'unread_count' => 0,
        ]);
    }

    public function test_inbox_is_ordered_by_recent_activity_and_exposes_unread_state(): void
    {
        $viewer = User::factory()->create();
        $first = User::factory()->create(['name' => 'First Person']);
        $recent = User::factory()->create(['name' => 'Recent Person']);
        $empty = User::factory()->create(['name' => 'No Messages Yet']);
        $firstConversation = $this->conversationBetween($viewer, $first);
        $recentConversation = $this->conversationBetween($viewer, $recent);
        $service = app(DirectConversationService::class);

        $service->send($firstConversation, $first, 'Earlier message');
        $this->travel(1)->second();
        $service->send($recentConversation, $recent, 'Most recent message');
        $emptyConversation = $this->conversationBetween($viewer, $empty);

        $this->actingAs($viewer)
            ->get('/direct')
            ->assertInertia(fn (Assert $page) => $page
                ->where('direct.unread_count', 2)
                ->has('conversations', 3)
                ->where('conversations.0.id', $recentConversation->id)
                ->where('conversations.0.person.id', $recent->id)
                ->where('conversations.0.last_message.body', 'Most recent message')
                ->where('conversations.0.unread_count', 1)
                ->where('conversations.1.id', $firstConversation->id)
                ->where('conversations.2.id', $emptyConversation->id)
                ->where('conversations.2.last_message', null)
            );
    }

    private function connectMutually(User $first, User $second): void
    {
        $first->matchDecisions()->create([
            'target_user_id' => $second->id,
            'decision' => MatchDecisionType::Connect,
        ]);
        $second->matchDecisions()->create([
            'target_user_id' => $first->id,
            'decision' => MatchDecisionType::Connect,
        ]);
    }

    private function conversationBetween(User $first, User $second): Conversation
    {
        $this->connectMutually($first, $second);

        return app(DirectConversationService::class)->findOrCreate($first, $second);
    }
}
