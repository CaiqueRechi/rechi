type Star = {
    left: string;
    opacity: number;
    size: number;
    top: string;
};

const stars: Star[] = Array.from({ length: 64 }, (_, index) => ({
    left: `${(index * 37 + 11) % 101}%`,
    opacity: 0.2 + ((index * 17) % 55) / 100,
    size: index % 11 === 0 ? 2 : 1,
    top: `${(index * 61 + 7) % 97}%`,
}));

export default function GalaxyBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 overflow-hidden bg-[linear-gradient(145deg,#05070e_0%,#090819_42%,#07111d_72%,#05070e_100%)]"
        >
            <div className="absolute -inset-[18%] animate-[me-galaxy-drift_48s_ease-in-out_infinite] rounded-[45%] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,.28)_0%,rgba(76,29,149,.14)_36%,transparent_70%)] blur-3xl motion-reduce:animate-none" />
            <div className="absolute -top-[20%] -right-[15%] h-[75%] w-[80%] animate-[me-nebula-breathe_38s_ease-in-out_infinite] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,.22)_0%,rgba(59,130,246,.1)_42%,transparent_72%)] blur-3xl motion-reduce:animate-none" />
            <div className="absolute -bottom-[22%] -left-[18%] h-[75%] w-[85%] animate-[me-nebula-breathe_52s_ease-in-out_infinite_reverse] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(192,132,252,.2)_0%,rgba(88,28,135,.09)_45%,transparent_72%)] blur-3xl motion-reduce:animate-none" />
            <div className="absolute top-1/2 left-1/2 h-[30rem] w-[120vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 animate-[me-galaxy-band_70s_ease-in-out_infinite] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(186,230,253,.1)_0%,rgba(139,92,246,.08)_28%,transparent_68%)] blur-2xl motion-reduce:animate-none" />

            <div className="absolute -inset-[8%] animate-[me-star-drift_110s_linear_infinite] will-change-transform motion-reduce:animate-none">
                {stars.map((star, index) => (
                    <span
                        key={index}
                        className="absolute rounded-full bg-sky-100 shadow-[0_0_5px_rgba(186,230,253,.65)]"
                        style={{
                            height: star.size,
                            left: star.left,
                            opacity: star.opacity,
                            top: star.top,
                            width: star.size,
                        }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(2,4,10,.72)_100%)]" />
        </div>
    );
}
