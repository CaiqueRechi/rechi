import { Head } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    Flame,
    Ghost,
    MapPin,
    MoonStar,
    ShieldCheck,
    Skull,
    Sparkles,
} from 'lucide-react';
import AnonymousDeveloperProfile from '@/components/personal-profile/anonymous-developer-profile';
import ConnectedApiRail from '@/components/personal-profile/connected-api-rail';
import GalaxyBackground from '@/components/personal-profile/galaxy-background';
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
        description: 'Built something for fun.',
    },
];

export default function Me({ integrations }: PersonalProfileProps) {
    const steam = integrations.steam;
    const wakatime = integrations.wakatime;
    const profileName = steam.account?.name || 'Caique // night visitor';
    const avatarUrl = steam.account?.avatarUrl;
    const connectedCount = Object.values(integrations).filter(
        (integration) => integration.connected,
    ).length;
    const hasArtificialData = Object.values(integrations).some(
        (integration) => integration.isDemo,
    );

    return (
        <main className="min-h-screen overflow-hidden bg-[#05070e] text-[#d6e6f2] selection:bg-orange-400 selection:text-black">
            <Head title="ME // Haunted Profile" />

            <GalaxyBackground />

            <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                <nav className="mb-4 flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
                    <span className="flex items-center gap-2 text-orange-300">
                        <Ghost className="size-4" /> rechi.profile
                    </span>
                    <span className="text-zinc-500">
                        visitor session // public
                    </span>
                </nav>

                <header className="relative overflow-hidden rounded-3xl border border-[#3b4652] bg-[#121923]/95 shadow-[0_30px_100px_rgba(0,0,0,.55)]">
                    <div className="relative min-h-52 overflow-hidden bg-[linear-gradient(115deg,#2c1233_0%,#182635_45%,#0a1119_100%)] p-5 sm:min-h-64 sm:p-8">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,rgba(249,115,22,.4),transparent_20%),radial-gradient(circle_at_72%_35%,rgba(126,34,206,.45),transparent_25%)] opacity-40"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute right-8 bottom-0 text-[9rem] leading-none text-black/25 sm:text-[13rem]"
                        >
                            ♜
                        </div>
                        <div className="relative flex min-h-44 items-end">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                                <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-[#d8843f] bg-[#101722] shadow-[0_0_0_4px_#151f29,0_15px_40px_rgba(0,0,0,.5)] sm:size-36">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Ghost className="size-14 text-orange-200" />
                                    )}
                                </div>
                                <div className="pb-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                                        <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-300 uppercase">
                                            online after midnight
                                        </span>
                                    </div>
                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                                        {profileName}
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#aebfcb] sm:text-base">
                                        Developer by daylight, digital cryptid
                                        by choice. I build dependable backends,
                                        collect odd interfaces and keep a few
                                        side quests alive.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-px bg-[#35414c] sm:grid-cols-3">
                        <div className="flex items-center gap-3 bg-[#111923] px-5 py-4">
                            <MapPin className="size-4 text-orange-300" />
                            <span className="text-sm">Londrina, Brazil</span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#111923] px-5 py-4">
                            <Activity className="size-4 text-violet-300" />
                            <span className="text-sm">
                                {connectedCount}/5 live signals
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#111923] px-5 py-4">
                            <CalendarDays className="size-4 text-sky-300" />
                            <span className="text-sm">portfolio level 13</span>
                        </div>
                    </div>
                </header>

                {hasArtificialData && (
                    <aside className="mt-4 flex gap-3 rounded-2xl border border-orange-300/25 bg-orange-300/8 p-4 text-sm text-orange-100">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                        <p>
                            <strong>Preview mode:</strong> disconnected
                            integrations use clearly marked fictional records to
                            preserve the profile layout. They are not claims
                            about real activity.
                        </p>
                    </aside>
                )}

                <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <SteamShowcase integration={steam} />

                    <aside className="space-y-4 lg:sticky lg:top-5">
                        <section className="rounded-2xl border border-[#33424f] bg-[#111923]/95 p-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-white">
                                    Profile dossier
                                </h2>
                                <MoonStar className="size-4 text-orange-300" />
                            </div>
                            <dl className="mt-5 space-y-4">
                                {profileFacts.map((fact) => (
                                    <div
                                        key={fact.label}
                                        className="border-b border-dashed border-white/10 pb-3 last:border-0 last:pb-0"
                                    >
                                        <dt className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
                                            {fact.label}
                                        </dt>
                                        <dd className="mt-1 text-sm text-zinc-200">
                                            {fact.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <section className="rounded-2xl border border-violet-300/20 bg-[#15101c]/95 p-5">
                            <p className="font-mono text-[9px] tracking-[0.25em] text-violet-300 uppercase">
                                achievement cabinet
                            </p>
                            <div className="mt-4 space-y-3">
                                {achievementSlots.map(
                                    ({ icon: Icon, title, description }) => (
                                        <div
                                            key={title}
                                            className="flex gap-3 rounded-xl border border-white/8 bg-black/20 p-3"
                                        >
                                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-300/10 text-orange-300">
                                                <Icon className="size-4" />
                                            </span>
                                            <div>
                                                <strong className="block text-xs text-white">
                                                    {title}
                                                </strong>
                                                <span className="text-[11px] leading-tight text-zinc-500">
                                                    {description}
                                                </span>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                            <p className="mt-4 font-mono text-[9px] text-zinc-600 uppercase">
                                portfolio badges // not Steam achievements
                            </p>
                        </section>
                    </aside>
                </div>

                <div className="mt-6">
                    <AnonymousDeveloperProfile integration={wakatime} />
                </div>

                <div className="mt-10">
                    <ConnectedApiRail integrations={integrations} />
                </div>

                <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 font-mono text-[10px] tracking-[0.14em] text-zinc-600 uppercase sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        crafted somewhere between clean code and haunted pixels
                    </span>
                    <span>no credentials cross this boundary</span>
                </footer>
            </div>
        </main>
    );
}
