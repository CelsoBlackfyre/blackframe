<?php

namespace Database\Seeders;

use App\Enums\ShelfStatus;
use App\Enums\SubjectType;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = collect([
            ['dune', SubjectType::Franchise, 'Dune', 'Politics, ecology, faith, and power across Frank Herbert’s science-fiction universe.', null],
            ['dune-messiah', SubjectType::Book, 'Dune Messiah', 'The second Dune novel follows the consequences of Paul Atreides’ rise.', 'dune'],
            ['cyberpunk-2077', SubjectType::Game, 'Cyberpunk 2077', 'An open-world role-playing game set in the dense, dangerous Night City.', null],
            ['the-expanse', SubjectType::Series, 'The Expanse', 'A space drama where political tension grows across Earth, Mars, and the Belt.', null],
            ['mass-effect', SubjectType::Franchise, 'Mass Effect', 'A science-fiction role-playing universe built around Commander Shepard and the Normandy.', null],
            ['mass-effect-legendary-edition', SubjectType::Game, 'Mass Effect Legendary Edition', 'The remastered Commander Shepard trilogy in one collection.', 'mass-effect'],
            ['dc', SubjectType::Franchise, 'DC', 'Heroes, villains, worlds, and stories from the DC universe.', null],
            ['batman', SubjectType::Character, 'Batman', 'Gotham’s detective, hero, and enduring symbol of the DC universe.', 'dc'],
            ['baldurs-gate-3', SubjectType::Game, 'Baldur’s Gate 3', 'A party-based role-playing game shaped by choice, consequence, and Dungeons & Dragons.', null],
            ['one-piece', SubjectType::Anime, 'One Piece', 'A vast pirate adventure about freedom, friendship, and the search for the legendary treasure.', null],
            ['watchmen', SubjectType::Comic, 'Watchmen', 'A landmark superhero comic examining power, responsibility, and moral compromise.', null],
            ['magic-the-gathering', SubjectType::TabletopGame, 'Magic: The Gathering', 'A collectible strategy card game spanning planes, formats, decks, and communities.', null],
        ])->mapWithKeys(function (array $data) {
            [$slug, $type, $name, $description, $parentSlug] = $data;

            $subject = Subject::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'type' => $type,
                    'name' => $name,
                    'description' => $description,
                    'image_url' => "https://picsum.photos/seed/blackframe-{$slug}/640/800",
                    'metadata' => ['development_fixture' => true],
                ],
            );

            return [$slug => ['subject' => $subject, 'parent_slug' => $parentSlug]];
        });

        $subjects->each(function (array $data) use ($subjects): void {
            $parentSlug = $data['parent_slug'];

            if ($parentSlug) {
                $data['subject']->update(['parent_id' => $subjects->get($parentSlug)['subject']->id]);
            }
        });

        $viewer = User::query()->where('email', 'demo@blackframe.test')->first();

        if (! $viewer) {
            return;
        }

        $shelf = [
            ['cyberpunk-2077', ShelfStatus::Current, false, 9.2, '86 hours · PC'],
            ['the-expanse', ShelfStatus::Current, true, 9.5, 'Season 2 · Episode 4'],
            ['dune-messiah', ShelfStatus::Current, false, null, 'Chapter 8'],
            ['baldurs-gate-3', ShelfStatus::Backlog, false, null, null],
            ['mass-effect-legendary-edition', ShelfStatus::Completed, true, 9.8, 'Trilogy completed'],
            ['watchmen', ShelfStatus::Completed, true, 9.0, null],
        ];

        foreach ($shelf as [$slug, $status, $favorite, $rating, $progress]) {
            $viewer->shelfEntries()->updateOrCreate(
                ['subject_id' => $subjects->get($slug)['subject']->id],
                compact('status', 'favorite', 'rating', 'progress'),
            );
        }

        $communityShelves = [
            'elena@blackframe.test' => [
                ['dune-messiah', ShelfStatus::Completed, true, 9.1, null],
                ['watchmen', ShelfStatus::Completed, false, 8.7, null],
                ['the-expanse', ShelfStatus::Backlog, false, null, null],
            ],
            'noah@blackframe.test' => [
                ['cyberpunk-2077', ShelfStatus::Completed, true, 9.0, 'Main story completed'],
                ['baldurs-gate-3', ShelfStatus::Current, false, 9.3, 'Act 2'],
                ['mass-effect-legendary-edition', ShelfStatus::Completed, true, 9.6, null],
            ],
            'amina@blackframe.test' => [
                ['the-expanse', ShelfStatus::Current, true, 9.2, 'Season 3'],
                ['dune-messiah', ShelfStatus::Backlog, false, null, null],
                ['magic-the-gathering', ShelfStatus::Current, false, 8.4, 'Commander'],
            ],
            'theo@blackframe.test' => [
                ['mass-effect-legendary-edition', ShelfStatus::Completed, true, 10.0, null],
                ['the-expanse', ShelfStatus::Completed, true, 9.6, null],
                ['cyberpunk-2077', ShelfStatus::Current, false, 8.8, 'Second playthrough'],
            ],
            'lina@blackframe.test' => [
                ['watchmen', ShelfStatus::Completed, true, 9.4, null],
                ['dune-messiah', ShelfStatus::Current, false, 8.9, 'Chapter 5'],
                ['one-piece', ShelfStatus::Current, true, 9.7, 'Egghead'],
            ],
        ];

        foreach ($communityShelves as $email => $entries) {
            $member = User::query()->where('email', $email)->first();

            if (! $member) {
                continue;
            }

            foreach ($entries as [$slug, $status, $favorite, $rating, $progress]) {
                $member->shelfEntries()->updateOrCreate(
                    ['subject_id' => $subjects->get($slug)['subject']->id],
                    compact('status', 'favorite', 'rating', 'progress'),
                );
            }
        }

        $geekPosts = [
            [$viewer, 'Mass Effect still understands the weight of a final conversation better than almost any game I have played.', 'mass-effect'],
            [User::query()->where('email', 'elena@blackframe.test')->first(), 'Dune Messiah is a much stranger and more intimate book than I remembered.', 'dune-messiah'],
        ];

        foreach ($geekPosts as $index => [$author, $caption, $subjectSlug]) {
            if (! $author) {
                continue;
            }

            $post = $author->posts()->firstOrCreate(
                ['type' => 'text', 'caption' => $caption],
                ['published_at' => now()->subMinutes($index * 23 + 3)],
            );

            $post->subjects()->syncWithoutDetaching([$subjects->get($subjectSlug)['subject']->id]);
        }
    }
}
