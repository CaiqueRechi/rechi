<?php

namespace Database\Factories;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Card>
 */
class CardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'board_id' => Board::factory(),
            'board_column_id' => fn (array $attributes) => BoardColumn::factory()->create([
                'board_id' => $attributes['board_id'],
            ]),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'starts_at' => null,
            'due_at' => fake()->optional()->dateTimeBetween('now', '+1 month'),
            'completed_at' => null,
            'position' => fake()->numberBetween(1, 1000),
            'archived_at' => null,
        ];
    }
}
