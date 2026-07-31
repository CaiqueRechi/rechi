<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SecureHttpsUrl implements ValidationRule
{
    public static function normalize(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $url = trim($value);

        if ($url === '') {
            return null;
        }

        if (! preg_match('/^[a-z][a-z0-9+.-]*:\/\//i', $url)) {
            $url = "http://{$url}";
        }

        return $url;
    }

    public static function isValid(mixed $value): bool
    {
        $url = self::normalize($value);

        if ($url === null || filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));

        return is_array($parts)
            && in_array($scheme, ['http', 'https'], true)
            && filled($parts['host'] ?? null)
            && ! isset($parts['user'])
            && ! isset($parts['pass']);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::isValid($value)) {
            $fail('A URL deve usar HTTP ou HTTPS, possuir host e nao pode conter credenciais.');
        }
    }
}
