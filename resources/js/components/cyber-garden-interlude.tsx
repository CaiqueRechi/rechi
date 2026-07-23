import { useEffect, useRef, useState } from 'react';

type CyberGardenInterludeProps = {
    onVisibilityChange: (isVisible: boolean) => void;
};

export default function CyberGardenInterlude({
    onVisibilityChange,
}: CyberGardenInterludeProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section || !('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const shouldReveal =
                    entry.isIntersecting && entry.intersectionRatio >= 0.3;

                setIsVisible(shouldReveal);
                onVisibilityChange(shouldReveal);
            },
            { threshold: [0, 0.3, 0.65] },
        );

        observer.observe(section);

        return () => {
            observer.disconnect();
            onVisibilityChange(false);
        };
    }, [onVisibilityChange]);

    return (
        <section
            ref={sectionRef}
            aria-label="Cyber Garden observation window"
            className="hidden lg:relative lg:left-1/2 lg:my-12 lg:block lg:h-[90svh] lg:w-screen lg:-translate-x-1/2 xl:my-16"
        >
            <div className="relative h-full overflow-hidden">
                <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[18svh] bg-linear-to-b from-[#f2f0e8]/90 via-[#f2f0e8]/30 to-transparent transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none dark:from-[#090b0d]/90 dark:via-[#090b0d]/30 ${
                        isVisible
                            ? 'translate-y-0 opacity-80'
                            : '-translate-y-5 opacity-100'
                    }`}
                />
                <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[18svh] bg-linear-to-t from-[#f2f0e8]/90 via-[#f2f0e8]/30 to-transparent transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none dark:from-[#090b0d]/90 dark:via-[#090b0d]/30 ${
                        isVisible
                            ? 'translate-y-0 opacity-80'
                            : 'translate-y-5 opacity-100'
                    }`}
                />
                <div
                    aria-hidden="true"
                    className={`absolute inset-7 origin-center border-x border-fuchsia-600/10 transition-[opacity,transform] delay-150 duration-1000 ease-out motion-reduce:transition-none dark:border-lime-300/10 ${
                        isVisible
                            ? 'scale-y-100 opacity-100'
                            : 'scale-y-75 opacity-0'
                    }`}
                />
                <div
                    aria-hidden="true"
                    className={`absolute top-1/2 left-1/2 size-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/8 blur-3xl transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-none dark:bg-lime-300/6 ${
                        isVisible
                            ? 'scale-100 opacity-100'
                            : 'scale-75 opacity-0'
                    }`}
                />
                <span className="sr-only">
                    A clear observation window reveals the animated Cyber Garden
                    and its character.
                </span>
            </div>
        </section>
    );
}
