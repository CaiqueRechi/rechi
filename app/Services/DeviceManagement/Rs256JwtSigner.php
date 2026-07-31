<?php

namespace App\Services\DeviceManagement;

use OpenSSLAsymmetricKey;

class Rs256JwtSigner
{
    public function publicKeyBase64(): string
    {
        $privateKey = $this->privateKey();

        try {
            $details = openssl_pkey_get_details($privateKey);
            $publicKey = is_array($details) ? ($details['key'] ?? null) : null;

            if (! is_string($publicKey)) {
                throw new JwtSigningException('Unable to derive the device JWT public key.');
            }

            return (string) preg_replace(
                '/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/',
                '',
                $publicKey,
            );
        } finally {
            openssl_free_key($privateKey);
        }
    }

    /** @param array<string, mixed> $claims */
    public function sign(array $claims): string
    {
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $keyId = config('device-management.jwt.key_id');

        if (filled($keyId)) {
            $header['kid'] = (string) $keyId;
        }

        $encodedHeader = $this->encodeJson($header);
        $encodedClaims = $this->encodeJson($claims);
        $signingInput = "{$encodedHeader}.{$encodedClaims}";
        $privateKey = $this->privateKey();
        $signature = '';

        try {
            if (! openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
                throw new JwtSigningException('Unable to sign the device configuration token.');
            }
        } finally {
            openssl_free_key($privateKey);
        }

        return "{$signingInput}.{$this->base64UrlEncode($signature)}";
    }

    private function privateKey(): OpenSSLAsymmetricKey
    {
        $material = $this->privateKeyMaterial();
        $passphrase = config('device-management.jwt.private_key_passphrase');
        $key = openssl_pkey_get_private($material, is_string($passphrase) ? $passphrase : '');

        if (! $key instanceof OpenSSLAsymmetricKey) {
            throw new JwtSigningException('The device JWT private key is invalid.');
        }

        $details = openssl_pkey_get_details($key);

        if (! is_array($details)
            || ($details['type'] ?? null) !== OPENSSL_KEYTYPE_RSA
            || ($details['bits'] ?? 0) < 2048) {
            openssl_free_key($key);

            throw new JwtSigningException('The device JWT key must be RSA with at least 2048 bits.');
        }

        return $key;
    }

    private function privateKeyMaterial(): string
    {
        $path = config('device-management.jwt.private_key_path');

        if (is_string($path) && $path !== '') {
            $resolvedPath = str_starts_with($path, DIRECTORY_SEPARATOR)
                || preg_match('/^[A-Za-z]:[\\\\\/]/', $path) === 1
                    ? $path
                    : base_path($path);
            $material = is_file($resolvedPath) ? file_get_contents($resolvedPath) : false;

            if (is_string($material) && $material !== '') {
                return $material;
            }

            throw new JwtSigningException('The device JWT private key file is unavailable.');
        }

        $encoded = config('device-management.jwt.private_key_base64');
        $material = is_string($encoded) ? base64_decode($encoded, true) : false;

        if (! is_string($material) || $material === '') {
            throw new JwtSigningException('The device JWT private key is not configured.');
        }

        return $material;
    }

    /** @param array<string, mixed> $value */
    private function encodeJson(array $value): string
    {
        $json = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        return $this->base64UrlEncode($json);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
