<?php

namespace App\Http\Requests\Kanban;

use App\Models\Board;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBoardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board instanceof Board && (bool) $this->user()?->can('update', $board);
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'visibility' => ['required', Rule::in(['private', 'shared'])],
        ];
    }
}
