<?php

namespace Database\Factories;

use App\Enums\DeviceProfileType;
use App\Models\DeviceProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DeviceProfile> */
class DeviceProfileFactory extends Factory
{
    protected $model = DeviceProfile::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = fake()->unique()->company().' kiosk';

        return [
            'name' => ucfirst($name),
            'slug' => fake()->unique()->slug(3),
            'type' => DeviceProfileType::Kiosk,
            'description' => fake()->sentence(),
            'config' => ['url' => 'https://portal.example.com/'],
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
