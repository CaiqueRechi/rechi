<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class StoreCardCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('comment', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['body' => ['required', 'string', 'max:5000']];
    }
}
