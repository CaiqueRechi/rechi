<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SecureHttpsUrl implements ValidationRule
{
    public static function isValid(mixed $value): bool
    {
        if (! is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $parts = parse_url($value);

        return is_array($parts)
            && strtolower((string) ($parts['scheme'] ?? '')) === 'https'
            && filled($parts['host'] ?? null)
            && ! isset($parts['user'])
            && ! isset($parts['pass']);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::isValid($value)) {
            $fail('A URL deve usar HTTPS, possuir host e não pode conter credenciais.');
        }
    }
}
