import {
    Code2,
    Gamepad2,
    Headphones,
    MessageCircle,
    Radio,
    Signal,
    SignalZero,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProfileIntegration } from '@/components/personal-profile/types';

type ConnectedApiRailProps = {
    integrations: Record<string, ProfileIntegration>;
};

const providerIcons: Record<string, LucideIcon> = {
    spotify: Headphones,
    steam: Gamepad2,
    wakatime: Code2,
    lastfm: Radio,
    discord: MessageCircle,
};

const providerStyles: Record<
    string,
    { accent: string; glow: string; surface: string }
> = {
    spotify: {
        accent: 'text-emerald-300',
        glow: 'group-hover:shadow-[0_18px_50px_rgba(52,211,153,.09)]',
        surface: 'hover:border-emerald-300/25 hover:bg-emerald-300/[0.035]',
    },
    steam: {
        accent: 'text-sky-300',
        glow: 'group-hover:shadow-[0_18px_50px_rgba(56,189,248,.09)]',
        surface: 'hover:border-sky-300/25 hover:bg-sky-300/[0.035]',
    },
    wakatime: {
        accent: 'text-violet-300',
        glow: 'group-hover:shadow-[0_18px_50px_rgba(167,139,250,.09)]',
        surface: 'hover:border-violet-300/25 hover:bg-violet-300/[0.035]',
    },
    lastfm: {
        accent: 'text-rose-300',
        glow: 'group-hover:shadow-[0_18px_50px_rgba(251,113,133,.09)]',
        surface: 'hover:border-rose-300/25 hover:bg-rose-300/[0.035]',
    },
    discord: {
        accent: 'text-indigo-300',
        glow: 'group-hover:shadow-[0_18px_50px_rgba(129,140,248,.09)]',
        surface: 'hover:border-indigo-300/25 hover:bg-indigo-300/[0.035]',
    },
};

export default function ConnectedApiRail({
    integrations,
}: ConnectedApiRailProps) {
    return (
        <section>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {Object.values(integrations).map((integration) => {
                    const Icon = providerIcons[integration.provider] ?? Signal;
                    const activity = integration.activities[0];
                    const style = providerStyles[integration.provider] ?? {
                        accent: 'text-orange-300',
                        glow: '',
                        surface:
                            'hover:border-orange-300/25 hover:bg-orange-300/[0.035]',
                    };

                    return (
                        <article
                            key={integration.provider}
                            className={`group relative min-h-48 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#0b1019]/80 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${style.surface} ${style.glow}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute -top-8 -right-8 size-24 rounded-full bg-current opacity-[0.035] blur-2xl ${style.accent}`}
                            />
                            <div className="flex items-start justify-between gap-3">
                                <span
                                    className={`grid size-10 place-items-center rounded-2xl bg-current/8 ${style.accent}`}
                                >
                                    <Icon className="size-5" />
                                </span>
                                {integration.connected ? (
                                    <Signal className="size-3.5 text-emerald-300" />
                                ) : (
                                    <SignalZero className="size-3.5 text-orange-300/70" />
                                )}
                            </div>
                            <h3 className="mt-6 font-semibold text-white">
                                {integration.label}
                            </h3>
                            <p className="mt-1 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                                {integration.connected
                                    ? integration.account?.name || 'connected'
                                    : 'skeleton signal'}
                            </p>
                            <div className="mt-4 border-t border-dashed border-white/10 pt-3">
                                <strong className="block truncate text-xs text-zinc-300">
                                    {activity?.title ?? 'No activity captured'}
                                </strong>
                                <span className="block truncate font-mono text-[10px] text-zinc-500">
                                    {activity?.subtitle ??
                                        activity?.meta ??
                                        'awaiting connection'}
                                </span>
                            </div>
                            {integration.isDemo && (
                                <span className="absolute right-0 bottom-0 rounded-tl-lg bg-orange-300/10 px-2 py-1 font-mono text-[9px] text-orange-200 uppercase">
                                    artificial
                                </span>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
