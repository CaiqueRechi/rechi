import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Code2,
    Database,
    Mail,
    MessageCircle,
    Moon,
    ShieldCheck,
    Sun,
    Wrench,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import { formatCurrency } from '@/lib/money';
import { dashboard, login } from '@/routes';

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
};

type PortfolioItem = {
    title: string;
    segment: string | null;
    solution: string | null;
    publicUrl: string | null;
    technologies: string[];
};

type PageProps = {
    auth: {
        user?: unknown;
    };
};

const fallbackPortfolio: PortfolioItem[] = [
    {
        title: 'BudgetCore',
        segment: 'Financas / SaaS',
        solution:
            'Plataforma de gestao financeira com historico auditavel e arquitetura Laravel.',
        publicUrl: 'https://github.com/CaiqueRechi/budgetcore-showcase',
        technologies: ['Laravel', 'PHP', 'MySQL'],
    },
    {
        title: 'Payment Flow',
        segment: 'API / Pagamentos',
        solution:
            'Servico para ciclo de pagamentos com status seguros, auditoria e testes.',
        publicUrl: 'https://github.com/CaiqueRechi/payment-flow-service',
        technologies: ['REST API', 'PHPUnit', 'CI'],
    },
    {
        title: 'Rechi',
        segment: 'Portfolio / Produto proprio',
        solution:
            'Aplicacao Laravel/Inertia para portfolio, integracoes pessoais e canal comercial.',
        publicUrl: 'https://github.com/CaiqueRechi/rechi',
        technologies: ['Laravel 13', 'React', 'Inertia'],
    },
];

const otherServices = [
    'Sistemas internos em Laravel',
    'APIs e integracoes com pagamentos',
    'Dashboards e areas administrativas',
    'Automacoes de processos web',
    'Consultoria tecnica para projetos existentes',
];

