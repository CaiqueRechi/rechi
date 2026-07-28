<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCardAssignmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('manageAssignees', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'user_ids' => ['present', 'array', 'max:50'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ];
    }
}
