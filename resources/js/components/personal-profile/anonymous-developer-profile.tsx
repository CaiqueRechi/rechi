import { Braces, Clock3, Code2, EyeOff, SquareTerminal } from 'lucide-react';
import { formatCodingTime } from '@/components/personal-profile/types';
import type { ProfileIntegration } from '@/components/personal-profile/types';

type AnonymousDeveloperProfileProps = {
    integration: ProfileIntegration;
};

export default function AnonymousDeveloperProfile({
    integration,
}: AnonymousDeveloperProfileProps) {
    const entries = integration.activities.filter((activity) => activity.title);
    const totalSeconds = entries.reduce(
        (total, activity) => total + (activity.seconds ?? 0),
        0,
    );
    const maximumSeconds = Math.max(
        ...entries.map((activity) => activity.seconds ?? 0),
        1,
    );

    return (
        <section className="relative overflow-hidden rounded-3xl border border-violet-300/20 bg-[#120f1a]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,.34)] sm:p-6">
            <div className="relative">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-violet-300/25 pb-5">
                    <div className="flex items-center gap-4">
                        <span className="grid size-14 place-items-center rounded-full border border-violet-300/35 bg-violet-400/10 text-violet-200 shadow-[0_0_35px_rgba(168,85,247,.22)]">
                            <EyeOff className="size-6" />
                        </span>
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-violet-300 uppercase">
                                WakaTime // masked identity
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-white">
                                The anonymous programmer
                            </h2>
                        </div>
                    </div>
                    <span className="border border-violet-300/25 bg-black/25 px-3 py-1 font-mono text-[10px] tracking-wider text-violet-200 uppercase">
                        {integration.isDemo
                            ? 'simulated trace'
                            : 'telemetry online'}
                    </span>
                </header>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                        <Clock3 className="mb-4 size-4 text-violet-300" />
                        <strong className="text-2xl text-white">
                            {formatCodingTime(totalSeconds)}
                        </strong>
                        <p className="font-mono text-[10px] text-zinc-400 uppercase">
                            captured today
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                        <Braces className="mb-4 size-4 text-orange-300" />
                        <strong className="text-2xl text-white">
                            {entries.length}
                        </strong>
                        <p className="font-mono text-[10px] text-zinc-400 uppercase">
                            active traces
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                        <SquareTerminal className="mb-4 size-4 text-emerald-300" />
                        <strong className="block truncate text-lg text-white">
                            {entries[0]?.title ?? 'redacted'}
                        </strong>
                        <p className="font-mono text-[10px] text-zinc-400 uppercase">
                            current focus
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {entries.slice(0, 6).map((activity, index) => {
                        const seconds = activity.seconds ?? 0;
                        const width = Math.max(
                            8,
                            Math.round((seconds / maximumSeconds) * 100),
                        );

                        return (
                            <div key={`${activity.title}-${index}`}>
                                <div className="mb-2 flex items-end justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Code2 className="size-3.5 shrink-0 text-violet-300" />
                                        <span className="truncate font-mono text-xs text-zinc-200">
                                            project_
                                            {String(index + 1).padStart(
                                                2,
                                                '0',
                                            )}{' '}
                                            // {activity.title}
                                        </span>
                                    </div>
                                    <span className="shrink-0 font-mono text-[10px] text-orange-200">
                                        {formatCodingTime(seconds)}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-black/40">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-violet-600 via-fuchsia-400 to-orange-300 shadow-[0_0_18px_rgba(217,70,239,.45)]"
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-6 border-l-2 border-orange-300/60 pl-3 font-mono text-[11px] leading-relaxed text-zinc-400">
                    Identity intentionally obscured. Only coding duration and
                    selected project aliases should become public; repository
                    contents and credentials remain outside this signal.
                </p>
            </div>
        </section>
    );
}
