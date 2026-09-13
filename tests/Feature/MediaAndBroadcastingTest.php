<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaAndBroadcastingTest extends TestCase
{
    use RefreshDatabase;

    public function test_publishing_an_image_generates_webp_variants(): void
    {
        Storage::fake('post-media');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/posts', [
                'type' => 'image',
                'alt_text' => 'Warm afternoon light crossing a concrete studio floor.',
                'media' => UploadedFile::fake()->image('studio.jpg', 1600, 1200),
            ])
            ->assertRedirect(route('feed'));

        $post = Post::query()->whereBelongsTo($user)->sole();
        $media = Media::query()->whereMorphedTo('mediaable', $post)->sole();

        $variants = $media->variants();

        $this->assertArrayHasKey('thumb', $variants);
        $this->assertArrayHasKey('medium', $variants);
        $this->assertLessThanOrEqual(480, $variants['thumb']['width']);
        $this->assertLessThanOrEqual(1200, $variants['medium']['width']);

        foreach ($variants as $variant) {
            $this->assertTrue(Storage::disk('post-media')->exists($variant['path']));
            $this->assertStringEndsWith('.webp', $variant['path']);
        }

        $this->assertStringContainsString('variant=thumb', $media->thumb_url);
        $this->assertStringContainsString('variant=medium', $media->medium_url);
    }

    public function test_authorized_viewers_can_load_variants_of_visible_posts(): void
    {
        Storage::fake('post-media');
        $author = User::factory()->create();
        $viewer = User::factory()->create();

        $this->actingAs($author)
            ->post('/posts', [
                'type' => 'image',
                'alt_text' => 'A test image.',
                'media' => UploadedFile::fake()->image('studio.jpg', 1600, 1200),
            ]);

        $post = Post::query()->whereBelongsTo($author)->sole();
        $media = Media::query()->whereMorphedTo('mediaable', $post)->sole();

        $response = $this->actingAs($viewer)
            ->get(route('posts.media.show', ['post' => $post, 'media' => $media]).'?variant=thumb')
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp');

        $this->assertStringContainsString('immutable', (string) $response->headers->get('Cache-Control'));

        $this->actingAs($viewer)
            ->get(route('posts.media.show', ['post' => $post, 'media' => $media]).'?variant=thumbnail')
            ->assertNotFound();
    }

    public function test_sending_a_message_broadcasts_to_the_conversation_and_each_recipient(): void
    {
        Event::fake([MessageSent::class]);

        $author = User::factory()->create();
        $recipient = User::factory()->create();

        $author->matchDecisions()->create(['target_user_id' => $recipient->id, 'decision' => 'connect']);
        $recipient->matchDecisions()->create(['target_user_id' => $author->id, 'decision' => 'connect']);

        $conversation = $this->actingAs($author)->post(route('direct.start', $recipient));
        $conversationId = $conversation->headers->get('Location');
        $conversationId = (int) substr($conversationId, (int) strrpos($conversationId, '/') + 1);

        $this->actingAs($author)->post(route('direct.messages.store', $conversationId), [
            'body' => 'A message worth receiving in real time.',
        ])->assertRedirect();

        Event::assertDispatched(MessageSent::class, function (MessageSent $event) use ($author, $recipient, $conversationId) {
            $this->assertSame($conversationId, $event->conversation->id);
            $this->assertSame('A message worth receiving in real time.', $event->broadcastWith()['body']);

            $channelNames = array_map(fn ($channel) => $channel->name, $event->broadcastOn());

            $this->assertContains('private-conversation.'.$conversationId, $channelNames);
            $this->assertContains('private-App.Models.User.'.$recipient->id, $channelNames);
            $this->assertNotContains('private-App.Models.User.'.$author->id, $channelNames);

            return true;
        });
    }

    public function test_only_conversation_participants_can_authorize_its_channel(): void
    {
        // The log broadcaster authorizes every request, so assert against the
        // real channel callbacks through the reverb broadcaster. Channel
        // callbacks attach to the boot-time driver, so they must be required
        // again after swapping the connection.
        config(['broadcasting.default' => 'reverb']);
        require base_path('routes/channels.php');

        $author = User::factory()->create();
        $recipient = User::factory()->create();
        $outsider = User::factory()->create();

        $author->matchDecisions()->create(['target_user_id' => $recipient->id, 'decision' => 'connect']);
        $recipient->matchDecisions()->create(['target_user_id' => $author->id, 'decision' => 'connect']);

        $this->actingAs($author)->post(route('direct.start', $recipient));

        $conversationId = $author->conversations()->sole()->id;
        $channelName = 'private-conversation.'.$conversationId;

        $this->actingAs($recipient)
            ->post('/broadcasting/auth', ['channel_name' => $channelName, 'socket_id' => '1234.1234'])
            ->assertOk();

        $this->actingAs($outsider)
            ->post('/broadcasting/auth', ['channel_name' => $channelName, 'socket_id' => '1234.1234'])
            ->assertForbidden();
    }
}
