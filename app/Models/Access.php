<?php

namespace App\Models;

use Database\Factories\AccessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property array<string, array<string, bool>> $accesses
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'accesses'])]
class Access extends Model
{
    /** @use HasFactory<AccessFactory> */
    use HasFactory;

    protected $table = 'access';

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['accesses' => 'array'];
    }
}
