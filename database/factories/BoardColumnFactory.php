<?php

namespace Database\Factories;

use App\Models\Board;
use App\Models\BoardColumn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BoardColumn>
 */
class BoardColumnFactory extends Factory
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
            'title' => fake()->randomElement(['Backlog', 'Em andamento', 'Concluído']),
            'position' => fake()->unique()->numberBetween(1, 1000),
            'card_limit' => null,
            'archived_at' => null,
        ];
    }
}
