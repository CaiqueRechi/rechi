import {
    Activity,
    Braces,
    CalendarDays,
    Coffee,
    Flame,
    Gamepad2,
    Ghost,
    MapPin,
    MoonStar,
    Orbit,
    RadioTower,
    ShieldCheck,
    Skull,
    Sparkles,
    Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnonymousDeveloperProfile from '@/components/personal-profile/anonymous-developer-profile';
import ConnectedApiRail from '@/components/personal-profile/connected-api-rail';
import GalaxyBackground from '@/components/personal-profile/galaxy-background';
import SeoHead from '@/components/seo-head';
import SteamShowcase from '@/components/personal-profile/steam-showcase';
import type { PersonalProfileProps } from '@/components/personal-profile/types';

const profileFacts = [
    { label: 'class', value: 'backend conjurer' },
    { label: 'alignment', value: 'chaotic maintainable' },
    { label: 'favorite hour', value: '00:42' },
    { label: 'current quest', value: 'ship strange ideas' },
];

const achievementSlots = [
    {
        icon: Flame,
        title: 'Night deploy',
        description: 'Code survived past midnight.',
    },
    {
        icon: Skull,
        title: 'Bug necromancer',
        description: 'Raised a legacy feature.',
    },
    {
        icon: Sparkles,
        title: 'Rare drop',
        description: 'Built something just for fun.',
    },
];

const chapterStyles: Record<
    string,
    { icon: LucideIcon; marker: string; text: string }
> = {
    play: {
        icon: Gamepad2,
        marker: 'bg-orange-300 shadow-[0_0_22px_rgba(253,186,116,.6)]',
        text: 'text-orange-200',
    },
    code: {
        icon: Braces,
        marker: 'bg-violet-300 shadow-[0_0_22px_rgba(196,181,253,.6)]',
        text: 'text-violet-200',
    },
    signals: {
        icon: RadioTower,
        marker: 'bg-sky-300 shadow-[0_0_22px_rgba(125,211,252,.6)]',
        text: 'text-sky-200',
    },
};

function ChapterHeading({
    chapter,
    eyebrow,
    title,
    description,
}: {
    chapter: keyof typeof chapterStyles;
    eyebrow: string;
    title: string;
    description: string;
}) {
    const style = chapterStyles[chapter];
    const Icon = style.icon;

    return (
        <header className="mb-5 flex items-end gap-4 sm:gap-6">
            <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#0c101b]/80 backdrop-blur-md">
                <div
                    className={`absolute -top-1 -right-1 size-2.5 rounded-full ${style.marker}`}
                />
                <Icon className={`size-5 ${style.text}`} />
            </div>
            <div className="min-w-0">
                <p
                    className={`font-mono text-[10px] tracking-[0.3em] uppercase ${style.text}`}
                >
                    {eyebrow}
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h2>
                    <p className="max-w-xl text-xs text-slate-400 sm:text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </header>
    );
}

export default function Me({ integrations }: PersonalProfileProps) {
    const steam = integrations.steam;
    const wakatime = integrations.wakatime;
    const profileName = steam.account?.name || 'Caique';
    const avatarUrl = steam.account?.avatarUrl;
    const connectedCount = Object.values(integrations).filter(
        (integration) => integration.connected,
    ).length;
    const hasArtificialData = Object.values(integrations).some(
        (integration) => integration.isDemo,
    );

    return (
        <main className="min-h-screen overflow-hidden bg-[#05070e] text-[#d6e6f2] selection:bg-violet-300 selection:text-[#110b20]">
            <SeoHead
                title="Caique Rechi — Perfil pessoal e projetos"
                description="Perfil pessoal de Caique Rechi: desenvolvimento, jogos, música, projetos e sinais das integrações conectadas."
                canonicalPath="/me"
                type="profile"
            />

            <GalaxyBackground />

            <div className="relative mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-[#090c15]/75 px-3 py-2 font-mono text-[9px] tracking-[0.2em] uppercase shadow-[0_16px_60px_rgba(0,0,0,.28)] backdrop-blur-xl sm:px-4">
                    <a
                        href="#top"
                        className="flex items-center gap-2 rounded-full bg-orange-300/10 px-3 py-2 text-orange-200 transition hover:bg-orange-300/15"
                    >
                        <Ghost className="size-3.5" />
                        rechi.exe
                    </a>

                    <div className="hidden items-center gap-1 text-slate-500 sm:flex">
                        <a
                            href="#play"
                            className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-orange-200"
                        >
                            01 play
                        </a>
                        <a
                            href="#code"
                            className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-violet-200"
                        >
                            02 code
                        </a>
                        <a
                            href="#signals"
                            className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-sky-200"
                        >
                            03 signals
                        </a>
                    </div>

                    <span className="flex items-center gap-2 px-2 text-slate-500">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
                        night shift
                    </span>
                </nav>

                <header
                    id="top"
                    className="group relative scroll-mt-6 overflow-hidden rounded-[2rem] border border-violet-200/15 bg-[#0a0d17]/82 shadow-[0_35px_120px_rgba(0,0,0,.6)] backdrop-blur-xl sm:rounded-[2.5rem]"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-300/80 to-transparent" />
                    <div
                        aria-hidden="true"
                        className="absolute top-8 -right-10 font-mono text-[5rem] font-black tracking-[-0.08em] text-white/[0.025] uppercase sm:text-[9rem] lg:right-3"
                    >
                        visitor
                    </div>
                    <div
                        aria-hidden="true"
                        className="absolute -top-16 -left-20 size-72 rounded-full bg-fuchsia-500/10 blur-3xl"
                    />

                    <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10 lg:p-10">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative mx-auto shrink-0 sm:mx-0">
                                <div className="absolute inset-0 rotate-6 rounded-[2rem] border border-violet-300/30 bg-violet-500/15 transition duration-500 group-hover:rotate-3" />
                                <div className="relative grid size-32 -rotate-2 place-items-center overflow-hidden rounded-[1.75rem] border-2 border-orange-300/80 bg-[#101522] shadow-[0_0_0_5px_rgba(15,23,42,.8),0_20px_55px_rgba(0,0,0,.55)] transition duration-500 group-hover:rotate-0 sm:size-40">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Ghost className="size-16 animate-[me-gentle-float_5s_ease-in-out_infinite] text-orange-200 motion-reduce:animate-none" />
                                    )}
                                </div>
                                <span className="absolute -right-3 -bottom-3 grid size-12 place-items-center rounded-full border-4 border-[#0b0f19] bg-orange-300 font-mono text-xs font-black text-[#1c120b] shadow-[0_0_25px_rgba(253,186,116,.35)]">
                                    13
                                </span>
                            </div>

                            <div className="text-center sm:text-left">
                                <p className="font-mono text-[10px] tracking-[0.32em] text-emerald-300 uppercase">
                                    player one // online after midnight
                                </p>
                                <h1 className="mt-3 text-4xl leading-none font-black tracking-[-0.045em] text-white sm:text-6xl">
                                    {profileName}
                                    <span className="mt-2 block bg-linear-to-r from-orange-200 via-fuchsia-300 to-sky-200 bg-clip-text text-2xl font-semibold tracking-[-0.02em] text-transparent sm:text-4xl">
                                        // night visitor
                                    </span>
                                </h1>
                                <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:mx-0 sm:text-base">
                                    Laravel in the daylight. Haunted interfaces
                                    after midnight. I like dependable systems,
                                    strange little worlds and code that leaves
                                    the room better than it found it.
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-2 font-mono text-[9px] tracking-wider uppercase sm:justify-start">
                                    <span className="rounded-full border border-orange-300/20 bg-orange-300/8 px-3 py-1.5 text-orange-200">
                                        backend main
                                    </span>
                                    <span className="rounded-full border border-violet-300/20 bg-violet-300/8 px-3 py-1.5 text-violet-200">
                                        curious by default
                                    </span>
                                    <span className="rounded-full border border-sky-300/20 bg-sky-300/8 px-3 py-1.5 text-sky-200">
                                        side quests enabled
                                    </span>
                                </div>
                            </div>
                        </div>

                        <aside className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-5 shadow-inner">
                            <Orbit className="absolute -right-7 -bottom-7 size-36 text-violet-300/7" />
                            <div className="relative">
                                <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase">
                                    <span className="text-slate-500">
                                        current session
                                    </span>
                                    <span className="text-emerald-300">
                                        live
                                    </span>
                                </div>
                                <blockquote className="mt-6 text-xl leading-snug font-semibold text-white">
                                    “Make it useful.
                                    <span className="block text-violet-200">
                                        Then make it weird.”
                                    </span>
                                </blockquote>
                                <dl className="mt-7 space-y-3 border-t border-dashed border-white/10 pt-4 font-mono text-[10px]">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-500">mood</dt>
                                        <dd className="text-orange-200">
                                            building
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-500">fuel</dt>
                                        <dd className="flex items-center gap-1.5 text-slate-300">
                                            <Coffee className="size-3" /> coffee
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-500">
                                            party
                                        </dt>
                                        <dd className="text-sky-200">
                                            {connectedCount}/5 signals
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </aside>
                    </div>

                    <div className="relative grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
                        <div className="flex items-center gap-3 bg-[#0b1019]/95 px-5 py-4">
                            <MapPin className="size-4 text-orange-300" />
                            <span className="text-sm">Londrina, Brazil</span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0b1019]/95 px-5 py-4">
                            <Activity className="size-4 text-violet-300" />
                            <span className="text-sm">
                                {connectedCount}/5 live signals
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0b1019]/95 px-5 py-4">
                            <CalendarDays className="size-4 text-sky-300" />
                            <span className="text-sm">portfolio level 13</span>
                        </div>
                    </div>
                </header>

                {hasArtificialData && (
                    <aside className="mt-4 flex items-start gap-3 rounded-2xl border border-orange-300/15 bg-[#120e15]/75 p-4 text-xs leading-relaxed text-orange-100/80 backdrop-blur-lg">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-orange-300" />
                        <p>
                            <strong className="text-orange-200">
                                Simulation overlay active.
                            </strong>{' '}
                            Disconnected signals borrow fictional memories so
                            the interface does not become an empty room.
                        </p>
                    </aside>
                )}

                <section id="play" className="scroll-mt-6 pt-16">
                    <ChapterHeading
                        chapter="play"
                        eyebrow="chapter 01 // play history"
                        title="Things I disappear into"
                        description="Recent games, accumulated hours and the occasional digital obsession."
                    />

                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                        <SteamShowcase integration={steam} />

                        <aside className="space-y-5 lg:sticky lg:top-5">
                            <section className="relative -rotate-1 rounded-2xl border border-orange-100/15 bg-[#17131a]/90 p-5 shadow-[10px_12px_0_rgba(249,115,22,.05)] backdrop-blur-xl transition hover:rotate-0">
                                <span className="absolute -top-2 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2 bg-orange-200/10 backdrop-blur-sm" />
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-white">
                                        Field notes
                                    </h3>
                                    <MoonStar className="size-4 text-orange-300" />
                                </div>
                                <dl className="mt-5 space-y-4">
                                    {profileFacts.map((fact) => (
                                        <div
                                            key={fact.label}
                                            className="border-b border-dashed border-white/10 pb-3 last:border-0 last:pb-0"
                                        >
                                            <dt className="font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
                                                {fact.label}
                                            </dt>
                                            <dd className="mt-1 text-sm text-slate-200">
                                                {fact.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>

                            <section className="rounded-2xl border border-violet-300/15 bg-[#110e19]/90 p-5 backdrop-blur-xl">
                                <p className="font-mono text-[9px] tracking-[0.25em] text-violet-300 uppercase">
                                    pocket achievements
                                </p>
                                <div className="mt-4 space-y-3">
                                    {achievementSlots.map(
                                        ({
                                            icon: Icon,
                                            title,
                                            description,
                                        }) => (
                                            <div
                                                key={title}
                                                className="group flex gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3 transition hover:translate-x-1 hover:border-violet-300/20 hover:bg-violet-300/5"
                                            >
                                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-300/10 text-orange-300 transition group-hover:rotate-12">
                                                    <Icon className="size-4" />
                                                </span>
                                                <div>
                                                    <strong className="block text-xs text-white">
                                                        {title}
                                                    </strong>
                                                    <span className="text-[11px] leading-tight text-slate-500">
                                                        {description}
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <p className="mt-4 font-mono text-[8px] text-slate-600 uppercase">
                                    portfolio badges // not Steam achievements
                                </p>
                            </section>
                        </aside>
                    </div>
                </section>

                <section id="code" className="scroll-mt-6 pt-16">
                    <ChapterHeading
                        chapter="code"
                        eyebrow="chapter 02 // code after dark"
                        title="Anonymous traces"
                        description="The work is visible. The secrets, repository contents and credentials are not."
                    />
                    <AnonymousDeveloperProfile integration={wakatime} />
                </section>

                <section id="signals" className="scroll-mt-6 pt-16">
                    <ChapterHeading
                        chapter="signals"
                        eyebrow="chapter 03 // outside frequencies"
                        title="Signals from elsewhere"
                        description="Games, music, code and communities leaking gently into one profile."
                    />
                    <ConnectedApiRail integrations={integrations} />
                </section>

                <footer className="mt-16 flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-[#090c14]/60 px-6 py-5 font-mono text-[9px] tracking-[0.14em] text-slate-600 uppercase backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-2">
                        <Terminal className="size-3.5 text-violet-300" />
                        crafted between clean code and haunted pixels
                    </span>
                    <span>no credentials cross this boundary</span>
                </footer>
            </div>
        </main>
    );
}
