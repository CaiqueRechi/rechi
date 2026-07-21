import assert from 'node:assert/strict';
import test from 'node:test';
import {
    characterFrameIndex,
    computeMotion,
    directionFromVector,
    hashCoordinate,
    nextLowerQuality,
    normalizeSeed,
    sampleTerrain,
    valueNoise,
} from '../../resources/js/background/core.ts';

test('the same seed and coordinates always produce the same world', () => {
    const seed = normalizeSeed('cyber-garden-test');
    const firstSample = sampleTerrain(124, -37, seed);
    const secondSample = sampleTerrain(124, -37, seed);

    assert.equal(firstSample, secondSample);
    assert.equal(hashCoordinate(9, 14, seed), hashCoordinate(9, 14, seed));
    assert.equal(valueNoise(4.25, 7.75, seed), valueNoise(4.25, 7.75, seed));
});

test('terrain sampling returns only supported Cyber Garden biomes', () => {
    const supportedBiomes = new Set([
        'deepWater',
        'water',
        'moss',
        'grass',
        'rock',
    ]);
    const seed = normalizeSeed('biome-coverage');

    for (let coordinate = -120; coordinate <= 120; coordinate += 8) {
        assert.ok(
            supportedBiomes.has(sampleTerrain(coordinate, coordinate / 2, seed)),
        );
    }
});

test('pointer distance selects idle, looking, walking and running states', () => {
    const center = { x: 500, y: 400 };

    assert.equal(computeMotion(center, center, 0).state, 'idle');
    assert.equal(computeMotion({ x: 530, y: 400 }, center, 0).state, 'looking');
    assert.equal(computeMotion({ x: 650, y: 400 }, center, 0).state, 'walking');
    assert.equal(computeMotion({ x: 900, y: 400 }, center, 0).state, 'running');
    assert.equal(computeMotion({ x: 650, y: 400 }, center, 1200).state, 'surprised');
});

test('motion vectors are normalized and directions remain stable at rest', () => {
    const motion = computeMotion({ x: 800, y: 400 }, { x: 500, y: 400 }, 0);

    assert.equal(Math.round(Math.hypot(motion.targetVelocity.x, motion.targetVelocity.y)), 39);
    assert.equal(directionFromVector(motion.targetVelocity, 'down'), 'right');
    assert.equal(directionFromVector({ x: 0, y: 0 }, 'left'), 'left');
});

test('quality degrades one level at a time and animation frames stay bounded', () => {
    assert.equal(nextLowerQuality('high'), 'medium');
    assert.equal(nextLowerQuality('medium'), 'low');
    assert.equal(nextLowerQuality('low'), 'low');
    assert.ok(characterFrameIndex('walking', 12.5) >= 0);
    assert.ok(characterFrameIndex('walking', 12.5) < 4);
    assert.ok(characterFrameIndex('idle', 12.5) < 2);
});
