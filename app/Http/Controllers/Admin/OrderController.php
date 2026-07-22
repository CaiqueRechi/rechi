<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $ordersQuery = Order::query()->with('items')->latest();
        $orders = [
            'data' => (clone $ordersQuery)->limit(20)->get()->map(fn (Order $order) => [
                'id' => $order->id,
                'publicNumber' => $order->public_number,
                'customerName' => $order->customer_name,
                'customerEmail' => $order->customer_email,
                'status' => $order->status->value,
                'statusLabel' => $order->status->label(),
                'paymentStatus' => $order->payment_status->value,
                'paymentStatusLabel' => $order->payment_status->label(),
                'totalCents' => $order->total_cents,
                'createdAt' => $order->created_at?->toIso8601String(),
            ])->values(),
        ];

        $summaryQuery = Order::query()->where('created_at', '>=', now()->subDays(30));
        $approvedQuery = (clone $summaryQuery)->where('payment_status', PaymentStatus::Approved->value);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'metrics' => [
                'ordersInPeriod' => (clone $summaryQuery)->count(),
                'soldCents' => (clone $summaryQuery)->sum('total_cents'),
                'approvedCents' => (clone $approvedQuery)->sum('total_cents'),
                'pendingOrders' => Order::query()->where('payment_status', PaymentStatus::Pending->value)->count(),
                'completedOrders' => Order::query()->where('status', 'completed')->count(),
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'payment.events', 'briefing.files', 'statusHistories.user']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'publicNumber' => $order->public_number,
                'customerName' => $order->customer_name,
                'customerEmail' => $order->customer_email,
                'customerPhone' => $order->customer_phone,
                'status' => $order->status->value,
                'statusLabel' => $order->status->label(),
                'paymentStatus' => $order->payment_status->value,
                'paymentStatusLabel' => $order->payment_status->label(),
                'productionStatus' => $order->production_status->value,
                'productionStatusLabel' => $order->production_status->label(),
                'totalCents' => $order->total_cents,
                'currency' => $order->currency,
                'items' => $order->items,
                'payment' => $order->payment,
                'briefing' => $order->briefing,
                'timeline' => $order->statusHistories,
            ],
        ]);
    }
}
