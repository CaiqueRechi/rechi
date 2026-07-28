<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class MoveCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('move', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'target_column_id' => ['required', 'integer', 'exists:board_columns,id'],
            'target_position' => ['required', 'integer', 'min:0'],
        ];
    }
}
