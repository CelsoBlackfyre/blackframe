<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_people_can_read_and_write_comments(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['published_at' => now()]);

        $this->actingAs($user)->from('/feed')->post(route('posts.comments.store', $post), [
            'body' => 'This belongs on my shelf.', 'user_id' => $post->user_id,
        ])->assertRedirect('/feed');

        $this->assertDatabaseHas('comments', ['post_id' => $post->id, 'user_id' => $user->id, 'body' => 'This belongs on my shelf.']);
        $this->getJson(route('posts.comments.index', $post))
            ->assertOk()->assertJsonPath('data.0.author.username', $user->username)
            ->assertJsonPath('data.0.can_delete', true)->assertJsonPath('total', 1);
    }

    public function test_comments_are_paginated_newest_first(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['published_at' => now()]);
        foreach (range(1, 23) as $index) {
            $comment = $post->comments()->create(['user_id' => $user->id, 'body' => "Comment {$index}"]);
            $comment->forceFill(['created_at' => now()->subSeconds(24 - $index)])->save();
        }
        $this->actingAs($user)->getJson(route('posts.comments.index', $post))
            ->assertJsonCount(20, 'data')->assertJsonPath('data.0.body', 'Comment 23')->assertJsonPath('total', 23);
    }

    public function test_comments_require_a_nonempty_body_of_at_most_1000_characters(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['published_at' => now()]);
        foreach (['', '   ', str_repeat('a', 1001)] as $body) {
            $this->actingAs($user)->post(route('posts.comments.store', $post), ['body' => $body])->assertSessionHasErrors('body');
        }
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_private_draft_and_scheduled_post_comments_cannot_be_accessed(): void
    {
        $user = User::factory()->create();
        $private = User::factory()->create(['is_private' => true]);
        $posts = [
            Post::factory()->for($private)->create(['published_at' => now()]),
            Post::factory()->create(['published_at' => null]),
            Post::factory()->create(['published_at' => now()->addDay()]),
        ];
        foreach ($posts as $post) {
            $this->actingAs($user)->getJson(route('posts.comments.index', $post))->assertNotFound();
            $this->post(route('posts.comments.store', $post), ['body' => 'Hidden'])->assertForbidden();
        }
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_only_comment_author_or_post_owner_can_remove_a_comment(): void
    {
        [$author, $stranger] = User::factory()->count(2)->create();
        $post = Post::factory()->create(['published_at' => now()]);
        $comment = $post->comments()->create(['user_id' => $author->id, 'body' => 'A thought']);
        $this->actingAs($stranger)->delete(route('posts.comments.destroy', [$post, $comment]))->assertForbidden();
        $this->actingAs($author)->delete(route('posts.comments.destroy', [$post, $comment]))->assertRedirect();
        $this->assertSoftDeleted($comment);
        $second = $post->comments()->create(['user_id' => $author->id, 'body' => 'Another thought']);
        $this->actingAs($post->user)->delete(route('posts.comments.destroy', [$post, $second]))->assertRedirect();
        $this->assertSoftDeleted($second);
    }

    public function test_a_comment_cannot_be_removed_through_another_post(): void
    {
        $user = User::factory()->create();
        [$first, $second] = Post::factory()->count(2)->create(['published_at' => now()]);
        $comment = $first->comments()->create(['user_id' => $user->id, 'body' => 'Keep me']);
        $this->actingAs($user)->delete(route('posts.comments.destroy', [$second, $comment]))->assertNotFound();
        $this->assertNotSoftDeleted($comment);
    }

    public function test_comments_from_deleted_people_are_not_returned(): void
    {
        $author = User::factory()->create();
        $viewer = User::factory()->create();
        $post = Post::factory()->create(['published_at' => now()]);
        $post->comments()->create(['user_id' => $author->id, 'body' => 'Old comment']);
        $author->delete();
        $this->actingAs($viewer)->getJson(route('posts.comments.index', $post))->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_guests_cannot_read_or_write_comments(): void
    {
        $post = Post::factory()->create(['published_at' => now()]);
        $this->getJson(route('posts.comments.index', $post))->assertUnauthorized();
        $this->post(route('posts.comments.store', $post), ['body' => 'Hello'])->assertRedirect('/login');
    }

    public function test_text_shortcut_opens_text_composer_and_invalid_format_falls_back_to_photo(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/posts/create?type=text')->assertInertia(fn ($page) => $page->where('initialFormat', 'text'));
        $this->get('/posts/create?type=unknown')->assertInertia(fn ($page) => $page->where('initialFormat', 'image'));
    }
}
