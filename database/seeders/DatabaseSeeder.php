<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $viewer = User::query()->updateOrCreate(
            ['email' => 'demo@blackframe.test'],
            [
                'name' => 'Maya Santos',
                'username' => 'maya.santos',
                'password' => $password,
                'bio' => 'Finding quiet color in busy places.',
                'avatar_path' => 'https://i.pravatar.cc/160?u=maya-santos',
            ],
        );

        $creators = collect([
            ['Elena Park', 'elena.park', 'elena@blackframe.test', 'Ceramics, small studios, and slow mornings.', 'elena-park'],
            ['Noah Williams', 'noah.w', 'noah@blackframe.test', 'Street frames from wherever the train stops.', 'noah-williams'],
            ['Amina Diallo', 'amina.d', 'amina@blackframe.test', 'Food, friends, and recipes worth repeating.', 'amina-diallo'],
            ['Theo Martins', 'theo.m', 'theo@blackframe.test', 'Coastlines and the people who live beside them.', 'theo-martins'],
            ['Lina Okafor', 'lina.o', 'lina@blackframe.test', 'Portraits shaped by music and movement.', 'lina-okafor'],
        ])->map(fn (array $creator) => User::query()->updateOrCreate(
            ['email' => $creator[2]],
            [
                'name' => $creator[0],
                'username' => $creator[1],
                'password' => $password,
                'bio' => $creator[3],
                'avatar_path' => 'https://i.pravatar.cc/160?u='.$creator[4],
            ],
        ));

        $creators->take(4)->each(fn (User $creator) => DB::table('follows')->updateOrInsert(
            [
                'follower_id' => $viewer->id,
                'following_id' => $creator->id,
            ],
            [
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ));

        $postData = [
            [$creators[0], 'The glaze finally landed where I wanted it. Soft edges, cobalt center.', 'Portland, Oregon', 'frame-ceramics-cobalt', 'Handmade ceramic bowls with a deep cobalt glaze on a studio table.'],
            [$creators[1], 'Rain made the whole block look like a film set for ten quiet minutes.', 'Brooklyn, New York', 'frame-rainy-brooklyn', 'A rain-soaked city street reflecting storefront lights at dusk.'],
            [$creators[2], 'Sunday lunch: tomatoes, torn bread, herbs, and whoever arrives first.', 'Dakar, Senegal', 'frame-sunday-table', 'A shared lunch table with tomatoes, bread, herbs, and bright plates.'],
            [$creators[3], 'First light, last boat in. The harbor was almost completely still.', 'Ubatuba, Brazil', 'frame-ubatuba-harbor', 'A small fishing boat entering a calm harbor in soft morning light.'],
        ];

        foreach ($postData as $index => [$creator, $caption, $location, $seed, $alt]) {
            $post = $creator->posts()->firstOrCreate(
                [
                    'caption' => $caption,
                    'type' => 'image',
                ],
                [
                    'location' => $location,
                    'published_at' => now()->subHours($index * 5 + 1),
                ],
            );

            $post->media()->updateOrCreate(
                ['path' => "https://picsum.photos/seed/{$seed}/1200/1500"],
                [
                    'disk' => 'external',
                    'mime_type' => 'image/jpeg',
                    'width' => 1200,
                    'height' => 1500,
                    'alt_text' => $alt,
                ],
            );

            $post->likes()->firstOrCreate(['user_id' => $viewer->id]);
            $post->comments()->firstOrCreate([
                'user_id' => $viewer->id,
                'body' => ['That blue is beautiful.', 'The reflections are perfect.', 'Saving this lunch idea.', 'Such a calm frame.'][$index],
            ]);
        }

        $this->call(PulseSeeder::class);
        $this->call(SubjectSeeder::class);
    }
}
