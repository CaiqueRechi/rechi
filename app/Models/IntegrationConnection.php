<?php

namespace App\Models;

use App\Casts\EncryptedIntegrationCredentials;
use App\IntegrationProvider;
use Database\Factories\IntegrationConnectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property IntegrationProvider $provider
 * @property array<string, mixed> $credentials
 * @property string $status
 * @property string|null $account_id
 * @property string|null $account_name
 * @property string|null $account_avatar_url
 * @property Carbon|null $connected_at
 * @property Carbon|null $last_synced_at
 * @property string|null $last_error
 */
#[Fillable(['provider', 'credentials', 'status', 'account_id', 'account_name', 'account_avatar_url', 'connected_at', 'last_synced_at', 'last_error'])]
#[Hidden(['credentials'])]
class IntegrationConnection extends Model
{
    /** @use HasFactory<IntegrationConnectionFactory> */
    use HasFactory;

    protected $attributes = ['status' => 'disconnected'];

    /** @return HasMany<IntegrationActivity, $this> */
    public function activities(): HasMany
    {
        return $this->hasMany(IntegrationActivity::class);
    }

    /** @return array<string, class-string|string> */
    protected function casts(): array
    {
        return [
            'provider' => IntegrationProvider::class,
            'credentials' => EncryptedIntegrationCredentials::class,
            'connected_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }
}
