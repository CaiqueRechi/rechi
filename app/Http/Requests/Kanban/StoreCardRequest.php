<?php

namespace App\Http\Requests\Kanban;

use App\Models\BoardColumn;
use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $column = $this->route('boardColumn');

        return $column instanceof BoardColumn && (bool) $this->user()?->can('create', [Card::class, $column]);
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:20000'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'starts_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }
}
