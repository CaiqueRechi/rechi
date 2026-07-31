<?php

namespace Tests\Feature;

use App\Models\DeviceProfile;
use App\Models\DeviceProfileAudit;
use App\Models\ManagedDevice;
use App\Models\User;
use App\Services\DeviceManagement\DeviceIdentifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeviceProfileManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_user_cannot_access_profile_management(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.device-profiles.index'))
            ->assertForbidden();
    }

    public function test_authorized_user_can_create_kiosk_profile_with_json_config(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, [
            'device_profiles.view',
            'device_profiles.create',
        ]);

        $this->actingAs($user)
            ->post(route('admin.device-profiles.store'), [
                'name' => 'Quiosque produção',
                'slug' => 'quiosque-producao',
                'type' => 'kiosk',
                'description' => 'Portal controlado.',
                'is_active' => true,
                'config' => ['url' => 'https://portal.example.com/'],
            ])
            ->assertRedirect();

        $profile = DeviceProfile::query()->firstOrFail();

        $this->assertSame('kiosk', $profile->type->value);
        $this->assertSame(
            ['url' => 'https://portal.example.com/'],
            $profile->config,
        );
        $this->assertDatabaseHas('device_profile_audits', [
            'actor_id' => $user->id,
            'device_profile_id' => $profile->id,
            'action' => 'profile.created',
        ]);
    }

    public function test_kiosk_profile_accepts_http_and_bare_domains(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, [
            'device_profiles.view',
            'device_profiles.create',
        ]);

        $this->actingAs($user)
            ->post(route('admin.device-profiles.store'), [
                'name' => 'Quiosque interno',
                'slug' => 'quiosque-interno',
                'type' => 'kiosk',
                'description' => 'Portal interno.',
                'is_active' => true,
                'config' => ['url' => 'hubibiporahomolog.grupoibipora.local'],
            ])
            ->assertRedirect();

        $profile = DeviceProfile::query()->firstOrFail();

        $this->assertSame(
            ['url' => 'http://hubibiporahomolog.grupoibipora.local'],
            $profile->config,
        );
    }

    public function test_kiosk_profile_rejects_invalid_urls_credentials_and_unknown_config(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, ['device_profiles.create']);

        foreach ([
            ['url' => 'ftp://portal.example.com/'],
            ['url' => 'https://user:secret@portal.example.com/'],
            ['url' => 'https://portal.example.com/', 'privateKey' => 'must-not-be-here'],
        ] as $config) {
            $this->actingAs($user)
                ->from(route('admin.device-profiles.create'))
                ->post(route('admin.device-profiles.store'), [
                    'name' => 'Invalid profile',
                    'slug' => 'invalid-'.Str::lower(Str::random(8)),
                    'type' => 'kiosk',
                    'is_active' => true,
                    'config' => $config,
                ])
                ->assertSessionHasErrors();
        }

        $this->assertDatabaseCount('device_profiles', 0);
    }

    public function test_device_uuid_is_encrypted_and_indexed_without_plaintext(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, ['device_profiles.manage_devices']);
        $profile = DeviceProfile::factory()->create();
        $deviceId = strtolower((string) Str::uuid());

        $this->actingAs($user)
            ->post(route('admin.device-profiles.devices.store', $profile), [
                'device_uuid' => $deviceId,
                'label' => 'Tablet recepção',
            ])
            ->assertRedirect();

        $device = ManagedDevice::query()->firstOrFail();
        $rawValue = DB::table('managed_devices')
            ->where('id', $device->id)
            ->value('device_uuid');

        $this->assertSame($deviceId, $device->device_uuid);
        $this->assertNotSame($deviceId, $rawValue);
        $this->assertStringNotContainsString($deviceId, (string) $rawValue);
        $this->assertSame(
            app(DeviceIdentifier::class)->blindIndex($deviceId),
            $device->device_uuid_hash,
        );
        $this->assertDatabaseHas('device_profile_audits', [
            'action' => 'device.created',
            'managed_device_id' => $device->id,
        ]);
    }

    public function test_active_device_cannot_be_silently_reassigned(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, ['device_profiles.manage_devices']);
        $firstProfile = DeviceProfile::factory()->create();
        $secondProfile = DeviceProfile::factory()->create();
        $deviceId = strtolower((string) Str::uuid());
        ManagedDevice::factory()->for($firstProfile, 'profile')->create([
            'device_uuid' => $deviceId,
            'device_uuid_hash' => app(DeviceIdentifier::class)->blindIndex($deviceId),
        ]);

        $this->actingAs($user)
            ->post(route('admin.device-profiles.devices.store', $secondProfile), [
                'device_uuid' => $deviceId,
            ])
            ->assertSessionHasErrors('device_uuid');

        $this->assertSame(
            $firstProfile->id,
            ManagedDevice::query()->firstOrFail()->device_profile_id,
        );
    }

    public function test_deleting_profile_soft_deletes_it_and_revokes_devices(): void
    {
        $user = User::factory()->create();
        $this->grantAccess($user, ['device_profiles.delete']);
        $profile = DeviceProfile::factory()->create();
        $device = ManagedDevice::factory()->for($profile, 'profile')->create();

        $this->actingAs($user)
            ->delete(route('admin.device-profiles.destroy', $profile))
            ->assertRedirect(route('admin.device-profiles.index'));

        $this->assertSoftDeleted($profile);
        $this->assertNotNull($device->refresh()->revoked_at);
        $this->assertTrue(
            DeviceProfileAudit::query()
                ->where('action', 'profile.deleted')
                ->where('device_profile_id', $profile->id)
                ->exists(),
        );
    }
}
