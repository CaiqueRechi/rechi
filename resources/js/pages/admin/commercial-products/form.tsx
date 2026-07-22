import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Product = {
    id: number;
    type: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    priceCents: number;
    promotionalPriceCents: number | null;
    estimatedDelivery: string;
    maxSections: number | null;
    includedFeatures: string[];
    excludedFeatures: string[];
    revisionCount: number;
    isFeatured: boolean;
    isActive: boolean;
    category: string | null;
    sortOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
};

export default function AdminProductForm({
    product,
}: {
    product: Product | null;
}) {
    const action = product
        ? `/admin/commercial-products/${product.id}`
        : '/admin/commercial-products';
    const method = product ? 'put' : 'post';

    return (
        <>
            <Head title={product ? 'Editar produto' : 'Novo produto'} />
            <div className="mx-auto grid w-full max-w-3xl gap-6 p-4 md:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {product ? 'Editar produto' : 'Novo produto'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Preços são salvos em centavos para evitar erros de
                        dinheiro.
                    </p>
                </header>

                <Form action={action} method={method} className="grid gap-5">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={product?.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={product?.slug}
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <input
                                type="hidden"
                                name="type"
                                value={product?.type ?? 'landing_page'}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="short_description">
                                    Descrição curta
                                </Label>
                                <Input
                                    id="short_description"
                                    name="short_description"
                                    defaultValue={product?.shortDescription}
                                    required
                                />
                                <InputError
                                    message={errors.short_description}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={product?.description}
                                    required
                                    className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="price_cents">
                                        Preço em centavos
                                    </Label>
                                    <Input
                                        id="price_cents"
                                        name="price_cents"
                                        type="number"
                                        min="1"
                                        defaultValue={
                                            product?.priceCents ?? 45000
                                        }
                                        required
                                    />
                                    <InputError message={errors.price_cents} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="estimated_delivery">
                                        Prazo
                                    </Label>
                                    <Input
                                        id="estimated_delivery"
                                        name="estimated_delivery"
                                        defaultValue={
                                            product?.estimatedDelivery ??
                                            'até 3 dias úteis'
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.estimated_delivery}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="max_sections">
                                        Máximo de seções
                                    </Label>
                                    <Input
                                        id="max_sections"
                                        name="max_sections"
                                        type="number"
                                        defaultValue={product?.maxSections ?? 5}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="revision_count">
                                        Revisões
                                    </Label>
                                    <Input
                                        id="revision_count"
                                        name="revision_count"
                                        type="number"
                                        defaultValue={
                                            product?.revisionCount ?? 1
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="included_features">
                                    Recursos incluídos, um por linha
                                </Label>
                                <textarea
                                    id="included_features"
                                    name="included_features"
                                    defaultValue={(
                                        product?.includedFeatures ?? [
                                            'design responsivo',
                                            'botão para WhatsApp',
                                            'formulário de contato',
                                        ]
                                    ).join('\n')}
                                    className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        name="is_active"
                                        value="1"
                                        defaultChecked={
                                            product?.isActive ?? true
                                        }
                                    />
                                    Ativo
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        name="is_featured"
                                        value="1"
                                        defaultChecked={
                                            product?.isFeatured ?? true
                                        }
                                    />
                                    Destaque
                                </label>
                            </div>
                            <input
                                type="hidden"
                                name="sort_order"
                                value={product?.sortOrder ?? 0}
                            />
                            <div className="flex gap-3">
                                <Button disabled={processing}>Salvar</Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/commercial-products">
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
