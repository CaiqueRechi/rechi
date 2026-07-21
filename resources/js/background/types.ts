export type CharacterState =
    'idle' | 'looking' | 'walking' | 'running' | 'surprised';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type QualityLevel = 'low' | 'medium' | 'high';

export type TerrainType = 'deepWater' | 'water' | 'moss' | 'grass' | 'rock';

export type Vector = {
    x: number;
    y: number;
};

export type MotionResult = {
    state: CharacterState;
    targetVelocity: Vector;
    distance: number;
};

export type QualityProfile = {
    level: QualityLevel;
    framesPerSecond: number;
    maxInternalWidth: number;
    maxInternalHeight: number;
    resolutionScale: number;
    particleCount: number;
    maxCachedChunks: number;
};

export type WorldPalette = {
    deepWater: string;
    water: string;
    waterGlow: string;
    moss: string;
    grass: string;
    grassHighlight: string;
    rock: string;
    rockHighlight: string;
    flower: string;
    shadow: string;
};
