import type { ReactNode } from 'react';
import { useState } from 'react';
import { Form, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    CheckCircle2,
    Code2,
    Database,
    ExternalLink,
    Mail,
    MessageCircle,
    Moon,
    ShieldCheck,
    Sun,
    Wrench,
} from '@/components/bootstrap-icons';
import InputError from '@/components/input-error';
import SeoHead from '@/components/seo-head';
import { Button } from '@/components/ui/button';
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

const brand = {
    logoHorizontal: '/brand/rechi-logo-horizontal.svg',
    logoStacked: '/brand/rechi-logo-stacked.svg',
    mascot: '/brand/rechi-mascot.svg',
    wordmark: '/brand/rechi-wordmark.svg',
};

const navigation = [
    ['Serviços', '#servicos'],
    ['Projetos', '#portfolio'],
    ['Processo', '#processo'],
    ['Contato', '#contato'],
];

const fallbackPortfolio: PortfolioItem[] = [
    {
        title: 'BudgetCore',
        segment: 'Finanças / SaaS',
        solution:
            'Plataforma de gestão financeira com histórico auditável e arquitetura Laravel.',
        publicUrl: 'https://github.com/CaiqueRechi/budgetcore-showcase',
        technologies: ['Laravel', 'PHP', 'MySQL'],
    },
    {
        title: 'Payment Flow',
        segment: 'API / Pagamentos',
        solution:
            'Serviço para ciclo de pagamentos com estados seguros, auditoria e testes.',
        publicUrl: 'https://github.com/CaiqueRechi/payment-flow-service',
        technologies: ['REST API', 'PHPUnit', 'CI'],
    },
    {
        title: 'Rechi',
        segment: 'Produto próprio',
        solution:
            'Aplicação Laravel/Inertia para portfólio, integrações pessoais e canal comercial.',
        publicUrl: 'https://github.com/CaiqueRechi/rechi',
        technologies: ['Laravel 13', 'React', 'Inertia'],
    },
];

