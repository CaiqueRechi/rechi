<?php

namespace App\Models;

use Database\Factories\BoardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['owner_id', 'title', 'description', 'color', 'visibility', 'archived_at'])]
class Board extends Model
{
    /** @use HasFactory<BoardFactory> */
    use HasFactory, SoftDeletes;

    protected $attributes = [
        'color' => '#7c3aed',
        'visibility' => 'private',
    ];

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /** @return HasMany<BoardColumn, $this> */
    public function columns(): HasMany
    {
        return $this->hasMany(BoardColumn::class)->orderBy('position');
    }

    /** @return HasMany<Card, $this> */
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    /** @return HasMany<Label, $this> */
    public function labels(): HasMany
    {
        return $this->hasMany(Label::class)->orderBy('name');
    }

    /**
     * @param  Builder<Board>  $query
     * @return Builder<Board>
     */
    public function scopeAccessibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $query) use ($user): void {
            $query->whereBelongsTo($user, 'owner')
                ->orWhereHas('participants', fn (Builder $query) => $query->whereKey($user->getKey()));
        });
    }

    public function includes(User $user): bool
    {
        return $this->owner_id === $user->getKey()
            || $this->participants()->whereKey($user->getKey())->exists();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
