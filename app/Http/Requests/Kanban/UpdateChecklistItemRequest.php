<?php

namespace App\Http\Requests\Kanban;

use App\Models\ChecklistItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChecklistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $item = $this->route('checklistItem');

        return $item instanceof ChecklistItem
            && (bool) $this->user()?->can('manageChecklists', $item->checklist->card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:500'],
            'completed' => ['required', 'boolean'],
        ];
    }
}
