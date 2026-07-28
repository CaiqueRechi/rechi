<?php

namespace App\Http\Requests\Kanban;

use App\Models\Checklist;
use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $checklist = $this->route('checklist');

        return $checklist instanceof Checklist
            && (bool) $this->user()?->can('manageChecklists', $checklist->card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['content' => ['required', 'string', 'max:500']];
    }
}
