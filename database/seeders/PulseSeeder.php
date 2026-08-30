<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class PulseSeeder extends Seeder
{
    public function run(): void
    {
        $authors = User::query()
            ->whereIn('email', [
                'demo@blackframe.test',
                'elena@blackframe.test',
                'noah@blackframe.test',
                'amina@blackframe.test',
            ])
            ->get()
            ->keyBy('email');

        $viewer = $authors->get('demo@blackframe.test');

        if (! $viewer) {
            return;
        }

        $pulseData = [
            ['demo@blackframe.test', 'BlackFrame is starting to feel less like a clone and more like a place with its own point of view.'],
            ['elena@blackframe.test', 'The best studio days are usually the ones where the first three attempts fail for different reasons.'],
            ['noah@blackframe.test', 'A city changes completely when you stop looking for landmarks and start following the light.'],
            ['amina@blackframe.test', 'What is one recipe you learned from someone you love and still make exactly their way?'],
        ];

        foreach ($pulseData as $index => [$email, $body]) {
            $creator = $authors->get($email);

            if (! $creator) {
                continue;
            }

            $post = $creator->posts()->firstOrCreate([
                'type' => 'text',
                'caption' => $body,
            ], [
                'published_at' => now()->subMinutes($index * 37 + 8),
            ]);

            if (! $creator->is($viewer)) {
                $post->likes()->firstOrCreate(['user_id' => $viewer->id]);
            }
        }
    }
}
