<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PeopleDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_open_people_discovery(): void
    {
        $this->get('/people')->assertRedirect('/login');
    }

    public function test_discover_lists_people_with_relationship_and_activity_context(): void
    {
        $viewer = User::factory()->create();
        $mutual = User::factory()->create([
            'name' => 'Mutual Friend',
            'username' => 'mutual.friend',
        ]);
        $stranger = User::factory()->create([
            'name' => 'New Perspective',
            'username' => 'new.perspective',
        ]);

        $viewer->following()->attach($mutual, ['accepted_at' => now()]);
        $mutual->following()->attach($viewer, ['accepted_at' => now()]);
        Post::factory()->for($mutual)->create(['published_at' => now()]);
        Post::factory()->for($mutual)->create(['published_at' => null]);

        $this->actingAs($viewer)
            ->get('/people')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('people/index')
                ->where('filters.view', 'discover')
                ->where('filters.query', '')
                ->where('network.followers_count', 1)
                ->where('network.following_count', 1)
                ->where('network.follow_requests_count', 0)
                ->has('people.data', 2)
                ->where('people.data.0.id', $mutual->id)
                ->where('people.data.0.is_following', true)
                ->where('people.data.0.follows_you', true)
                ->where('people.data.0.followers_count', 1)
                ->where('people.data.0.posts_count', 1)
                ->where('people.data.1.id', $stranger->id)
            );
    }

    public function test_pending_private_follow_requests_are_visible_only_to_the_recipient(): void
    {
        $requester = User::factory()->create(['name' => 'Pending Person']);
        $privateCreator = User::factory()->create(['is_private' => true]);

        $this->actingAs($requester)->post(route('people.follow.store', $privateCreator));

        $this->actingAs($privateCreator)
            ->get('/people')
            ->assertInertia(fn (Assert $page) => $page
                ->where('network.follow_requests_count', 1)
                ->has('follow_requests', 1)
                ->where('follow_requests.0.id', $requester->id)
                ->where('follow_requests.0.incoming_follow_request', true)
            );

        $this->actingAs($requester)
            ->get('/people')
            ->assertInertia(fn (Assert $page) => $page
                ->where('network.follow_requests_count', 0)
                ->has('follow_requests', 0)
            );
    }

    public function test_followers_and_following_views_use_the_correct_relationship_direction(): void
    {
        $viewer = User::factory()->create();
        $follower = User::factory()->create(['name' => 'Incoming Friend']);
        $followed = User::factory()->create(['name' => 'Outgoing Friend']);
        $mutual = User::factory()->create(['name' => 'Mutual Friend']);

        $follower->following()->attach($viewer, ['accepted_at' => now()]);
        $viewer->following()->attach([$followed->id, $mutual->id], ['accepted_at' => now()]);
        $mutual->following()->attach($viewer, ['accepted_at' => now()]);

        $this->actingAs($viewer)
            ->get('/people?view=followers')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.view', 'followers')
                ->has('people.data', 2)
                ->where('people.data.0.id', $mutual->id)
                ->where('people.data.0.is_following', true)
                ->where('people.data.0.follows_you', true)
                ->where('people.data.1.id', $follower->id)
                ->where('people.data.1.is_following', false)
                ->where('people.data.1.follows_you', true)
            );

        $this->actingAs($viewer)
            ->get('/people?view=following')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.view', 'following')
                ->has('people.data', 2)
                ->where('people.data.0.id', $mutual->id)
                ->where('people.data.1.id', $followed->id)
            );
    }

    public function test_people_search_matches_names_and_at_usernames_case_insensitively(): void
    {
        $viewer = User::factory()->create();
        $matchingName = User::factory()->create([
            'name' => 'Celso Martins',
            'username' => 'frame.builder',
        ]);
        $matchingUsername = User::factory()->create([
            'name' => 'Another Person',
            'username' => 'DoomFrame',
        ]);
        User::factory()->create([
            'name' => 'Unrelated Person',
            'username' => 'somebody.else',
        ]);

        $this->actingAs($viewer)
            ->get('/people?query=MARTINS')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.query', 'MARTINS')
                ->has('people.data', 1)
                ->where('people.data.0.id', $matchingName->id)
            );

        $this->actingAs($viewer)
            ->get('/people?query=%40doomframe')
            ->assertInertia(fn (Assert $page) => $page
                ->has('people.data', 1)
                ->where('people.data.0.id', $matchingUsername->id)
            );
    }

    public function test_people_filters_are_validated_and_results_are_paginated(): void
    {
        $viewer = User::factory()->create();
        User::factory()->count(13)->create();

        $this->actingAs($viewer)
            ->get('/people?view=unknown')
            ->assertSessionHasErrors('view');

        $this->actingAs($viewer)
            ->get('/people?'.http_build_query(['query' => str_repeat('a', 81)]))
            ->assertSessionHasErrors('query');

        $this->actingAs($viewer)
            ->get('/people')
            ->assertInertia(fn (Assert $page) => $page
                ->where('people.total', 13)
                ->where('people.current_page', 1)
                ->where('people.last_page', 2)
                ->has('people.data', 12)
            );
    }

    public function test_discover_prioritizes_and_explains_shared_culture(): void
    {
        $viewer = User::factory()->create();
        $sharedPerson = User::factory()->create(['name' => 'Shared Culture']);
        $popularPerson = User::factory()->create(['name' => 'Popular Stranger']);
        $sharedSubject = Subject::factory()->create(['name' => 'The Expanse']);

        $viewer->shelfEntries()->create([
            'subject_id' => $sharedSubject->id,
            'status' => 'completed',
        ]);
        $sharedPerson->shelfEntries()->create([
            'subject_id' => $sharedSubject->id,
            'status' => 'current',
        ]);
        User::factory()->count(3)->create()->each(fn (User $follower) => $follower->following()->attach($popularPerson, ['accepted_at' => now()]));

        $this->actingAs($viewer)
            ->get('/people')
            ->assertInertia(fn (Assert $page) => $page
                ->where('people.data.0.id', $sharedPerson->id)
                ->where('people.data.0.shared_titles_count', 1)
                ->where('people.data.0.shared_subjects.0.name', 'The Expanse')
                ->where('people.data.0.current_activity.subject.name', 'The Expanse')
                ->where('people.data.0.recommendation_reason', 'Suggested because you both shelved The Expanse.')
            );
    }
}
