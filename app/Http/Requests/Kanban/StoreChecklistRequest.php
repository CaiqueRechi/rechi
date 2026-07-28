<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('manageChecklists', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['title' => ['required', 'string', 'max:120']];
    }
}
