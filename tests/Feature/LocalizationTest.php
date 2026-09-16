<?php

namespace Tests\Feature;

use App\Enums\ShelfStatus;
use App\Enums\SubjectType;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_english_is_the_default_without_a_translation_payload(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->has('translations', 0)
            );

        $this->assertStringContainsString('<html lang="en"', $response->getContent());
    }

    public function test_a_portuguese_browser_is_served_portuguese(): void
    {
        $response = $this->withHeader('Accept-Language', 'pt-BR,pt;q=0.9,en;q=0.8')->get('/');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'pt_BR')
                ->where('translations.Home', 'Início')
                ->where('translations.Create', 'Criar')
            );

        $this->assertStringContainsString('<html lang="pt-BR"', $response->getContent());
    }

    public function test_an_explicit_choice_wins_over_the_browser_preference(): void
    {
        $this->withSession(['locale' => 'en'])
            ->withHeader('Accept-Language', 'pt-BR,pt;q=0.9')
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_switching_locale_persists_for_the_session_and_the_browser(): void
    {
        $this->from('/')->post(route('locale.update'), ['locale' => 'pt_BR'])
            ->assertRedirect('/')
            ->assertSessionHas('locale', 'pt_BR')
            ->assertCookie(config('localization.cookie'), 'pt_BR');

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
    }

    public function test_an_unsupported_locale_is_rejected(): void
    {
        $this->from('/')
            ->post(route('locale.update'), ['locale' => 'fr'])
            ->assertSessionHasErrors('locale');
    }

    public function test_enums_and_flash_messages_follow_the_chosen_locale(): void
    {
        $this->assertSame('Game', SubjectType::Game->label());
        $this->assertSame('Watching', ShelfStatus::Current->labelFor(SubjectType::Series));

        $owner = User::factory()->create();
        $post = Post::factory()->for($owner)->create(['type' => 'text', 'published_at' => now()]);

        $this->withSession(['locale' => 'pt_BR'])->actingAs($owner)
            ->delete(route('posts.destroy', $post))
            ->assertSessionHas('success', 'Sua mensagem do Pulse foi excluída.');

        $this->assertSame('Jogo', SubjectType::Game->label());
        $this->assertSame('Assistindo', ShelfStatus::Current->labelFor(SubjectType::Series));
        $this->assertSame('Em andamento', ShelfStatus::Current->label());
    }
}
