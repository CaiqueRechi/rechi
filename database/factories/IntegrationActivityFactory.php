<?php

namespace Database\Factories;

use App\IntegrationProvider;
use App\Models\IntegrationActivity;
use App\Models\IntegrationConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IntegrationActivity>
 */
class IntegrationActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'integration_connection_id' => IntegrationConnection::factory(),
            'provider' => IntegrationProvider::Spotify,
            'external_id' => fake()->uuid(),
            'activity_type' => 'track',
            'payload' => ['title' => fake()->sentence(3), 'subtitle' => fake()->name()],
            'occurred_at' => now(),
        ];
    }
}
