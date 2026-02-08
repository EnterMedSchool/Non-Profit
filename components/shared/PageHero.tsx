"use client";

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
  /** Floating decorative icons (pre-rendered ReactNode) */
  floatingIcons?: React.ReactNode;
}

export default function PageHero({
  titlePre,
  titleHighlight,
  titlePost,
  gradient = "from-showcase-purple via-showcase-teal to-showcase-green",
  annotation,
  annotationColor = "text-showcase-teal",
  subtitle,
  floatingIcons,
}: PageHeroProps) {
  return (
    <AnimatedSection animation="blurIn">
      <div className="relative text-center">
        {/* Floating decorative elements */}
        {floatingIcons && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {floatingIcons}
          </div>
        )}

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
          <div className="relative mx-auto mt-1 inline-block">
            <span
              className={`font-handwritten text-xl sm:text-2xl ${annotationColor}`}
            >
              {annotation}
            </span>
            <svg
              className={`absolute -right-6 -top-3 h-5 w-5 ${annotationColor} opacity-50 rotate-[30deg]`}
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
      </div>
    </AnimatedSection>
  );
}
