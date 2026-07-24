import { Link } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo-head';
import { formatCurrency } from '@/lib/money';

type Product = {
    id: number;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    effectivePriceCents: number;
    currency: string;
    estimatedDelivery: string;
    maxSections: number | null;
    includedFeatures: string[];
    excludedFeatures: string[];
    revisionCount: number;
    seoTitle: string | null;
    seoDescription: string | null;
};

export default function CommercialProductShow({
    product,
}: {
    product: Product;
}) {
    return (
        <>
            <SeoHead
                title={product.seoTitle ?? `${product.name} | RECHI/`}
                description={product.seoDescription ?? product.shortDescription}
                canonicalPath={`/landing-pages/${product.slug}`}
                type="product"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: product.name,
                    description:
                        product.seoDescription ?? product.shortDescription,
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: product.currency,
                        price: (product.effectivePriceCents / 100).toFixed(2),
                        availability: 'https://schema.org/InStock',
                        url: `https://rechi.net.br/landing-pages/${product.slug}`,
                    },
                }}
            />
            <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
                <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="grid content-start gap-6">
                        <Link
                            href="/landing-pages"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Voltar para ofertas
                        </Link>
                        <div className="grid gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {product.shortDescription}
                            </p>
                        </div>
                        <p className="leading-relaxed">{product.description}</p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border p-4">
                                <span className="text-sm text-muted-foreground">
                                    Prazo
                                </span>
                                <strong className="block">
                                    {product.estimatedDelivery}
                                </strong>
                            </div>
                            <div className="rounded-lg border p-4">
                                <span className="text-sm text-muted-foreground">
                                    Seções
                                </span>
                                <strong className="block">
                                    {product.maxSections
                                        ? `Até ${product.maxSections}`
                                        : 'Sob escopo'}
                                </strong>
                            </div>
                            <div className="rounded-lg border p-4">
                                <span className="text-sm text-muted-foreground">
                                    Revisões
                                </span>
                                <strong className="block">
                                    {product.revisionCount}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <aside className="grid content-start gap-5 rounded-lg border bg-card p-6">
                        <div>
                            <span className="text-sm text-muted-foreground">
                                Investimento
                            </span>
                            <strong className="block text-4xl">
                                {formatCurrency(
                                    product.effectivePriceCents,
                                    product.currency,
                                )}
                            </strong>
                        </div>
                        <Button asChild size="lg">
                            <Link href={`/checkout/${product.slug}`}>
                                Comprar agora
                            </Link>
                        </Button>
                        <div className="grid gap-3 border-t pt-5">
                            <h2 className="font-semibold">Inclui</h2>
                            {product.includedFeatures.map((feature) => (
                                <p key={feature} className="flex gap-2 text-sm">
                                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                                    {feature}
                                </p>
                            ))}
                        </div>
                        {product.excludedFeatures.length > 0 && (
                            <div className="grid gap-3 border-t pt-5">
                                <h2 className="font-semibold">Não inclui</h2>
                                {product.excludedFeatures.map((feature) => (
                                    <p
                                        key={feature}
                                        className="flex gap-2 text-sm text-muted-foreground"
                                    >
                                        <XCircle className="mt-0.5 size-4" />
                                        {feature}
                                    </p>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </>
    );
}
