<?php

namespace App\Services\Integrations;

use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Str;
use JsonException;
use LogicException;

class IntegrationEncrypter
{
    private Encrypter $encrypter;

    public function __construct(?string $configuredKey = null)
    {
        $key = $configuredKey ?? config('services.integrations.encryption_key');

        if (! is_string($key) || $key === '') {
            throw new LogicException('APP_SETTINGS_KEY must be configured before integration credentials can be used.');
        }

        $decodedKey = Str::startsWith($key, 'base64:')
            ? base64_decode(Str::after($key, 'base64:'), true)
            : $key;

        if (! is_string($decodedKey) || mb_strlen($decodedKey, '8bit') !== 32) {
            throw new LogicException('APP_SETTINGS_KEY must contain exactly 32 bytes, preferably encoded as base64:.');
        }

        $this->encrypter = new Encrypter($decodedKey, 'AES-256-CBC');
    }

    /** @param array<string, mixed> $credentials */
    public function encrypt(array $credentials): string
    {
        return $this->encrypter->encryptString(json_encode($credentials, JSON_THROW_ON_ERROR));
    }

    /** @return array<string, mixed> */
    public function decrypt(string $payload): array
    {
        try {
            $credentials = json_decode($this->encrypter->decryptString($payload), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new LogicException('The encrypted integration credentials are not valid JSON.', previous: $exception);
        }

        return is_array($credentials) ? $credentials : [];
    }
}
