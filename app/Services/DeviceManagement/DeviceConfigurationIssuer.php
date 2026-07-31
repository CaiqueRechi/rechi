<?php

namespace App\Services\DeviceManagement;

use App\Enums\DeviceProfileType;
use App\Models\ManagedDevice;
use App\Rules\SecureHttpsUrl;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class DeviceConfigurationIssuer
{
    public function __construct(
        private DeviceIdentifier $identifier,
        private Rs256JwtSigner $signer,
    ) {}

    public function issue(string $deviceId): string
    {
        $canonicalId = $this->identifier->canonicalize($deviceId);
        $deviceHash = $this->identifier->blindIndex($canonicalId);

        return DB::transaction(function () use ($canonicalId, $deviceHash): string {
            $device = ManagedDevice::query()
                ->with('profile')
                ->where('device_uuid_hash', $deviceHash)
                ->whereNull('revoked_at')
                ->lockForUpdate()
                ->first();

            if ($device === null
                || $device->profile === null
                || ! $device->profile->is_active
                || $device->profile->trashed()) {
                throw (new ModelNotFoundException)->setModel(ManagedDevice::class);
            }

            $firstConnectionDate = $device->first_connection_date?->format('Y-m-d')
                ?? now('UTC')->toDateString();
            $issuedAt = now('UTC')->getTimestamp();
            $ttl = min(max((int) config('device-management.jwt.ttl_seconds', 300), 60), 900);
            $tokenId = (string) Str::uuid();
            $url = $this->configurationUrl($device);
            $token = $this->signer->sign([
                'iss' => (string) config('device-management.jwt.issuer'),
                'aud' => (string) config('device-management.jwt.audience'),
                'sub' => $canonicalId,
                'firstConnectionDate' => $firstConnectionDate,
                'url' => $url,
                'iat' => $issuedAt,
                'nbf' => $issuedAt,
                'exp' => $issuedAt + $ttl,
                'jti' => $tokenId,
            ]);

            $device->forceFill([
                'first_connection_date' => $firstConnectionDate,
                'last_connected_at' => now('UTC'),
                'last_token_jti_hash' => hash('sha256', $tokenId),
            ])->save();

            return $token;
        }, 3);
    }

    private function configurationUrl(ManagedDevice $device): string
    {
        $url = match ($device->profile->type) {
            DeviceProfileType::Kiosk => data_get($device->profile->config, 'url'),
        };

        if (! SecureHttpsUrl::isValid($url)) {
            throw new RuntimeException('The kiosk profile does not contain a secure URL.');
        }

        return $url;
    }
}
