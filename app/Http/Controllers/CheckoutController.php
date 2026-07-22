<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Models\CommercialProduct;
use App\Models\Order;
use App\Services\Orders\OrderCreator;
use App\Services\Payments\PaymentGatewayInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CheckoutController extends Controller
{
    public function show(CommercialProduct $commercialProduct): Response
    {
        abort_unless($commercialProduct->is_active, 404);

        return Inertia::render('checkout/show', [
            'product' => [
                'id' => $commercialProduct->id,
                'name' => $commercialProduct->name,
                'slug' => $commercialProduct->slug,
                'shortDescription' => $commercialProduct->short_description,
                'description' => $commercialProduct->description,
                'effectivePriceCents' => $commercialProduct->effectivePriceCents(),
                'currency' => $commercialProduct->currency,
                'estimatedDelivery' => $commercialProduct->estimated_delivery,
                'revisionCount' => $commercialProduct->revision_count,
                'includedFeatures' => $commercialProduct->included_features,
                'excludedFeatures' => $commercialProduct->excluded_features ?? [],
            ],
        ]);
    }

    public function store(StoreCheckoutRequest $request, OrderCreator $orderCreator, PaymentGatewayInterface $paymentGateway): RedirectResponse
    {
        $product = CommercialProduct::query()
            ->whereKey($request->integer('product_id'))
            ->where('is_active', true)
            ->firstOrFail();

        $created = $orderCreator->create($request->user(), $product, $request->validated());

        try {
            $payment = $paymentGateway->createCheckout($created['order']);
        } catch (Throwable $exception) {
            report($exception);

            return to_route('orders.show', $created['order'])
                ->with('status', 'Pedido criado. Configure o Mercado Pago para liberar o pagamento on-line.');
        }

        if ($payment->checkout_url) {
            return redirect()->away($payment->checkout_url);
        }

        return to_route('orders.show', $created['order'])
            ->with('status', 'Pedido criado. O checkout do pagamento ainda não retornou uma URL.');
    }

    public function order(Request $request, Order $order): Response
    {
        abort_unless($request->user()?->is_admin || $order->user_id === $request->user()?->id, 403);

        $order->load(['items', 'payment', 'briefing.files', 'statusHistories' => fn ($query) => $query->latest()]);

        return Inertia::render('orders/show', [
            'order' => [
                'id' => $order->id,
                'publicNumber' => $order->public_number,
                'status' => $order->status->value,
                'statusLabel' => $order->status->label(),
                'paymentStatus' => $order->payment_status->value,
                'paymentStatusLabel' => $order->payment_status->label(),
                'productionStatus' => $order->production_status->value,
                'productionStatusLabel' => $order->production_status->label(),
                'totalCents' => $order->total_cents,
                'currency' => $order->currency,
                'agreedDelivery' => $order->agreed_delivery,
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->product_name,
                    'description' => $item->short_description,
                    'totalCents' => $item->total_cents,
                    'includedFeatures' => $item->included_features,
                ]),
                'payment' => $order->payment ? [
                    'status' => $order->payment->status->value,
                    'checkoutUrl' => $order->payment->checkout_url,
                    'method' => $order->payment->method,
                ] : null,
                'briefingStatus' => $order->briefing?->status,
                'timeline' => $order->statusHistories->map(fn ($history) => [
                    'field' => $history->field,
                    'fromStatus' => $history->from_status,
                    'toStatus' => $history->to_status,
                    'notes' => $history->notes,
                    'createdAt' => $history->created_at?->toIso8601String(),
                ]),
            ],
            'status' => $request->session()->get('status'),
        ]);
    }
}
