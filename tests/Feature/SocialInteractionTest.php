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

    public function test_private_and_unpublished_posts_cannot_be_liked_by_direct_id(): void
    {
        $viewer = User::factory()->create();
        $privateAuthor = User::factory()->create(['is_private' => true]);
        $privatePost = Post::factory()->for($privateAuthor)->create(['published_at' => now()]);
        $draft = Post::factory()->create(['published_at' => null]);

        $this->actingAs($viewer)
            ->post(route('posts.likes.store', $privatePost))
            ->assertNotFound();
        $this->actingAs($viewer)
            ->post(route('posts.likes.store', $draft))
            ->assertNotFound();

        $viewer->following()->attach($privateAuthor, ['accepted_at' => now()]);

        $this->actingAs($viewer)
            ->post(route('posts.likes.store', $privatePost))
            ->assertRedirect();

        $this->assertDatabaseCount('likes', 1);
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

        $this->actingAs($viewer)
            ->post(route('people.follow.store', $viewer))
            ->assertSessionHasErrors('person');
        $this->assertDatabaseCount('follows', 1);
    }

    public function test_user_can_unfollow_from_the_people_directory(): void
    {
        $viewer = User::factory()->create();
        $creator = User::factory()->create(['username' => 'former.friend']);
        $viewer->following()->attach($creator, ['accepted_at' => now()]);

        $this->actingAs($viewer)
            ->from('/people?view=following')
            ->delete(route('people.follow.destroy', $creator))
            ->assertRedirect('/people?view=following')
            ->assertSessionHas('success', 'Your relationship with former.friend was removed.');

        $this->assertDatabaseMissing('follows', [
            'follower_id' => $viewer->id,
            'following_id' => $creator->id,
        ]);
    }

    public function test_private_follow_requires_owner_approval(): void
    {
        $viewer = User::factory()->create();
        $privateCreator = User::factory()->create([
            'username' => 'private.creator',
            'is_private' => true,
        ]);

        $this->actingAs($viewer)
            ->post(route('people.follow.store', $privateCreator))
            ->assertRedirect()
            ->assertSessionHas('success', 'Follow request sent to private.creator.');

        $this->assertDatabaseHas('follows', [
            'follower_id' => $viewer->id,
            'following_id' => $privateCreator->id,
            'accepted_at' => null,
        ]);
        $this->assertFalse($viewer->following()->whereKey($privateCreator->id)->exists());

        $this->actingAs($privateCreator)
            ->patch(route('people.follow-requests.accept', $viewer))
            ->assertRedirect();

        $this->assertTrue($viewer->following()->whereKey($privateCreator->id)->exists());
    }

    public function test_follow_requests_can_only_be_managed_by_the_recipient(): void
    {
        $requester = User::factory()->create();
        $privateCreator = User::factory()->create(['is_private' => true]);
        $attacker = User::factory()->create();

        $this->actingAs($requester)->post(route('people.follow.store', $privateCreator));

        $this->actingAs($attacker)
            ->patch(route('people.follow-requests.accept', $requester))
            ->assertNotFound();
        $this->actingAs($attacker)
            ->delete(route('people.follow-requests.decline', $requester))
            ->assertNotFound();

        $this->assertDatabaseHas('follows', [
            'follower_id' => $requester->id,
            'following_id' => $privateCreator->id,
            'accepted_at' => null,
        ]);
    }
}
