<?php

namespace App\Models;

use Database\Factories\ChecklistItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/** @property Carbon|null $completed_at */
#[Fillable(['checklist_id', 'content', 'position', 'completed_at'])]
class ChecklistItem extends Model
{
    /** @use HasFactory<ChecklistItemFactory> */
    use HasFactory;

    /** @return BelongsTo<Checklist, $this> */
    public function checklist(): BelongsTo
    {
        return $this->belongsTo(Checklist::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'completed_at' => 'datetime',
        ];
    }
}
