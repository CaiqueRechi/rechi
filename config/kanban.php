<?php

return [
    'attachments' => [
        'disk' => env('KANBAN_ATTACHMENTS_DISK', 'local'),
        'max_size_kb' => 10240,
        'extensions' => ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'md', 'zip'],
        'mime_types' => [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed',
        ],
    ],
];
