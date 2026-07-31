<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeviceProfileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeviceManagement\StoreDeviceProfileRequest;
use App\Http\Requests\DeviceManagement\UpdateDeviceProfileRequest;
use App\Models\DeviceProfile;
use App\Models\ManagedDevice;
use App\Models\User;
use App\Services\DeviceManagement\DeviceProfileAuditLogger;
use App\Services\DeviceManagement\JwtSigningException;
use App\Services\DeviceManagement\Rs256JwtSigner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeviceProfileController extends Controller
{
    public function __construct(
        private DeviceProfileAuditLogger $auditLogger,
        private Rs256JwtSigner $jwtSigner,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $type = $request->string('type')->trim()->toString();
        $status = $request->string('status')->trim()->toString();
        $profiles = DeviceProfile::query()
            ->withCount([
                'devices',
                'devices as active_devices_count' => fn ($query) => $query->whereNull('revoked_at'),
            ])
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            }))
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('updated_at')
            ->paginate(20)
            ->withQueryString();

        $payload = $profiles->toArray();
        $payload['data'] = $profiles->getCollection()
            ->map(fn (DeviceProfile $profile): array => $this->serializeProfile($profile))
            ->all();

        return Inertia::render('admin/device-profiles/index', [
            'profiles' => $payload,
            'filters' => compact('search', 'type', 'status'),
            'profileTypes' => $this->profileTypes(),
            'apiConfiguration' => $this->apiConfiguration(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/device-profiles/form', [
            'profile' => null,
            'devices' => null,
            'profileTypes' => $this->profileTypes(),
            'apiConfiguration' => $this->apiConfiguration(),
        ]);
    }

    public function store(StoreDeviceProfileRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $profile = DeviceProfile::query()->create([
            ...$request->validated(),
            'created_by' => $user->getKey(),
            'updated_by' => $user->getKey(),
        ]);
        $this->auditLogger->record(
            $request,
            'profile.created',
            $profile,
            after: $this->auditProfile($profile),
        );

        return to_route('admin.device-profiles.edit', $profile)
            ->with('status', 'Profile criado com segurança.');
    }

    public function edit(Request $request, DeviceProfile $deviceProfile): Response
    {
        $devices = $deviceProfile->devices()
            ->latest()
            ->paginate(30);
        $devicePayload = $devices->toArray();
        $devicePayload['data'] = array_map(
            fn (ManagedDevice $device): array => [
                'id' => $device->id,
                'label' => $device->label,
                'deviceUuid' => $device->device_uuid,
                'firstConnectionDate' => $device->first_connection_date?->format('Y-m-d'),
                'lastConnectedAt' => $device->last_connected_at?->toIso8601String(),
                'revokedAt' => $device->revoked_at?->toIso8601String(),
                'createdAt' => $device->created_at?->toIso8601String(),
            ],
            $devices->items(),
        );

        return Inertia::render('admin/device-profiles/form', [
            'profile' => $this->serializeProfile($deviceProfile),
            'devices' => $devicePayload,
            'profileTypes' => $this->profileTypes(),
            'apiConfiguration' => $this->apiConfiguration(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(
        UpdateDeviceProfileRequest $request,
        DeviceProfile $deviceProfile,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $before = $this->auditProfile($deviceProfile);
        $deviceProfile->update([
            ...$request->validated(),
            'updated_by' => $user->getKey(),
        ]);
        $this->auditLogger->record(
            $request,
            'profile.updated',
            $deviceProfile,
            before: $before,
            after: $this->auditProfile($deviceProfile->refresh()),
        );

        return back()->with('status', 'Profile atualizado.');
    }

    public function destroy(Request $request, DeviceProfile $deviceProfile): RedirectResponse
    {
        DB::transaction(function () use ($request, $deviceProfile): void {
            $before = $this->auditProfile($deviceProfile);
            $deviceProfile->devices()->whereNull('revoked_at')->update(['revoked_at' => now('UTC')]);
            $this->auditLogger->record(
                $request,
                'profile.deleted',
                $deviceProfile,
                before: $before,
            );
            $deviceProfile->delete();
        });

        return to_route('admin.device-profiles.index')
            ->with('status', 'Profile removido e dispositivos revogados.');
    }

    /** @return array<int, array{value: string, label: string}> */
    private function profileTypes(): array
    {
        return array_map(
            fn (DeviceProfileType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ],
            DeviceProfileType::cases(),
        );
    }

    /** @return array<string, mixed> */
    private function serializeProfile(DeviceProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'name' => $profile->name,
            'slug' => $profile->slug,
            'type' => $profile->type->value,
            'typeLabel' => $profile->type->label(),
            'description' => $profile->description,
            'config' => $profile->config,
            'isActive' => $profile->is_active,
            'deviceCount' => $profile->devices_count ?? $profile->devices()->count(),
            'activeDeviceCount' => $profile->active_devices_count
                ?? $profile->devices()->whereNull('revoked_at')->count(),
            'updatedAt' => $profile->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function auditProfile(DeviceProfile $profile): array
    {
        return $profile->only(['name', 'slug', 'type', 'description', 'config', 'is_active']);
    }

    /** @return array<string, mixed> */
    private function apiConfiguration(): array
    {
        try {
            $publicKey = $this->jwtSigner->publicKeyBase64();
        } catch (JwtSigningException) {
            $publicKey = null;
        }

        return [
            'baseUrl' => rtrim((string) config('app.url'), '/').'/',
            'endpoint' => '/api/v1/devices/{deviceId}/configuration',
            'issuer' => (string) config('device-management.jwt.issuer'),
            'audience' => (string) config('device-management.jwt.audience'),
            'ttlSeconds' => min(max((int) config('device-management.jwt.ttl_seconds', 300), 60), 900),
            'publicKeyBase64' => $publicKey,
            'signingKeyConfigured' => $publicKey !== null,
        ];
    }
}
