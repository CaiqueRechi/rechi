import { Form, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    Braces,
    Check,
    CheckCircle2,
    Code2,
    Database,
    ExternalLink,
    Ghost,
    Mail,
    MessageCircle,
    Moon,
    Orbit,
    ShieldCheck,
    Sparkles,
    Sun,
    Terminal,
    Wrench,
} from 'lucide-react';
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
        segment: 'Portfólio / Produto próprio',
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

const navigation = [
    ['Começos', '#servicos'],
    ['Projetos', '#portfolio'],
    ['Processo', '#processo'],
    ['Contato', '#contato'],
];

const accentStyles = [
    {
        border: 'group-hover:border-[#b8f34a]/80',
        badge: 'bg-[#b8f34a] text-[#11120e]',
        glow: 'bg-[#b8f34a]',
    },
    {
        border: 'group-hover:border-[#9b87f5]/80',
        badge: 'bg-[#9b87f5] text-[#11120e]',
        glow: 'bg-[#9b87f5]',
    },
    {
        border: 'group-hover:border-[#ff9a62]/80',
        badge: 'bg-[#ff9a62] text-[#11120e]',
        glow: 'bg-[#ff9a62]',
    },
    {
        border: 'group-hover:border-[#82ddf7]/80',
        badge: 'bg-[#82ddf7] text-[#11120e]',
        glow: 'bg-[#82ddf7]',
    },
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
            <SeoHead
                title="RECHI/ — Desenvolvimento web com intenção"
                description="Oficina digital de Caique Rechi. Landing pages para vender, sistemas para sustentar e integrações para fazer a operação funcionar."
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
                        name: 'RECHI/ Digital Workshop',
                        url: 'https://rechi.net.br',
                        areaServed: 'BR',
                        description:
                            'Desenvolvimento de landing pages, sistemas web e integrações.',
                    },
                ]}
            />

            <main className="min-h-screen overflow-hidden bg-[#f2efe7] text-[#11120e] selection:bg-[#b8f34a] selection:text-[#11120e] dark:bg-[#07080d] dark:text-[#f2efe7]">
                <header className="sticky top-0 z-50 border-b border-[#11120e]/15 bg-[#f2efe7]/88 backdrop-blur-xl dark:border-[#f2efe7]/12 dark:bg-[#07080d]/88">
                    <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                            aria-label="RECHI, página inicial"
                        >
                            <span className="text-xl font-black tracking-[-0.08em]">
                                RECHI
                                <span className="text-[#7ba900] dark:text-[#b8f34a]">
                                    /
                                </span>
                            </span>
                            <span className="hidden border-l border-current/20 pl-3 font-mono text-[9px] leading-tight tracking-[0.18em] uppercase sm:block">
                                Digital
                                <br />
                                Workshop
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-7 font-mono text-[10px] tracking-[0.16em] uppercase lg:flex">
                            {navigation.map(([label, href], index) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="transition-colors hover:text-[#6d9500] dark:hover:text-[#b8f34a]"
                                >
                                    <span className="mr-1.5 opacity-40">
                                        0{index + 1}
                                    </span>
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="grid size-10 place-items-center border border-[#11120e]/20 transition hover:-translate-y-0.5 hover:bg-white dark:border-[#f2efe7]/20 dark:hover:bg-white/10"
                                aria-label="Alternar tema"
                                title="Alternar tema"
                            >
                                <Sun className="hidden size-4 dark:block" />
                                <Moon className="size-4 dark:hidden" />
                            </button>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="flex h-10 items-center border border-[#11120e] px-4 font-mono text-[10px] font-bold tracking-[0.14em] uppercase transition hover:bg-[#11120e] hover:text-[#f2efe7] dark:border-[#f2efe7] dark:hover:bg-[#f2efe7] dark:hover:text-[#11120e]"
                            >
                                {auth.user ? 'Dashboard' : 'Entrar'}
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9b87f5] to-transparent opacity-70"
                    />
                    <div className="mx-auto grid min-h-[calc(100svh-73px)] max-w-[1480px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12 lg:py-20">
                        <div className="relative z-10 grid content-center gap-8">
                            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.16em] uppercase">
                                <span className="flex items-center gap-2 border border-[#11120e]/20 px-3 py-2 dark:border-[#f2efe7]/20">
                                    <span className="size-2 animate-pulse rounded-full bg-[#7ba900] dark:bg-[#b8f34a]" />
                                    Agenda aberta
                                </span>
                                <span className="opacity-55">
                                    Londrina, BR · {new Date().getFullYear()}
                                </span>
                            </div>

                            <div className="grid gap-6">
                                <p className="font-mono text-xs tracking-[0.2em] text-[#6d9500] uppercase dark:text-[#b8f34a]">
                                    Caique Rechi · Desenvolvedor web
                                </p>
                                <h1 className="max-w-5xl text-[clamp(3.5rem,8vw,8.25rem)] leading-[0.82] font-black tracking-[-0.075em]">
                                    Eu construo a parte da internet que precisa{' '}
                                    <span className="relative inline-block text-[#6d9500] dark:text-[#b8f34a]">
                                        funcionar.
                                        <span
                                            aria-hidden
                                            className="absolute -right-4 bottom-[0.08em] size-3 rounded-full bg-[#ff9a62] sm:-right-7 sm:size-5"
                                        />
                                    </span>
                                </h1>
                                <p className="max-w-2xl text-lg leading-relaxed text-[#11120e]/65 sm:text-xl dark:text-[#f2efe7]/65">
                                    Landing pages para vender. Sistemas para
                                    sustentar o que vem depois. Código claro,
                                    decisões honestas e uma entrega que não
                                    desaparece quando entra em produção.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <a
                                    href="#servicos"
                                    className="group flex h-13 items-center gap-4 bg-[#11120e] px-6 font-mono text-xs font-bold tracking-[0.12em] text-[#f2efe7] uppercase transition hover:-translate-y-1 dark:bg-[#b8f34a] dark:text-[#11120e]"
                                >
                                    Escolher ponto de partida
                                    <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                                </a>
                                <a
                                    href="#contato"
                                    className="flex h-13 items-center border border-[#11120e]/30 px-6 font-mono text-xs font-bold tracking-[0.12em] uppercase transition hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 dark:border-[#f2efe7]/25"
                                >
                                    Tenho outra missão
                                </a>
                            </div>
                        </div>

                        <WorkshopMap />
                    </div>
                </section>

                <div className="border-y border-[#11120e]/15 bg-[#11120e] text-[#f2efe7] dark:border-[#f2efe7]/12 dark:bg-[#111218]">
                    <div className="mx-auto grid max-w-[1480px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-12">
                        <MiniMetric
                            value="Laravel"
                            label="Motor"
                            icon={Braces}
                        />
                        <MiniMetric
                            value="React"
                            label="Interface"
                            icon={Orbit}
                        />
                        <MiniMetric
                            value="APIs"
                            label="Conexões"
                            icon={Database}
                        />
                        <MiniMetric
                            value="Humano"
                            label="Atendimento"
                            icon={MessageCircle}
                        />
                    </div>
                </div>

                <section
                    id="servicos"
                    className="relative mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
                >
                    <SectionHeader
                        number="01"
                        eyebrow="Escolha seu ponto de partida"
                        title="Uma boa entrega começa com um escopo que cabe no mundo real."
                        description="Ofertas com preço, prazo e fronteiras visíveis. Você sabe o que entra antes de abrir a missão."
                    />

                    <div className="mt-14 grid gap-5 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <ProductGrid products={landingProducts} />
                        </div>
                        <aside className="relative overflow-hidden border border-[#11120e]/20 bg-[#ff9a62] p-7 text-[#11120e] lg:col-span-4">
                            <div
                                aria-hidden
                                className="absolute -top-14 -right-14 size-40 rounded-full border-[28px] border-[#11120e]/8"
                            />
                            <Wrench className="size-8" />
                            <p className="mt-16 font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">
                                Rota de emergência
                            </p>
                            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                                Algo já existe, mas parou de funcionar?
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed opacity-75">
                                Diagnóstico de bugs em PHP, Laravel, JavaScript
                                e APIs, com autorização antes de ampliar o
                                escopo.
                            </p>
                            <div className="mt-7">
                                <ProductGrid products={bugProducts} compact />
                            </div>
                        </aside>
                    </div>
                </section>

                <section
                    id="portfolio"
                    className="border-y border-[#11120e]/15 bg-[#11120e] text-[#f2efe7] dark:border-[#f2efe7]/12 dark:bg-[#0d0e15]"
                >
                    <div className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
                        <SectionHeader
                            number="02"
                            eyebrow="Projetos despachados"
                            title="Sistemas com história, cicatrizes e motivo para existir."
                            description="Uma seleção de projetos próprios e trabalhos usados para demonstrar como penso arquitetura, produto e manutenção."
                            inverted
                        />

                        <div className="mt-14 grid gap-px bg-[#f2efe7]/15 md:grid-cols-3">
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
                    className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
                >
                    <SectionHeader
                        number="03"
                        eyebrow="Como a oficina trabalha"
                        title="Menos fumaça. Mais visibilidade do primeiro contato à produção."
                        description="O processo existe para reduzir surpresa, proteger os dois lados e deixar o projeto evoluir sem depender de adivinhação."
                    />

                    <div className="mt-14 grid border-y border-[#11120e]/20 md:grid-cols-3 dark:border-[#f2efe7]/15">
                        <ProcessStep
                            number="01"
                            title="Abrimos a missão"
                            text="Objetivo, contexto, prazo e restrições viram um escopo legível antes do trabalho começar."
                            accent="#9b87f5"
                        />
                        <ProcessStep
                            number="02"
                            title="Construímos à vista"
                            text="Decisões técnicas, briefing, pagamento e status ficam registrados durante a execução."
                            accent="#82ddf7"
                        />
                        <ProcessStep
                            number="03"
                            title="Despachamos com base"
                            text="A entrega considera produção, manutenção e os próximos passos — não só a captura de tela."
                            accent="#b8f34a"
                        />
                    </div>

                    <div className="mt-16 grid gap-5 md:grid-cols-3">
                        <TrustItem
                            icon={ShieldCheck}
                            title="Pagamento protegido"
                            text="Pix e cartão passam pelo checkout hospedado do Mercado Pago. O servidor não processa dados de cartão."
                        />
                        <TrustItem
                            icon={Code2}
                            title="Stack de produção"
                            text="PHP, Laravel, React, APIs, MySQL/MariaDB, testes e integrações com webhooks."
                        />
                        <TrustItem
                            icon={MessageCircle}
                            title="Contato sem labirinto"
                            text="Você fala com quem projeta e constrói. Sem tradução entre comercial e desenvolvimento."
                        />
                    </div>
                </section>

                <section
                    id="contato"
                    className="border-y border-[#11120e]/15 bg-[#dfe7ff] text-[#11120e] dark:border-[#f2efe7]/12 dark:bg-[#151426] dark:text-[#f2efe7]"
                >
                    <div className="mx-auto grid max-w-[1480px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-32">
                        <div className="grid content-start gap-8">
                            <SectionHeader
                                number="04"
                                eyebrow="Entrada de novas missões"
                                title="Seu projeto não cabe numa caixinha?"
                                description="Ótimo. Conte o que precisa funcionar e eu devolvo perguntas melhores, riscos visíveis e um próximo passo possível."
                            />
                            <div className="grid gap-3">
                                {otherServices.map((service) => (
                                    <p
                                        key={service}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <span className="grid size-6 place-items-center rounded-full bg-[#11120e] text-[#dfe7ff] dark:bg-[#b8f34a] dark:text-[#11120e]">
                                            <Check className="size-3.5" />
                                        </span>
                                        {service}
                                    </p>
                                ))}
                            </div>
                            <p className="max-w-sm border-l-2 border-[#9b87f5] pl-4 font-mono text-[10px] leading-relaxed tracking-[0.12em] uppercase opacity-55">
                                Sem spam, sem promessa automática, sem vender
                                seu contato. Só contexto suficiente para uma
                                conversa útil.
                            </p>
                        </div>

                        <OtherServiceForm />
                    </div>
                </section>

                <section
                    id="faq"
                    className="mx-auto grid max-w-[1480px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12"
                >
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-[#6d9500] uppercase dark:text-[#b8f34a]">
                            05 / Antes de apertar enter
                        </p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                            Perguntas honestas, respostas sem rodapé mágico.
                        </h2>
                    </div>
                    <div className="grid">
                        {[
                            [
                                'SEO garante posição no Google?',
                                'Não. A entrega cria uma base técnica correta, rastreável e indexável. Resultado orgânico depende de concorrência, autoridade, conteúdo e tempo.',
                            ],
                            [
                                'Posso pedir reembolso?',
                                'A contratação segue a legislação brasileira, incluindo direito de arrependimento quando aplicável e regras específicas para execução personalizada.',
                            ],
                            [
                                'Preciso criar conta?',
                                'Sim. A conta permite criar o pedido, receber o link seguro e acompanhar briefing, pagamento e produção.',
                            ],
                        ].map(([question, answer], index) => (
                            <article
                                key={question}
                                className="grid gap-3 border-t border-[#11120e]/20 py-6 sm:grid-cols-[3rem_1fr] dark:border-[#f2efe7]/15"
                            >
                                <span className="font-mono text-xs opacity-35">
                                    0{index + 1}
                                </span>
                                <div>
                                    <h3 className="font-bold">{question}</h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-60">
                                        {answer}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="relative overflow-hidden bg-[#b8f34a] px-5 py-14 text-[#11120e] sm:px-8 lg:px-12">
                    <div
                        aria-hidden
                        className="absolute -right-20 -bottom-32 size-96 rounded-full border-[64px] border-[#11120e]/8"
                    />
                    <div className="relative mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-55">
                                RECHI/ Digital Workshop
                            </p>
                            <h2 className="mt-4 max-w-4xl text-4xl leading-[0.95] font-black tracking-[-0.055em] sm:text-6xl">
                                Vamos colocar isso em produção?
                            </h2>
                            <a
                                href="mailto:caique.rechi.dev@gmail.com"
                                className="mt-7 inline-flex items-center gap-2 border-b border-[#11120e] pb-1 text-sm font-bold"
                            >
                                <Mail className="size-4" />
                                caique.rechi.dev@gmail.com
                            </a>
                        </div>
                        <div className="grid gap-6 lg:justify-items-end">
                            <nav className="flex flex-wrap gap-5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase">
                                <Link href="/termos-de-uso">Termos</Link>
                                <Link href="/privacidade">Privacidade</Link>
                                <Link href="/arrependimento-e-reembolso">
                                    Reembolso
                                </Link>
                            </nav>
                            <Link
                                href="/me"
                                prefetch
                                className="group flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] uppercase opacity-40 transition hover:opacity-100"
                                title="Há mais coisas depois do expediente"
                            >
                                <Ghost className="size-4 transition-transform group-hover:-translate-y-1" />
                                Depois do expediente
                            </Link>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}

function WorkshopMap() {
    return (
        <div className="relative hidden min-h-[610px] lg:block">
            <div className="absolute inset-8 border border-[#11120e]/15 dark:border-[#f2efe7]/15">
                <span className="absolute -top-3 left-5 bg-[#f2efe7] px-2 font-mono text-[9px] tracking-[0.15em] uppercase dark:bg-[#07080d]">
                    Build map / live
                </span>
                <span className="absolute right-4 bottom-3 font-mono text-[9px] tracking-[0.12em] uppercase opacity-35">
                    v1.0 → always evolving
                </span>
            </div>

            <div className="absolute top-[16%] right-[9%] left-[9%] h-px bg-[#11120e]/20 dark:bg-[#f2efe7]/20" />
            <div className="absolute top-[16%] bottom-[18%] left-[28%] w-px bg-[#11120e]/20 dark:bg-[#f2efe7]/20" />
            <div className="absolute right-[18%] bottom-[29%] left-[28%] h-px bg-[#11120e]/20 dark:bg-[#f2efe7]/20" />

            <MapNode
                className="top-[9%] left-[9%]"
                label="01 / intenção"
                title="O que precisa mudar?"
                icon={Sparkles}
                accent="bg-[#9b87f5]"
            />
            <MapNode
                className="top-[31%] left-[17%]"
                label="02 / engenharia"
                title="Fazer caber no real."
                icon={Terminal}
                accent="bg-[#82ddf7]"
                large
            />
            <MapNode
                className="right-[5%] bottom-[16%]"
                label="03 / entrega"
                title="Funciona. E continua."
                icon={CheckCircle2}
                accent="bg-[#b8f34a]"
            />

            <div className="absolute top-[13%] right-[5%] rotate-3 bg-[#ff9a62] px-4 py-3 font-mono text-[9px] leading-relaxed tracking-[0.12em] text-[#11120e] uppercase shadow-[6px_6px_0_#11120e]">
                Código é detalhe.
                <br />
                Resultado é sistema.
            </div>

            <div className="absolute bottom-[6%] left-[8%] flex items-center gap-3">
                <span className="size-3 rounded-full bg-[#b8f34a]" />
                <span className="size-3 rounded-full bg-[#9b87f5]" />
                <span className="size-3 rounded-full bg-[#ff9a62]" />
                <span className="size-3 rounded-full bg-[#82ddf7]" />
                <span className="ml-2 font-mono text-[9px] tracking-[0.15em] uppercase opacity-45">
                    engineering with a pulse
                </span>
            </div>
        </div>
    );
}

function MapNode({
    className,
    label,
    title,
    icon: Icon,
    accent,
    large = false,
}: {
    className: string;
    label: string;
    title: string;
    icon: typeof Sparkles;
    accent: string;
    large?: boolean;
}) {
    return (
        <div
            className={`absolute ${className} ${large ? 'w-72' : 'w-58'} border border-[#11120e]/25 bg-[#f2efe7] p-5 shadow-[8px_8px_0_rgba(17,18,14,0.12)] dark:border-[#f2efe7]/25 dark:bg-[#0d0e15] dark:shadow-[8px_8px_0_rgba(242,239,231,0.06)]`}
        >
            <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-45">
                    {label}
                </span>
                <span className={`grid size-8 place-items-center ${accent}`}>
                    <Icon className="size-4 text-[#11120e]" />
                </span>
            </div>
            <p className="mt-8 text-xl leading-tight font-black tracking-[-0.04em]">
                {title}
            </p>
        </div>
    );
}

function OtherServiceForm() {
    return (
        <Form
            action="/solicitar-servico"
            method="post"
            className="grid gap-5 border border-[#11120e]/25 bg-[#f2efe7] p-6 text-[#11120e] shadow-[10px_10px_0_#9b87f5] sm:p-8 dark:border-[#f2efe7]/20 dark:bg-[#0d0e15] dark:text-[#f2efe7]"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <div className="flex items-center justify-between gap-4 border-b border-current/15 pb-5">
                        <div>
                            <p className="font-mono text-[9px] tracking-[0.16em] uppercase opacity-50">
                                New mission / intake
                            </p>
                            <h3 className="mt-1 text-xl font-black">
                                Conte o contexto
                            </h3>
                        </div>
                        <span className="grid size-10 place-items-center bg-[#9b87f5] text-[#11120e]">
                            <ArrowDownRight className="size-5" />
                        </span>
                    </div>
                    {recentlySuccessful && (
                        <div
                            role="status"
                            className="border border-[#6d9500] bg-[#b8f34a]/25 px-4 py-3 text-sm"
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
                            className="min-h-36 border border-current/20 bg-transparent px-3 py-2 text-sm transition outline-none focus-visible:border-[#9b87f5] focus-visible:ring-2 focus-visible:ring-[#9b87f5]/25"
                            placeholder="Objetivo, problema, prazo desejado e contexto do projeto."
                        />
                        <InputError message={errors.problem_description} />
                    </div>
                    <label className="flex items-start gap-3 text-sm">
                        <Checkbox name="consent_accepted" value="1" />
                        <span>
                            Aceito ser contatado sobre esta solicitação e li a{' '}
                            <Link href="/privacidade" className="underline">
                                política de privacidade
                            </Link>
                            .
                        </span>
                    </label>
                    <InputError message={errors.consent_accepted} />
                    <Button
                        disabled={processing}
                        className="h-12 rounded-none bg-[#11120e] font-mono text-xs tracking-[0.12em] text-[#f2efe7] uppercase hover:bg-[#11120e]/85 dark:bg-[#b8f34a] dark:text-[#11120e] dark:hover:bg-[#b8f34a]/85"
                    >
                        {processing ? 'Enviando...' : 'Abrir missão'}
                        <ArrowRight className="size-4" />
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
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function MiniMetric({
    value,
    label,
    icon: Icon,
}: {
    value: string;
    label: string;
    icon: typeof Database;
}) {
    return (
        <div className="flex min-h-28 items-center gap-4 border-r border-[#f2efe7]/15 px-3 first:border-l sm:px-6">
            <Icon className="size-5 text-[#b8f34a]" />
            <div>
                <strong className="block text-lg tracking-[-0.03em]">
                    {value}
                </strong>
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase opacity-45">
                    {label}
                </span>
            </div>
        </div>
    );
}

function SectionHeader({
    number,
    eyebrow,
    title,
    description,
    inverted = false,
}: {
    number: string;
    eyebrow: string;
    title: string;
    description: string;
    inverted?: boolean;
}) {
    return (
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div className="flex items-start gap-4">
                <span
                    className={`font-mono text-xs ${inverted ? 'text-[#b8f34a]' : 'text-[#6d9500] dark:text-[#b8f34a]'}`}
                >
                    {number}
                </span>
                <p className="font-mono text-[10px] tracking-[0.17em] uppercase opacity-55">
                    {eyebrow}
                </p>
            </div>
            <div className="grid gap-5">
                <h2 className="max-w-4xl text-4xl leading-[0.98] font-black tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                    {title}
                </h2>
                <p className="max-w-2xl leading-relaxed opacity-60">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ProductGrid({
    products,
    compact = false,
}: {
    products: Product[];
    compact?: boolean;
}) {
    if (products.length === 0) {
        return (
            <div
                className={`${compact ? 'border-[#11120e]/20 bg-[#f2efe7]/65 text-[#11120e]' : 'border-[#11120e]/20 dark:border-[#f2efe7]/15'} border p-6 text-sm`}
            >
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-45">
                    Slot disponível
                </p>
                <p className="mt-2 font-semibold">
                    Nenhuma oferta ativa cadastrada ainda.
                </p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="grid gap-3">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/landing-pages/${product.slug}`}
                        className="group flex items-center justify-between gap-4 border border-[#11120e]/20 bg-[#f2efe7] p-4 transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#11120e]"
                    >
                        <div>
                            <p className="font-bold">{product.name}</p>
                            <p className="mt-1 text-xs opacity-60">
                                {formatCurrency(
                                    product.effectivePriceCents,
                                    product.currency,
                                )}
                            </p>
                        </div>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {products.map((product, index) => {
                const accent = accentStyles[index % accentStyles.length];

                return (
                    <article
                        key={product.id}
                        className={`group relative overflow-hidden border border-[#11120e]/20 bg-[#f8f6f0] p-6 transition duration-300 hover:-translate-y-1 dark:border-[#f2efe7]/15 dark:bg-[#0d0e15] ${accent.border}`}
                    >
                        <div
                            aria-hidden
                            className={`absolute top-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full ${accent.glow}`}
                        />
                        <div className="flex items-start justify-between gap-4">
                            <span className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-40">
                                Mission / 0{index + 1}
                            </span>
                            <span
                                className={`px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.12em] uppercase ${accent.badge}`}
                            >
                                {product.estimatedDelivery}
                            </span>
                        </div>
                        <h3 className="mt-12 text-3xl font-black tracking-[-0.045em]">
                            {product.name}
                        </h3>
                        <p className="mt-3 min-h-14 text-sm leading-relaxed opacity-60">
                            {product.shortDescription}
                        </p>
                        <div className="mt-7 border-y border-current/12 py-5">
                            <strong className="text-3xl tracking-[-0.04em]">
                                {formatCurrency(
                                    product.effectivePriceCents,
                                    product.currency,
                                )}
                            </strong>
                        </div>
                        <ul className="mt-6 grid gap-2.5 text-sm">
                            {product.includedFeatures
                                .slice(0, 4)
                                .map((feature) => (
                                    <li key={feature} className="flex gap-2.5">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#6d9500] dark:text-[#b8f34a]" />
                                        <span className="opacity-75">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                        </ul>
                        <Link
                            href={`/landing-pages/${product.slug}`}
                            className="mt-8 flex items-center justify-between border-t border-current/12 pt-5 font-mono text-[10px] font-bold tracking-[0.14em] uppercase"
                        >
                            Abrir missão
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </article>
                );
            })}
        </div>
    );
}

function PortfolioCard({
    item,
    index,
}: {
    item: PortfolioItem;
    index: number;
}) {
    const accents = ['#b8f34a', '#9b87f5', '#ff9a62'];
    const content = (
        <>
            <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase opacity-40">
                    Case / 0{index + 1}
                </span>
                {item.publicUrl && (
                    <ExternalLink className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                )}
            </div>
            <div className="mt-24">
                <p
                    className="font-mono text-[10px] tracking-[0.12em] uppercase"
                    style={{ color: accents[index % accents.length] }}
                >
                    {item.segment}
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.045em]">
                    {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed opacity-55">
                    {item.solution}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                    {item.technologies.map((technology) => (
                        <span
                            key={technology}
                            className="border border-[#f2efe7]/20 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] uppercase"
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    const className =
        'group min-h-[430px] bg-[#11120e] p-7 transition hover:bg-[#181a15] dark:bg-[#0d0e15] dark:hover:bg-[#151720]';

    if (!item.publicUrl) {
        return <article className={className}>{content}</article>;
    }

    return (
        <a
            href={item.publicUrl}
            target="_blank"
            rel="noreferrer"
            className={className}
        >
            {content}
        </a>
    );
}

function ProcessStep({
    number,
    title,
    text,
    accent,
}: {
    number: string;
    title: string;
    text: string;
    accent: string;
}) {
    return (
        <article className="relative min-h-72 border-b border-[#11120e]/20 p-7 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0 dark:border-[#f2efe7]/15">
            <span
                className="absolute top-7 right-7 size-3 rounded-full"
                style={{ backgroundColor: accent }}
            />
            <span className="font-mono text-xs opacity-35">{number}</span>
            <div className="mt-20">
                <h3 className="text-2xl font-black tracking-[-0.04em]">
                    {title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-60">
                    {text}
                </p>
            </div>
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
        <article className="border border-[#11120e]/18 p-6 dark:border-[#f2efe7]/15">
            <Icon className="size-6 text-[#6d9500] dark:text-[#b8f34a]" />
            <h3 className="mt-8 font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-55">{text}</p>
        </article>
    );
}
