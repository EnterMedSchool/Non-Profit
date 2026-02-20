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
  /** @deprecated No longer rendered */
  floatingIcons?: React.ReactNode;
  /** @deprecated No longer rendered — kept for backward compat */
  meshColors?: string[];
  /** Content rendered inside the hero panel below the subtitle (e.g. stat badges) */
  children?: React.ReactNode;
}

export default function PageHero({
  titlePre,
  titleHighlight,
  titlePost,
  gradient = "from-showcase-purple via-showcase-teal to-showcase-green",
  annotation,
  annotationColor = "text-showcase-teal",
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <AnimatedSection animation="blurIn">
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/60 px-6 py-10 shadow-soft backdrop-blur-sm sm:px-10 sm:py-12 lg:px-16 lg:py-14">
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
