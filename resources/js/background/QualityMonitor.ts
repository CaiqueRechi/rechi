import { WorldConfig } from './config';
import { nextLowerQuality } from './core';
import type { QualityLevel } from './types';

export class QualityMonitor {
    private measuredFrames = 0;
    private accumulatedRenderTime = 0;

    public constructor(
        private quality: QualityLevel,
        private readonly onQualityChanged: (quality: QualityLevel) => void,
    ) {}

    public record(renderTime: number): void {
        this.measuredFrames += 1;
        this.accumulatedRenderTime += renderTime;

        if (this.measuredFrames < WorldConfig.performanceSampleSize) {
            return;
        }

        const averageRenderTime =
            this.accumulatedRenderTime / this.measuredFrames;
        this.measuredFrames = 0;
        this.accumulatedRenderTime = 0;

        if (
            averageRenderTime <= WorldConfig.slowFrameThreshold ||
            this.quality === 'low'
        ) {
            return;
        }

        this.quality = nextLowerQuality(this.quality);
        this.onQualityChanged(this.quality);
    }
}
