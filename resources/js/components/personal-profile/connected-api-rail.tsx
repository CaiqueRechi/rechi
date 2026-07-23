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

const providerAccents: Record<string, string> = {
    spotify: 'text-emerald-300',
    steam: 'text-sky-300',
    wakatime: 'text-violet-300',
    lastfm: 'text-rose-300',
    discord: 'text-indigo-300',
};

export default function ConnectedApiRail({
    integrations,
}: ConnectedApiRailProps) {
    return (
        <section>
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-orange-300 uppercase">
                        External manifestations
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                        Connected signals
                    </h2>
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    secrets stay server-side
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {Object.values(integrations).map((integration) => {
                    const Icon = providerIcons[integration.provider] ?? Signal;
                    const activity = integration.activities[0];

                    return (
                        <article
                            key={integration.provider}
                            className="group relative min-h-44 overflow-hidden rounded-2xl border border-white/10 bg-[#111923]/90 p-4 transition duration-300 hover:-translate-y-1 hover:border-orange-300/35"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <Icon
                                    className={`size-5 ${providerAccents[integration.provider] ?? 'text-orange-300'}`}
                                />
                                {integration.connected ? (
                                    <Signal className="size-3.5 text-emerald-300" />
                                ) : (
                                    <SignalZero className="size-3.5 text-orange-300/70" />
                                )}
                            </div>
                            <h3 className="mt-7 font-semibold text-white">
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
