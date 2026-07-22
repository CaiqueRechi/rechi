import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/money';

type Product = {
    id: number;
    name: string;
    slug: string;
    shortDescription: string;
    effectivePriceCents: number;
    currency: string;
    estimatedDelivery: string;
    revisionCount: number;
    includedFeatures: string[];
    excludedFeatures: string[];
};

export default function CheckoutShow({ product }: { product: Product }) {
    return (
        <>
            <Head title={`Checkout - ${product.name}`} />
            <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr]">
                    <section className="grid content-start gap-5">
                        <Link
                            href={`/landing-pages/${product.slug}`}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Voltar para a oferta
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Confirmar compra
                            </h1>
                            <p className="text-muted-foreground">
                                O valor é calculado no backend e o pagamento é
                                iniciado pelo Mercado Pago.
                            </p>
                        </div>
                        <Form
                            action="/checkout"
                            method="post"
                            className="grid gap-5 rounded-lg border bg-card p-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="product_id"
                                        value={product.id}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer_phone">
                                            Telefone ou WhatsApp
                                        </Label>
                                        <Input
                                            id="customer_phone"
                                            name="customer_phone"
                                            placeholder="(43) 99999-9999"
                                        />
                                        <InputError
                                            message={errors.customer_phone}
                                        />
                                    </div>
                                    <label className="flex items-start gap-3 text-sm">
                                        <Checkbox
                                            name="terms_accepted"
                                            value="1"
                                        />
                                        <span>
                                            Li e aceito os termos da
                                            contratação, incluindo prazos,
                                            escopo,{' '}
                                            <Link
                                                href="/arrependimento-e-reembolso"
                                                className="underline"
                                            >
                                                política legal de arrependimento
                                            </Link>{' '}
                                            e regras de execução personalizada.
                                        </span>
                                    </label>
                                    <InputError
                                        message={errors.terms_accepted}
                                    />
                                    <Button disabled={processing}>
                                        Iniciar pagamento
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    <aside className="grid content-start gap-5 rounded-lg border p-6">
                        <div>
                            <span className="text-sm text-muted-foreground">
                                Produto
                            </span>
                            <h2 className="text-2xl font-semibold">
                                {product.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {product.shortDescription}
                            </p>
                        </div>
                        <strong className="text-4xl">
                            {formatCurrency(
                                product.effectivePriceCents,
                                product.currency,
                            )}
                        </strong>
                        <p className="text-sm text-muted-foreground">
                            Prazo estimado: {product.estimatedDelivery}
                        </p>
                        <ul className="grid gap-2 text-sm">
                            {product.includedFeatures.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </main>
        </>
    );
}
