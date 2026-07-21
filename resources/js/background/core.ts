import type {
    CharacterState,
    Direction,
    MotionResult,
    QualityLevel,
    TerrainType,
    Vector,
} from './types';

const fade = (value: number): number => value * value * (3 - 2 * value);
const interpolate = (from: number, to: number, amount: number): number =>
    from + (to - from) * amount;

export const MotionTuning = {
    deadZone: 58,
    idleRadius: 20,
    runDistance: 260,
    walkSpeed: 24,
    runSpeed: 39,
    surprisePointerSpeed: 1150,
} as const;

export function hashCoordinate(x: number, y: number, seed: number): number {
    let hash = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    hash = Math.imul(hash ^ (hash >>> 13) ^ seed, 1274126177);

    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
}

export function valueNoise(x: number, y: number, seed: number): number {
    const left = Math.floor(x);
    const top = Math.floor(y);
    const horizontalMix = fade(x - left);
    const verticalMix = fade(y - top);
    const topValue = interpolate(
        hashCoordinate(left, top, seed),
        hashCoordinate(left + 1, top, seed),
        horizontalMix,
    );
    const bottomValue = interpolate(
        hashCoordinate(left, top + 1, seed),
        hashCoordinate(left + 1, top + 1, seed),
        horizontalMix,
    );

    return interpolate(topValue, bottomValue, verticalMix) * 2 - 1;
}

export function sampleTerrain(
    worldX: number,
    worldY: number,
    seed: number,
): TerrainType {
    const broadShapes = valueNoise(worldX * 0.018, worldY * 0.018, seed);
    const gardenDetail = valueNoise(
        worldX * 0.052,
        worldY * 0.052,
        seed ^ 0x9e3779b9,
    );
    const terrain = broadShapes * 0.72 + gardenDetail * 0.28;

    if (terrain < -0.43) {
        return 'deepWater';
    }

    if (terrain < -0.2) {
        return 'water';
    }

    if (terrain < 0.02) {
        return 'moss';
    }

    if (terrain < 0.55) {
        return 'grass';
    }

    return 'rock';
}

export function computeMotion(
    pointer: Vector,
    viewportCenter: Vector,
    pointerSpeed: number,
): MotionResult {
    const offsetX = pointer.x - viewportCenter.x;
    const offsetY = pointer.y - viewportCenter.y;
    const distance = Math.hypot(offsetX, offsetY);

    if (pointerSpeed > MotionTuning.surprisePointerSpeed) {
        return {
            state: 'surprised',
            targetVelocity: { x: 0, y: 0 },
            distance,
        };
    }

    if (distance < MotionTuning.deadZone) {
        return {
            state: distance < MotionTuning.idleRadius ? 'idle' : 'looking',
            targetVelocity: { x: 0, y: 0 },
            distance,
        };
    }

    const isRunning = distance >= MotionTuning.runDistance;
    const speed = isRunning ? MotionTuning.runSpeed : MotionTuning.walkSpeed;

    return {
        state: isRunning ? 'running' : 'walking',
        targetVelocity: {
            x: (offsetX / distance) * speed,
            y: (offsetY / distance) * speed,
        },
        distance,
    };
}

export function directionFromVector(
    vector: Vector,
    fallback: Direction,
): Direction {
    if (Math.abs(vector.x) < 0.1 && Math.abs(vector.y) < 0.1) {
        return fallback;
    }

    if (Math.abs(vector.x) > Math.abs(vector.y)) {
        return vector.x > 0 ? 'right' : 'left';
    }

    return vector.y > 0 ? 'down' : 'up';
}

export function nextLowerQuality(level: QualityLevel): QualityLevel {
    if (level === 'high') {
        return 'medium';
    }

    return 'low';
}

export function characterFrameIndex(
    state: CharacterState,
    elapsedSeconds: number,
): number {
    const frameCount = state === 'walking' || state === 'running' ? 4 : 2;
    const speed = state === 'running' ? 10 : state === 'walking' ? 7 : 2;

    return Math.floor(elapsedSeconds * speed) % frameCount;
}

export function normalizeSeed(input: string): number {
    let seed = 2166136261;

    for (const character of input) {
        seed ^= character.codePointAt(0) ?? 0;
        seed = Math.imul(seed, 16777619);
    }

    return seed >>> 0;
}
