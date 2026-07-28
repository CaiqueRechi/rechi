<?php

namespace App\Models;

use Database\Factories\CardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $starts_at
 * @property Carbon|null $due_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $archived_at
 */
#[Fillable([
    'board_id',
    'board_column_id',
    'title',
    'description',
    'priority',
    'starts_at',
    'due_at',
    'completed_at',
    'position',
    'archived_at',
])]
class Card extends Model
{
    /** @use HasFactory<CardFactory> */
    use HasFactory, SoftDeletes;

    protected $attributes = ['priority' => 'medium'];

    /** @return BelongsTo<Board, $this> */
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    /** @return BelongsTo<BoardColumn, $this> */
    public function column(): BelongsTo
    {
        return $this->belongsTo(BoardColumn::class, 'board_column_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /** @return BelongsToMany<Label, $this> */
    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class)->withTimestamps();
    }

    /** @return HasMany<Checklist, $this> */
    public function checklists(): HasMany
    {
        return $this->hasMany(Checklist::class)->orderBy('position');
    }

    /** @return HasMany<CardComment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(CardComment::class)->oldest();
    }

    /** @return HasMany<CardAttachment, $this> */
    public function attachments(): HasMany
    {
        return $this->hasMany(CardAttachment::class)->latest();
    }

    /** @return HasMany<CardActivity, $this> */
    public function activities(): HasMany
    {
        return $this->hasMany(CardActivity::class)->latest();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'starts_at' => 'datetime',
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }
}
