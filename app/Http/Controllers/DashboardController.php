<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\IntegrationConnection;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $orders = $this->ordersFor($user);
        $leads = $this->leadsFor($user);
        $approvedOrders = (clone $orders)->where('payment_status', PaymentStatus::Approved->value);
        $orderCount = (clone $orders)->count();
        $approvedOrderCount = (clone $approvedOrders)->count();

        return Inertia::render('dashboard', [
            'isAdminView' => $user->is_admin,
            'summary' => [
                'revenueCents' => (clone $approvedOrders)->sum('total_cents'),
                'orderCount' => $orderCount,
                'leadCount' => (clone $leads)->count(),
                'approvalRate' => $orderCount > 0
                    ? round(($approvedOrderCount / $orderCount) * 100, 1)
                    : 0,
                'connectedIntegrations' => $user->is_admin
                    ? IntegrationConnection::query()->where('status', 'connected')->count()
                    : null,
            ],
            'monthlyPerformance' => $this->monthlyPerformance($orders),
            'orderStatuses' => $this->orderStatuses($orders),
            'leadTypes' => $this->leadTypes($leads),
            'paymentMethods' => $this->paymentMethods($user),
            'recentOrders' => (clone $orders)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'publicNumber' => $order->public_number,
                    'customerName' => $order->customer_name,
                    'status' => $order->status->value,
                    'statusLabel' => $order->status->label(),
                    'totalCents' => $order->total_cents,
                    'currency' => $order->currency,
                    'createdAt' => $order->created_at?->toIso8601String(),
                ]),
        ]);
    }

    /** @return Builder<Order> */
    private function ordersFor(User $user): Builder
    {
        return Order::query()->when(
            ! $user->is_admin,
            fn (Builder $query) => $query->where('user_id', $user->id),
        );
    }

    /** @return Builder<Lead> */
    private function leadsFor(User $user): Builder
    {
        return Lead::query()->when(
            ! $user->is_admin,
            fn (Builder $query) => $query->where('user_id', $user->id),
        );
    }

    /**
     * @param  Builder<Order>  $orders
     * @return array<int, array{label: string, revenueCents: int, orders: int}>
     */
    private function monthlyPerformance(Builder $orders): array
    {
        return collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($orders): array {
                $month = now()->startOfMonth()->subMonths($monthsAgo);

                return [
                    'label' => $month->translatedFormat('M'),
                    'revenueCents' => (clone $orders)
                        ->where('payment_status', PaymentStatus::Approved->value)
                        ->whereBetween('paid_at', [$month, $month->copy()->endOfMonth()])
                        ->sum('total_cents'),
                    'orders' => (clone $orders)
                        ->whereBetween('created_at', [$month, $month->copy()->endOfMonth()])
                        ->count(),
                ];
            })
            ->all();
    }

    /**
     * @param  Builder<Order>  $orders
     * @return array<int, array{label: string, value: int}>
     */
    private function orderStatuses(Builder $orders): array
    {
        return (clone $orders)
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->orderByDesc('aggregate')
            ->get()
            ->map(function (Order $order): array {
                $status = OrderStatus::tryFrom((string) $order->getRawOriginal('status'));

                return [
                    'label' => $status?->label() ?? 'Outro',
                    'value' => (int) $order->getAttribute('aggregate'),
                ];
            })
            ->all();
    }

    /**
     * @param  Builder<Lead>  $leads
     * @return array<int, array{label: string, value: int}>
     */
    private function leadTypes(Builder $leads): array
    {
        $labels = [
            'other_service' => 'Serviço sob medida',
            'bug_fix' => 'Correção de bug',
            'landing_page' => 'Landing page',
        ];

        return (clone $leads)
            ->selectRaw('type, count(*) as aggregate')
            ->groupBy('type')
            ->orderByDesc('aggregate')
            ->get()
            ->map(fn (Lead $lead) => [
                'label' => $labels[$lead->type] ?? str($lead->type)->headline()->toString(),
                'value' => (int) $lead->getAttribute('aggregate'),
            ])
            ->all();
    }

    /** @return array<int, array{label: string, value: int}> */
    private function paymentMethods(User $user): array
    {
        $labels = [
            'pix' => 'Pix',
            'credit_card' => 'Cartão',
            'debit_card' => 'Débito',
            'ticket' => 'Boleto',
            'unknown' => 'Não informado',
        ];

        return Payment::query()
            ->whereHas('order', fn (Builder $query) => $query->when(
                ! $user->is_admin,
                fn (Builder $scopedQuery) => $scopedQuery->where('user_id', $user->id),
            ))
            ->selectRaw("COALESCE(method, 'unknown') as payment_method, count(*) as aggregate")
            ->groupBy('payment_method')
            ->orderByDesc('aggregate')
            ->get()
            ->map(function (Payment $payment) use ($labels): array {
                $method = (string) $payment->getAttribute('payment_method');

                return [
                    'label' => $labels[$method] ?? str($method)->headline()->toString(),
                    'value' => (int) $payment->getAttribute('aggregate'),
                ];
            })
            ->all();
    }
}
