import { Clock3, Gamepad2, Monitor, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatHours } from '@/components/personal-profile/types';
import type {
    ProfileActivity,
    ProfileIntegration,
} from '@/components/personal-profile/types';

type SteamShowcaseProps = {
    integration: ProfileIntegration;
};

function GameArtwork({ game }: { game: ProfileActivity }) {
    if (game.imageUrl) {
        return (
            <img
                src={game.imageUrl}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
        );
    }

    return (
        <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#30134b,#0f1722_55%,#18333b)]">
            <Gamepad2 className="size-10 text-orange-300/70" />
        </div>
    );
}

export default function SteamShowcase({ integration }: SteamShowcaseProps) {
    const games = integration.activities.filter((activity) => activity.title);
    const featuredGame = games[0];
    const lifetimeMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayed ?? 0),
        0,
    );
    const recentMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayedTwoWeeks ?? 0),
        0,
    );
    const windowsMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayedWindows ?? 0),
        0,
    );
    const linuxMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayedLinux ?? 0),
        0,
    );
    const macMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayedMac ?? 0),
        0,
    );
    const deckMinutes = games.reduce(
        (total, game) => total + (game.minutesPlayedDeck ?? 0),
        0,
    );
    const platforms = [
        { name: 'Windows', minutes: windowsMinutes },
        { name: 'Linux', minutes: linuxMinutes },
        { name: 'macOS', minutes: macMinutes },
        { name: 'Steam Deck', minutes: deckMinutes },
    ];
    const mainPlatform = platforms.sort(
        (first, second) => second.minutes - first.minutes,
    )[0]?.name;
    const stats: Array<{
        label: string;
        value: string;
        icon: LucideIcon;
    }> = [
        {
            label: 'games sampled',
            value: games.length.toString(),
            icon: Gamepad2,
        },
        {
            label: 'recorded playtime',
            value: formatHours(lifetimeMinutes),
            icon: Clock3,
        },
        {
            label: 'last two weeks',
            value: formatHours(recentMinutes),
            icon: Trophy,
        },
        {
            label: 'main platform',
            value: mainPlatform ?? 'Unknown',
            icon: Monitor,
        },
    ];

    return (
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-200/15 bg-[#0b111b]/85 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-orange-300 via-fuchsia-400 to-violet-400" />
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 bg-linear-to-r from-orange-300/8 via-transparent to-violet-300/8 px-5 py-5 sm:px-6">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.28em] text-orange-300 uppercase">
                        Steam archive // memory card 01
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#d6e6f2]">
                        Recently haunted games
                    </h2>
                </div>
                <span
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider uppercase ${
                        integration.isDemo
                            ? 'border-orange-400/40 bg-orange-400/10 text-orange-200'
                            : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                    }`}
                >
                    {integration.isDemo ? 'skeleton data' : 'steam connected'}
                </span>
            </header>

            <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="group rounded-2xl border border-white/7 bg-white/[0.025] p-4 transition hover:-translate-y-0.5 hover:border-orange-300/20 hover:bg-orange-300/[0.035]"
                    >
                        <Icon className="mb-3 size-4 text-orange-300 transition group-hover:rotate-6" />
                        <strong className="block text-xl text-white">
                            {value}
                        </strong>
                        <span className="font-mono text-[10px] tracking-wider text-[#7f98aa] uppercase">
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {featuredGame && (
                <div className="group relative mx-3 min-h-72 overflow-hidden rounded-[1.5rem] border border-white/10 sm:mx-4">
                    <div className="absolute inset-0">
                        <GameArtwork game={featuredGame} />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#070a11_3%,rgba(7,10,17,.91)_38%,rgba(7,10,17,.08)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-orange-300/80 via-fuchsia-300/40 to-transparent" />
                    <div className="relative flex min-h-72 max-w-md flex-col justify-end p-6 sm:p-8">
                        <p className="font-mono text-[10px] tracking-[0.3em] text-orange-300 uppercase">
                            Featured apparition
                        </p>
                        <h3 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            {featuredGame.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#b8c8d3]">
                            <span className="rounded-md bg-black/45 px-2 py-1">
                                {formatHours(featuredGame.minutesPlayed ?? 0)}{' '}
                                total
                            </span>
                            <span className="rounded-md bg-black/45 px-2 py-1">
                                {formatHours(
                                    featuredGame.minutesPlayedTwoWeeks ?? 0,
                                )}{' '}
                                recent
                            </span>
                            {featuredGame.appId && (
                                <span className="rounded-md bg-black/45 px-2 py-1">
                                    app {featuredGame.appId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-3 p-4 sm:grid-cols-2">
                {games.slice(1, 7).map((game, index) => (
                    <article
                        key={`${game.appId ?? game.title}-${index}`}
                        className="group relative grid min-h-24 grid-cols-[7rem_1fr] overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition hover:-translate-y-0.5 hover:border-orange-300/35 hover:bg-orange-300/[0.035]"
                    >
                        <span className="absolute top-2 left-2 z-10 grid size-5 place-items-center rounded-full bg-black/70 font-mono text-[8px] text-orange-200">
                            {String(index + 2).padStart(2, '0')}
                        </span>
                        <div className="overflow-hidden">
                            <GameArtwork game={game} />
                        </div>
                        <div className="min-w-0 p-3">
                            <h3 className="truncate font-semibold text-[#e5f1f8]">
                                {game.title}
                            </h3>
                            <p className="mt-2 font-mono text-[11px] text-[#8fa5b4]">
                                {formatHours(game.minutesPlayed ?? 0)} on record
                            </p>
                            <p className="font-mono text-[10px] text-orange-200/70">
                                {formatHours(game.minutesPlayedTwoWeeks ?? 0)}{' '}
                                recently
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
