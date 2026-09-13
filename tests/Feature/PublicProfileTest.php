<?php

namespace Tests\Feature;

use App\Enums\ShelfStatus;
use App\Enums\SubjectType;
use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_open_member_profiles(): void
    {
        $user = User::factory()->create();

        $this->get(route('profiles.show', $user->username))->assertRedirect('/login');
    }

    public function test_public_profile_connects_posts_pulse_shelf_and_shared_culture(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create([
            'name' => 'Culture Friend',
            'username' => 'culture.friend',
            'website' => 'https://example.com',
        ]);
        $shared = Subject::factory()->create(['name' => 'Dune', 'type' => SubjectType::Book]);

        $viewer->shelfEntries()->create([
            'subject_id' => $shared->id,
            'status' => ShelfStatus::Completed,
        ]);
        $profile->shelfEntries()->create([
            'subject_id' => $shared->id,
            'status' => ShelfStatus::Current,
            'favorite' => true,
            'progress' => 'Chapter 8',
        ]);
        $visual = Post::factory()->for($profile)->create(['type' => 'image']);
        $pulse = Post::factory()->for($profile)->create(['type' => 'text']);

        $this->actingAs($viewer)
            ->get(route('profiles.show', $profile->username))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('profiles/show')
                ->where('filters.tab', 'posts')
                ->where('profile.username', 'culture.friend')
                ->where('profile.can_view_content', true)
                ->where('profile.counts.posts', 2)
                ->where('profile.counts.visual_posts', 1)
                ->where('profile.counts.pulse_posts', 1)
                ->where('profile.counts.shelf', 1)
                ->where('profile.shared_subjects.0.name', 'Dune')
                ->where('profile.current_activity.subject.name', 'Dune')
                ->where('posts.data.0.id', $visual->id)
                ->where('pulse', null)
            );

        $this->actingAs($viewer)
            ->get(route('profiles.show', ['user' => $profile->username, 'tab' => 'pulse']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.tab', 'pulse')
                ->where('pulse.data.0.id', $pulse->id)
                ->where('posts', null)
            );

        $this->actingAs($viewer)
            ->get(route('profiles.show', ['user' => $profile->username, 'tab' => 'shelf']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('shelf.data.0.subject.name', 'Dune')
                ->where('shelf.data.0.status_label', 'Reading')
            );
    }

    public function test_private_profile_content_requires_an_existing_follow(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create(['is_private' => true]);
        Post::factory()->for($profile)->create();

        $this->actingAs($viewer)
            ->get(route('profiles.show', $profile->username))
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.is_private', true)
                ->where('profile.can_view_content', false)
                ->where('profile.follow_request_pending', false)
                ->where('posts', null)
            );

        $this->actingAs($viewer)->post(route('people.follow.store', $profile));

        $this->actingAs($viewer)
            ->get(route('profiles.show', $profile->username))
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.can_view_content', false)
                ->where('profile.is_following', false)
                ->where('profile.follow_request_pending', true)
                ->where('posts', null)
            );

        $this->actingAs($profile)->patch(route('people.follow-requests.accept', $viewer));

        $this->actingAs($viewer)
            ->get(route('profiles.show', $profile->username))
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.is_following', true)
                ->where('profile.can_view_content', true)
                ->has('posts.data', 1)
            );
    }

    public function test_profile_tabs_are_validated(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create();

        $this->actingAs($viewer)
            ->get(route('profiles.show', ['user' => $profile->username, 'tab' => 'reviews-before-they-exist']))
            ->assertSessionHasErrors('tab');
    }

    public function test_guests_cannot_open_profile_connections(): void
    {
        $user = User::factory()->create();

        $this->get(route('profiles.connections', ['user' => $user->username, 'list' => 'followers']))->assertRedirect('/login');
    }

    public function test_profile_connections_list_followers_and_following(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create(['username' => 'leto']);
        $follower = User::factory()->create(['username' => 'ada.follower']);
        $followee = User::factory()->create(['username' => 'sam.followee']);

        $follower->following()->attach($profile->id, ['accepted_at' => now()]);
        $profile->following()->attach($followee->id, ['accepted_at' => now()]);
        $viewer->following()->attach($followee->id, ['accepted_at' => now()]);

        $this->actingAs($viewer)
            ->get(route('profiles.connections', ['user' => 'leto', 'list' => 'followers']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('profiles/connections')
                ->where('filters.list', 'followers')
                ->where('profile.username', 'leto')
                ->where('profile.can_view_connections', true)
                ->where('profile.counts.followers', 1)
                ->has('connections.data', 1)
                ->where('connections.data.0.username', 'ada.follower')
                ->where('connections.data.0.is_following', false)
            );

        $this->actingAs($viewer)
            ->get(route('profiles.connections', ['user' => 'leto', 'list' => 'following']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.list', 'following')
                ->where('profile.counts.following', 1)
                ->has('connections.data', 1)
                ->where('connections.data.0.username', 'sam.followee')
                ->where('connections.data.0.is_following', true)
                ->where('connections.data.0.follows_you', false)
            );
    }

    public function test_private_profile_connections_are_hidden_until_approved(): void
    {
        $viewer = User::factory()->create(['username' => 'pending.viewer']);
        $profile = User::factory()->create(['is_private' => true]);

        $this->actingAs($viewer)->post(route('people.follow.store', $profile));

        $this->actingAs($viewer)
            ->get(route('profiles.connections', ['user' => $profile->username, 'list' => 'followers']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.is_private', true)
                ->where('profile.can_view_connections', false)
                ->where('connections', null)
            );

        $this->actingAs($profile)->patch(route('people.follow-requests.accept', $viewer));

        $this->actingAs($viewer)
            ->get(route('profiles.connections', ['user' => $profile->username, 'list' => 'followers']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.can_view_connections', true)
                ->has('connections.data', 1)
                ->where('connections.data.0.username', 'pending.viewer')
            );
    }

    public function test_connections_list_filter_is_validated(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create();

        $this->actingAs($viewer)
            ->get(route('profiles.connections', ['user' => $profile->username, 'list' => 'everyone']))
            ->assertSessionHasErrors('list');
    }
}
