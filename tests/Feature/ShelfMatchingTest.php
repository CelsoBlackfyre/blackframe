<?php

namespace Tests\Feature;

use App\Enums\MatchDecisionType;
use App\Enums\ShelfStatus;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShelfMatchingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_open_or_use_shelf_matching(): void
    {
        $target = User::factory()->create();

        $this->get('/matches')->assertRedirect('/login');
        $this->post("/matches/{$target->id}/decision", ['decision' => 'connect'])
            ->assertRedirect('/login');
    }

    public function test_discover_ranks_people_by_explainable_shelf_compatibility(): void
    {
        $viewer = User::factory()->create();
        $strongMatch = User::factory()->create(['name' => 'Strong Match']);
        $lighterMatch = User::factory()->create(['name' => 'Lighter Match']);
        $unrelated = User::factory()->create();

        $favorite = Subject::factory()->create();
        $second = Subject::factory()->create();
        $unrelatedSubject = Subject::factory()->create();

        $this->addToShelf($viewer, $favorite, ShelfStatus::Completed, true, 9.5);
        $this->addToShelf($viewer, $second, ShelfStatus::Current, false, 8.0);
        $this->addToShelf($strongMatch, $favorite, ShelfStatus::Completed, true, 9.0);
        $this->addToShelf($strongMatch, $second, ShelfStatus::Current, false, 8.5);
        $this->addToShelf($lighterMatch, $second, ShelfStatus::Backlog, false, null);
        $this->addToShelf($unrelated, $unrelatedSubject, ShelfStatus::Current, true, 10.0);

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('matches/index')
                ->where('filters.view', 'discover')
                ->where('summary.shelf_count', 2)
                ->where('summary.remaining_count', 2)
                ->has('candidates', 2)
                ->where('candidates.0.id', $strongMatch->id)
                ->where('candidates.0.compatibility.shared_count', 2)
                ->where('candidates.0.compatibility.shared_favorites_count', 1)
                ->where('candidates.0.compatibility.same_status_count', 2)
                ->where('candidates.0.compatibility.rated_pairs_count', 2)
                ->where('candidates.1.id', $lighterMatch->id)
                ->where('candidates.1.compatibility.shared_count', 1)
                ->has('score_model', 4)
            );
    }

    public function test_an_empty_shelf_returns_a_clear_empty_state_payload(): void
    {
        $viewer = User::factory()->create();
        $candidate = User::factory()->create();
        $this->addToShelf($candidate, Subject::factory()->create());

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.shelf_count', 0)
                ->where('summary.remaining_count', 0)
                ->has('candidates', 0)
            );
    }

    public function test_decisions_are_validated_idempotent_and_cannot_target_self(): void
    {
        $viewer = User::factory()->create();
        $candidate = User::factory()->create();
        $subject = Subject::factory()->create();
        $this->addToShelf($viewer, $subject);
        $this->addToShelf($candidate, $subject);

        $this->actingAs($viewer)
            ->post("/matches/{$candidate->id}/decision", ['decision' => 'maybe'])
            ->assertSessionHasErrors('decision');

        $this->actingAs($viewer)
            ->post("/matches/{$viewer->id}/decision", ['decision' => 'connect'])
            ->assertSessionHasErrors('target');

        $this->actingAs($viewer)->post("/matches/{$candidate->id}/decision", ['decision' => 'connect'])->assertRedirect();
        $this->actingAs($viewer)->post("/matches/{$candidate->id}/decision", ['decision' => 'connect'])->assertRedirect();

        $this->assertDatabaseCount('match_decisions', 1);
        $this->assertDatabaseHas('match_decisions', [
            'user_id' => $viewer->id,
            'target_user_id' => $candidate->id,
            'decision' => MatchDecisionType::Connect->value,
        ]);
    }

    public function test_a_decision_requires_a_real_shared_shelf_title(): void
    {
        $viewer = User::factory()->create();
        $candidate = User::factory()->create();
        $this->addToShelf($viewer, Subject::factory()->create());
        $this->addToShelf($candidate, Subject::factory()->create());

        $this->actingAs($viewer)
            ->post("/matches/{$candidate->id}/decision", ['decision' => 'connect'])
            ->assertSessionHasErrors('target');

        $this->assertDatabaseCount('match_decisions', 0);
    }

    public function test_private_profiles_require_an_existing_follow_relationship(): void
    {
        $viewer = User::factory()->create();
        $privateCandidate = User::factory()->create(['is_private' => true]);
        $subject = Subject::factory()->create();
        $this->addToShelf($viewer, $subject);
        $this->addToShelf($privateCandidate, $subject);

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertInertia(fn (Assert $page) => $page->has('candidates', 0));

        $this->actingAs($viewer)
            ->post("/matches/{$privateCandidate->id}/decision", ['decision' => 'connect'])
            ->assertSessionHasErrors('target');

        $viewer->following()->attach($privateCandidate);

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertInertia(fn (Assert $page) => $page
                ->has('candidates', 1)
                ->where('candidates.0.id', $privateCandidate->id)
            );
    }

    public function test_pass_removes_a_candidate_and_undo_restores_them(): void
    {
        $viewer = User::factory()->create();
        $candidate = User::factory()->create();
        $subject = Subject::factory()->create();
        $this->addToShelf($viewer, $subject);
        $this->addToShelf($candidate, $subject);

        $this->actingAs($viewer)
            ->post("/matches/{$candidate->id}/decision", ['decision' => 'pass'])
            ->assertSessionHas('success');

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertInertia(fn (Assert $page) => $page->has('candidates', 0));

        $this->actingAs($viewer)
            ->delete("/matches/{$candidate->id}/decision")
            ->assertSessionHas('success');

        $this->actingAs($viewer)
            ->get('/matches')
            ->assertInertia(fn (Assert $page) => $page
                ->has('candidates', 1)
                ->where('candidates.0.id', $candidate->id)
            );
    }

    public function test_only_mutual_connect_decisions_appear_as_connections(): void
    {
        $viewer = User::factory()->create();
        $mutual = User::factory()->create();
        $outgoingOnly = User::factory()->create();
        $subject = Subject::factory()->create();

        foreach ([$viewer, $mutual, $outgoingOnly] as $user) {
            $this->addToShelf($user, $subject);
        }

        $viewer->matchDecisions()->create(['target_user_id' => $mutual->id, 'decision' => MatchDecisionType::Connect]);
        $mutual->matchDecisions()->create(['target_user_id' => $viewer->id, 'decision' => MatchDecisionType::Connect]);
        $viewer->matchDecisions()->create(['target_user_id' => $outgoingOnly->id, 'decision' => MatchDecisionType::Connect]);

        $this->actingAs($viewer)
            ->get('/matches?view=connections')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.view', 'connections')
                ->where('summary.connections_count', 1)
                ->has('candidates', 1)
                ->where('candidates.0.id', $mutual->id)
            );
    }

    private function addToShelf(
        User $user,
        Subject $subject,
        ShelfStatus $status = ShelfStatus::Current,
        bool $favorite = false,
        ?float $rating = null,
    ): void {
        $user->shelfEntries()->create([
            'subject_id' => $subject->id,
            'status' => $status,
            'favorite' => $favorite,
            'rating' => $rating,
        ]);
    }
}
