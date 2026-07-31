<?php

return [
    'device_lookup_key' => env('DEVICE_LOOKUP_KEY', env('APP_KEY')),

    'jwt' => [
        'issuer' => env('DEVICE_JWT_ISSUER', 'rechi-mdm-api'),
        'audience' => env('DEVICE_JWT_AUDIENCE', 'rechi-mdm-device'),
        'ttl_seconds' => (int) env('DEVICE_JWT_TTL_SECONDS', 300),
        'key_id' => env('DEVICE_JWT_KEY_ID'),
        'private_key_path' => env('DEVICE_JWT_PRIVATE_KEY_PATH'),
        'private_key_base64' => env('DEVICE_JWT_PRIVATE_KEY_BASE64'),
        'private_key_passphrase' => env('DEVICE_JWT_PRIVATE_KEY_PASSPHRASE'),
    ],
];
