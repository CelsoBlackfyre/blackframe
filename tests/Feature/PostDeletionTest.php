<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PostDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owner_can_delete_their_photo_post_with_its_files(): void
    {
        Storage::fake('post-media');

        $owner = User::factory()->create();
        $post = Post::factory()->for($owner)->create(['type' => 'image', 'published_at' => now()]);
        $media = $this->attachMedia($post);

        $this->actingAs($owner)
            ->from('/feed')
            ->delete(route('posts.destroy', $post))
            ->assertRedirect('/feed')
            ->assertSessionHas('success', 'Your photo was deleted.');

        $this->assertSoftDeleted($post);
        $this->assertSame(0, Post::count());
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('post-media')->assertMissing($media->path);

        foreach ($media->variants() as $variant) {
            Storage::disk('post-media')->assertMissing($variant['path']);
        }
    }

    public function test_the_owner_can_delete_their_pulse_message(): void
    {
        $owner = User::factory()->create();
        $post = Post::factory()->for($owner)->create(['type' => 'text', 'published_at' => now()]);

        $this->actingAs($owner)
            ->from('/pulse')
            ->delete(route('posts.destroy', $post))
            ->assertRedirect('/pulse')
            ->assertSessionHas('success', 'Your Pulse message was deleted.');

        $this->assertSoftDeleted($post);
        $this->assertSame(0, Post::count());
    }

    public function test_deleting_a_post_leaves_other_posts_and_their_files_untouched(): void
    {
        Storage::fake('post-media');

        $owner = User::factory()->create();
        $removed = Post::factory()->for($owner)->create(['type' => 'image', 'published_at' => now()]);
        $kept = Post::factory()->for($owner)->create(['type' => 'image', 'published_at' => now()]);
        $this->attachMedia($removed);
        $keptMedia = $this->attachMedia($kept, 'kept');

        $this->actingAs($owner)->delete(route('posts.destroy', $removed))->assertRedirect();

        $this->assertDatabaseHas('media', ['id' => $keptMedia->id]);
        Storage::disk('post-media')->assertExists($keptMedia->path);
        $this->assertNotSoftDeleted($kept);
        $this->assertSame(1, Post::count());
    }

    public function test_a_user_cannot_delete_someone_elses_post(): void
    {
        Storage::fake('post-media');

        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $post = Post::factory()->for($owner)->create(['type' => 'image', 'published_at' => now()]);
        $media = $this->attachMedia($post);

        $this->actingAs($stranger)->delete(route('posts.destroy', $post))->assertForbidden();

        $this->assertNotSoftDeleted($post);
        $this->assertDatabaseHas('media', ['id' => $media->id]);
        Storage::disk('post-media')->assertExists($media->path);
    }

    public function test_guests_cannot_delete_posts(): void
    {
        $post = Post::factory()->create(['published_at' => now()]);

        $this->delete(route('posts.destroy', $post))->assertRedirect('/login');

        $this->assertNotSoftDeleted($post);
    }

    public function test_posts_advertise_whether_the_viewer_may_delete_them(): void
    {
        $owner = User::factory()->create();
        Post::factory()->for($owner)->create(['type' => 'image', 'published_at' => now()]);
        Post::factory()->for($owner)->create(['type' => 'text', 'published_at' => now()]);

        $this->actingAs($owner)->get('/feed')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.can_delete', true));

        $this->actingAs($owner)->get('/pulse')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.can_delete', true));

        $this->actingAs($owner)->get(route('profiles.show', $owner->username))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.can_delete', true));

        $author = User::factory()->create();
        Post::factory()->for($author)->create(['type' => 'image', 'published_at' => now()]);

        $viewer = User::factory()->create();
        $viewer->following()->attach($author, ['accepted_at' => now()]);

        $this->actingAs($viewer)->get('/feed')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.author.id', $author->id)
            ->where('posts.data.0.can_delete', false));
    }

    private function attachMedia(Post $post, string $name = 'example'): Media
    {
        $directory = 'posts/'.$post->user_id;
        $path = $directory.'/'.$name.'.jpg';
        $thumb = $directory.'/'.$name.'-thumb.webp';
        $medium = $directory.'/'.$name.'-medium.webp';

        Storage::disk('post-media')->put($path, 'original bytes');
        Storage::disk('post-media')->put($thumb, 'thumb bytes');
        Storage::disk('post-media')->put($medium, 'medium bytes');

        return $post->media()->create([
            'disk' => 'post-media',
            'path' => $path,
            'mime_type' => 'image/jpeg',
            'alt_text' => 'A photo used by the deletion tests.',
            'variants' => [
                'thumb' => ['path' => $thumb, 'width' => 480, 'height' => 600],
                'medium' => ['path' => $medium, 'width' => 1200, 'height' => 1500],
            ],
        ]);
    }
}
