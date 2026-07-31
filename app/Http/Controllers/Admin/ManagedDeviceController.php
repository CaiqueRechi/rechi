<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeviceManagement\StoreManagedDeviceRequest;
use App\Models\DeviceProfile;
use App\Models\ManagedDevice;
use App\Models\User;
use App\Services\DeviceManagement\DeviceIdentifier;
use App\Services\DeviceManagement\DeviceProfileAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ManagedDeviceController extends Controller
{
    public function __construct(
        private DeviceIdentifier $identifier,
        private DeviceProfileAuditLogger $auditLogger,
    ) {}

    public function store(
        StoreManagedDeviceRequest $request,
        DeviceProfile $deviceProfile,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $canonicalId = $this->identifier->canonicalize($request->string('device_uuid')->toString());
        $deviceHash = $this->identifier->blindIndex($canonicalId);

        DB::transaction(function () use (
            $request,
            $deviceProfile,
            $user,
            $canonicalId,
            $deviceHash,
        ): void {
            $existing = ManagedDevice::query()
                ->where('device_uuid_hash', $deviceHash)
                ->lockForUpdate()
                ->first();

            if ($existing !== null && $existing->revoked_at === null) {
                throw ValidationException::withMessages([
                    'device_uuid' => 'Este UUID já está vinculado a um profile ativo.',
                ]);
            }

            if ($existing !== null) {
                $before = $this->auditDevice($existing);
                $existing->forceFill([
                    'device_profile_id' => $deviceProfile->getKey(),
                    'label' => $request->string('label')->trim()->toString() ?: null,
                    'device_uuid' => $canonicalId,
                    'first_connection_date' => null,
                    'last_connected_at' => null,
                    'last_token_jti_hash' => null,
                    'revoked_at' => null,
                    'created_by' => $user->getKey(),
                ])->save();
                $device = $existing;
                $action = 'device.reactivated';
            } else {
                $before = null;
                $device = ManagedDevice::query()->create([
                    'device_profile_id' => $deviceProfile->getKey(),
                    'label' => $request->string('label')->trim()->toString() ?: null,
                    'device_uuid' => $canonicalId,
                    'device_uuid_hash' => $deviceHash,
                    'created_by' => $user->getKey(),
                ]);
                $action = 'device.created';
            }

            $this->auditLogger->record(
                $request,
                $action,
                $deviceProfile,
                $device,
                $before,
                $this->auditDevice($device),
            );
        });

        return back()->with('status', 'Dispositivo vinculado ao profile.');
    }

    public function destroy(Request $request, ManagedDevice $managedDevice): RedirectResponse
    {
        if ($managedDevice->revoked_at === null) {
            $before = $this->auditDevice($managedDevice);
            $managedDevice->update(['revoked_at' => now('UTC')]);
            $this->auditLogger->record(
                $request,
                'device.revoked',
                $managedDevice->profile,
                $managedDevice,
                $before,
                $this->auditDevice($managedDevice->refresh()),
            );
        }

        return back()->with('status', 'Dispositivo revogado.');
    }

    /** @return array<string, mixed> */
    private function auditDevice(ManagedDevice $device): array
    {
        return [
            'profile_id' => $device->device_profile_id,
            'device_uuid_hash' => $device->device_uuid_hash,
            'label' => $device->label,
            'first_connection_date' => $device->first_connection_date?->format('Y-m-d'),
            'revoked_at' => $device->revoked_at?->toIso8601String(),
        ];
    }
}
