<?php

namespace Tests\Feature;

use App\Models\CommercialProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CommercialProductFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_active_products_are_visible_publicly(): void
    {
        $product = CommercialProduct::factory()->create(['name' => 'Landing Page Essencial']);

        $this->get(route('commercial-products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('commercial-products/index')
                ->where('products.0.id', $product->id));
    }

    public function test_inactive_products_are_not_available_publicly(): void
    {
        $product = CommercialProduct::factory()->inactive()->create();

        $this->get(route('commercial-products.show', $product))->assertNotFound();
    }

    public function test_admins_can_create_configurable_products(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.commercial-products.store'), [
            'type' => 'landing_page',
            'name' => 'Landing Page Essencial',
            'slug' => 'landing-page-essencial',
            'short_description' => 'Página para validar uma oferta.',
            'description' => 'Página responsiva com WhatsApp e formulário.',
            'price_cents' => 45000,
            'estimated_delivery' => 'até 3 dias úteis',
            'max_sections' => 5,
            'included_features' => "design responsivo\nformulário de contato",
            'revision_count' => 1,
            'is_active' => '1',
            'is_featured' => '1',
            'sort_order' => 10,
        ])->assertRedirect(route('admin.commercial-products.index'));

        $this->assertDatabaseHas('commercial_products', [
            'slug' => 'landing-page-essencial',
            'price_cents' => 45000,
        ]);
    }
}
