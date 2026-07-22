import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/money';

type Product = {
    id: number;
    name: string;
    slug: string;
    type: string;
    effectivePriceCents: number;
    isActive: boolean;
    isFeatured: boolean;
};

export default function AdminProductsIndex({
    products,
    status,
}: {
    products: Product[];
    status?: string;
}) {
    return (
        <>
            <Head title="Produtos comerciais" />
            <div className="grid gap-6 p-4 md:p-8">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Produtos comerciais
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gerencie landing pages e pacotes de horas.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/commercial-products/create">
                            Novo produto
                        </Link>
                    </Button>
                </header>

                {status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {status}
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto]"
                        >
                            <div>
                                <strong>{product.name}</strong>
                                <p className="text-sm text-muted-foreground">
                                    {product.slug} ·{' '}
                                    {formatCurrency(
                                        product.effectivePriceCents,
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={
                                        product.isActive ? 'default' : 'outline'
                                    }
                                >
                                    {product.isActive ? 'ativo' : 'inativo'}
                                </Badge>
                                {product.isFeatured && (
                                    <Badge variant="outline">destaque</Badge>
                                )}
                            </div>
                            <Button asChild variant="outline">
                                <Link
                                    href={`/admin/commercial-products/${product.id}/edit`}
                                >
                                    Editar
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Produtos comerciais',
            href: '/admin/commercial-products',
        },
    ],
};