const otherServices = [
    'Sistemas internos em Laravel',
    'APIs e integrações com pagamentos',
    'Dashboards e áreas administrativas',
    'Automações de processos web',
    'Consultoria para projetos existentes',
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
    const [menuOpen, setMenuOpen] = useState(false);
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

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <SeoHead
                title="Rechi - Desenvolvimento web com personalidade"
                description="Caique Rechi cria landing pages, sistemas web e integrações com Laravel, React e APIs. Software profissional com identidade autoral."
                canonicalPath="/"
                structuredData={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Person',
                        name: 'Caique Rechi',
                        url: 'https://rechi.net.br',
                        jobTitle: 'Desenvolvedor web',
                        sameAs: ['https://github.com/CaiqueRechi'],
                        knowsAbout: [
                            'Laravel',
                            'PHP',
                            'React',
                            'Inertia.js',
                            'APIs',
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ProfessionalService',
                        name: 'Rechi',
                        url: 'https://rechi.net.br',
                        areaServed: 'BR',
                        description:
                            'Desenvolvimento de landing pages, sistemas web, correções de bugs e integrações.',
                    },
                ]}
            />

            <main className="rechi-home min-h-screen overflow-x-clip">
                <header className="sticky top-0 z-50 border-b [border-color:var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_92%,transparent)] backdrop-blur-md">
                    <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
                        <Link
                            href="/"
                            className="rechi-focus rounded-3xl"
                            aria-label="Rechi, página inicial"
                            onClick={closeMenu}
                        >
                            <span className="grid h-14 w-32 place-items-center rounded-[24px_16px_24px_18px] bg-[var(--color-brand-plate)] px-4 shadow-[4px_4px_0_rgb(var(--shadow-color)/0.16)] sm:w-40">
                                <img
                                    src={brand.wordmark}
                                    width="1024"
                                    height="560"
                                    alt="Rechi"
                                    className="h-auto max-h-11 w-full object-contain"
                                />
                            </span>
                        </Link>

                        <nav
                            className="hidden items-center gap-7 text-sm font-semibold lg:flex"
                            aria-label="Navegação principal"
                        >
                            {navigation.map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="rechi-focus rounded-full text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="rechi-focus inline-flex min-h-11 items-center gap-2 rounded-full border [border-color:var(--color-border)] px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[var(--color-surface-elevated)]"
                                aria-label={
                                    resolvedAppearance === 'dark'
                                        ? 'Ativar modo claro'
                                        : 'Ativar modo escuro'
                                }
                            >
                                {resolvedAppearance === 'dark' ? (
                                    <Sun className="size-4" aria-hidden />
                                ) : (
                                    <Moon className="size-4" aria-hidden />
                                )}
                                <span className="hidden sm:inline">
                                    {resolvedAppearance === 'dark'
                                        ? 'Claro'
                                        : 'Escuro'}
                                </span>
                            </button>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rechi-focus hidden min-h-11 items-center rounded-full bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--rechi-cream)] shadow-[4px_4px_0_rgb(var(--shadow-color)/0.18)] transition hover:-translate-y-0.5 sm:inline-flex"
                            >
                                {auth.user ? 'Dashboard' : 'Entrar'}
                            </Link>
                            <button
                                type="button"
                                className="rechi-focus inline-flex min-h-11 items-center rounded-full border [border-color:var(--color-border)] px-4 text-sm font-bold lg:hidden"
                                aria-expanded={menuOpen}
                                aria-controls="home-mobile-menu"
                                onClick={() => setMenuOpen((open) => !open)}
                            >
                                Menu
                            </button>
                        </div>
                    </div>

                    {menuOpen && (
                        <nav
                            id="home-mobile-menu"
                            className="border-t [border-color:var(--color-border)] px-4 py-4 lg:hidden"
                            aria-label="Navegação mobile"
                        >
                            <div className="grid gap-2">
                                {navigation.map(([label, href]) => (
                                    <a
                                        key={href}
                                        href={href}
                                        className="rechi-focus rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--color-surface)]"
                                        onClick={closeMenu}
                                    >
                                        {label}
                                    </a>
                                ))}
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="rechi-focus rounded-2xl bg-[var(--color-primary)] px-4 py-3 font-bold text-[var(--rechi-cream)]"
                                    onClick={closeMenu}
                                >
                                    {auth.user ? 'Dashboard' : 'Entrar'}
                                </Link>
                            </div>
                        </nav>
                    )}
                </header>

                <section className="relative px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
                    <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.76fr)] lg:items-center">
                        <div className="grid gap-8">
                            <div className="inline-flex w-fit items-center gap-3 rounded-full border [border-color:var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)]">
                                <span className="size-2 rounded-full bg-[var(--color-primary)]" />
                                Caique Rechi / desenvolvimento web
                            </div>

                            <div className="grid gap-6">
                                <h1 className="rechi-display max-w-5xl text-[clamp(3.1rem,8vw,8.4rem)] leading-[0.9] font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                                    Software com cara própria, código sério e
                                    otimizado.
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-[var(--color-text-muted)] sm:text-xl">
                                    Eu crio landing pages, sistemas internos e
                                    integrações para quem precisa vender,
                                    organizar operação ou consertar algo que já
                                    deveria estar funcionando.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="#servicos"
                                    className="rechi-focus inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--color-primary)] px-6 font-bold text-[var(--rechi-cream)] shadow-[5px_5px_0_rgb(var(--shadow-color)/0.18)] transition hover:-translate-y-0.5"
                                >
                                    Ver soluções
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden
                                    />
                                </a>
                                <a
                                    href="#contato"
                                    className="rechi-focus inline-flex min-h-12 items-center gap-3 rounded-full border [border-color:var(--color-border)] px-6 font-bold transition hover:-translate-y-0.5 hover:bg-[var(--color-surface)]"
                                >
                                    Solicitar outro serviço
                                    <ArrowDownRight
                                        className="size-4"
                                        aria-hidden
                                    />
                                </a>
                            </div>
                        </div>

                        <HeroMascot />
                    </div>
                </section>

                <section className="px-4 pb-16 sm:px-6 lg:px-10">
                    <div className="mx-auto grid max-w-[1440px] gap-4 md:grid-cols-3">
                        <ValueNote
                            title="Software"
                            text="Laravel, React, APIs, banco de dados e integrações com visão de manutenção."
                        />
                        <ValueNote
                            title="Criatividade"
                            text="Interfaces com identidade, sem sacrificar clareza, performance ou acessibilidade."
                        />
                        <ValueNote
                            title="Profissionalismo"
                            text="Escopo, pagamento, briefing, status e entrega com registro e previsibilidade."
                        />
                    </div>
                </section>

                <section
                    id="servicos"
                    className="border-y [border-color:var(--color-border)] px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
                >
                    <div className="mx-auto grid max-w-[1440px] gap-12">
                        <SectionHeader
                            eyebrow="Serviços e soluções"
                            title="Pontos de partida claros para construir, vender ou destravar."
                            description="As ofertas continuam vindo do painel administrativo. Se uma oferta for pausada, a página respeita o estado real do sistema."
                        />

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                            <ProductGrid products={landingProducts} />
                            <BugRepairPanel products={bugProducts} />
                        </div>
                    </div>
                </section>

                <section
                    id="portfolio"
                    className="px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
                >
                    <div className="mx-auto grid max-w-[1440px] gap-12">
                        <SectionHeader
                            eyebrow="Projetos em destaque"
                            title="Trabalhos e produtos com engenharia aparente."
                            description="Projetos reais e itens publicados no sistema com consentimento comercial continuam sendo priorizados automaticamente."
                        />

                        <div className="grid gap-5 lg:grid-cols-3">
                            {portfolio.map((item, index) => (
                                <PortfolioCard
                                    key={item.title}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="processo"
                    className="border-y [border-color:var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
                >
                    <div className="mx-auto grid max-w-[1440px] gap-12">
                        <SectionHeader
                            eyebrow="Processo"
                            title="Retrô na estética. Atual no jeito de entregar."
                            description="A nostalgia fica nas formas, curvas e cores. A operação continua moderna: dados dinâmicos, autenticação, checkout seguro e formulários protegidos por CSRF."
                        />

                        <div className="grid gap-4 md:grid-cols-3">
                            <ProcessStep
                                number="01"
                                title="Escopo antes da pressa"
                                text="Entendo objetivo, restrições e riscos antes de prometer qualquer coisa bonita demais."
                            />
                            <ProcessStep
                                number="02"
                                title="Construção visível"
                                text="Pedido, briefing, pagamento e status ficam registrados no sistema quando o fluxo exige."
                            />
                            <ProcessStep
                                number="03"
                                title="Entrega utilizável"
                                text="A prioridade é publicar algo que carregue bem, seja legível e continue possível de manter."
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <TrustItem
                                icon={ShieldCheck}
                                title="Pagamento protegido"
                                text="Pix e cartão seguem pelo checkout hospedado do Mercado Pago."
                            />
                            <TrustItem
                                icon={Code2}
                                title="Stack de produção"
                                text="PHP, Laravel, React, Inertia, MySQL/MariaDB, APIs e webhooks."
                            />
                            <TrustItem
                                icon={MessageCircle}
                                title="Acompanhamento"
                                text="Pedidos, briefing e status seguem registrados após a contratação."
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="contato"
                    className="px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
                >
                    <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-start">
                        <div className="grid gap-8">
                            <SectionHeader
                                eyebrow="Solicitar outros serviços"
                                title="Tem uma missão estranha? Ótimo. Só descreva direito."
                                description="Use o formulário para sistemas, automações, integrações ou consultoria técnica fora dos pacotes de landing page."
                            />
                            <div className="grid gap-3">
                                {otherServices.map((service) => (
                                    <p
                                        key={service}
                                        className="flex items-center gap-3 text-[var(--color-text-muted)]"
                                    >
                                        <CheckCircle2
                                            className="size-4 text-[var(--color-accent)]"
                                            aria-hidden
                                        />
                                        {service}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <OtherServiceForm />
                    </div>
                </section>

                <section
                    id="faq"
                    className="border-t [border-color:var(--color-border)] px-4 py-16 sm:px-6 lg:px-10"
                >
                    <div className="mx-auto grid max-w-4xl gap-5">
                        <SectionHeader
                            eyebrow="Perguntas frequentes"
                            title="Sem fumaça de palco."
                            description="O básico antes de contratar, com promessas em tamanho normal."
                        />
                        {[
                            [
                                'SEO garante posição no Google?',
                                'Não. A entrega cria uma base técnica correta, rastreável e indexável. Resultado orgânico depende de concorrência, autoridade, conteúdo e tempo.',
                            ],
                            [
                                'Posso pedir reembolso?',
                                'A contratação seguirá a legislação brasileira, incluindo direito de arrependimento quando aplicável e regras específicas para execução personalizada.',
                            ],
                            [
                                'Preciso criar conta?',
                                'Sim para compras. A conta permite criar o pedido, receber link seguro e acompanhar briefing, pagamento e produção.',
                            ],
                        ].map(([question, answer]) => (
                            <article
                                key={question}
                                className="rechi-drawn-border bg-[var(--color-surface-elevated)] p-6"
                            >
                                <h3 className="font-bold">{question}</h3>
                                <p className="mt-2 leading-7 text-[var(--color-text-muted)]">
                                    {answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="px-4 py-12 sm:px-6 lg:px-10">
                    <div className="mx-auto grid max-w-[1440px] gap-8 rounded-[36px_22px_36px_24px] bg-[var(--rechi-purple)] p-6 text-[var(--rechi-cream)] sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div className="w-fit rounded-[28px_18px_28px_20px] bg-[var(--color-brand-plate)] p-4">
                            <img
                                src={brand.wordmark}
                                width="1024"
                                height="1024"
                                alt="Rechi"
                                className="h-20 w-44 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <div className="grid gap-5 lg:justify-items-end">
                            <p className="max-w-xl text-lg leading-8">
                                Desenvolvimento web com personalidade, estrutura
                                e respeito pelo que precisa funcionar depois do
                                clique bonito.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm font-semibold">
                                <a
                                    href="mailto:caique.rechi.dev@gmail.com"
                                    className="rechi-focus inline-flex items-center gap-2 rounded-full"
                                >
                                    <Mail className="size-4" aria-hidden />
                                    caique.rechi.dev@gmail.com
                                </a>
                                <Link
                                    href="/termos-de-uso"
                                    className="rechi-focus rounded-full"
                                >
                                    Termos
                                </Link>
                                <Link
                                    href="/privacidade"
                                    className="rechi-focus rounded-full"
                                >
                                    Privacidade
                                </Link>
                                <Link
                                    href="/arrependimento-e-reembolso"
                                    className="rechi-focus rounded-full"
                                >
                                    Reembolso legal
                                </Link>
                                <Link
                                    href="/me"
                                    className="rechi-focus rounded-full"
                                >
                                    /me
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}

function HeroMascot() {
    return (
        <aside className="relative mx-auto grid w-full max-w-[34rem] place-items-center lg:mr-0">
            <div
                aria-hidden
                className="absolute inset-x-16 top-16 bottom-10 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_24%,transparent)] blur-3xl"
            />
            <img
                src={brand.mascot}
                width="1024"
                height="1024"
                alt="Mascote Rechi, gato preto de expressão misteriosa"
                className="rechi-mascot-float relative z-10 h-auto max-h-[25rem] w-full max-w-[25rem] object-contain drop-shadow-[8px_14px_0_rgb(var(--shadow-color)/0.12)] sm:max-h-[30rem] sm:max-w-[30rem]"
                fetchPriority="high"
            />
        </aside>
    );
}

function ValueNote({ title, text }: { title: string; text: string }) {
    return (
        <article className="rechi-drawn-border bg-[var(--color-surface-elevated)] p-6">
            <h2 className="rechi-display text-3xl font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                {title}
            </h2>
            <p className="mt-3 leading-7 text-[var(--color-text-muted)]">
                {text}
            </p>
        </article>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr] lg:gap-10">
            <p className="text-sm font-black tracking-[0.16em] text-[var(--color-primary)] uppercase">
                {eyebrow}
            </p>
            <div className="grid gap-4">
                <h2 className="rechi-display max-w-4xl text-[clamp(2.25rem,5vw,5.2rem)] leading-none font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                    {title}
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ProductGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <div
                role="status"
                className="rechi-drawn-border bg-[var(--color-surface-elevated)] p-6"
            >
                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                    Nenhuma oferta ativa cadastrada ainda.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {products.map((product, index) => (
                <article
                    key={product.id}
                    className={`rechi-drawn-border group bg-[var(--color-surface-elevated)] p-6 transition hover:-translate-y-1 ${index === 0 ? 'md:row-span-2 md:p-8' : ''}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <p className="text-xs font-black tracking-[0.16em] text-[var(--color-primary)] uppercase">
                            Oferta / 0{index + 1}
                        </p>
                        <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold text-[var(--rechi-ink)]">
                            {product.estimatedDelivery}
                        </span>
                    </div>
                    <h3 className="rechi-display mt-10 text-4xl leading-none font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                        {product.name}
                    </h3>
                    <p className="mt-4 min-h-14 leading-7 text-[var(--color-text-muted)]">
                        {product.shortDescription}
                    </p>
                    <div className="my-6 border-y [border-color:var(--color-border)] py-5">
                        <strong className="text-3xl">
                            {formatCurrency(
                                product.effectivePriceCents,
                                product.currency,
                            )}
                        </strong>
                    </div>
                    <ul className="grid gap-2.5">
                        {product.includedFeatures.slice(0, 4).map((feature) => (
                            <li key={feature} className="flex gap-2.5">
                                <CheckCircle2
                                    className="mt-1 size-4 shrink-0 text-[var(--color-accent)]"
                                    aria-hidden
                                />
                                <span className="text-[var(--color-text-muted)]">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={`/landing-pages/${product.slug}`}
                        className="rechi-focus mt-7 inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--color-primary)] px-5 font-bold text-[var(--rechi-cream)] transition group-hover:-translate-y-0.5"
                    >
                        Ver detalhes
                        <ArrowRight className="size-4" aria-hidden />
                    </Link>
                </article>
            ))}
        </div>
    );
}

function BugRepairPanel({ products }: { products: Product[] }) {
    return (
        <aside className="rechi-drawn-border grid content-start gap-6 bg-[var(--rechi-purple)] p-6 text-[var(--rechi-cream)]">
            <Wrench className="size-8 text-[var(--color-accent)]" aria-hidden />
            <div>
                <p className="text-xs font-black tracking-[0.16em] text-[var(--color-accent)] uppercase">
                    Correção de bugs
                </p>
                <h3 className="rechi-display mt-3 text-4xl leading-none font-black">
                    Algo quebrou? Vamos olhar sem teatro.
                </h3>
                <p className="mt-4 leading-7 text-[color-mix(in_srgb,var(--rechi-cream)_78%,transparent)]">
                    Diagnóstico para PHP, Laravel, JavaScript, APIs e
                    pagamentos, com mínimo de 2 horas e autorização antes de
                    ampliar escopo.
                </p>
            </div>
            <div className="grid gap-3">
                {products.length === 0 ? (
                    <p className="rounded-2xl border border-[color-mix(in_srgb,var(--rechi-cream)_24%,transparent)] p-4 text-sm">
                        Nenhum pacote de bug ativo no momento.
                    </p>
                ) : (
                    products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/landing-pages/${product.slug}`}
                            className="rechi-focus flex items-center justify-between gap-4 rounded-3xl bg-[var(--color-brand-plate)] p-4 text-[var(--rechi-ink)] transition hover:-translate-y-0.5"
                        >
                            <span>
                                <strong className="block">
                                    {product.name}
                                </strong>
                                <span className="text-sm opacity-70">
                                    {formatCurrency(
                                        product.effectivePriceCents,
                                        product.currency,
                                    )}
                                </span>
                            </span>
                            <ArrowRight className="size-4" aria-hidden />
                        </Link>
                    ))
                )}
            </div>
        </aside>
    );
}

function PortfolioCard({
    item,
    index,
}: {
    item: PortfolioItem;
    index: number;
}) {
    const content = (
        <>
            <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-black tracking-[0.16em] text-[var(--color-primary)] uppercase">
                    Projeto / 0{index + 1}
                </span>
                {item.publicUrl && (
                    <ExternalLink className="size-4" aria-hidden />
                )}
            </div>
            <div className="mt-12">
                <p className="font-bold text-[var(--color-text-muted)]">
                    {item.segment}
                </p>
                <h3 className="rechi-display mt-3 text-4xl leading-none font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                    {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--color-text-muted)]">
                    {item.solution}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                    {item.technologies.map((technology) => (
                        <span
                            key={technology}
                            className="rounded-full border [border-color:var(--color-border)] px-3 py-1 text-xs font-bold"
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    const className =
        'rechi-drawn-border group min-h-[25rem] bg-[var(--color-surface-elevated)] p-6 transition hover:-translate-y-1';

    if (!item.publicUrl) {
        return <article className={className}>{content}</article>;
    }

    return (
        <a
            href={item.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`rechi-focus ${className}`}
        >
            {content}
        </a>
    );
}

function ProcessStep({
    number,
    title,
    text,
}: {
    number: string;
    title: string;
    text: string;
}) {
    return (
        <article className="rechi-drawn-border bg-[var(--color-surface-elevated)] p-6">
            <span className="text-sm font-black text-[var(--color-primary)]">
                {number}
            </span>
            <h3 className="rechi-display mt-12 text-3xl font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                {title}
            </h3>
            <p className="mt-3 leading-7 text-[var(--color-text-muted)]">
                {text}
            </p>
        </article>
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
        <article className="rechi-drawn-border bg-[var(--color-surface-elevated)] p-6">
            <Icon className="size-6 text-[var(--color-primary)]" aria-hidden />
            <h3 className="mt-8 font-bold">{title}</h3>
            <p className="mt-2 leading-7 text-[var(--color-text-muted)]">
                {text}
            </p>
        </article>
    );
}

function OtherServiceForm() {
    return (
        <Form
            action="/solicitar-servico"
            method="post"
            className="rechi-drawn-border grid gap-5 bg-[var(--color-surface-elevated)] p-6 sm:p-8"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <div className="flex items-start justify-between gap-4 border-b [border-color:var(--color-border)] pb-5">
                        <div>
                            <p className="text-xs font-black tracking-[0.16em] text-[var(--color-primary)] uppercase">
                                Pedido sob medida
                            </p>
                            <h3 className="rechi-display mt-2 text-3xl font-black text-[var(--rechi-purple)] dark:text-[var(--color-text)]">
                                Conte o contexto
                            </h3>
                        </div>
                        <Database
                            className="size-6 text-[var(--color-accent)]"
                            aria-hidden
                        />
                    </div>
                    {recentlySuccessful && (
                        <div
                            role="status"
                            className="rounded-2xl border [border-color:var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] px-4 py-3 text-sm"
                        >
                            Solicitação enviada. Vou analisar e retornar pelo
                            contato informado.
                        </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            htmlFor="name"
                            label="Nome"
                            error={errors.name}
                        >
                            <Input id="name" name="name" required />
                        </FormField>
                        <FormField
                            htmlFor="email"
                            label="E-mail"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                            />
                        </FormField>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            htmlFor="phone"
                            label="WhatsApp"
                            error={errors.phone}
                        >
                            <Input id="phone" name="phone" />
                        </FormField>
                        <FormField
                            htmlFor="technology"
                            label="Tecnologia"
                            error={errors.technology}
                        >
                            <Input
                                id="technology"
                                name="technology"
                                placeholder="Laravel, React, WordPress..."
                            />
                        </FormField>
                    </div>
                    <FormField
                        htmlFor="url"
                        label="URL do projeto"
                        error={errors.url}
                    >
                        <Input
                            id="url"
                            name="url"
                            type="url"
                            placeholder="https://..."
                        />
                    </FormField>
                    <div className="grid gap-2">
                        <Label htmlFor="problem_description">
                            O que precisa funcionar?
                        </Label>
                        <textarea
                            id="problem_description"
                            name="problem_description"
                            required
                            className="min-h-36 rounded-2xl border [border-color:var(--color-border)] bg-transparent px-3 py-2 text-sm transition outline-none focus-visible:border-[var(--color-focus)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-focus)_30%,transparent)]"
                            placeholder="Objetivo, problema, prazo desejado e contexto do projeto."
                        />
                        <InputError message={errors.problem_description} />
                    </div>
                    <label className="flex items-start gap-3 text-sm leading-6">
                        <Checkbox name="consent_accepted" value="1" />
                        <span>
                            Aceito ser contatado sobre esta solicitação e li a{' '}
                            <Link
                                href="/privacidade"
                                className="rechi-focus rounded-full underline"
                            >
                                política de privacidade
                            </Link>
                            .
                        </span>
                    </label>
                    <InputError message={errors.consent_accepted} />
                    <Button
                        disabled={processing}
                        className="min-h-12 rounded-full bg-[var(--color-primary)] font-bold text-[var(--rechi-cream)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--rechi-ink))]"
                    >
                        {processing ? 'Enviando...' : 'Enviar solicitação'}
                        <ArrowRight className="size-4" aria-hidden />
                    </Button>
                </>
            )}
        </Form>
    );
}

function FormField({
    htmlFor,
    label,
    error,
    children,
}: {
    htmlFor: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
