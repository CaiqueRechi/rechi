<?php

namespace App\Http\Controllers;

use App\Models\CommercialProduct;
use Inertia\Inertia;
use Inertia\Response;

class CommercialProductController extends Controller
{
    public function index(): Response
    {
        $products = CommercialProduct::query()
            ->where('is_active', true)
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (CommercialProduct $product) => $this->serializeProduct($product));

        return Inertia::render('commercial-products/index', [
            'products' => $products,
        ]);
    }

    public function show(CommercialProduct $commercialProduct): Response
    {
        abort_unless($commercialProduct->is_active, 404);

        return Inertia::render('commercial-products/show', [
            'product' => $this->serializeProduct($commercialProduct),
        ]);
    }

    /** @return array<string, mixed> */
    private function serializeProduct(CommercialProduct $product): array
    {
        return [
            'id' => $product->id,
            'type' => $product->type,
            'name' => $product->name,
            'slug' => $product->slug,
            'shortDescription' => $product->short_description,
            'description' => $product->description,
            'priceCents' => $product->price_cents,
            'promotionalPriceCents' => $product->promotional_price_cents,
            'effectivePriceCents' => $product->effectivePriceCents(),
            'currency' => $product->currency,
            'estimatedDelivery' => $product->estimated_delivery,
            'maxSections' => $product->max_sections,
            'includedFeatures' => $product->included_features,
            'excludedFeatures' => $product->excluded_features ?? [],
            'revisionCount' => $product->revision_count,
            'isFeatured' => $product->is_featured,
            'category' => $product->category,
            'seoTitle' => $product->seo_title,
            'seoDescription' => $product->seo_description,
        ];
    }
}
