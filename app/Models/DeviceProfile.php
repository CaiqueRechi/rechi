<?php

namespace App\Models;

use App\Enums\DeviceProfileType;
use Database\Factories\DeviceProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property DeviceProfileType $type
 * @property array<string, mixed> $config
 * @property bool $is_active
 * @property int $devices_count
 * @property int $active_devices_count
 */
#[Fillable([
    'name',
    'slug',
    'type',
    'description',
    'config',
    'is_active',
    'created_by',
    'updated_by',
])]
class DeviceProfile extends Model
{
    /** @use HasFactory<DeviceProfileFactory> */
    use HasFactory, SoftDeletes;

    /** @return HasMany<ManagedDevice, $this> */
    public function devices(): HasMany
    {
        return $this->hasMany(ManagedDevice::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => DeviceProfileType::class,
            'config' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
