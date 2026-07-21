import { CharacterRenderer } from './CharacterRenderer';
import { ChunkCache } from './ChunkCache';
import { CyberGardenPalette, QualityProfiles, WorldConfig } from './config';
import { computeMotion, directionFromVector, hashCoordinate } from './core';
import { InputController } from './InputController';
import { QualityMonitor } from './QualityMonitor';
import type {
    CharacterState,
    Direction,
    QualityLevel,
    QualityProfile,
    Vector,
} from './types';

export class ProceduralBackground {
    private readonly context: CanvasRenderingContext2D;
    private readonly input = new InputController();
    private readonly character: CharacterRenderer;
    private readonly chunks: ChunkCache;
    private readonly qualityMonitor: QualityMonitor;
    private quality: QualityProfile = QualityProfiles.medium;
    private camera: Vector = { x: 0, y: 0 };
    private velocity: Vector = { x: 0, y: 0 };
    private direction: Direction = 'down';
    private characterState: CharacterState = 'idle';
    private surpriseSecondsRemaining = 0;
    private elapsedSeconds = 0;
    private lastFrameAt = 0;
    private animationFrame: number | null = null;
    private isRunning = false;

    private readonly handleResize = (): void => this.resize();
    private readonly handleVisibilityChange = (): void => {
        this.lastFrameAt = performance.now();
    };

    public constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly seed: number,
    ) {
        const context = canvas.getContext('2d', { alpha: false });

        if (!context) {
            throw new Error('Canvas 2D is unavailable for the Cyber Garden.');
        }

        this.context = context;
        this.context.imageSmoothingEnabled = false;
        this.character = new CharacterRenderer(seed ^ 0x7f4a7c15);
        this.chunks = new ChunkCache(seed, this.quality.maxCachedChunks);
        this.qualityMonitor = new QualityMonitor(this.quality.level, (level) =>
            this.applyQuality(level),
        );
    }

    public start(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.resize();
        this.input.start();
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener(
            'visibilitychange',
            this.handleVisibilityChange,
        );
        this.lastFrameAt = performance.now();
        this.animationFrame = requestAnimationFrame(this.frame);
    }

    public destroy(): void {
        this.isRunning = false;
        this.input.stop();
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener(
            'visibilitychange',
            this.handleVisibilityChange,
        );

        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = null;
        this.chunks.clear();
    }

    private readonly frame = (timestamp: number): void => {
        if (!this.isRunning) {
            return;
        }

        this.animationFrame = requestAnimationFrame(this.frame);

        if (document.hidden) {
            this.lastFrameAt = timestamp;

            return;
        }

        const frameInterval = 1000 / this.quality.framesPerSecond;
        const elapsedMilliseconds = timestamp - this.lastFrameAt;

        if (elapsedMilliseconds < frameInterval) {
            return;
        }

        this.lastFrameAt = timestamp - (elapsedMilliseconds % frameInterval);
        const deltaSeconds = Math.min(elapsedMilliseconds / 1000, 0.05);
        const renderStartedAt = performance.now();

        this.update(deltaSeconds);
        this.render();
        this.qualityMonitor.record(performance.now() - renderStartedAt);
    };

    private update(deltaSeconds: number): void {
        this.elapsedSeconds += deltaSeconds;
        this.input.update(deltaSeconds);
        const center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        const motion = computeMotion(
            this.input.position,
            center,
            this.input.speed,
        );

        if (motion.state === 'surprised') {
            this.surpriseSecondsRemaining = WorldConfig.surpriseDuration;
        } else {
            this.surpriseSecondsRemaining = Math.max(
                0,
                this.surpriseSecondsRemaining - deltaSeconds,
            );
        }

        const targetVelocity =
            this.surpriseSecondsRemaining > 0
                ? { x: 0, y: 0 }
                : motion.targetVelocity;
        const acceleration =
            1 - Math.exp(-WorldConfig.acceleration * deltaSeconds);

        this.velocity.x += (targetVelocity.x - this.velocity.x) * acceleration;
        this.velocity.y += (targetVelocity.y - this.velocity.y) * acceleration;
        this.camera.x += this.velocity.x * deltaSeconds;
        this.camera.y += this.velocity.y * deltaSeconds;
        this.characterState =
            this.surpriseSecondsRemaining > 0 ? 'surprised' : motion.state;

        const lookVector =
            Math.hypot(this.velocity.x, this.velocity.y) > 0.4
                ? this.velocity
                : {
                      x: this.input.position.x - center.x,
                      y: this.input.position.y - center.y,
                  };
        this.direction = directionFromVector(lookVector, this.direction);
    }

    private render(): void {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.chunks.drawVisible(
            this.context,
            this.camera.x,
            this.camera.y,
            width,
            height,
        );
        this.drawEnvironment(width, height);
        this.character.draw(
            this.context,
            width / 2,
            height / 2,
            this.direction,
            this.characterState,
            this.elapsedSeconds,
        );

        this.canvas.dataset.quality = this.quality.level;
        this.canvas.dataset.characterState = this.characterState;
        this.canvas.dataset.cachedChunks = this.chunks.size.toString();
    }

    private drawEnvironment(width: number, height: number): void {
        this.context.save();
        this.context.globalCompositeOperation = 'screen';

        for (let index = 0; index < this.quality.particleCount; index += 1) {
            const originX = hashCoordinate(index, 11, this.seed) * width;
            const originY = hashCoordinate(index, 29, this.seed) * height;
            const driftX = Math.sin(this.elapsedSeconds * 0.34 + index) * 9;
            const driftY =
                ((originY - this.elapsedSeconds * (2 + (index % 3))) % height) +
                height;
            const x = (originX + driftX) % width;
            const y = driftY % height;

            this.context.fillStyle =
                index % 3 === 0
                    ? CyberGardenPalette.flower
                    : CyberGardenPalette.grassHighlight;
            this.context.globalAlpha = 0.28 + (index % 4) * 0.08;
            this.context.fillRect(Math.round(x), Math.round(y), 1, 1);
        }

        this.context.restore();
    }

    private applyQuality(level: QualityLevel): void {
        this.quality = QualityProfiles[level];
        this.chunks.setMaxChunks(this.quality.maxCachedChunks);
        this.resize();
    }

    private resize(): void {
        const internalScale = Math.min(
            this.quality.resolutionScale,
            this.quality.maxInternalWidth / window.innerWidth,
            this.quality.maxInternalHeight / window.innerHeight,
        );
        const targetWidth = Math.max(
            240,
            Math.floor(window.innerWidth * internalScale),
        );
        const targetHeight = Math.max(
            135,
            Math.floor(window.innerHeight * internalScale),
        );

        if (
            this.canvas.width === targetWidth &&
            this.canvas.height === targetHeight
        ) {
            return;
        }

        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        this.context.imageSmoothingEnabled = false;
    }
}
