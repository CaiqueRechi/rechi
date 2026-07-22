<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUploadFileSettingsRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'allowed_mime_types' => $this->listFromInput('allowed_mime_types'),
            'allowed_extensions' => $this->listFromInput('allowed_extensions'),
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'allowed_mime_types' => ['required', 'array', 'min:1', 'max:30'],
            'allowed_mime_types.*' => ['required', 'string', 'max:255'],
            'allowed_extensions' => ['required', 'array', 'min:1', 'max:30'],
            'allowed_extensions.*' => ['required', 'string', 'max:20', 'alpha_dash:ascii'],
            'max_file_size_kb' => ['required', 'integer', 'min:64', 'max:51200'],
            'max_total_size_kb' => ['required', 'integer', 'min:64', 'max:204800'],
            'max_files_per_briefing' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }

    /** @return list<string> */
    private function listFromInput(string $key): array
    {
        $value = $this->input($key);

        if (is_array($value)) {
            $items = $value;
        } else {
            $items = preg_split('/\r\n|\r|\n/', (string) $value) ?: [];
        }

        $list = [];

        foreach ($items as $item) {
            $item = trim((string) $item);

            if ($item !== '') {
                $list[] = $item;
            }
        }

        return $list;
    }
}
