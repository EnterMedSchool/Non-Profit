"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { List, ChevronDown } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/* ── Heading extraction (runs client-side on the rendered DOM) ─────── */

function extractHeadings(): TocItem[] {
  const body = document.getElementById("article-body");
  if (!body) return [];

  const headings = body.querySelectorAll("h2, h3");
  const items: TocItem[] = [];

  headings.forEach((el) => {
    const id = el.id;
    if (!id) return;
    items.push({
      id,
      text: el.textContent?.trim() || "",
      level: el.tagName === "H2" ? 2 : 3,
    });
  });

  return items;
}

/* ── Main Component ────────────────────────────────────────────────── */

export default function TableOfContents() {
  const prefersReducedMotion = useReducedMotion();
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Extract headings on mount */
  useEffect(() => {
    // Small delay to let the body render
    const timer = setTimeout(() => {
      setHeadings(extractHeadings());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /* IntersectionObserver for active heading tracking */
  useEffect(() => {
    if (headings.length === 0) return;

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the first visible heading
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the one closest to the top
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

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      setActiveId(id);
      setMobileOpen(false);
    },
    [prefersReducedMotion],
  );

  if (headings.length === 0) return null;

  return (
    <>
      {/* ── Desktop: Sticky sidebar ────────────────────────────────── */}
      <nav
        className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4"
        aria-label="Table of contents"
      >
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/50">
          On this page
        </p>
        <div className="relative border-l-2 border-showcase-navy/10 pl-4">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`
                  group relative block w-full text-left text-sm transition-all duration-200
                  ${item.level === 3 ? "ml-3 py-1" : "py-1.5"}
                  ${
                    isActive
                      ? "font-semibold text-showcase-purple"
                      : "text-ink-muted hover:text-ink-dark"
                  }
                `}
              >
                {/* Active accent bar */}
                {isActive && (
                  <m.div
                    layoutId={prefersReducedMotion ? undefined : "toc-active"}
                    className="absolute -left-[calc(1rem+2px)] top-0 h-full w-0.5 rounded-full bg-showcase-purple"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Dot indicator */}
                <span
                  className={`absolute -left-[calc(1rem+5px)] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-showcase-purple bg-showcase-purple"
                      : "border-showcase-navy/20 bg-white group-hover:border-showcase-purple/50"
                  }`}
                />

                <span className="line-clamp-2">{item.text}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile: Collapsible card ───────────────────────────────── */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border-2 border-showcase-navy/10 bg-white/80 px-4 py-3 text-sm font-bold text-ink-dark backdrop-blur-sm transition-all hover:border-showcase-purple/20"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-showcase-purple" />
            Table of Contents
          </span>
          <ChevronDown
            className={`h-4 w-4 text-ink-muted transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 rounded-xl border-2 border-showcase-navy/10 bg-white/90 p-3 backdrop-blur-sm">
                {headings.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`
                      block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors
                      ${item.level === 3 ? "pl-6" : ""}
                      ${
                        activeId === item.id
                          ? "bg-showcase-purple/10 font-semibold text-showcase-purple"
                          : "text-ink-muted hover:bg-pastel-lavender/50 hover:text-ink-dark"
                      }
                    `}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
