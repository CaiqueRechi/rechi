import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SeoHead from '@/components/seo-head';
import { formatCurrency } from '@/lib/money';

type Product = {
    id: number;
    type: string;
    name: string;
    slug: string;
    shortDescription: string;
    effectivePriceCents: number;
    currency: string;
    estimatedDelivery: string;
    includedFeatures: string[];
    revisionCount: number;
    isFeatured: boolean;
};

export default function CommercialProductsIndex({
    products,
}: {
    products: Product[];
}) {
    return (
        <>
            <SeoHead
                title="Landing pages e serviços web | RECHI/"
                description="Landing pages, correção de bugs e serviços web com escopo, prazo e investimento claros."
                canonicalPath="/landing-pages"
            />
            <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
                <div className="mx-auto grid max-w-6xl gap-8">
                    <header className="grid gap-3 border-b pb-6">
                        <p className="text-sm font-medium text-muted-foreground">
                            Rechi serviços digitais
                        </p>
                        <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
                            Landing pages e correção de bugs com escopo claro.
                        </h1>
                        <p className="max-w-2xl text-muted-foreground">
                            Escolha uma oferta, entre na sua conta, confirme o
                            pedido e acompanhe o briefing pelo sistema.
                        </p>
                    </header>

                    <section className="grid gap-4 md:grid-cols-2">
                        {products.map((product) => (
                            <Card key={product.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between gap-3">
                                        <span>{product.name}</span>
                                        {product.isFeatured && (
                                            <span className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
                                                destaque
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-5">
                                    <p className="text-sm text-muted-foreground">
                                        {product.shortDescription}
                                    </p>
                                    <div>
                                        <strong className="text-3xl">
                                            {formatCurrency(
                                                product.effectivePriceCents,
                                                product.currency,
                                            )}
                                        </strong>
                                        <p className="text-sm text-muted-foreground">
                                            Prazo: {product.estimatedDelivery}
                                        </p>
                                    </div>
                                    <ul className="grid gap-2 text-sm">
                                        {product.includedFeatures
                                            .slice(0, 4)
                                            .map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex gap-2"
                                                >
                                                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                    </ul>
                                    <Button asChild>
                                        <Link
                                            href={`/landing-pages/${product.slug}`}
                                        >
                                            Ver oferta
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                </div>
            </main>
        </>
    );
}
