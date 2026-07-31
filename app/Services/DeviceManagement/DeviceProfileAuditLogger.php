<?php

namespace App\Services\DeviceManagement;

use App\Models\DeviceProfile;
use App\Models\DeviceProfileAudit;
use App\Models\ManagedDevice;
use App\Models\User;
use Illuminate\Http\Request;

class DeviceProfileAuditLogger
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function record(
        Request $request,
        string $action,
        ?DeviceProfile $profile = null,
        ?ManagedDevice $device = null,
        ?array $before = null,
        ?array $after = null,
    ): void {
        $actor = $request->user();

        DeviceProfileAudit::query()->create([
            'actor_id' => $actor instanceof User ? $actor->getKey() : null,
            'device_profile_id' => $profile?->getKey(),
            'managed_device_id' => $device?->getKey(),
            'action' => $action,
            'before' => $before,
            'after' => $after,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 2000),
        ]);
    }
}
