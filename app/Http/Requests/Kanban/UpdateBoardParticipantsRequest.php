<?php

namespace App\Http\Requests\Kanban;

use App\Models\Board;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBoardParticipantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board instanceof Board && (bool) $this->user()?->can('manageParticipants', $board);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'user_ids' => ['present', 'array', 'max:100'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ];
    }
}
