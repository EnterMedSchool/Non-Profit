"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TocSection {
  id: string;
  label: string;
  icon: string;
}

interface GlossaryTableOfContentsProps {
  sections: TocSection[];
}

export default function GlossaryTableOfContents({
  sections,
}: GlossaryTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        const sorted = [...visible].sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveId(sorted[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
    setMobileOpen(false);
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <nav
        className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
        aria-label="Table of contents"
      >
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/50">
          On this page
        </p>
        <div className="relative border-l-2 border-showcase-navy/10 pl-3 space-y-0.5">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={cn(
                  "group relative flex w-full items-center gap-2 rounded-r-lg py-1.5 pl-2 pr-1 text-left text-[13px] leading-snug transition-all duration-200",
                  isActive
                    ? "bg-showcase-purple/5 font-semibold text-showcase-purple"
                    : "text-ink-muted hover:text-ink-dark hover:bg-ink-dark/[0.02]",
                )}
              >
                {isActive && (
                  <div className="absolute -left-[calc(0.75rem+2px)] top-0 h-full w-0.5 rounded-full bg-showcase-purple" />
                )}
                <span className="flex-shrink-0 text-xs">{section.icon}</span>
                <span className="line-clamp-1">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile: Collapsible card */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border-2 border-showcase-navy/10 bg-white/80 px-4 py-3 text-sm font-bold text-ink-dark backdrop-blur-sm transition-all hover:border-showcase-purple/20"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-showcase-purple" />
            On this page
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-muted transition-transform duration-200",
              mobileOpen && "rotate-180",
            )}
          />
        </button>

        {mobileOpen && (
          <div className="mt-1 rounded-xl border-2 border-showcase-navy/10 bg-white/90 p-2 backdrop-blur-sm">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeId === section.id
                    ? "bg-showcase-purple/10 font-semibold text-showcase-purple"
                    : "text-ink-muted hover:bg-pastel-lavender/50 hover:text-ink-dark",
                )}
              >
                <span className="text-xs">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
