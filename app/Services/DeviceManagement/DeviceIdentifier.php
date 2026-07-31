<?php

namespace App\Services\DeviceManagement;

use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class DeviceIdentifier
{
    public function canonicalize(string $deviceId): string
    {
        $canonical = strtolower(trim($deviceId));

        if (! Str::isUuid($canonical)) {
            throw new InvalidArgumentException('Invalid device identifier.');
        }

        return $canonical;
    }

    public function blindIndex(string $deviceId): string
    {
        return hash_hmac('sha256', $this->canonicalize($deviceId), $this->lookupKey());
    }

    private function lookupKey(): string
    {
        $configured = (string) config('device-management.device_lookup_key', '');
        $key = str_starts_with($configured, 'base64:')
            ? base64_decode(substr($configured, 7), true)
            : $configured;

        if (! is_string($key) || strlen($key) < 32) {
            throw new RuntimeException('The device lookup key must contain at least 256 bits.');
        }

        return $key;
    }
}