export default function Welcome({
    products = [],
    portfolioItems = [],
}: {
    products?: Product[];
    portfolioItems?: PortfolioItem[];
}) {
    const { auth } = usePage<PageProps>().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const landingProducts = products.filter(
        (product) => product.type === 'landing_page',
    );
    const bugProducts = products.filter(
        (product) => product.type === 'bug_fix',
    );
    const portfolio =
        portfolioItems.length > 0 ? portfolioItems : fallbackPortfolio;

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <Head title="Caique Rechi - Desenvolvedor web e landing pages">
                <meta
                    name="description"
                    content="Portfolio pessoal de Caique Rechi, desenvolvedor web especializado em Laravel, React, landing pages, correcoes de bugs e integracoes."
                />
            </Head>

            <main className="min-h-screen bg-[#f7f7f2] text-[#151510] dark:bg-[#10100e] dark:text-[#f7f7f2]">
                <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f7f2]/90 backdrop-blur dark:border-white/10 dark:bg-[#10100e]/90">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <Link href="/" className="font-black uppercase">
                            Caique Rechi
                        </Link>
                        <nav className="hidden gap-6 text-sm font-medium lg:flex">
                            <a href="#sobre">Sobre</a>
                            <a href="#landing-pages">Landing pages</a>
                            <a href="#outros-servicos">Outros servicos</a>
                            <a href="#portfolio">Portfolio</a>
                            <a href="#faq">FAQ</a>
                        </nav>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={toggleTheme}
                                aria-label="Alternar tema"
                                title="Alternar tema"
                            >
                                {resolvedAppearance === 'dark' ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={auth.user ? dashboard() : login()}>
                                    {auth.user ? 'Dashboard' : 'Entrar'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </header>

                <section
                    id="sobre"
                    className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24"
                >
                    <div className="grid content-center gap-7">
                        <p className="text-sm font-semibold tracking-wide text-[#5f7d00] uppercase">
                            Portfolio pessoal / desenvolvimento web
                        </p>
                        <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
                            Sou Caique Rechi. Transformo ideias, sistemas e
                            ofertas em experiencias web claras.
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-black/65 dark:text-white/65">
                            Trabalho com PHP, Laravel, React, Inertia, APIs,
                            banco de dados e integracoes. Meu foco e construir
                            paginas e sistemas que sejam objetivos para vender,
                            faceis de manter e confiaveis em producao.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <a href="#landing-pages">
                                    Ver ofertas
                                    <ArrowRight className="size-4" />
                                </a>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <a href="#outros-servicos">
                                    Solicitar outro servico
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="grid content-center gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Como posso ajudar</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                {[
                                    'Landing pages para validar ofertas e captar contatos.',
                                    'Correcoes de bugs em PHP, Laravel, JavaScript e APIs.',
                                    'Integracoes com pagamentos, webhooks, e-mail e paineis.',
                                    'Organizacao tecnica para projetos que precisam evoluir.',
                                ].map((step) => (
                                    <p key={step} className="flex gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-[#5f7d00]" />
                                        {step}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="border-y border-black/10 bg-white px-5 py-8 sm:px-8 dark:border-white/10 dark:bg-[#171713]">
                    <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
                        <MiniMetric value="Laravel" label="Backend" />
                        <MiniMetric value="React" label="Frontend" />
                        <MiniMetric value="APIs" label="Integracoes" />
                        <MiniMetric value="SEO" label="Base tecnica" />
                    </div>
                </section>

                <section
                    id="landing-pages"
                    className="px-5 py-16 sm:px-8"
                >
                    <div className="mx-auto grid max-w-7xl gap-8">
                        <SectionTitle
                            title="Landing pages prontas para receber clientes"
                            description="Pacotes com escopo fechado, prazo e itens incluidos visiveis antes da compra."
                        />
                        <ProductGrid products={landingProducts} />
                    </div>
                </section>

                <section
                    id="bugs"
                    className="border-y border-black/10 bg-white px-5 py-16 sm:px-8 dark:border-white/10 dark:bg-[#171713]"
                >
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="grid content-start gap-4">
                            <Wrench className="size-10 text-[#5f7d00]" />
                            <SectionTitle
                                title="Correcao de bugs em PHP, Laravel e JavaScript"
                                description="Diagnostico com minimo de 2 horas, autorizacao antes de exceder horas e registro do pedido."
                            />
                            <p className="text-sm text-black/60 dark:text-white/60">
                                Quando o erro nao for reproduzivel, o trabalho
                                vira diagnostico documentado com proximos
                                passos. Acesso a codigo, logs e ambiente deve
                                ser fornecido de forma segura.
                            </p>
                        </div>
                        <ProductGrid products={bugProducts} />
                    </div>
                </section>

                <section id="outros-servicos" className="px-5 py-16 sm:px-8">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="grid content-start gap-6">
                            <SectionTitle
                                title="Solicite outros servicos"
                                description="Se o que voce precisa nao cabe em uma landing page ou bug pontual, envie um pedido de escopo personalizado."
                            />
                            <div className="grid gap-3">
                                {otherServices.map((service) => (
                                    <p
                                        key={service}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <CheckCircle2 className="size-4 text-[#5f7d00]" />
                                        {service}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <OtherServiceForm />
                    </div>
                </section>

                <section
                    id="portfolio"
                    className="border-y border-black/10 bg-white px-5 py-16 sm:px-8 dark:border-white/10 dark:bg-[#171713]"
                >
                    <div className="mx-auto grid max-w-7xl gap-8">
                        <SectionTitle
                            title="Portfolio"
                            description="Trabalhos reais e projetos tecnicos usados para demonstrar experiencia."
                        />
                        <div className="grid gap-4 md:grid-cols-3">
                            {portfolio.map((item) => (
                                <Card key={item.title} className="rounded-lg">
                                    <CardHeader>
                                        <CardTitle>{item.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {item.segment}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <p className="text-sm text-muted-foreground">
                                            {item.solution}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.technologies.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="rounded-md border px-2 py-1 text-xs"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-5 py-16 sm:px-8">
                    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
                        <TrustItem
                            icon={ShieldCheck}
                            title="Pagamento protegido"
                            text="Pix e cartao passam pelo checkout hospedado do Mercado Pago. O servidor nao processa cartao."
                        />
                        <TrustItem
                            icon={Code2}
                            title="Stack de producao"
                            text="PHP, Laravel, APIs, MySQL/MariaDB, JavaScript e integracoes com webhooks."
                        />
                        <TrustItem
                            icon={MessageCircle}
                            title="Acompanhamento"
                            text="Pedido, briefing e status ficam registrados no sistema apos a compra."
                        />
                    </div>
                </section>

                <section
                    id="faq"
                    className="border-t border-black/10 px-5 py-16 sm:px-8 dark:border-white/10"
                >
                    <div className="mx-auto grid max-w-4xl gap-5">
                        <SectionTitle
                            title="Perguntas frequentes"
                            description="Informacoes diretas antes de contratar."
                        />
                        {[
                            [
                                'SEO garante posicao no Google?',
                                'Nao. A entrega cria uma base tecnica correta, rastreavel e indexavel. Resultado organico depende de concorrencia, autoridade, conteudo e tempo.',
                            ],
                            [
                                'Posso pedir reembolso?',
                                'A contratacao seguira a legislacao brasileira, incluindo direito de arrependimento quando aplicavel e regras especificas para execucao personalizada.',
                            ],
                            [
                                'Preciso criar conta?',
                                'Sim. A conta permite criar o pedido, receber o link seguro e acompanhar briefing, pagamento e producao.',
                            ],
                        ].map(([question, answer]) => (
                            <article
                                key={question}
                                className="rounded-lg border bg-card p-5"
                            >
                                <h3 className="font-semibold">{question}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="bg-[#d8ff3e] px-5 py-12 text-[#151510] sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-black">
                                Vamos colocar isso em producao?
                            </h2>
                            <p className="text-sm">
                                Landing page, bug ou sistema sob medida:
                                escolha uma oferta ou envie uma solicitacao.
                            </p>
                        </div>
                        <a
                            href="mailto:caique.rechi.dev@gmail.com"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <Mail className="size-4" />
                            caique.rechi.dev@gmail.com
                        </a>
                        <nav className="flex flex-wrap gap-4 text-sm font-semibold">
                            <Link href="/termos-de-uso">Termos</Link>
                            <Link href="/privacidade">Privacidade</Link>
                            <Link href="/arrependimento-e-reembolso">
                                Reembolso legal
                            </Link>
                        </nav>
                    </div>
                </footer>
            </main>
        </>
    );
}

function OtherServiceForm() {
    return (
        <Form
            action="/solicitar-servico"
            method="post"
            className="grid gap-5 rounded-lg border bg-card p-6"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    {recentlySuccessful && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            Solicitacao enviada. Vou analisar e retornar pelo
                            contato informado.
                        </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" name="name" required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">WhatsApp</Label>
                            <Input id="phone" name="phone" />
                            <InputError message={errors.phone} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="technology">Tecnologia</Label>
                            <Input
                                id="technology"
                                name="technology"
                                placeholder="Laravel, React, WordPress..."
                            />
                            <InputError message={errors.technology} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="url">URL do projeto</Label>
                        <Input
                            id="url"
                            name="url"
                            type="url"
                            placeholder="https://..."
                        />
                        <InputError message={errors.url} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="problem_description">
                            O que voce precisa?
                        </Label>
                        <textarea
                            id="problem_description"
                            name="problem_description"
                            required
                            className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            placeholder="Descreva o objetivo, problema, prazo desejado e contexto do projeto."
                        />
                        <InputError message={errors.problem_description} />
                    </div>
                    <label className="flex items-start gap-3 text-sm">
                        <Checkbox name="consent_accepted" value="1" />
                        <span>
                            Aceito ser contatado sobre esta solicitacao e li a{' '}
                            <Link href="/privacidade" className="underline">
                                politica de privacidade
                            </Link>
                            .
                        </span>
                    </label>
                    <InputError message={errors.consent_accepted} />
                    <Button disabled={processing}>
                        Enviar solicitacao
                        <ArrowRight className="size-4" />
                    </Button>
                </>
            )}
        </Form>
    );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <Database className="size-5 text-[#5f7d00]" />
            <div>
                <strong className="block text-lg">{value}</strong>
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
        </div>
    );
}

function SectionTitle({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="grid gap-2">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                {title}
            </h2>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
        </div>
    );
}

function ProductGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <Card className="rounded-lg">
                <CardContent className="p-6 text-sm text-muted-foreground">
                    Nenhuma oferta ativa cadastrada ainda.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
                <Card key={product.id} className="rounded-lg">
                    <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {product.shortDescription}
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <div>
                            <strong className="text-3xl">
                                {formatCurrency(
                                    product.effectivePriceCents,
                                    product.currency,
                                )}
                            </strong>
                            <p className="text-sm text-muted-foreground">
                                {product.estimatedDelivery}
                            </p>
                        </div>
                        <ul className="grid gap-2 text-sm">
                            {product.includedFeatures
                                .slice(0, 4)
                                .map((feature) => (
                                    <li key={feature} className="flex gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-[#5f7d00]" />
                                        {feature}
                                    </li>
                                ))}
                        </ul>
                        <Button asChild>
                            <Link href={`/landing-pages/${product.slug}`}>
                                Ver detalhes
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function TrustItem({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof ShieldCheck;
    title: string;
    text: string;
}) {
    return (
        <article className="rounded-lg border bg-card p-5">
            <Icon className="mb-4 size-6 text-[#5f7d00]" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        </article>
    );
}
