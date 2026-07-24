<?php

namespace Tests\Feature;

use App\Models\CommercialProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_public_pages_receive_shared_seo_configuration(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('seo.siteName', 'RECHI/ Digital Workshop')
                ->where('seo.siteUrl', rtrim((string) config('app.url'), '/'))
                ->where('seo.defaultImageUrl', asset('apple-touch-icon.png')));
    }

    public function test_sitemap_contains_public_pages_and_only_active_products(): void
    {
        $activeProduct = CommercialProduct::factory()->create([
            'slug' => 'landing-page-seo',
        ]);
        $inactiveProduct = CommercialProduct::factory()->inactive()->create([
            'slug' => 'produto-inativo',
        ]);

        $this->get(route('sitemap'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee(route('home'), false)
            ->assertSee(route('commercial-products.show', $activeProduct), false)
            ->assertDontSee(route('commercial-products.show', $inactiveProduct), false);
    }
}
