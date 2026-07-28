<?php

namespace App\Http\Requests\Kanban;

use App\Models\Board;
use App\Models\BoardColumn;
use Illuminate\Foundation\Http\FormRequest;

class StoreBoardColumnRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board instanceof Board && (bool) $this->user()?->can('create', [BoardColumn::class, $board]);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:80'],
            'card_limit' => ['nullable', 'integer', 'min:1', 'max:999'],
        ];
    }
}
