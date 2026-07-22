<?php

namespace Tests\Feature;

use App\Models\CommercialProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config()->set('services.integrations.encryption_key', 'base64:'.base64_encode(str_repeat('s', 32)));
    }

    public function test_checkout_requires_authentication(): void
    {
        $product = CommercialProduct::factory()->create();

        $this->get(route('checkout.show', $product))->assertRedirect(route('login'));
    }

    public function test_order_total_is_calculated_from_backend_product_price(): void
    {
        Http::preventStrayRequests();
        $user = User::factory()->create();
        $product = CommercialProduct::factory()->create([
            'price_cents' => 45000,
            'promotional_price_cents' => null,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'product_id' => $product->id,
            'price_cents' => 1,
            'terms_accepted' => '1',
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_cents' => 45000,
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_slug' => $product->slug,
            'unit_price_cents' => 45000,
            'total_cents' => 45000,
        ]);
        $this->assertDatabaseHas('order_status_histories', [
            'to_status' => 'awaiting_payment',
        ]);
    }
}
