import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/money';

type Order = {
    publicNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    statusLabel: string;
    paymentStatusLabel: string;
    productionStatusLabel: string;
    totalCents: number;
    currency: string;
    items: { id: number; product_name: string; total_cents: number }[];
    timeline: {
        id: number;
        field: string;
        from_status: string | null;
        to_status: string;
        notes: string | null;
        created_at: string;
    }[];
};

export default function AdminOrderShow({ order }: { order: Order }) {
    return (
        <>
            <Head title={`Pedido ${order.publicNumber}`} />
            <div className="grid gap-6 p-4 md:p-8">
                <header className="flex flex-wrap justify-between gap-3 border-b pb-5">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {order.publicNumber}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {order.customerName} · {order.customerEmail}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/orders">Voltar</Link>
                    </Button>
                </header>
                <section className="grid gap-4 md:grid-cols-4">
                    <Info label="Pedido" value={order.statusLabel} />
                    <Info label="Pagamento" value={order.paymentStatusLabel} />
                    <Info
                        label="Produção"
                        value={order.productionStatusLabel}
                    />
                    <Info
                        label="Total"
                        value={formatCurrency(order.totalCents, order.currency)}
                    />
                </section>
                <section className="grid gap-3 rounded-lg border p-5">
                    <h2 className="font-semibold">Itens</h2>
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.product_name}</span>
                            <strong>{formatCurrency(item.total_cents)}</strong>
                        </div>
                    ))}
                </section>
                <section className="grid gap-3 rounded-lg border p-5">
                    <h2 className="font-semibold">Timeline</h2>
                    {order.timeline.map((entry) => (
                        <div
                            key={entry.id}
                            className="border-b py-3 last:border-b-0"
                        >
                            <strong>
                                {entry.field}: {entry.to_status}
                            </strong>
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

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <strong className="block">{value}</strong>
        </div>
    );
}
