import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUpRight,
    Asterisk,
    Code2,
    Layers3,
    Mail,
    Menu,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login } from '@/routes';

const projects = [
    {
        number: '01',
        title: 'BudgetCore',
        category: 'Finanças · SaaS',
        description:
            'Plataforma de gestão financeira para pessoas, freelancers e pequenos negócios, com arquitetura orientada a domínio e histórico auditável.',
        tags: ['Laravel 12', 'PHP 8.3', 'MySQL'],
        accent: 'from-[#d8ff3e] via-[#b8e72d] to-[#789d00]',
        artwork: 'BC',
        url: 'https://github.com/CaiqueRechi/budgetcore-showcase',
    },
    {
        number: '02',
        title: 'Payment Flow',
        category: 'API · Pagamentos',
        description:
            'Microsserviço para gerenciar o ciclo completo de pagamentos, com trilha de auditoria, status seguros, testes automatizados e CI.',
        tags: ['REST API', 'PHPUnit', 'GitHub Actions'],
        accent: 'from-[#ff775f] via-[#f24f38] to-[#a51d11]',
        artwork: 'PF',
        url: 'https://github.com/CaiqueRechi/payment-flow-service',
    },
    {
        number: '03',
        title: 'Rechi',
        category: 'Portfólio · Ecossistema',
        description:
            'Este portfólio como produto vivo: uma aplicação moderna para apresentar projetos, experimentar integrações e evoluir meu ecossistema profissional.',
        tags: ['Laravel 13', 'Inertia', 'React'],
        accent: 'from-[#9f8cff] via-[#765ce9] to-[#33248a]',
        artwork: 'CR',
        url: 'https://github.com/CaiqueRechi/rechi',
    },
];

const services = [
    {
        icon: Layers3,
        title: 'Back-end & APIs',
        description:
            'Sistemas PHP e Laravel com regras de negócio claras, APIs REST sustentáveis e atenção a performance.',
    },
    {
        icon: Code2,
        title: 'Pagamentos & e-commerce',
        description:
            'Checkouts transparentes, integrações com gateways e fluxos financeiros rastreáveis de ponta a ponta.',
    },
    {
        icon: Sparkles,
        title: 'Modernização de legado',
        description:
            'Refatoração incremental, compatibilidade retroativa, testes e evolução segura de sistemas em produção.',
    },
];

