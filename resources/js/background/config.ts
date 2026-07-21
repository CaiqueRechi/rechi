import type { QualityLevel, QualityProfile, WorldPalette } from './types';

export const WorldConfig = {
    chunkSize: 48,
    cellSize: 2,
    acceleration: 5.4,
    surpriseDuration: 0.42,
    performanceSampleSize: 120,
    slowFrameThreshold: 37,
} as const;

export const QualityProfiles: Record<QualityLevel, QualityProfile> = {
    low: {
        level: 'low',
        framesPerSecond: 24,
        maxInternalWidth: 320,
        maxInternalHeight: 180,
        resolutionScale: 0.28,
        particleCount: 5,
        maxCachedChunks: 16,
    },
    medium: {
        level: 'medium',
        framesPerSecond: 30,
        maxInternalWidth: 480,
        maxInternalHeight: 270,
        resolutionScale: 0.35,
        particleCount: 10,
        maxCachedChunks: 25,
    },
    high: {
        level: 'high',
        framesPerSecond: 45,
        maxInternalWidth: 640,
        maxInternalHeight: 360,
        resolutionScale: 0.42,
        particleCount: 16,
        maxCachedChunks: 36,
    },
};

export const CyberGardenPalette: WorldPalette = {
    deepWater: '#160b2d',
    water: '#34105f',
    waterGlow: '#9f4dff',
    moss: '#173426',
    grass: '#164b30',
    grassHighlight: '#72ff72',
    rock: '#1f3158',
    rockHighlight: '#5f8dff',
    flower: '#ff4fd8',
    shadow: '#080b15',
};

export const WorldSeedStorageKey = 'alt-tab-cyber-garden-seed';
