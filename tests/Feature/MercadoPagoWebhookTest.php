<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MercadoPagoWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_events_are_stored_idempotently(): void
    {
        $payload = [
            'id' => 'event-1',
            'type' => 'payment',
            'data' => ['id' => 'payment-1'],
        ];

        $this->postJson(route('payments.mercado-pago.webhook'), $payload)
            ->assertOk()
            ->assertJson(['received' => true, 'duplicate' => false]);

        $this->postJson(route('payments.mercado-pago.webhook'), $payload)
            ->assertOk()
            ->assertJson(['received' => true, 'duplicate' => true]);

        $this->assertDatabaseCount('payment_events', 1);
        $this->assertDatabaseHas('payment_events', [
            'gateway' => 'mercado_pago',
            'external_event_id' => 'event-1',
            'external_resource_id' => 'payment-1',
        ]);
    }
}
