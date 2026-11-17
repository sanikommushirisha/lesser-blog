// The /business/partnerships hero background (faint grid, soft green glows,
// two floating tiles and rising dots), reused behind the Resources pages
// (NRI services, free passport forms). Sits at the top of a `relative`
// wrapper, fades out into the white page, and never takes clicks.

export default function PageBackdrop({ height = 900 }: { height?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      style={{ height }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="resources-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#resources-grid)" style={{ animation: "hero-grid-draw 2s ease-out forwards" }} />
      </svg>

      <div className="absolute left-[8%] top-[15%] h-72 w-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(3,79,70,0.15) 0%, transparent 70%)", animation: "hero-glow-pulse 6s ease-in-out infinite" }} />
      <div className="absolute bottom-[10%] right-[5%] h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(3,79,70,0.12) 0%, transparent 70%)", animation: "hero-glow-pulse 8s ease-in-out infinite 2s" }} />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(3,79,70,0.08) 0%, transparent 60%)", animation: "hero-glow-pulse 10s ease-in-out infinite 1s" }} />

      <div className="absolute right-[15%] top-[20%]" style={{ animation: "hero-float-1 8s ease-in-out infinite" }}>
        <div className="h-16 w-16 rotate-12 rounded-2xl border border-primary/10 bg-primary/[0.03] backdrop-blur-sm" style={{ boxShadow: "0 8px 32px rgba(3,79,70,0.06)" }} />
      </div>
      <div className="absolute bottom-[25%] left-[10%]" style={{ animation: "hero-float-2 10s ease-in-out infinite" }}>
        <div className="h-12 w-12 -rotate-6 rounded-xl border border-primary/10 bg-primary/[0.02] backdrop-blur-sm" style={{ boxShadow: "0 8px 32px rgba(3,79,70,0.04)" }} />
      </div>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/20"
          style={{ left: `${15 + i * 14}%`, bottom: "0%", animation: `hero-particle-drift ${8 + i * 2}s linear infinite ${i * 1.5}s` }}
        />
      ))}
    </div>
  );
}
