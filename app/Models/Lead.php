<?php

namespace App\Models;

use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'type',
    'name',
    'email',
    'phone',
    'technology',
    'problem_description',
    'error_message',
    'reproduction_steps',
    'impact',
    'urgency',
    'available_budget_cents',
    'url',
    'status',
    'lead_source',
    'utm',
    'entry_page',
    'consent_accepted_at',
])]
class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'utm' => 'array',
            'consent_accepted_at' => 'datetime',
        ];
    }
}
