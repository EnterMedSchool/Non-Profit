"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePDFViewer } from "./PDFViewerContext";
import {
  fontSizeClasses,
  themeClasses,
} from "@/hooks/useReaderPreferences";
import type { PDFSection } from "@/data/pdf-books";

interface ChapterRendererProps {
  sections: PDFSection[];
}

export default function ChapterRenderer({ sections }: ChapterRendererProps) {
  const {
    fontSize,
    theme,
    currentChapter,
    readingProgress,
    book,
  } = usePDFViewer();
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Track scroll progress ──
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const elTop = el.offsetTop;
    const scrollTop = window.scrollY - elTop;
    const scrollHeight = el.scrollHeight - window.innerHeight;

    // Guard against division by zero and clamp to 0-100
    if (scrollHeight <= 0) {
      readingProgress.updateChapterProgress(currentChapter.slug, 100);
      return;
    }

    const percent = Math.min(
      100,
      Math.max(0, Math.round((scrollTop / scrollHeight) * 100)),
    );
    readingProgress.updateChapterProgress(currentChapter.slug, percent);
  }, [currentChapter.slug, readingProgress]);

  useEffect(() => {
    // Throttle scroll handler using rAF
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const colors = themeClasses[theme];

  return (
    <div
      ref={contentRef}
      className={`${colors.bg} ${colors.text} rounded-xl p-4 transition-colors duration-200`}
    >
      <article
        className={`prose prose-slate max-w-none ${colors.prose} ${fontSizeClasses[fontSize]} transition-all duration-200`}
      >
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24"
          >
            <h2 className="font-display flex items-baseline gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="font-mono text-base font-semibold text-showcase-purple">
                {section.number}
              </span>
              {section.title}
            </h2>
            <div
              className="chapter-content"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        ))}
      </article>
    </div>
  );
}
