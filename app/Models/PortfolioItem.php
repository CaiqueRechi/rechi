<?php

namespace App\Models;

use Database\Factories\PortfolioItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'commercial_product_id',
    'order_id',
    'title',
    'slug',
    'client_name',
    'segment',
    'problem',
    'solution',
    'technologies',
    'image_paths',
    'public_url',
    'results',
    'testimonial',
    'is_published',
    'is_featured',
    'has_customer_consent',
    'seo_title',
    'seo_description',
    'published_at',
])]
class PortfolioItem extends Model
{
    /** @use HasFactory<PortfolioItemFactory> */
    use HasFactory;

    /** @return BelongsTo<CommercialProduct, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(CommercialProduct::class, 'commercial_product_id');
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'image_paths' => 'array',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'has_customer_consent' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
