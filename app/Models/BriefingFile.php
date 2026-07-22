<?php

namespace App\Models;

use Database\Factories\BriefingFileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'briefing_id',
    'order_id',
    'user_id',
    'disk',
    'path',
    'original_name',
    'stored_name',
    'mime_type',
    'extension',
    'size_bytes',
    'checksum',
    'status',
])]
class BriefingFile extends Model
{
    /** @use HasFactory<BriefingFileFactory> */
    use HasFactory;

    /** @return BelongsTo<Briefing, $this> */
    public function briefing(): BelongsTo
    {
        return $this->belongsTo(Briefing::class);
    }

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
}
