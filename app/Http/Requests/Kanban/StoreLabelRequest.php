<?php

namespace App\Http\Requests\Kanban;

use App\Models\Board;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLabelRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board instanceof Board
            && $board->includes($this->user())
            && (bool) $this->user()?->can('kanban.manage_labels');
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $board = $this->route('board');
        $boardId = $board instanceof Board ? $board->getKey() : 0;

        return [
            'name' => [
                'required',
                'string',
                'max:40',
                Rule::unique('labels')->where('board_id', $boardId),
            ],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ];
    }
}
