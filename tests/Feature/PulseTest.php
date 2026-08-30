<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PulseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_pulse(): void
    {
        $this->get('/pulse')->assertRedirect('/login');
    }

    public function test_pulse_contains_text_posts_from_the_viewer_and_followed_people_only(): void
    {
        $viewer = User::factory()->create();
        $followed = User::factory()->create();
        $stranger = User::factory()->create();

        $viewer->following()->attach($followed);

        $ownPost = Post::factory()->for($viewer)->create([
            'type' => 'text',
            'caption' => 'An update from me.',
            'published_at' => now()->subMinute(),
        ]);
        $followedPost = Post::factory()->for($followed)->create([
            'type' => 'text',
            'caption' => 'A newer update from someone I follow.',
            'published_at' => now(),
        ]);
        $subject = Subject::factory()->create(['name' => 'Dune Messiah']);
        $followedPost->subjects()->attach($subject);
        Post::factory()->for($stranger)->create(['type' => 'text']);
        Post::factory()->for($followed)->create(['type' => 'image']);

        $this->actingAs($viewer)
            ->get('/pulse')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pulse/index')
                ->has('posts.data', 2)
                ->where('posts.data.0.id', $followedPost->id)
                ->where('posts.data.0.subjects.0.name', 'Dune Messiah')
                ->where('posts.data.1.id', $ownPost->id)
            );
    }

    public function test_unpublished_text_posts_do_not_appear_in_pulse(): void
    {
        $viewer = User::factory()->create();
        Post::factory()->for($viewer)->create([
            'type' => 'text',
            'published_at' => null,
        ]);

        $this->actingAs($viewer)
            ->get('/pulse')
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 0));
    }
}
