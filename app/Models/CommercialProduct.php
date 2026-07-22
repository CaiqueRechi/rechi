<?php

namespace App\Models;

use Database\Factories\CommercialProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'type',
    'name',
    'slug',
    'short_description',
    'description',
    'price_cents',
    'promotional_price_cents',
    'currency',
    'estimated_delivery',
    'max_sections',
    'included_features',
    'excluded_features',
    'revision_count',
    'is_featured',
    'is_active',
    'cover_image_path',
    'gallery_image_paths',
    'category',
    'sort_order',
    'seo_title',
    'seo_description',
])]
class CommercialProduct extends Model
{
    /** @use HasFactory<CommercialProductFactory> */
    use HasFactory;

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function effectivePriceCents(): int
    {
        return $this->promotional_price_cents ?? $this->price_cents;
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'included_features' => 'array',
            'excluded_features' => 'array',
            'gallery_image_paths' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
