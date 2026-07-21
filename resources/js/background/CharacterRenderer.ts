import { characterFrameIndex, hashCoordinate } from './core';
import type { CharacterState, Direction } from './types';

type CharacterPalette = {
    hair: string;
    skin: string;
    shirt: string;
    shirtGlow: string;
    trousers: string;
    shoes: string;
};

export class CharacterRenderer {
    private readonly frames = new Map<string, HTMLCanvasElement>();
    private readonly palette: CharacterPalette;

    public constructor(seed: number) {
        this.palette = this.createPalette(seed);
        this.generateFrames();
    }

    public draw(
        context: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        direction: Direction,
        state: CharacterState,
        elapsedSeconds: number,
    ): void {
        const frameIndex = characterFrameIndex(state, elapsedSeconds);
        const frame = this.frames.get(
            this.frameKey(direction, state, frameIndex),
        );

        if (!frame) {
            return;
        }

        context.fillStyle = 'rgba(2, 4, 10, 0.55)';
        context.fillRect(
            Math.round(centerX - 10),
            Math.round(centerY + 12),
            20,
            4,
        );
        context.drawImage(
            frame,
            Math.round(centerX - 12),
            Math.round(centerY - 25),
        );
    }

    private generateFrames(): void {
        const directions: Direction[] = ['up', 'down', 'left', 'right'];
        const states: CharacterState[] = [
            'idle',
            'looking',
            'walking',
            'running',
            'surprised',
        ];

        for (const direction of directions) {
            for (const state of states) {
                const frameCount =
                    state === 'walking' || state === 'running' ? 4 : 2;

                for (let frame = 0; frame < frameCount; frame += 1) {
                    this.frames.set(
                        this.frameKey(direction, state, frame),
                        this.createFrame(direction, state, frame),
                    );
                }
            }
        }
    }

    private createFrame(
        direction: Direction,
        state: CharacterState,
        frame: number,
    ): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 32;
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas 2D is unavailable for the character.');
        }

        context.imageSmoothingEnabled = false;
        const isMoving = state === 'walking' || state === 'running';
        const bob = isMoving && frame % 2 === 1 ? 1 : 0;
        const surprisedLift = state === 'surprised' ? -2 : 0;
        const bodyY = 12 + bob + surprisedLift;
        const horizontalLook =
            direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

        context.fillStyle = this.palette.hair;
        context.fillRect(7, 2 + surprisedLift, 10, 4);
        context.fillRect(5, 5 + surprisedLift, 14, 5);

        context.fillStyle = this.palette.skin;
        context.fillRect(7, 8 + surprisedLift, 10, 6);

        if (direction !== 'up') {
            context.fillStyle = state === 'surprised' ? '#ff4fd8' : '#09111f';
            context.fillRect(9 + horizontalLook, 10 + surprisedLift, 2, 1);
            context.fillRect(14 + horizontalLook, 10 + surprisedLift, 2, 1);
        }

        context.fillStyle = this.palette.shirt;
        context.fillRect(6, bodyY, 12, 9);
        context.fillStyle = this.palette.shirtGlow;
        context.fillRect(direction === 'left' ? 6 : 15, bodyY + 2, 3, 5);

        const stride = isMoving ? (frame % 4 < 2 ? -2 : 2) : 0;
        context.fillStyle = this.palette.skin;
        context.fillRect(4 + stride, bodyY + 1, 2, 7);
        context.fillRect(18 - stride, bodyY + 1, 2, 7);

        context.fillStyle = this.palette.trousers;
        context.fillRect(7, bodyY + 9, 4, 7 + Math.max(0, stride));
        context.fillRect(13, bodyY + 9, 4, 7 + Math.max(0, -stride));

        context.fillStyle = this.palette.shoes;
        context.fillRect(6, bodyY + 15 + Math.max(0, stride), 5, 2);
        context.fillRect(13, bodyY + 15 + Math.max(0, -stride), 5, 2);

        return canvas;
    }

    private createPalette(seed: number): CharacterPalette {
        const skinTones = ['#ffd0a6', '#d99568', '#9c6247', '#6d4338'];
        const hairColors = ['#090b13', '#3b2142', '#1a3154', '#5a2b20'];
        const index = Math.floor(hashCoordinate(2, 7, seed) * skinTones.length);
        const hairIndex = Math.floor(
            hashCoordinate(9, 3, seed) * hairColors.length,
        );

        return {
            skin: skinTones[index] ?? skinTones[0],
            hair: hairColors[hairIndex] ?? hairColors[0],
            shirt: hashCoordinate(4, 8, seed) > 0.5 ? '#9cff57' : '#ff4fd8',
            shirtGlow: hashCoordinate(4, 8, seed) > 0.5 ? '#e1ffb8' : '#ffb4ed',
            trousers: '#17233f',
            shoes: '#66a3ff',
        };
    }

    private frameKey(
        direction: Direction,
        state: CharacterState,
        frame: number,
    ): string {
        return `${direction}:${state}:${frame}`;
    }
}
