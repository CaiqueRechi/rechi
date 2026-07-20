<?php

namespace App\Models;

use App\IntegrationProvider;
use Database\Factories\IntegrationActivityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $integration_connection_id
 * @property IntegrationProvider $provider
 * @property string $external_id
 * @property string $activity_type
 * @property array<string, mixed> $payload
 * @property Carbon $occurred_at
 */
#[Fillable(['integration_connection_id', 'provider', 'external_id', 'activity_type', 'payload', 'occurred_at'])]
class IntegrationActivity extends Model
{
    /** @use HasFactory<IntegrationActivityFactory> */
    use HasFactory;

    /** @return BelongsTo<IntegrationConnection, $this> */
    public function connection(): BelongsTo
    {
        return $this->belongsTo(IntegrationConnection::class, 'integration_connection_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'provider' => IntegrationProvider::class,
            'payload' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
