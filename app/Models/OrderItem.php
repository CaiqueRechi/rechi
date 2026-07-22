<?php

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id',
    'commercial_product_id',
    'product_type',
    'product_name',
    'product_slug',
    'short_description',
    'description',
    'unit_price_cents',
    'discount_cents',
    'quantity',
    'subtotal_cents',
    'total_cents',
    'currency',
    'estimated_delivery',
    'max_sections',
    'revision_count',
    'included_features',
    'excluded_features',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<CommercialProduct, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(CommercialProduct::class, 'commercial_product_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'included_features' => 'array',
            'excluded_features' => 'array',
        ];
    }
}
