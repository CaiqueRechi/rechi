<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccessAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_has_full_effective_access_without_access_record(): void
    {
        $owner = $this->createOwner();

        $this->assertTrue(app(AccessManager::class)->allows($owner, 'dashboard.view'));
        $this->actingAs($owner)->get(route('dashboard'))->assertOk();
    }

    public function test_regular_user_cannot_access_dashboard_or_ajax_endpoint(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('dashboard'))->assertForbidden();
        $this->actingAs($user)
            ->getJson(route('dashboard'))
            ->assertForbidden();
    }

    public function test_explicitly_authorized_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, ['dashboard.view']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
    }

    public function test_missing_access_record_uses_safe_defaults(): void
    {
        $user = User::factory()->create();
        $manager = app(AccessManager::class);

        $this->assertFalse($manager->allows($user, 'dashboard.view'));
        $this->assertFalse($manager->allows($user, 'access_management.update'));
        $this->assertTrue($manager->allows($user, 'kanban.view'));
    }

    public function test_unknown_and_non_boolean_permissions_are_rejected(): void
    {
        $manager = app(AccessManager::class);

        try {
            $manager->normalize([
                'dashboard' => ['view' => 'yes'],
                'unknown' => ['view' => true],
            ]);
            $this->fail('ValidationException was not thrown.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('accesses.dashboard.view', $exception->errors());
            $this->assertArrayHasKey('accesses.unknown', $exception->errors());
        }
    }

    public function test_navigation_omits_unauthorized_modules(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('access.none'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('access.permissions.dashboard.view', false)
                ->where('access.navigation', fn ($navigation) => collect($navigation)
                    ->doesntContain('permission', 'dashboard.view')));
    }
}
