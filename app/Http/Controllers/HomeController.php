<?php

namespace App\Http\Controllers;

use App\Models\CommercialProduct;
use App\Models\PortfolioItem;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'products' => CommercialProduct::query()
                ->where('is_active', true)
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->take(4)
                ->get()
                ->map(fn (CommercialProduct $product) => [
                    'id' => $product->id,
                    'type' => $product->type,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'shortDescription' => $product->short_description,
                    'effectivePriceCents' => $product->effectivePriceCents(),
                    'currency' => $product->currency,
                    'estimatedDelivery' => $product->estimated_delivery,
                    'includedFeatures' => $product->included_features,
                ]),
            'portfolioItems' => PortfolioItem::query()
                ->where('is_published', true)
                ->where('has_customer_consent', true)
                ->orderByDesc('is_featured')
                ->latest('published_at')
                ->take(3)
                ->get()
                ->map(fn (PortfolioItem $item) => [
                    'title' => $item->title,
                    'segment' => $item->segment,
                    'solution' => $item->solution,
                    'publicUrl' => $item->public_url,
                    'technologies' => $item->technologies ?? [],
                ]),
        ]);
    }
}
