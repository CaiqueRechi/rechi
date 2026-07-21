import { useEffect, useRef } from 'react';

const canLoadProceduralBackground = (): boolean => {
    const connection = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    return (
        window.matchMedia('(min-width: 1024px)').matches &&
        window.matchMedia('(pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        !connection?.saveData
    );
};

export default function ProceduralBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canLoadProceduralBackground()) {
            return;
        }

        let isMounted = true;
        let destroy: (() => void) | undefined;

        import('@/background/bootstrap')
            .then(({ startProceduralBackground }) => {
                if (!isMounted) {
                    return;
                }

                destroy = startProceduralBackground(canvas).destroy;
                canvas.dataset.status = 'running';
            })
            .catch(() => {
                canvas.dataset.status = 'unavailable';
            });

        return () => {
            isMounted = false;
            destroy?.();
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden lg:block"
        >
            <canvas
                ref={canvasRef}
                className="size-full opacity-30 [image-rendering:pixelated] dark:opacity-55"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(242,240,232,.72)_72%,rgba(242,240,232,.94)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,11,13,.58)_70%,rgba(9,11,13,.92)_100%)]" />
        </div>
    );
}
