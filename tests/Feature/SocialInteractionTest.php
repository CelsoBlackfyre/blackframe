<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialInteractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_like_and_unlike_a_published_post(): void
    {
        $viewer = User::factory()->create();
        $post = Post::factory()->create(['published_at' => now()]);

        $this->actingAs($viewer)->post(route('posts.likes.store', $post))->assertRedirect();
        $this->actingAs($viewer)->post(route('posts.likes.store', $post))->assertRedirect();

        $this->assertDatabaseCount('likes', 1);
        $this->assertDatabaseHas('likes', [
            'user_id' => $viewer->id,
            'likeable_type' => Post::class,
            'likeable_id' => $post->id,
        ]);

        $this->actingAs($viewer)->delete(route('posts.likes.destroy', $post))->assertRedirect();
        $this->assertDatabaseCount('likes', 0);
    }

    public function test_user_can_follow_another_user_but_not_themselves(): void
    {
        $viewer = User::factory()->create();
        $creator = User::factory()->create();

        $this->actingAs($viewer)->post(route('people.follow.store', $creator))->assertRedirect();
        $this->actingAs($viewer)->post(route('people.follow.store', $creator))->assertRedirect();

        $this->assertDatabaseCount('follows', 1);
        $this->assertDatabaseHas('follows', [
            'follower_id' => $viewer->id,
            'following_id' => $creator->id,
        ]);

        $this->actingAs($viewer)->post(route('people.follow.store', $viewer))->assertStatus(422);
        $this->assertDatabaseCount('follows', 1);
    }

    public function test_user_can_unfollow_from_the_people_directory(): void
    {
        $viewer = User::factory()->create();
        $creator = User::factory()->create(['username' => 'former.friend']);
        $viewer->following()->attach($creator);

        $this->actingAs($viewer)
            ->from('/people?view=following')
            ->delete(route('people.follow.destroy', $creator))
            ->assertRedirect('/people?view=following')
            ->assertSessionHas('success', 'You unfollowed former.friend.');

        $this->assertDatabaseMissing('follows', [
            'follower_id' => $viewer->id,
            'following_id' => $creator->id,
        ]);
    }
}
