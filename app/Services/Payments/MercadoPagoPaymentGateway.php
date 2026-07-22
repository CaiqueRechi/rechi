<?php

namespace App\Services\Payments;

use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use LogicException;

class MercadoPagoPaymentGateway implements PaymentGatewayInterface
{
    public function createCheckout(Order $order): Payment
    {
        $connection = IntegrationConnection::query()
            ->where('provider', IntegrationProvider::MercadoPago)
            ->first();

        if (! $connection instanceof IntegrationConnection) {
            throw new LogicException('Mercado Pago não está configurado.');
        }

        $credentials = $connection->credentials;
        $accessToken = (string) Arr::get($credentials, 'access_token');
        $environment = (string) Arr::get($credentials, 'environment', 'sandbox');

        if ($accessToken === '') {
            throw new LogicException('Mercado Pago não está configurado.');
        }

        $order->loadMissing('items');
        $payload = [
            'external_reference' => $order->public_number,
            'notification_url' => route('payments.mercado-pago.webhook'),
            'back_urls' => [
                'success' => route('orders.show', $order),
                'pending' => route('orders.show', $order),
                'failure' => route('orders.show', $order),
            ],
            'auto_return' => 'approved',
            'payment_methods' => [
                'excluded_payment_types' => [
                    ['id' => 'ticket'],
                    ['id' => 'atm'],
                    ['id' => 'bank_transfer'],
                ],
            ],
            'payer' => [
                'name' => $order->customer_name,
                'email' => $order->customer_email,
            ],
            'items' => $order->items->map(fn ($item): array => [
                'id' => (string) $item->product_slug,
                'title' => $item->product_name,
                'description' => $item->short_description,
                'quantity' => $item->quantity,
                'currency_id' => $item->currency,
                'unit_price' => $item->unit_price_cents / 100,
            ])->values()->all(),
        ];

        $response = $this->client($accessToken)
            ->post('https://api.mercadopago.com/checkout/preferences', $payload)
            ->throw()
            ->json();

        return $order->payment()->updateOrCreate(
            ['gateway' => 'mercado_pago'],
            [
                'environment' => $environment,
                'status' => $order->payment_status,
                'external_preference_id' => Arr::get($response, 'id'),
                'checkout_url' => Arr::get($response, $environment === 'production' ? 'init_point' : 'sandbox_init_point'),
                'amount_cents' => $order->total_cents,
                'currency' => $order->currency,
                'raw_response' => $response,
            ],
        );
    }

    private function client(string $accessToken): PendingRequest
    {
        return Http::acceptJson()
            ->withToken($accessToken)
            ->connectTimeout(3)
            ->timeout(10)
            ->retry([100, 300]);
    }
}
