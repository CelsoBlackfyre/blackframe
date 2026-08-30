<?php

namespace Tests\Feature;

use App\Enums\ShelfStatus;
use App\Enums\SubjectType;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GeekShelfTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_or_change_a_geek_shelf(): void
    {
        $this->get('/shelf')->assertRedirect('/login');
        $this->post('/shelf', [])->assertRedirect('/login');
    }

    public function test_shelf_page_contains_the_viewers_entries_and_stats(): void
    {
        $viewer = User::factory()->create();
        $subject = Subject::factory()->create([
            'name' => 'Mass Effect',
            'type' => SubjectType::Franchise,
        ]);
        $viewer->shelfEntries()->create([
            'subject_id' => $subject->id,
            'status' => ShelfStatus::Current,
            'favorite' => true,
            'rating' => 9.5,
            'progress' => 'Second playthrough',
        ]);

        $this->actingAs($viewer)
            ->get('/shelf')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shelf/index')
                ->has('entries', 1)
                ->where('entries.0.subject.name', 'Mass Effect')
                ->where('entries.0.status_label', 'Exploring')
                ->where('entries.0.favorite', true)
                ->where('stats.total', 1)
                ->where('stats.current', 1)
                ->where('stats.favorites', 1)
                ->has('statusOptions', 5)
            );
    }

    public function test_user_can_add_and_idempotently_replace_a_shelf_entry(): void
    {
        $viewer = User::factory()->create();
        $subject = Subject::factory()->create();

        $this->actingAs($viewer)
            ->post('/shelf', [
                'subject_id' => $subject->id,
                'status' => 'current',
                'favorite' => true,
                'rating' => 8.7,
                'progress' => 'Chapter 12',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($viewer)
            ->post('/shelf', [
                'subject_id' => $subject->id,
                'status' => 'completed',
                'favorite' => false,
                'rating' => 9.0,
                'progress' => 'Finished',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('user_subjects', 1);
        $this->assertDatabaseHas('user_subjects', [
            'user_id' => $viewer->id,
            'subject_id' => $subject->id,
            'status' => 'completed',
            'favorite' => false,
            'rating' => 9.0,
            'progress' => 'Finished',
        ]);
    }

    public function test_user_can_update_and_remove_their_own_shelf_entry(): void
    {
        $viewer = User::factory()->create();
        $entry = $viewer->shelfEntries()->create([
            'subject_id' => Subject::factory()->create()->id,
            'status' => ShelfStatus::Backlog,
            'favorite' => false,
        ]);

        $this->actingAs($viewer)
            ->patch(route('shelf.update', $entry), [
                'status' => 'current',
                'favorite' => true,
                'rating' => 7.5,
                'progress' => 'Act 1',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('user_subjects', [
            'id' => $entry->id,
            'status' => 'current',
            'favorite' => true,
            'progress' => 'Act 1',
        ]);

        $this->actingAs($viewer)
            ->delete(route('shelf.destroy', $entry))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('user_subjects', ['id' => $entry->id]);
    }

    public function test_user_cannot_change_another_users_shelf_entry(): void
    {
        $viewer = User::factory()->create();
        $otherUser = User::factory()->create();
        $entry = $otherUser->shelfEntries()->create([
            'subject_id' => Subject::factory()->create()->id,
            'status' => ShelfStatus::Current,
            'favorite' => false,
        ]);

        $this->actingAs($viewer)
            ->patch(route('shelf.update', $entry), [
                'status' => 'completed',
                'favorite' => false,
            ])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->delete(route('shelf.destroy', $entry))
            ->assertForbidden();

        $this->assertDatabaseHas('user_subjects', ['id' => $entry->id, 'status' => 'current']);
    }

    public function test_shelf_entry_input_is_validated(): void
    {
        $viewer = User::factory()->create();

        $this->actingAs($viewer)
            ->post('/shelf', [
                'subject_id' => 999999,
                'status' => 'watching_everything',
                'favorite' => false,
                'rating' => 11,
                'progress' => str_repeat('a', 121),
            ])
            ->assertSessionHasErrors(['subject_id', 'status', 'rating', 'progress']);
    }
}
