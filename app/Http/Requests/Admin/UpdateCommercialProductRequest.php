<?php

namespace App\Http\Requests\Admin;

use App\Models\CommercialProduct;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommercialProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'included_features' => $this->listFromInput('included_features'),
            'excluded_features' => $this->listFromInput('excluded_features'),
            'is_active' => $this->boolean('is_active'),
            'is_featured' => $this->boolean('is_featured'),
        ]);
    }

    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('commercial_product');
        $productId = $product instanceof CommercialProduct ? $product->id : null;

        return [
            'type' => ['required', Rule::in(['landing_page', 'bug_fix'])],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique('commercial_products', 'slug')->ignore($productId)],
            'short_description' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string'],
            'price_cents' => ['required', 'integer', 'min:1'],
            'promotional_price_cents' => ['nullable', 'integer', 'min:1', 'lt:price_cents'],
            'estimated_delivery' => ['required', 'string', 'max:255'],
            'max_sections' => ['nullable', 'integer', 'min:1', 'max:30'],
            'included_features' => ['required', 'array', 'min:1'],
            'included_features.*' => ['required', 'string', 'max:255'],
            'excluded_features' => ['nullable', 'array'],
            'excluded_features.*' => ['required', 'string', 'max:255'],
            'revision_count' => ['required', 'integer', 'min:0', 'max:10'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'cover_image_path' => ['nullable', 'string', 'max:2048'],
            'gallery_image_paths' => ['nullable', 'array'],
            'gallery_image_paths.*' => ['required', 'string', 'max:2048'],
            'category' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
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
