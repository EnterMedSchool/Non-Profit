import AnimatedSection from "@/components/shared/AnimatedSection";

interface PageHeroProps {
  /** Text rendered before the gradient word(s) */
  titlePre?: string;
  /** The word(s) rendered with gradient text */
  titleHighlight: string;
  /** Text rendered after the gradient word(s) */
  titlePost?: string;
  /** Tailwind gradient classes, e.g. "from-showcase-purple via-showcase-teal to-showcase-green" */
  gradient?: string;
  /** Handwritten annotation text shown below the title */
  annotation?: string;
  /** Color class for the annotation text */
  annotationColor?: string;
  /** Subtitle paragraph below the annotation */
  subtitle?: string;
  /** @deprecated Ignored in the new panel design — use meshColors for visual interest */
  floatingIcons?: React.ReactNode;
  /** 2-3 Tailwind bg-color classes for gradient mesh orbs inside the panel */
  meshColors?: string[];
  /** Content rendered inside the hero panel below the subtitle (e.g. stat badges) */
  children?: React.ReactNode;
}

const defaultMeshColors = [
  "bg-showcase-purple/30",
  "bg-showcase-teal/25",
  "bg-showcase-green/20",
];

const orbStyles: { className: string; style?: React.CSSProperties }[] = [
  {
    className:
      "absolute -top-16 -left-16 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl",
  },
  {
    className:
      "absolute -top-10 -right-16 h-60 w-60 sm:h-80 sm:w-80 rounded-full blur-3xl",
  },
  {
    className:
      "absolute -bottom-14 left-1/3 h-52 w-52 sm:h-72 sm:w-72 rounded-full blur-3xl",
  },
];

export default function PageHero({
  titlePre,
  titleHighlight,
  titlePost,
  gradient = "from-showcase-purple via-showcase-teal to-showcase-green",
  annotation,
  annotationColor = "text-showcase-teal",
  subtitle,
  meshColors = defaultMeshColors,
  children,
}: PageHeroProps) {
  return (
    <AnimatedSection animation="blurIn">
      <div className="noise-overlay relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 px-6 py-12 shadow-sm backdrop-blur-sm sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        {/* Gradient mesh orbs */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {meshColors.map((color, i) => {
            const orb = orbStyles[i] ?? orbStyles[0];
            return (
              <div
                key={i}
                className={`${orb.className} ${color}`}
                style={orb.style}
              />
            );
          })}
        </div>

        {/* Dot pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 pattern-dots"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {titlePre && <span className="text-ink-dark">{titlePre} </span>}
            <span
              className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
            >
              {titleHighlight}
            </span>
            {titlePost && <span className="text-ink-dark"> {titlePost}</span>}
          </h1>

          {/* Handwritten annotation */}
          {annotation && (
            <div className="relative mx-auto mt-2 inline-block">
              <span
                className={`font-handwritten text-xl sm:text-2xl ${annotationColor}`}
              >
                {annotation}
              </span>
              <svg
                className={`absolute -right-6 -top-3 h-5 w-5 ${annotationColor} rotate-[30deg] opacity-50`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7M17 7H8M17 7V16" />
              </svg>
            </div>
          )}

          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              {subtitle}
            </p>
          )}

          {/* Children slot — stat badges, CTAs, etc. */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </AnimatedSection>
  );
}
