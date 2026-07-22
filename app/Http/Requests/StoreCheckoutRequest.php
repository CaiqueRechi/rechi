<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                Rule::exists('commercial_products', 'id')->where('is_active', true),
            ],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'terms_accepted' => ['accepted'],
            'lead_source' => ['nullable', 'string', 'max:255'],
            'entry_page' => ['nullable', 'url', 'max:2048'],
            'utm' => ['nullable', 'array'],
            'utm.source' => ['nullable', 'string', 'max:255'],
            'utm.medium' => ['nullable', 'string', 'max:255'],
            'utm.campaign' => ['nullable', 'string', 'max:255'],
            'utm.term' => ['nullable', 'string', 'max:255'],
            'utm.content' => ['nullable', 'string', 'max:255'],
        ];
    }
}
