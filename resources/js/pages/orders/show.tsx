import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/money';

type Order = {
    publicNumber: string;
    statusLabel: string;
    paymentStatusLabel: string;
    productionStatusLabel: string;
    totalCents: number;
    currency: string;
    agreedDelivery: string | null;
    items: {
        name: string;
        description: string;
        totalCents: number;
        includedFeatures: string[];
    }[];
    payment: {
        status: string;
        checkoutUrl: string | null;
        method: string | null;
    } | null;
    briefingStatus: string | null;
    timeline: {
        field: string;
        fromStatus: string | null;
        toStatus: string;
        notes: string | null;
        createdAt: string | null;
    }[];
};

export default function OrderShow({
    order,
    status,
}: {
    order: Order;
    status?: string;
}) {
    return (
        <>
            <Head title={`Pedido ${order.publicNumber}`} />
            <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Pedido {order.publicNumber}
                        </h1>
                        <p className="text-muted-foreground">
                            Acompanhe pagamento, briefing e produção.
                        </p>
                    </div>
                    <Badge>{order.statusLabel}</Badge>
                </header>

                {status && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {status}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <span className="text-sm text-muted-foreground">
                            Pagamento
                        </span>
                        <strong className="block">
                            {order.paymentStatusLabel}
                        </strong>
                    </div>
                    <div className="rounded-lg border p-4">
                        <span className="text-sm text-muted-foreground">
                            Produção
                        </span>
                        <strong className="block">
                            {order.productionStatusLabel}
                        </strong>
                    </div>
                    <div className="rounded-lg border p-4">
                        <span className="text-sm text-muted-foreground">
                            Total
                        </span>
                        <strong className="block">
                            {formatCurrency(order.totalCents, order.currency)}
                        </strong>
                    </div>
                </section>

                {order.payment?.checkoutUrl && (
                    <Button asChild className="w-fit">
                        <a href={order.payment.checkoutUrl}>Abrir pagamento</a>
                    </Button>
                )}

                <section className="grid gap-3 rounded-lg border p-5">
                    <h2 className="text-xl font-semibold">Itens</h2>
                    {order.items.map((item) => (
                        <article key={item.name} className="grid gap-2">
                            <strong>{item.name}</strong>
                            <p className="text-sm text-muted-foreground">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="grid gap-3 rounded-lg border p-5">
                    <h2 className="text-xl font-semibold">Timeline</h2>
                    {order.timeline.map((entry) => (
                        <div
                            key={`${entry.field}-${entry.toStatus}-${entry.createdAt}`}
                            className="border-b py-3 last:border-b-0"
                        >
                            <strong>{entry.toStatus}</strong>
                            {entry.notes && (
                                <p className="text-sm text-muted-foreground">
                                    {entry.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
}
