<?php

namespace App\Http\Requests\Settings;

use App\IntegrationProvider;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIntegrationConnectionRequest extends FormRequest
{
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
            'provider' => ['required', Rule::enum(IntegrationProvider::class)],
            'client_id' => ['nullable', 'string', 'max:512'],
            'client_secret' => ['nullable', 'string', 'max:2048'],
            'api_key' => ['nullable', 'string', 'max:2048'],
            'steam_id' => ['nullable', 'string', 'regex:/^\d{17}$/'],
            'username' => ['nullable', 'string', 'max:255'],
            'guild_id' => ['nullable', 'string', 'regex:/^\d{17,20}$/'],
            'environment' => ['nullable', Rule::in(['sandbox', 'production'])],
            'public_key' => ['nullable', 'string', 'max:2048'],
            'access_token' => ['nullable', 'string', 'max:4096'],
            'webhook_secret' => ['nullable', 'string', 'max:4096'],
        ];
    }
}
