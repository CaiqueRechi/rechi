import { Head } from '@inertiajs/react';
import { Activity, Code2, Gamepad2, Headphones, MessageCircle, Moon, Radio, Sun, WifiOff, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

type ActivityItem = {
    title?: string;
    subtitle?: string;
    meta?: string;
    imageUrl?: string;
    url?: string;
    status?: string;
    nowPlaying?: boolean;
    occurredAt?: string;
};

type Integration = {
    provider: string;
    label: string;
    connected: boolean;
    isDemo: boolean;
    notice: string | null;
    account: { name: string | null; avatarUrl: string | null } | null;
    lastSyncedAt: string | null;
    activities: ActivityItem[];
};

type PageProps = {
    integrations: Record<string, Integration>;
};

const providerStyles: Record<string, { icon: LucideIcon; accent: string; code: string }> = {
    spotify: { icon: Headphones, accent: 'text-emerald-600 dark:text-emerald-300', code: 'AUD-01' },
    steam: { icon: Gamepad2, accent: 'text-sky-600 dark:text-sky-300', code: 'PLY-02' },
    lastfm: { icon: Radio, accent: 'text-rose-600 dark:text-rose-300', code: 'SCB-03' },
    wakatime: { icon: Code2, accent: 'text-violet-600 dark:text-violet-300', code: 'DEV-04' },
    discord: { icon: MessageCircle, accent: 'text-indigo-600 dark:text-indigo-300', code: 'COM-05' },
};

function SignalPanel({ integration, featured = false }: { integration: Integration; featured?: boolean }) {
    const style = providerStyles[integration.provider];
    const Icon = style.icon;

    return (
        <section className={`group relative overflow-hidden border border-zinc-900/15 bg-white/65 p-5 shadow-[6px_6px_0_rgba(24,24,27,0.12)] backdrop-blur-sm transition-transform hover:-translate-y-1 dark:border-lime-300/25 dark:bg-zinc-950/70 dark:shadow-[6px_6px_0_rgba(163,230,53,0.12)] ${featured ? 'md:col-span-2' : ''}`}>
            <div className="absolute top-0 right-0 h-14 w-14 bg-[linear-gradient(135deg,transparent_49%,rgba(217,70,239,.35)_50%)]" />
            <header className="mb-5 flex items-start justify-between gap-4 border-b border-dashed border-zinc-900/20 pb-4 dark:border-lime-300/20">
                <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center border border-current bg-zinc-50 dark:bg-zinc-900">
                        <Icon className={`size-5 ${style.accent}`} />
                    </span>
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.28em] text-zinc-500 dark:text-zinc-400">{style.code} // SIGNAL</p>
                        <h2 className="text-xl font-black tracking-tight uppercase">{integration.label}</h2>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase ${integration.connected ? 'text-emerald-600 dark:text-lime-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {integration.connected ? <Activity className="size-3" /> : <WifiOff className="size-3" />}
                    {integration.connected ? 'linked' : 'demo feed'}
                </span>
            </header>

            {integration.notice && (
                <div className="mb-4 border-l-2 border-amber-500 bg-amber-400/10 px-3 py-2 font-mono text-[11px] text-amber-800 dark:text-amber-200">
                    SIMULATION: {integration.notice}
                </div>
            )}

            <div className={`grid gap-2 ${featured ? 'sm:grid-cols-2' : ''}`}>
                {integration.activities.slice(0, featured ? 4 : 3).map((item, index) => {
                    const content = (
                        <div className="flex min-h-16 items-center gap-3 border border-zinc-900/10 bg-zinc-50/75 p-3 transition-colors group-hover:border-fuchsia-500/30 dark:border-white/10 dark:bg-black/25 dark:group-hover:border-lime-300/30">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="size-11 border border-zinc-900/20 object-cover dark:border-white/20" />
                            ) : (
                                <span className="grid size-11 shrink-0 place-items-center border border-zinc-900/15 font-mono text-xs text-zinc-400 dark:border-white/15">0{index + 1}</span>
                            )}
                            <span className="min-w-0">
                                <strong className="block truncate text-sm font-bold">{item.title ?? 'Unknown signal'}</strong>
                                <span className="block truncate font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{item.subtitle ?? item.meta ?? 'No metadata'}</span>
                            </span>
                            {item.nowPlaying && <Zap className="ml-auto size-4 animate-pulse text-fuchsia-500 dark:text-lime-300" />}
                        </div>
                    );

                    return item.url ? (
                        <a key={`${item.title}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="block">{content}</a>
                    ) : (
                        <div key={`${item.title}-${index}`}>{content}</div>
                    );
                })}
            </div>
        </section>
    );
}

export default function AltTab({ integrations }: PageProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const orderedProviders = ['spotify', 'steam', 'wakatime', 'lastfm', 'discord'];

    return (
        <>
            <Head title="ALT / TAB" />
            <main className="relative min-h-screen overflow-hidden bg-[#f2f0e8] text-zinc-950 selection:bg-fuchsia-400/50 dark:bg-[#090b0d] dark:text-zinc-100 dark:selection:bg-lime-300/40">
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(24,24,27,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,.08)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-20 dark:[background-image:linear-gradient(rgba(163,230,53,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,.16)_1px,transparent_1px)]" />
                <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-fuchsia-500/20 blur-3xl dark:bg-fuchsia-500/15" />

                <div className="relative mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
                    <nav className="flex items-center justify-between border-b border-zinc-900/20 pb-4 font-mono text-[10px] tracking-[0.25em] uppercase dark:border-lime-300/20">
                        <span>rechi.net.br / private frequency</span>
                        <button
                            type="button"
                            onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                            className="flex items-center gap-2 border border-zinc-900/30 px-3 py-2 transition hover:bg-zinc-950 hover:text-white dark:border-lime-300/30 dark:hover:bg-lime-300 dark:hover:text-black"
                            aria-label="Toggle color theme"
                        >
                            {resolvedAppearance === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                            {resolvedAppearance === 'dark' ? 'light mode' : 'dark mode'}
                        </button>
                    </nav>

                    <header className="grid gap-8 py-14 md:grid-cols-[1.45fr_.55fr] md:items-end md:py-20">
                        <div>
                            <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.24em] text-fuchsia-700 uppercase dark:text-lime-300">
                                <span className="size-2 animate-pulse bg-current" /> human process detected
                            </p>
                            <h1 className="max-w-4xl text-[clamp(4.5rem,15vw,10rem)] leading-[0.72] font-black tracking-[-0.09em] uppercase">
                                Alt<span className="text-fuchsia-600 dark:text-lime-300">/</span>Tab
                            </h1>
                        </div>
                        <div className="border-l-4 border-zinc-950 pl-5 dark:border-fuchsia-500">
                            <p className="text-lg leading-snug font-semibold">What leaks through when the work window loses focus.</p>
                            <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">music // games // code // communities<br />live signals with a database memory</p>
                        </div>
                    </header>

                    <div className="mb-8 flex overflow-hidden border-y border-zinc-900/20 py-2 font-mono text-[10px] tracking-[0.3em] whitespace-nowrap uppercase dark:border-lime-300/20">
                        <span className="animate-pulse">● five channels armed &nbsp; // &nbsp; artificial feeds are always labeled &nbsp; // &nbsp; secrets remain server-side &nbsp; // &nbsp;</span>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {orderedProviders.map((provider, index) => (
                            <SignalPanel key={provider} integration={integrations[provider]} featured={index === 0} />
                        ))}
                    </div>

                    <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-zinc-900/20 pt-5 font-mono text-[10px] tracking-[0.2em] uppercase sm:flex-row dark:border-lime-300/20">
                        <span>ALT/TAB OS — build 01</span>
                        <span>privacy mode: server-side encrypted</span>
                    </footer>
                </div>
            </main>
        </>
    );
}
