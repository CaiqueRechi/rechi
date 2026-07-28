<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCardLabelsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('manageLabels', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'label_ids' => ['present', 'array', 'max:50'],
            'label_ids.*' => ['integer', 'distinct', 'exists:labels,id'],
        ];
    }
}
