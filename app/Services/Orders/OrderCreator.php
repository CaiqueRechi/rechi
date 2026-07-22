<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductionStatus;
use App\Models\CommercialProduct;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderCreator
{
    /**
     * @param  array<string, mixed>  $input
     * @return array{order: Order, plainAccessToken: string}
     */
    public function create(User $user, CommercialProduct $product, array $input): array
    {
        return DB::transaction(function () use ($user, $product, $input): array {
            $unitPriceCents = $product->effectivePriceCents();
            $plainAccessToken = Str::random(64);

            $order = Order::query()->create([
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => Arr::get($input, 'customer_phone'),
                'status' => OrderStatus::AwaitingPayment,
                'payment_status' => PaymentStatus::Pending,
                'production_status' => ProductionStatus::NotStarted,
                'subtotal_cents' => $unitPriceCents,
                'discount_cents' => 0,
                'total_cents' => $unitPriceCents,
                'currency' => $product->currency,
                'agreed_delivery' => $product->estimated_delivery,
                'utm' => Arr::get($input, 'utm'),
                'lead_source' => Arr::get($input, 'lead_source'),
                'entry_page' => Arr::get($input, 'entry_page'),
                'user_agent' => request()->userAgent(),
                'secure_access_token_hash' => hash('sha256', $plainAccessToken),
                'secure_access_expires_at' => now()->addDays(30),
                'terms_accepted_at' => now(),
            ]);

            $order->items()->create([
                'commercial_product_id' => $product->id,
                'product_type' => $product->type,
                'product_name' => $product->name,
                'product_slug' => $product->slug,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'unit_price_cents' => $unitPriceCents,
                'discount_cents' => 0,
                'quantity' => 1,
                'subtotal_cents' => $unitPriceCents,
                'total_cents' => $unitPriceCents,
                'currency' => $product->currency,
                'estimated_delivery' => $product->estimated_delivery,
                'max_sections' => $product->max_sections,
                'revision_count' => $product->revision_count,
                'included_features' => $product->included_features,
                'excluded_features' => $product->excluded_features,
            ]);

            $order->briefing()->create([
                'user_id' => $user->id,
                'status' => 'locked_until_payment',
            ]);

            $order->recordStatusChange('status', null, OrderStatus::AwaitingPayment->value, $user, 'Pedido criado pelo checkout.');

            return [
                'order' => $order->fresh(['items', 'briefing']),
                'plainAccessToken' => $plainAccessToken,
            ];
        });
    }
}
