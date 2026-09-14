<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\SubjectSuggestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CatalogSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_search_or_suggest_catalog_subjects(): void
    {
        $this->getJson('/catalog/search?query=dune')->assertUnauthorized();
        $this->post('/catalog/suggestions', [])->assertRedirect('/login');
    }

    public function test_catalog_search_uses_only_external_sources(): void
    {
        Subject::factory()->create([
            'name' => 'Dune',
            'type' => 'franchise',
        ]);
        $this->fakeCatalogs();

        $response = $this->actingAs(User::factory()->create())
            ->getJson('/catalog/search?query=dune');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Dune Messiah',
                'type' => 'book',
                'source_label' => 'Open Library',
            ])
            ->assertJsonFragment([
                'name' => 'Dune: Prophecy',
                'type' => 'series',
                'source_label' => 'TVmaze',
            ]);

        $data = collect($response->json('data'));

        $this->assertFalse($data->contains(fn (array $candidate): bool => $candidate['source'] === 'blackframe'));

        $external = $data->firstWhere('source', 'openlibrary');

        $this->assertNull($external['subject_id']);
        $this->assertNotEmpty($external['reference']);
    }

    public function test_exact_matches_rank_above_fuzzy_provider_results(): void
    {
        config(['services.catalog.tmdb_token' => 'tmdb-token']);

        Http::fake([
            'openlibrary.org/*' => Http::response(['docs' => [[
                'key' => '/works/OL9W',
                'title' => 'Faust',
                'author_name' => ['Goethe'],
                'first_publish_year' => 1808,
                'cover_i' => null,
            ]]]),
            'api.tvmaze.com/*' => Http::response([]),
            'api.jikan.moe/v4/anime*' => Http::response(['data' => []]),
            'api.jikan.moe/v4/manga*' => Http::response(['data' => []]),
            'www.wikidata.org/*' => Http::response(['search' => []]),
            'api.themoviedb.org/*' => Http::response(['results' => [
                [
                    'media_type' => 'movie',
                    'id' => 693134,
                    'title' => 'Dune: Part Two',
                    'overview' => 'Paul Atreides unites with the Fremen.',
                    'poster_path' => '/dune-two.jpg',
                ],
                [
                    'media_type' => 'movie',
                    'id' => 999,
                    'title' => 'The Dune Story',
                    'overview' => null,
                    'poster_path' => null,
                ],
            ]]),
        ]);

        $data = $this->actingAs(User::factory()->create())
            ->getJson('/catalog/search?query=dune%20part%20two')
            ->assertOk()
            ->json('data');

        $this->assertSame('Dune: Part Two', $data[0]['name']);
        $this->assertSame('tmdb', $data[0]['source']);

        $names = collect($data)->pluck('name');

        $this->assertFalse($names->contains('Faust'));
        $this->assertFalse($names->contains('The Dune Story'));
    }

    public function test_fuzzy_results_are_kept_when_nothing_matches_closely(): void
    {
        Http::fake([
            'openlibrary.org/*' => Http::response(['docs' => [[
                'key' => '/works/OL7W',
                'title' => 'Sand and Stone',
                'author_name' => ['Someone'],
                'first_publish_year' => 2001,
                'cover_i' => null,
            ]]]),
            'api.tvmaze.com/*' => Http::response([]),
            'api.jikan.moe/v4/anime*' => Http::response(['data' => []]),
            'api.jikan.moe/v4/manga*' => Http::response(['data' => []]),
            'www.wikidata.org/*' => Http::response(['search' => []]),
        ]);

        $data = $this->actingAs(User::factory()->create())
            ->getJson('/catalog/search?query=quicksand%20chronicles')
            ->assertOk()
            ->json('data');

        $this->assertSame(['Sand and Stone'], collect($data)->pluck('name')->all());
    }

    public function test_chosen_external_result_is_imported_only_when_added_to_a_shelf(): void
    {
        $this->fakeCatalogs();
        $user = User::factory()->create();

        $search = $this->actingAs($user)->getJson('/catalog/search?query=dune&type=book');
        $candidate = collect($search->json('data'))->firstWhere('source', 'openlibrary');

        $this->assertDatabaseCount('subjects', 0);

        $this->actingAs($user)
            ->post('/shelf', [
                'subject_reference' => $candidate['reference'],
                'status' => 'backlog',
                'favorite' => false,
                'rating' => null,
                'progress' => null,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $subject = Subject::query()->sole();

        $this->assertSame('Dune Messiah', $subject->name);
        $this->assertSame('openlibrary', $subject->source);
        $this->assertSame($user->id, $subject->imported_by);
        $this->assertDatabaseHas('user_subjects', [
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'status' => 'backlog',
        ]);
    }

    public function test_external_catalog_reference_cannot_be_tampered_with(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/shelf', [
                'subject_reference' => 'not-a-signed-catalog-reference',
                'status' => 'current',
                'favorite' => false,
            ])
            ->assertSessionHasErrors('subject_reference');

        $this->assertDatabaseCount('subjects', 0);
        $this->assertDatabaseCount('user_subjects', 0);
    }

    public function test_missing_title_requests_are_normalized_and_deduplicated(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $this->actingAs($firstUser)
            ->post('/catalog/suggestions', [
                'name' => '  The Long Tomorrow  ',
                'type' => 'comic',
                'source_url' => 'https://example.com/the-long-tomorrow',
                'notes' => 'A specific graphic story.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'The Long Tomorrow was sent for catalog review.');

        $this->actingAs($secondUser)
            ->post('/catalog/suggestions', [
                'name' => 'the long tomorrow',
                'type' => 'comic',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'The Long Tomorrow is already in the catalog review queue.');

        $this->assertDatabaseCount('subject_suggestions', 1);
        $suggestion = SubjectSuggestion::query()->sole();
        $this->assertSame($firstUser->id, $suggestion->user_id);
        $this->assertSame('the long tomorrow', $suggestion->normalized_name);
        $this->assertSame('pending', $suggestion->status);
    }

    private function fakeCatalogs(): void
    {
        Http::fake([
            'openlibrary.org/*' => Http::response([
                'docs' => [[
                    'key' => '/works/OL123W',
                    'title' => 'Dune Messiah',
                    'author_name' => ['Frank Herbert'],
                    'first_publish_year' => 1969,
                    'cover_i' => 12345,
                ]],
            ]),
            'api.tvmaze.com/*' => Http::response([[
                'score' => 1,
                'show' => [
                    'id' => 999,
                    'name' => 'Dune: Prophecy',
                    'url' => 'https://www.tvmaze.com/shows/999/dune-prophecy',
                    'summary' => '<p>A series set in the Dune universe.</p>',
                    'image' => ['medium' => 'https://static.tvmaze.com/uploads/images/medium_portrait/1/2.jpg'],
                ],
            ]]),
            'api.jikan.moe/v4/anime*' => Http::response(['data' => []]),
            'api.jikan.moe/v4/manga*' => Http::response(['data' => []]),
            'www.wikidata.org/*' => Http::response(['search' => []]),
        ]);
    }
}
