<?php

namespace Tests;

use App\Models\Access;
use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    /** @param array<string, mixed> $attributes */
    protected function createOwner(array $attributes = []): User
    {
        $owner = User::factory()->admin()->create($attributes);
        config()->set('access.owner_user_id', $owner->getKey());

        return $owner;
    }

    /** @param array<int, string> $permissions */
    protected function grantAccess(User $user, array $permissions): Access
    {
        $accessManager = app(AccessManager::class);
        $matrix = $accessManager->defaults();

        foreach ($permissions as $permission) {
            data_set($matrix, $permission, true);
        }

        return Access::query()->updateOrCreate(
            ['user_id' => $user->getKey()],
            ['accesses' => $matrix],
        );
    }

    /** @param array<string, bool> $permissions */
    protected function setAccess(User $user, array $permissions): Access
    {
        $matrix = app(AccessManager::class)->defaults();

        foreach ($permissions as $permission => $granted) {
            data_set($matrix, $permission, $granted);
        }

        return Access::query()->updateOrCreate(
            ['user_id' => $user->getKey()],
            ['accesses' => $matrix],
        );
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
