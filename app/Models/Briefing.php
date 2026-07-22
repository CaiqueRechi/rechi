<?php

namespace App\Models;

use Database\Factories\BriefingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'user_id',
    'status',
    'company_name',
    'segment',
    'goal',
    'target_audience',
    'products_or_services',
    'main_call_to_action',
    'available_copy',
    'preferred_colors',
    'references',
    'whatsapp',
    'contact_email',
    'domain',
    'social_links',
    'desired_integrations',
    'notes',
    'submitted_at',
])]
class Briefing extends Model
{
    /** @use HasFactory<BriefingFactory> */
    use HasFactory;

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<BriefingFile, $this> */
    public function files(): HasMany
    {
        return $this->hasMany(BriefingFile::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'references' => 'array',
            'social_links' => 'array',
            'desired_integrations' => 'array',
            'submitted_at' => 'datetime',
        ];
    }
}
