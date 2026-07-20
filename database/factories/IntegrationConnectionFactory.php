<?php

namespace Database\Factories;

use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IntegrationConnection>
 */
class IntegrationConnectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'provider' => fake()->unique()->randomElement(IntegrationProvider::cases()),
            'credentials' => ['api_key' => 'test-secret'],
            'status' => 'connected',
            'account_name' => fake()->userName(),
            'connected_at' => now(),
        ];
    }
}
