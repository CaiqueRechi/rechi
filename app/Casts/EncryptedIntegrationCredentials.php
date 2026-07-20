<?php

namespace App\Casts;

use App\Services\Integrations\IntegrationEncrypter;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/** @implements CastsAttributes<array<string, mixed>, array<string, mixed>> */
class EncryptedIntegrationCredentials implements CastsAttributes
{
    /** @return array<string, mixed> */
    public function get(Model $model, string $key, mixed $value, array $attributes): array
    {
        if (! is_string($value) || $value === '') {
            return [];
        }

        return app(IntegrationEncrypter::class)->decrypt($value);
    }

    /** @return array<string, string> */
    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        if (! is_array($value)) {
            throw new InvalidArgumentException('Integration credentials must be an array.');
        }

        return [$key => app(IntegrationEncrypter::class)->encrypt($value)];
    }
}