const experience = [
    [
        'Jun 2026 — Atual',
        'Analista de Desenvolvimento Jr',
        'Ibiporã Empreendimentos',
    ],
    ['2025 — 2026', 'Back-End Developer I', 'Mosyle'],
    ['2022 — 2025', 'Full-Stack / Backend Developer', 'Rede Mídia'],
    ['2021 — 2022', 'Software Engineering Intern', 'Agriplace'],
    ['2020 — 2021', 'IT Support Analyst', 'Tata Consultancy Services'],
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <Head title="Caique Rechi — Back-End Developer">
                <meta
                    name="description"
                    content="Portfólio de Caique Rechi, desenvolvedor back-end com foco em PHP, Laravel, APIs, pagamentos e sistemas de negócio."
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-[#f2f0e9] text-[#171713] selection:bg-[#d8ff3e] selection:text-black dark:bg-[#11110f] dark:text-[#f2f0e9]">
                <header className="relative z-20 border-b border-black/15 dark:border-white/15">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                        <a
                            href="#inicio"
                            className="flex items-center gap-2 text-lg font-black tracking-[-0.06em] uppercase"
                        >
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#171713] text-[#d8ff3e] dark:bg-[#f2f0e9] dark:text-[#171713]">
                                C
                            </span>
                            Caique®
                        </a>

                        <nav className="hidden items-center gap-8 text-xs font-semibold tracking-[0.12em] uppercase md:flex">
                            <a
                                href="#projetos"
                                className="transition-opacity hover:opacity-50"
                            >
                                Projetos
                            </a>
                            <a
                                href="#sobre"
                                className="transition-opacity hover:opacity-50"
                            >
                                Sobre
                            </a>
                            <a
                                href="#contato"
                                className="transition-opacity hover:opacity-50"
                            >
                                Contato
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full border border-black/20 px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-black hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="hidden rounded-full border border-black/20 px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-black hover:text-white sm:block dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
                                >
                                    Entrar
                                </Link>
                            )}
                            <button
                                type="button"
                                aria-label="Abrir menu"
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-navigation"
                                onClick={() =>
                                    setIsMenuOpen((current) => !current)
                                }
                                className="flex size-10 items-center justify-center rounded-full bg-[#171713] text-white md:hidden dark:bg-[#f2f0e9] dark:text-black"
                            >
                                <Menu className="size-4" />
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <nav
                            id="mobile-navigation"
                            className="grid border-t border-black/15 px-5 py-3 text-sm font-bold uppercase md:hidden dark:border-white/15"
                        >
                            {[
                                ['Projetos', '#projetos'],
                                ['Sobre', '#sobre'],
                                ['Contato', '#contato'],
                            ].map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="border-b border-black/10 py-4 last:border-0 dark:border-white/10"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    )}
                </header>

                <main>
                    <section
                        id="inicio"
                        className="relative border-b border-black/15 dark:border-white/15"
                    >
                        <div className="pointer-events-none absolute top-10 right-[-8rem] size-80 rounded-full border border-black/10 sm:size-120 dark:border-white/10" />
                        <div className="mx-auto grid min-h-[calc(100svh-81px)] max-w-7xl items-end gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.55fr] lg:px-10 lg:py-14">
                            <div className="relative z-10">
                                <div className="mb-10 flex items-center gap-3 text-xs font-bold tracking-[0.15em] uppercase">
                                    <span className="size-2 animate-pulse rounded-full bg-[#8eb500]" />
                                    Aberto a conexões e novos desafios
                                </div>
                                <p className="mb-4 text-sm font-medium sm:text-base">
                                    Back-End Developer · Full Stack — Londrina,
                                    PR
                                </p>
                                <h1 className="max-w-5xl text-[clamp(4.5rem,14vw,11rem)] leading-[0.73] font-black tracking-[-0.085em] uppercase">
                                    Negócio
                                    <span className="block text-[#8eb500] italic">
                                        vira
                                    </span>
                                    software.
                                </h1>
                                <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="max-w-md text-base leading-relaxed text-black/60 dark:text-white/60">
                                        Construo e evoluo sistemas para
                                        e-commerce, SaaS e ambientes
                                        corporativos, conectando regras de
                                        negócio, APIs e produto.
                                    </p>
                                    <a
                                        href="#projetos"
                                        className="group flex size-16 shrink-0 items-center justify-center rounded-full border border-black/30 transition-colors hover:bg-[#d8ff3e] dark:border-white/30 dark:hover:text-black"
                                        aria-label="Ver projetos"
                                    >
                                        <ArrowDown className="size-5 transition-transform group-hover:translate-y-1" />
                                    </a>
                                </div>
                            </div>

                            <div className="relative hidden h-[70%] min-h-96 items-center justify-center lg:flex">
                                <div className="absolute size-80 rotate-6 rounded-[4rem] bg-[#d8ff3e]" />
                                <div className="absolute size-64 -rotate-12 rounded-full border-[3rem] border-[#171713] dark:border-[#f2f0e9]" />
                                <Asterisk className="relative size-52 rotate-12 stroke-[0.5]" />
                                <span className="absolute right-4 bottom-2 font-mono text-xs uppercase">
                                    Scroll to explore — 01/04
                                </span>
                            </div>
                        </div>
                    </section>

                    <section
                        id="projetos"
                        className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-14 flex items-end justify-between gap-8 border-b border-black/20 pb-6 dark:border-white/20">
                                <div>
                                    <p className="mb-3 text-xs font-bold tracking-[0.16em] text-black/50 uppercase dark:text-white/50">
                                        Trabalho selecionado
                                    </p>
                                    <h2 className="text-4xl font-black tracking-[-0.055em] sm:text-6xl">
                                        Projetos em destaque
                                    </h2>
                                </div>
                                <span className="hidden font-mono text-sm sm:block">
                                    (03)
                                </span>
                            </div>

                            <div className="flex flex-col gap-16 lg:gap-24">
                                {projects.map((project) => (
                                    <article
                                        key={project.title}
                                        className="group grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
                                    >
                                        <div
                                            className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${project.accent}`}
                                        >
                                            <div className="absolute inset-5 rounded-xl border border-white/35" />
                                            <span className="absolute top-8 left-8 font-mono text-xs text-white/80">
                                                PROJECT / {project.number}
                                            </span>
                                            <span className="absolute inset-0 flex items-center justify-center text-[clamp(7rem,20vw,15rem)] leading-none font-black tracking-[-0.12em] text-white/90 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                                                {project.artwork}
                                            </span>
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Ver ${project.title} no GitHub`}
                                                className="absolute right-7 bottom-7 flex size-14 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                                            >
                                                <ArrowUpRight className="size-5" />
                                            </a>
                                        </div>

                                        <div className="lg:pb-3">
                                            <div className="mb-6 flex items-center justify-between border-b border-black/20 pb-4 text-xs font-bold uppercase dark:border-white/20">
                                                <span>{project.category}</span>
                                                <span>
                                                    {project.number} / 03
                                                </span>
                                            </div>
                                            <h3 className="text-4xl font-black tracking-[-0.055em] sm:text-6xl">
                                                {project.title}
                                            </h3>
                                            <p className="mt-5 max-w-lg text-base leading-relaxed text-black/60 dark:text-white/60">
                                                {project.description}
                                            </p>
                                            <div className="mt-7 flex flex-wrap gap-2">
                                                {project.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-black/20 px-3 py-1.5 text-xs dark:border-white/20"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#171713] px-5 py-24 text-[#f2f0e9] sm:px-8 lg:px-10 lg:py-32">
                        <div className="mx-auto max-w-7xl">
                            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.16em] text-white/50 uppercase">
                                        Como eu posso ajudar
                                    </p>
                                    <Asterisk className="mt-10 size-20 text-[#d8ff3e]" />
                                </div>
                                <div className="divide-y divide-white/15 border-t border-white/15">
                                    {services.map((service, index) => (
                                        <div
                                            key={service.title}
                                            className="grid gap-5 py-9 sm:grid-cols-[4rem_1fr_1fr]"
                                        >
                                            <span className="font-mono text-xs text-white/40">
                                                0{index + 1}
                                            </span>
                                            <div className="flex items-start gap-4">
                                                <service.icon className="mt-1 size-5 text-[#d8ff3e]" />
                                                <h3 className="text-xl font-bold">
                                                    {service.title}
                                                </h3>
                                            </div>
                                            <p className="leading-relaxed text-white/55">
                                                {service.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="sobre"
                        className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
                    >
                        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
                            <div>
                                <p className="mb-6 text-xs font-bold tracking-[0.16em] text-black/50 uppercase dark:text-white/50">
                                    Um pouco sobre mim
                                </p>
                                <h2 className="text-4xl leading-[0.95] font-black tracking-[-0.055em] sm:text-6xl">
                                    Código com contexto de negócio.
                                </h2>
                            </div>
                            <div className="flex flex-col justify-end gap-8">
                                <p className="text-xl leading-relaxed text-black/65 dark:text-white/65">
                                    Sou desenvolvedor full stack com foco em
                                    back-end e mais de quatro anos de
                                    experiência construindo, mantendo e
                                    modernizando sistemas em produção.
                                </p>
                                <p className="leading-relaxed text-black/55 dark:text-white/55">
                                    Minha base em processos financeiros,
                                    faturamento e operações me ajuda a traduzir
                                    regras complexas em soluções escaláveis.
                                    Trabalho principalmente com PHP, Laravel,
                                    MySQL, APIs REST, integrações de pagamento e
                                    sistemas legados.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Medalhista NASA Space Apps',
                                        'Inglês B2',
                                        '4+ anos em produção',
                                    ].map((highlight) => (
                                        <span
                                            key={highlight}
                                            className="rounded-full border border-black/20 px-3 py-1.5 text-xs font-semibold dark:border-white/20"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto mt-20 max-w-7xl border-t border-black/20 dark:border-white/20">
                            {experience.map(([period, role, company]) => (
                                <div
                                    key={period}
                                    className="grid gap-3 border-b border-black/20 py-6 sm:grid-cols-[0.6fr_1fr_0.7fr] sm:items-center dark:border-white/20"
                                >
                                    <span className="font-mono text-xs text-black/50 dark:text-white/50">
                                        {period}
                                    </span>
                                    <strong className="text-lg">{role}</strong>
                                    <span className="sm:text-right">
                                        {company}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="contato"
                        className="border-t border-black/15 bg-[#d8ff3e] text-[#171713]"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                            <div className="flex flex-col items-start gap-10">
                                <p className="text-xs font-bold tracking-[0.16em] uppercase">
                                    Tem um projeto em mente?
                                </p>
                                <a
                                    href="mailto:caique.rechi.dev@gmail.com"
                                    className="group flex max-w-5xl items-center gap-3 text-[clamp(3.2rem,9vw,8rem)] leading-[0.85] font-black tracking-[-0.075em] uppercase"
                                >
                                    Vamos conversar
                                    <ArrowUpRight className="size-[0.65em] shrink-0 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
                                </a>
                                <div className="mt-10 flex w-full flex-col gap-6 border-t border-black/20 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <Mail className="size-4" />
                                        caique.rechi.dev@gmail.com
                                    </div>
                                    <div className="flex gap-6 font-semibold">
                                        <a
                                            href="https://linkedin.com/in/caique-rechi"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:underline"
                                        >
                                            LinkedIn
                                        </a>
                                        <a
                                            href="https://github.com/CaiqueRechi"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:underline"
                                        >
                                            GitHub
                                        </a>
                                    </div>
                                    <span>© 2026 — Londrina, PR</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
