<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PostCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_open_or_submit_the_post_composer(): void
    {
        $this->get('/posts/create')->assertRedirect('/login');
        $this->post('/posts', ['type' => 'text', 'caption' => 'Hello'])->assertRedirect('/login');
    }

    public function test_authenticated_users_can_open_the_post_composer(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/posts/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('posts/create')
            );
    }

    public function test_user_can_publish_a_text_post_to_pulse(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/posts', [
                'type' => 'text',
                'caption' => 'One identity, a new kind of conversation.',
            ])
            ->assertRedirect(route('pulse'))
            ->assertSessionHas('success', 'Your Pulse post is live.');

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'type' => 'text',
            'caption' => 'One identity, a new kind of conversation.',
        ]);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_user_can_publish_a_validated_image_post(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/posts', [
                'type' => 'image',
                'caption' => 'Late light across the studio floor.',
                'location' => 'São Paulo, Brazil',
                'alt_text' => 'Warm afternoon light crossing a concrete studio floor.',
                'media' => UploadedFile::fake()->image('studio.jpg', 1200, 1500)->size(900),
            ])
            ->assertRedirect(route('feed'))
            ->assertSessionHas('success', 'Your photo is live.');

        $post = Post::query()->whereBelongsTo($user)->sole();
        $media = Media::query()->whereMorphedTo('mediaable', $post)->sole();

        $this->assertSame('image', $post->type);
        $this->assertSame('public', $media->disk);
        $this->assertSame(1200, $media->width);
        $this->assertSame(1500, $media->height);
        $this->assertSame('Warm afternoon light crossing a concrete studio floor.', $media->alt_text);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_type_specific_post_fields_are_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/posts', ['type' => 'text', 'caption' => ''])
            ->assertSessionHasErrors('caption');

        $this->actingAs($user)
            ->post('/posts', ['type' => 'image', 'caption' => 'Missing media'])
            ->assertSessionHasErrors(['media', 'alt_text']);
    }

    public function test_non_image_uploads_are_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/posts', [
                'type' => 'image',
                'caption' => 'This should fail.',
                'alt_text' => 'Not actually an image.',
                'media' => UploadedFile::fake()->create('document.pdf', 200, 'application/pdf'),
            ])
            ->assertSessionHasErrors('media');
    }

    public function test_post_can_be_attached_to_a_structured_subject(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['name' => 'Cyberpunk 2077']);

        $this->actingAs($user)
            ->post('/posts', [
                'type' => 'text',
                'caption' => 'Night City still has stories left to tell.',
                'subject_id' => $subject->id,
            ])
            ->assertRedirect(route('pulse'));

        $post = Post::query()->whereBelongsTo($user)->sole();

        $this->assertDatabaseHas('post_subject', [
            'post_id' => $post->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_post_rejects_an_unknown_subject(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/posts', [
                'type' => 'text',
                'caption' => 'This topic does not exist.',
                'subject_id' => 999999,
            ])
            ->assertSessionHasErrors('subject_id');
    }
}
