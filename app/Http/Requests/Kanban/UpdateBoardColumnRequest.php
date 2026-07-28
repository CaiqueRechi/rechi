<?php

namespace App\Http\Requests\Kanban;

use App\Models\BoardColumn;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBoardColumnRequest extends FormRequest
{
    public function authorize(): bool
    {
        $column = $this->route('boardColumn');

        return $column instanceof BoardColumn && (bool) $this->user()?->can('update', $column);
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
