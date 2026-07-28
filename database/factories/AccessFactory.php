<?php

namespace Database\Factories;

use App\Models\Access;
use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Access>
 */
class AccessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'accesses' => app(AccessManager::class)->defaults(),
        ];
    }
}
