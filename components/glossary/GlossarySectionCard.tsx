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
        className="overflow-hidden rounded-2xl border-3 bg-white shadow-chunky-sm transition-shadow hover:shadow-chunky"
        style={{ borderColor: `${accent}30` }}
      >
        {/* Accent bar */}
        <div className="h-1.5" style={{ backgroundColor: accent }} />

        {/* Header — clickable to toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-dark/[0.02]"
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
        >
          <span className="text-xl flex-shrink-0">{icon}</span>
          <h2
            id={id}
            className="flex-1 font-display text-base font-bold text-ink-dark sm:text-lg"
          >
            {seoHeading || title}
          </h2>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-ink-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Content */}
        <div
          id={`${id}-content`}
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="border-t border-ink-dark/5 px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
