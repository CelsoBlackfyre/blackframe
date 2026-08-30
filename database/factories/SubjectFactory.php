<?php

namespace Database\Factories;

use App\Enums\SubjectType;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'type' => fake()->randomElement(SubjectType::cases()),
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->sentence(14),
            'image_url' => 'https://picsum.photos/seed/'.Str::slug($name).'/640/800',
            'metadata' => null,
        ];
    }
}
