import { CyberGardenPalette, WorldConfig } from './config';
import { hashCoordinate, sampleTerrain } from './core';

type CachedChunk = {
    canvas: HTMLCanvasElement;
    lastUsedAt: number;
};

export class ChunkCache {
    private readonly chunks = new Map<string, CachedChunk>();

    public constructor(
        private readonly seed: number,
        private maxChunks: number,
    ) {}

    public setMaxChunks(maxChunks: number): void {
        this.maxChunks = maxChunks;
        this.prune();
    }

    public drawVisible(
        context: CanvasRenderingContext2D,
        cameraX: number,
        cameraY: number,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const chunkSize = WorldConfig.chunkSize;
        const cellSize = WorldConfig.cellSize;
        const halfCellsWide = viewportWidth / cellSize / 2;
        const halfCellsHigh = viewportHeight / cellSize / 2;
        const startChunkX =
            Math.floor((cameraX - halfCellsWide) / chunkSize) - 1;
        const endChunkX = Math.floor((cameraX + halfCellsWide) / chunkSize) + 1;
        const startChunkY =
            Math.floor((cameraY - halfCellsHigh) / chunkSize) - 1;
        const endChunkY = Math.floor((cameraY + halfCellsHigh) / chunkSize) + 1;

        context.fillStyle = CyberGardenPalette.shadow;
        context.fillRect(0, 0, viewportWidth, viewportHeight);

        for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY += 1) {
            for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
                const chunk = this.getChunk(chunkX, chunkY);
                const drawX = Math.round(
                    (chunkX * chunkSize - cameraX) * cellSize +
                        viewportWidth / 2,
                );
                const drawY = Math.round(
                    (chunkY * chunkSize - cameraY) * cellSize +
                        viewportHeight / 2,
                );

                context.drawImage(chunk, drawX, drawY);
            }
        }

        this.prune();
    }

    public clear(): void {
        this.chunks.clear();
    }

    public get size(): number {
        return this.chunks.size;
    }

    private getChunk(chunkX: number, chunkY: number): HTMLCanvasElement {
        const key = `${chunkX}:${chunkY}`;
        const cached = this.chunks.get(key);

        if (cached) {
            cached.lastUsedAt = performance.now();

            return cached.canvas;
        }

        const canvas = this.generateChunk(chunkX, chunkY);
        this.chunks.set(key, { canvas, lastUsedAt: performance.now() });

        return canvas;
    }

    private generateChunk(chunkX: number, chunkY: number): HTMLCanvasElement {
        const chunkSize = WorldConfig.chunkSize;
        const cellSize = WorldConfig.cellSize;
        const canvas = document.createElement('canvas');
        canvas.width = chunkSize * cellSize;
        canvas.height = chunkSize * cellSize;
        const context = canvas.getContext('2d', { alpha: false });

        if (!context) {
            throw new Error('Canvas 2D is unavailable for procedural chunks.');
        }

        context.imageSmoothingEnabled = false;

        for (let localY = 0; localY < chunkSize; localY += 1) {
            for (let localX = 0; localX < chunkSize; localX += 1) {
                const worldX = chunkX * chunkSize + localX;
                const worldY = chunkY * chunkSize + localY;
                const terrain = sampleTerrain(worldX, worldY, this.seed);
                const detail = hashCoordinate(
                    worldX,
                    worldY,
                    this.seed ^ 0x51ed270b,
                );

                context.fillStyle = CyberGardenPalette[terrain];
                context.fillRect(
                    localX * cellSize,
                    localY * cellSize,
                    cellSize,
                    cellSize,
                );

                this.drawTerrainDetail(
                    context,
                    terrain,
                    detail,
                    localX * cellSize,
                    localY * cellSize,
                );
            }
        }

        return canvas;
    }

    private drawTerrainDetail(
        context: CanvasRenderingContext2D,
        terrain: ReturnType<typeof sampleTerrain>,
        detail: number,
        x: number,
        y: number,
    ): void {
        if ((terrain === 'deepWater' || terrain === 'water') && detail > 0.94) {
            context.fillStyle = CyberGardenPalette.waterGlow;
            context.fillRect(x, y, 1, 1);

            return;
        }

        if ((terrain === 'grass' || terrain === 'moss') && detail > 0.965) {
            context.fillStyle =
                detail > 0.988
                    ? CyberGardenPalette.flower
                    : CyberGardenPalette.grassHighlight;
            context.fillRect(x + 1, y, 1, 1);

            return;
        }

        if (terrain === 'rock' && detail > 0.9) {
            context.fillStyle = CyberGardenPalette.rockHighlight;
            context.fillRect(x, y, 1, 1);
        }
    }

    private prune(): void {
        if (this.chunks.size <= this.maxChunks) {
            return;
        }

        const oldestChunks = [...this.chunks.entries()]
            .sort(([, left], [, right]) => left.lastUsedAt - right.lastUsedAt)
            .slice(0, this.chunks.size - this.maxChunks);

        for (const [key] of oldestChunks) {
            this.chunks.delete(key);
        }
    }
}
