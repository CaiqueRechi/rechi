<?php

namespace Database\Factories;

use App\Models\Board;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Board>
 */
class BoardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'color' => fake()->randomElement(['#7c3aed', '#0891b2', '#16a34a', '#ea580c']),
            'visibility' => 'private',
            'archived_at' => null,
        ];
    }
}
