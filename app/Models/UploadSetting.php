<?php

namespace App\Models;

use Database\Factories\UploadSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $context
 * @property list<string> $allowed_mime_types
 * @property list<string> $allowed_extensions
 * @property int $max_file_size_kb
 * @property int $max_total_size_kb
 * @property int $max_files_per_briefing
 * @property bool $is_active
 */
#[Fillable([
    'context',
    'allowed_mime_types',
    'allowed_extensions',
    'max_file_size_kb',
    'max_total_size_kb',
    'max_files_per_briefing',
    'is_active',
])]
class UploadSetting extends Model
{
    /** @use HasFactory<UploadSettingFactory> */
    use HasFactory;

    public static function briefingDefaults(): self
    {
        return self::query()->firstOrCreate(
            ['context' => 'briefing'],
            [
                'allowed_mime_types' => [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'application/pdf',
                    'text/plain',
                ],
                'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt'],
                'max_file_size_kb' => 5120,
                'max_total_size_kb' => 20480,
                'max_files_per_briefing' => 10,
                'is_active' => true,
            ],
        );
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'allowed_mime_types' => 'array',
            'allowed_extensions' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
