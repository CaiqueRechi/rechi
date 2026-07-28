<?php

namespace Tests\Feature;

use App\Models\AccessAudit;
use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_and_update_another_users_access(): void
    {
        $owner = $this->createOwner();
        $subject = User::factory()->create();
        $matrix = app(AccessManager::class)->defaults();
        data_set($matrix, 'dashboard.view', true);

        $this->actingAs($owner)
            ->get(route('admin.access.index'))
            ->assertOk();

        $this->actingAs($owner)
            ->put(route('admin.access.update', $subject), [
                'accesses' => $matrix,
                'version' => null,
            ])
            ->assertRedirect();

        $this->assertTrue($subject->access()->firstOrFail()->accesses['dashboard']['view']);
        $this->assertDatabaseCount((new AccessAudit)->getTable(), 1);
    }

    public function test_user_cannot_grant_permissions_to_self(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, [
            'access_management.view',
            'access_management.update',
        ]);

        $this->actingAs($user)
            ->put(route('admin.access.update', $user), [
                'accesses' => app(AccessManager::class)->defaults(),
            ])
            ->assertForbidden();
    }

    public function test_delegated_admin_cannot_edit_owner_or_grant_critical_permission(): void
    {
        $owner = $this->createOwner();
        $admin = User::factory()->create();
        $subject = User::factory()->create();
        $this->grantAccess($admin, [
            'access_management.view',
            'access_management.update',
            'dashboard.view',
        ]);

        $criticalMatrix = app(AccessManager::class)->defaults();
        data_set($criticalMatrix, 'dashboard.view', true);

        $this->actingAs($admin)
            ->put(route('admin.access.update', $subject), ['accesses' => $criticalMatrix])
            ->assertForbidden();

        $this->actingAs($admin)
            ->put(route('admin.access.update', $owner), ['accesses' => $criticalMatrix])
            ->assertForbidden();
    }

    public function test_delegated_admin_can_grant_a_non_critical_permission_they_have(): void
    {
        $admin = User::factory()->create();
        $subject = User::factory()->create();
        $this->grantAccess($admin, [
            'access_management.view',
            'access_management.update',
            'kanban.delete_card',
        ]);
        $matrix = app(AccessManager::class)->defaults();
        data_set($matrix, 'kanban.delete_card', true);

        $this->actingAs($admin)
            ->put(route('admin.access.update', $subject), ['accesses' => $matrix])
            ->assertRedirect();

        $this->assertTrue($subject->access()->firstOrFail()->accesses['kanban']['delete_card']);
    }

    public function test_stale_update_is_rejected_without_audit(): void
    {
        $owner = $this->createOwner();
        $subject = User::factory()->create();
        $access = $this->grantAccess($subject, []);

        $this->actingAs($owner)
            ->put(route('admin.access.update', $subject), [
                'accesses' => app(AccessManager::class)->defaults(),
                'version' => now()->subDay()->toJSON(),
            ])
            ->assertSessionHasErrors('version');

        $this->assertDatabaseCount((new AccessAudit)->getTable(), 0);
        $this->assertSame($access->updated_at?->toJSON(), $access->fresh()?->updated_at?->toJSON());
    }
}
