<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCommercialProductRequest;
use App\Http\Requests\Admin\UpdateCommercialProductRequest;
use App\Models\CommercialProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = CommercialProduct::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (CommercialProduct $product) => $this->serialize($product));

        return Inertia::render('admin/commercial-products/index', [
            'products' => $products,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/commercial-products/form', [
            'product' => null,
        ]);
    }

    public function store(StoreCommercialProductRequest $request): RedirectResponse
    {
        CommercialProduct::query()->create($request->validated());

        return to_route('admin.commercial-products.index')->with('status', 'Produto criado.');
    }

    public function edit(CommercialProduct $commercialProduct): Response
    {
        return Inertia::render('admin/commercial-products/form', [
            'product' => $this->serialize($commercialProduct),
        ]);
    }

    public function update(UpdateCommercialProductRequest $request, CommercialProduct $commercialProduct): RedirectResponse
    {
        $commercialProduct->update($request->validated());

        return to_route('admin.commercial-products.index')->with('status', 'Produto atualizado.');
    }

    public function destroy(CommercialProduct $commercialProduct): RedirectResponse
    {
        $commercialProduct->update(['is_active' => false]);

        return to_route('admin.commercial-products.index')->with('status', 'Produto desativado.');
    }

    /** @return array<string, mixed> */
    private function serialize(CommercialProduct $product): array
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
            'estimatedDelivery' => $product->estimated_delivery,
            'maxSections' => $product->max_sections,
            'includedFeatures' => $product->included_features,
            'excludedFeatures' => $product->excluded_features ?? [],
            'revisionCount' => $product->revision_count,
            'isFeatured' => $product->is_featured,
            'isActive' => $product->is_active,
            'category' => $product->category,
            'sortOrder' => $product->sort_order,
            'seoTitle' => $product->seo_title,
            'seoDescription' => $product->seo_description,
        ];
    }
}
