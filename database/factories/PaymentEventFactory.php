<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\PaymentEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentEvent>
 */
class PaymentEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'gateway' => 'mercado_pago',
            'external_event_id' => fake()->uuid(),
            'external_resource_id' => (string) fake()->randomNumber(8),
            'event_type' => 'payment',
            'payload' => ['type' => 'payment'],
            'is_processed' => false,
        ];
    }
}
