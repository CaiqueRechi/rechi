<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\CardActivity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CardActivity>
 */
class CardActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'board_id' => fn (array $attributes) => Card::query()
                ->whereKey($attributes['card_id'])
                ->value('board_id'),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['created', 'updated', 'moved', 'assigned']),
            'changes' => [],
        ];
    }
}
