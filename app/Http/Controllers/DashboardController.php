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
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $hasOrders = $this->tableExists('orders');
        $hasLeads = $this->tableExists('leads');
        $hasPayments = $this->tableExists('payments');
        $hasIntegrations = $this->tableExists('integration_connections');
        $canViewIntegrations = $user->can('integration_settings.view');
        $orders = $hasOrders ? $this->ordersFor() : null;
        $leads = $hasLeads ? $this->leadsFor() : null;
        $approvedOrders = $orders
            ? (clone $orders)->where('payment_status', PaymentStatus::Approved->value)
            : null;
        $orderCount = $orders ? (clone $orders)->count() : 0;
        $approvedOrderCount = $approvedOrders ? (clone $approvedOrders)->count() : 0;
        $missingSources = collect([
            'Pedidos' => $hasOrders,
            'Leads' => $hasLeads,
            'Pagamentos' => $hasPayments,
            'Integrações' => ! $canViewIntegrations || $hasIntegrations,
        ])->reject()->keys()->values()->all();

        return Inertia::render('dashboard', [
            'isAdminView' => true,
            'dataAvailability' => [
                'isReady' => $missingSources === [],
                'missingSources' => $missingSources,
            ],
            'summary' => [
                'revenueCents' => $approvedOrders
                    ? (clone $approvedOrders)->sum('total_cents')
                    : 0,
                'orderCount' => $orderCount,
                'leadCount' => $leads ? (clone $leads)->count() : 0,
                'approvalRate' => $orderCount > 0
                    ? round(($approvedOrderCount / $orderCount) * 100, 1)
                    : 0,
                'connectedIntegrations' => $canViewIntegrations && $hasIntegrations
                    ? IntegrationConnection::query()->where('status', 'connected')->count()
                    : null,
            ],
            'monthlyPerformance' => $orders
                ? $this->monthlyPerformance($orders)
                : $this->emptyMonthlyPerformance(),
            'orderStatuses' => $orders ? $this->orderStatuses($orders) : [],
            'leadTypes' => $leads ? $this->leadTypes($leads) : [],
            'paymentMethods' => $hasOrders && $hasPayments
                ? $this->paymentMethods()
                : [],
            'recentOrders' => $orders
                ? (clone $orders)
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
                    ])
                : [],
        ]);
    }

    protected function tableExists(string $table): bool
    {
        return Schema::hasTable($table);
    }

    /** @return Builder<Order> */
    private function ordersFor(): Builder
    {
        return Order::query();
    }

    /** @return Builder<Lead> */
    private function leadsFor(): Builder
    {
        return Lead::query();
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
                    'revenueCents' => (int) (clone $orders)
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

    /** @return array<int, array{label: string, revenueCents: int, orders: int}> */
    private function emptyMonthlyPerformance(): array
    {
        return collect(range(5, 0))
            ->map(function (int $monthsAgo): array {
                $month = now()->startOfMonth()->subMonths($monthsAgo);

                return [
                    'label' => $month->translatedFormat('M'),
                    'revenueCents' => 0,
                    'orders' => 0,
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
    private function paymentMethods(): array
    {
        $labels = [
            'pix' => 'Pix',
            'credit_card' => 'Cartão',
            'debit_card' => 'Débito',
            'ticket' => 'Boleto',
            'unknown' => 'Não informado',
        ];

        return Payment::query()
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
