<?php

namespace App\Models;

use Database\Factories\BoardColumnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['board_id', 'title', 'position', 'card_limit', 'archived_at'])]
class BoardColumn extends Model
{
    /** @use HasFactory<BoardColumnFactory> */
    use HasFactory, SoftDeletes;

    /** @return BelongsTo<Board, $this> */
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    /** @return HasMany<Card, $this> */
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class)->orderBy('position');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'card_limit' => 'integer',
            'archived_at' => 'datetime',
        ];
    }
}
