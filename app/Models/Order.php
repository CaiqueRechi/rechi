<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductionStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $public_number
 * @property string $customer_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property OrderStatus $status
 * @property PaymentStatus $payment_status
 * @property ProductionStatus $production_status
 * @property int $subtotal_cents
 * @property int $discount_cents
 * @property int $total_cents
 * @property string $currency
 * @property string|null $agreed_delivery
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, OrderItem> $items
 * @property-read Payment|null $payment
 * @property-read Briefing|null $briefing
 * @property-read Collection<int, OrderStatusHistory> $statusHistories
 */
#[Fillable([
    'public_number',
    'user_id',
    'customer_name',
    'customer_email',
    'customer_phone',
    'status',
    'payment_status',
    'payment_method',
    'production_status',
    'subtotal_cents',
    'discount_cents',
    'total_cents',
    'currency',
    'agreed_delivery',
    'utm',
    'lead_source',
    'entry_page',
    'user_agent',
    'secure_access_token_hash',
    'secure_access_expires_at',
    'terms_accepted_at',
    'paid_at',
    'canceled_at',
    'refunded_at',
    'delivered_at',
    'final_url',
    'internal_notes',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Order $order): void {
            $order->public_number = $order->public_number ?: 'RC-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        });
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasOne<Payment, $this> */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /** @return HasOne<Briefing, $this> */
    public function briefing(): HasOne
    {
        return $this->hasOne(Briefing::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function recordStatusChange(string $field, ?string $fromStatus, string $toStatus, ?User $user = null, ?string $notes = null): void
    {
        $this->statusHistories()->create([
            'user_id' => $user?->id,
            'field' => $field,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes,
        ]);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'production_status' => ProductionStatus::class,
            'utm' => 'array',
            'secure_access_expires_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'paid_at' => 'datetime',
            'canceled_at' => 'datetime',
            'refunded_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }
}
