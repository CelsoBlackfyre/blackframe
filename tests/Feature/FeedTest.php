<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_the_feed(): void
    {
        $this->get('/feed')->assertRedirect('/login');
    }

    public function test_feed_contains_posts_from_the_viewer_and_followed_people_only(): void
    {
        $viewer = User::factory()->create();
        $followed = User::factory()->create();
        $stranger = User::factory()->create();

        $viewer->following()->attach($followed);

        $ownPost = Post::factory()->for($viewer)->create(['published_at' => now()->subMinute()]);
        $followedPost = Post::factory()->for($followed)->create(['published_at' => now()]);
        $subject = Subject::factory()->create(['name' => 'Baldur’s Gate 3']);
        $followedPost->subjects()->attach($subject);
        Post::factory()->for($stranger)->create(['published_at' => now()->addMinute()]);

        $this->actingAs($viewer)
            ->get('/feed')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('feed/index')
                ->has('posts.data', 2)
                ->where('posts.data.0.id', $followedPost->id)
                ->where('posts.data.0.subjects.0.name', 'Baldur’s Gate 3')
                ->where('posts.data.1.id', $ownPost->id)
            );
    }

    public function test_unpublished_posts_do_not_appear_in_the_feed(): void
    {
        $viewer = User::factory()->create();
        Post::factory()->for($viewer)->create(['published_at' => null]);

        $this->actingAs($viewer)
            ->get('/feed')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 0));
    }

    public function test_text_posts_do_not_appear_in_the_visual_feed(): void
    {
        $viewer = User::factory()->create();
        Post::factory()->for($viewer)->create([
            'type' => 'text',
            'published_at' => now(),
        ]);

        $this->actingAs($viewer)
            ->get('/feed')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 0));
    }
}
