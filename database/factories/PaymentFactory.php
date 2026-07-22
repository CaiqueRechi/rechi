<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'environment' => 'sandbox',
            'status' => PaymentStatus::Pending,
            'external_preference_id' => fake()->uuid(),
            'checkout_url' => 'https://sandbox.mercadopago.com.br/checkout/v1/redirect',
            'amount_cents' => 45000,
            'currency' => 'BRL',
        ];
    }
}
