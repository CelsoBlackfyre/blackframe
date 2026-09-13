<?php

namespace Tests\Feature;

use App\Enums\SubjectType;
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

        $viewer->following()->attach($followed, ['accepted_at' => now()]);

        $ownPost = Post::factory()->for($viewer)->create(['published_at' => now()->subMinute()]);
        $followedPost = Post::factory()->for($followed)->create(['published_at' => now()]);
        $subject = Subject::factory()->create(['name' => 'Baldur’s Gate 3', 'type' => SubjectType::Game]);
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

    public function test_scheduled_posts_stay_hidden_across_timelines_profiles_and_likes(): void
    {
        $viewer = User::factory()->create();
        $scheduled = Post::factory()->for($viewer)->create(['published_at' => now()->addHour()]);
        Post::factory()->for($viewer)->create(['type' => 'text', 'published_at' => now()->addHour()]);

        $this->actingAs($viewer)->get('/feed')->assertInertia(fn (Assert $page) => $page->has('posts.data', 0));
        $this->get('/pulse')->assertInertia(fn (Assert $page) => $page->has('posts.data', 0));
        $this->get(route('profiles.show', $viewer->username))->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 0)->where('profile.counts.posts', 0));
        $this->post(route('posts.likes.store', $scheduled))->assertNotFound();
    }

    public function test_deleted_authors_and_commenters_do_not_break_the_feed(): void
    {
        $viewer = User::factory()->create();
        $deleted = User::factory()->create();
        $viewer->following()->attach($deleted, ['accepted_at' => now()]);
        Post::factory()->for($deleted)->create(['published_at' => now()]);
        $own = Post::factory()->for($viewer)->create(['published_at' => now()]);
        $own->comments()->create(['user_id' => $deleted->id, 'body' => 'Previous comment']);
        $deleted->delete();

        $this->actingAs($viewer)->get('/feed')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)->where('posts.data.0.id', $own->id)
            ->where('posts.data.0.comments_count', 0)->has('posts.data.0.comments', 0));
    }

    public function test_home_includes_activation_and_current_culture_context(): void
    {
        $viewer = User::factory()->create();
        $subject = Subject::factory()->create(['name' => 'Baldur’s Gate 3', 'type' => SubjectType::Game]);
        $viewer->shelfEntries()->create([
            'subject_id' => $subject->id,
            'status' => 'current',
            'progress' => 'Act 2',
        ]);
        Post::factory()->for($viewer)->create(['type' => 'text']);

        $this->actingAs($viewer)
            ->get('/feed')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activation.shelf_count', 1)
                ->where('activation.following_count', 0)
                ->where('activation.published_posts_count', 1)
                ->where('current_shelf.0.subject.name', 'Baldur’s Gate 3')
                ->where('current_shelf.0.status_label', 'Playing')
                ->where('current_shelf.0.progress', 'Act 2')
            );
    }
}
