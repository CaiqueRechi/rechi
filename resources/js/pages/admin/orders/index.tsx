import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/money';

type Order = {
    id: number;
    publicNumber: string;
    customerName: string;
    customerEmail: string;
    statusLabel: string;
    paymentStatusLabel: string;
    totalCents: number;
    createdAt: string | null;
};

type PaginatedOrders = {
    data: Order[];
};

type Metrics = {
    ordersInPeriod: number;
    soldCents: number;
    approvedCents: number;
    pendingOrders: number;
    completedOrders: number;
};

export default function AdminOrdersIndex({
    orders,
    metrics,
}: {
    orders: PaginatedOrders;
    metrics: Metrics;
}) {
    return (
        <>
            <Head title="Pedidos" />
            <div className="grid gap-6 p-4 md:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">Pedidos</h1>
                    <p className="text-sm text-muted-foreground">
                        Histórico comercial e acompanhamento de produção.
                    </p>
                </header>
                <section className="grid gap-3 md:grid-cols-5">
                    <Metric label="Pedidos" value={metrics.ordersInPeriod} />
                    <Metric
                        label="Vendido"
                        value={formatCurrency(metrics.soldCents)}
                    />
                    <Metric
                        label="Aprovado"
                        value={formatCurrency(metrics.approvedCents)}
                    />
                    <Metric label="Pendentes" value={metrics.pendingOrders} />
                    <Metric
                        label="Concluídos"
                        value={metrics.completedOrders}
                    />
                </section>
                <section className="overflow-hidden rounded-lg border">
                    {orders.data.map((order) => (
                        <article
                            key={order.id}
                            className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto]"
                        >
                            <div>
                                <strong>{order.publicNumber}</strong>
                                <p className="text-sm text-muted-foreground">
                                    {order.customerName} · {order.customerEmail}
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {order.statusLabel} · {order.paymentStatusLabel}{' '}
                                · {formatCurrency(order.totalCents)}
                            </div>
                            <Button asChild variant="outline">
                                <Link href={`/admin/orders/${order.id}`}>
                                    Ver
                                </Link>
                            </Button>
                        </article>
                    ))}
                </section>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground">{label}</span>
            <strong className="block text-lg">{value}</strong>
        </div>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Pedidos', href: '/admin/orders' }],
};
