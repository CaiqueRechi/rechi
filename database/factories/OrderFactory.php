<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductionStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'status' => OrderStatus::AwaitingPayment,
            'payment_status' => PaymentStatus::Pending,
            'production_status' => ProductionStatus::NotStarted,
            'subtotal_cents' => 45000,
            'discount_cents' => 0,
            'total_cents' => 45000,
            'currency' => 'BRL',
            'agreed_delivery' => 'até 3 dias úteis',
            'terms_accepted_at' => now(),
        ];
    }
}
