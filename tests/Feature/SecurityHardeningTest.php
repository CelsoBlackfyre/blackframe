<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_responses_include_baseline_security_headers(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin')
            ->assertHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }

    public function test_private_post_media_requires_an_approved_follow(): void
    {
        Storage::fake('post-media');

        $author = User::factory()->create(['is_private' => true]);
        $viewer = User::factory()->create();
        $post = Post::factory()->for($author)->create(['published_at' => now()]);
        Storage::disk('post-media')->put('posts/example.jpg', 'image bytes');
        $media = $post->media()->create([
            'disk' => 'post-media',
            'path' => 'posts/example.jpg',
            'mime_type' => 'image/jpeg',
            'alt_text' => 'Protected example.',
        ]);

        $this->assertSame(route('posts.media.show', [$post, $media]), $media->url);

        $this->actingAs($viewer)
            ->get(route('posts.media.show', [$post, $media]))
            ->assertNotFound();

        $this->actingAs($viewer)->post(route('people.follow.store', $author));
        $this->actingAs($viewer)
            ->get(route('posts.media.show', [$post, $media]))
            ->assertNotFound();

        $this->actingAs($author)->patch(route('people.follow-requests.accept', $viewer));

        $this->actingAs($viewer)
            ->get(route('posts.media.show', [$post, $media]))
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('Content-Type', 'image/jpeg');
    }

    public function test_media_route_rejects_a_media_record_from_another_post(): void
    {
        Storage::fake('post-media');

        $author = User::factory()->create();
        $post = Post::factory()->for($author)->create(['published_at' => now()]);
        $otherPost = Post::factory()->for($author)->create(['published_at' => now()]);
        $media = $otherPost->media()->create([
            'disk' => 'post-media',
            'path' => 'posts/other.jpg',
            'mime_type' => 'image/jpeg',
        ]);

        $this->actingAs($author)
            ->get(route('posts.media.show', [$post, $media]))
            ->assertNotFound();

        Storage::disk('post-media')->put('posts/unsafe.html', '<script>alert(1)</script>');
        $unsafeMedia = $post->media()->create([
            'disk' => 'post-media',
            'path' => 'posts/unsafe.html',
            'mime_type' => 'text/html',
        ]);

        $this->actingAs($author)
            ->get(route('posts.media.show', [$post, $unsafeMedia]))
            ->assertNotFound();
    }
}
