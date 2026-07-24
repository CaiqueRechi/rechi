<?php

namespace App\Http\Controllers;

use App\Models\CommercialProduct;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $staticPages = [
            ['url' => route('home'), 'priority' => '1.0', 'frequency' => 'weekly'],
            ['url' => route('commercial-products.index'), 'priority' => '0.9', 'frequency' => 'weekly'],
            ['url' => route('me'), 'priority' => '0.7', 'frequency' => 'weekly'],
            ['url' => route('alt-tab'), 'priority' => '0.6', 'frequency' => 'weekly'],
            ['url' => route('legal.terms'), 'priority' => '0.2', 'frequency' => 'yearly'],
            ['url' => route('legal.privacy'), 'priority' => '0.2', 'frequency' => 'yearly'],
            ['url' => route('legal.refund'), 'priority' => '0.2', 'frequency' => 'yearly'],
        ];

        $productPages = CommercialProduct::query()
            ->where('is_active', true)
            ->get()
            ->map(fn (CommercialProduct $product) => [
                'url' => route('commercial-products.show', $product),
                'priority' => '0.8',
                'frequency' => 'monthly',
                'lastModified' => $product->updated_at?->toAtomString(),
            ])
            ->all();

        $urls = collect([...$staticPages, ...$productPages])
            ->map(function (array $page): string {
                $lastModified = isset($page['lastModified'])
                    ? "<lastmod>{$page['lastModified']}</lastmod>"
                    : '';

                return sprintf(
                    '<url><loc>%s</loc>%s<changefreq>%s</changefreq><priority>%s</priority></url>',
                    htmlspecialchars($page['url'], ENT_XML1),
                    $lastModified,
                    $page['frequency'],
                    $page['priority'],
                );
            })
            ->implode('');

        return response(
            '<?xml version="1.0" encoding="UTF-8"?>'
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            .$urls
            .'</urlset>',
            200,
            ['Content-Type' => 'application/xml; charset=UTF-8'],
        );
    }
}
