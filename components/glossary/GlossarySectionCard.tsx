"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface GlossarySectionCardProps {
  id: string;
  title: string;
  icon: string;
  accent: string;
  /** H2 heading text for SEO (may differ from title) */
  seoHeading?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function GlossarySectionCard({
  id,
  title,
  icon,
  accent,
  seoHeading,
  children,
  defaultOpen = true,
}: GlossarySectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section aria-labelledby={id} className="scroll-mt-20">
      <div
        className="overflow-hidden rounded-2xl border-2 bg-white transition-shadow hover:shadow-md"
        style={{ borderColor: `${accent}25` }}
      >
        {/* Accent bar */}
        <div className="h-1" style={{ backgroundColor: accent }} />

        {/* Header -- clickable to toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ink-dark/[0.02]"
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
        >
          <span className="text-lg flex-shrink-0">{icon}</span>
          <h2
            id={id}
            className="flex-1 font-display text-base font-bold text-ink-dark"
          >
            {seoHeading || title}
          </h2>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Content -- uses display:none instead of max-h for SEO safety */}
        <div
          id={`${id}-content`}
          className={cn(!isOpen && "hidden")}
        >
          <div className="border-t px-5 py-4" style={{ borderColor: `${accent}15` }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
