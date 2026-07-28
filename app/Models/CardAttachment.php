<?php

namespace App\Models;

use Database\Factories\CardAttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/** @property Carbon|null $created_at */
#[Fillable(['card_id', 'user_id', 'disk', 'path', 'original_name', 'mime_type', 'size_bytes'])]
class CardAttachment extends Model
{
    /** @use HasFactory<CardAttachmentFactory> */
    use HasFactory, SoftDeletes;

    /** @return BelongsTo<Card, $this> */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['size_bytes' => 'integer'];
    }
}
