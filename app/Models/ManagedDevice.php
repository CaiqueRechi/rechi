<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\ManagedDeviceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $device_uuid
 * @property string $device_uuid_hash
 * @property CarbonInterface|null $first_connection_date
 * @property CarbonInterface|null $last_connected_at
 * @property CarbonInterface|null $revoked_at
 */
#[Fillable([
    'device_profile_id',
    'label',
    'device_uuid',
    'device_uuid_hash',
    'first_connection_date',
    'last_connected_at',
    'last_token_jti_hash',
    'revoked_at',
    'created_by',
])]
class ManagedDevice extends Model
{
    /** @use HasFactory<ManagedDeviceFactory> */
    use HasFactory;

    /** @return BelongsTo<DeviceProfile, $this> */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(DeviceProfile::class, 'device_profile_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'device_uuid' => 'encrypted',
            'first_connection_date' => 'date:Y-m-d',
            'last_connected_at' => 'immutable_datetime',
            'revoked_at' => 'immutable_datetime',
        ];
    }
}
