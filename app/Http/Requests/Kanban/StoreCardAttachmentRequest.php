<?php

namespace App\Http\Requests\Kanban;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class StoreCardAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return $card instanceof Card && (bool) $this->user()?->can('manageAttachments', $card);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        $extensions = implode(',', config('kanban.attachments.extensions', []));
        $mimeTypes = implode(',', config('kanban.attachments.mime_types', []));

        return [
            'file' => [
                'required',
                'file',
                'max:'.config('kanban.attachments.max_size_kb', 10240),
                "mimes:{$extensions}",
                "mimetypes:{$mimeTypes}",
            ],
        ];
    }
}
