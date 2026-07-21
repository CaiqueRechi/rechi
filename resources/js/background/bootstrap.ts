import { normalizeSeed } from './core';
import { ProceduralBackground } from './ProceduralBackground';
import { WorldSeedStorageKey } from './config';

export type ProceduralBackgroundHandle = {
    destroy: () => void;
};

export function startProceduralBackground(
    canvas: HTMLCanvasElement,
): ProceduralBackgroundHandle {
    const engine = new ProceduralBackground(canvas, resolveWorldSeed());
    engine.start();

    return {
        destroy: () => engine.destroy(),
    };
}

function resolveWorldSeed(): number {
    const querySeed = new URLSearchParams(window.location.search).get(
        'worldSeed',
    );

    if (querySeed) {
        return normalizeSeed(querySeed);
    }

    try {
        const storedSeed = window.localStorage.getItem(WorldSeedStorageKey);

        if (storedSeed) {
            return normalizeSeed(storedSeed);
        }

        const generatedSeed = crypto.getRandomValues(new Uint32Array(1))[0];
        window.localStorage.setItem(
            WorldSeedStorageKey,
            generatedSeed.toString(),
        );

        return generatedSeed;
    } catch {
        return normalizeSeed(
            `${navigator.userAgent}:${screen.width}:${screen.height}`,
        );
    }
}
