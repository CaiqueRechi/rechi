<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property string $gateway
 * @property string $environment
 * @property PaymentStatus $status
 * @property string|null $method
 * @property string|null $checkout_url
 * @property int $amount_cents
 * @property string $currency
 * @property Carbon|null $approved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read Collection<int, PaymentEvent> $events
 */
#[Fillable([
    'order_id',
    'gateway',
    'environment',
    'status',
    'method',
    'external_preference_id',
    'external_payment_id',
    'external_status',
    'checkout_url',
    'amount_cents',
    'currency',
    'raw_response',
    'approved_at',
    'rejected_at',
    'refunded_at',
    'canceled_at',
])]
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return HasMany<PaymentEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(PaymentEvent::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'raw_response' => 'array',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'refunded_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }
}
