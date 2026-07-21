import type { Vector } from './types';

export class InputController {
    private pointer: Vector = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    };

    private pointerSpeed = 0;
    private lastPointerAt = performance.now();
    private readonly handlePointerMove = (event: PointerEvent): void => {
        const now = performance.now();
        const elapsedSeconds = Math.max(
            (now - this.lastPointerAt) / 1000,
            0.001,
        );
        const distance = Math.hypot(
            event.clientX - this.pointer.x,
            event.clientY - this.pointer.y,
        );
        const instantSpeed = distance / elapsedSeconds;

        this.pointerSpeed += (instantSpeed - this.pointerSpeed) * 0.28;
        this.pointer = { x: event.clientX, y: event.clientY };
        this.lastPointerAt = now;
    };

    public start(): void {
        window.addEventListener('pointermove', this.handlePointerMove, {
            passive: true,
        });
    }

    public update(deltaSeconds: number): void {
        this.pointerSpeed *= Math.exp(-4.5 * deltaSeconds);
    }

    public stop(): void {
        window.removeEventListener('pointermove', this.handlePointerMove);
    }

    public get position(): Vector {
        return this.pointer;
    }

    public get speed(): number {
        return this.pointerSpeed;
    }
}
