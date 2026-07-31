<?php

namespace Database\Factories;

use App\Models\DeviceProfile;
use App\Models\ManagedDevice;
use App\Services\DeviceManagement\DeviceIdentifier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ManagedDevice> */
class ManagedDeviceFactory extends Factory
{
    protected $model = ManagedDevice::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $deviceId = strtolower((string) Str::uuid());

        return [
            'device_profile_id' => DeviceProfile::factory(),
            'label' => fake()->optional()->words(2, true),
            'device_uuid' => $deviceId,
            'device_uuid_hash' => app(DeviceIdentifier::class)->blindIndex($deviceId),
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (): array => ['revoked_at' => now()]);
    }
}
