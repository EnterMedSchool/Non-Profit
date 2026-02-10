"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePDFViewer } from "./PDFViewerContext";

export default function ChapterNav() {
  const { book, currentChapter } = usePDFViewer();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { prev, next } = useMemo(() => {
    const idx = book.chapters.findIndex((c) => c.slug === currentChapter.slug);
    return {
      prev: idx > 0 ? book.chapters[idx - 1] : null,
      next: idx < book.chapters.length - 1 ? book.chapters[idx + 1] : null,
    };
  }, [book, currentChapter.slug]);

  return (
    <nav className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
      {prev ? (
        <Link
          href={`/${locale}/resources/pdfs/${book.slug}/${prev.slug}`}
          className="group flex flex-1 items-center gap-3 rounded-2xl border-3 border-showcase-navy/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-chunky-sm"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-ink-light transition-colors group-hover:text-showcase-purple" />
          <div className="min-w-0 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
              Previous
            </span>
            <p className="mt-0.5 truncate font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple">
              Ch. {prev.number}: {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <Link
          href={`/${locale}/resources/pdfs/${book.slug}`}
          className="group flex flex-1 items-center gap-3 rounded-2xl border-3 border-showcase-navy/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-chunky-sm"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-ink-light transition-colors group-hover:text-showcase-purple" />
          <div className="min-w-0 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
              Back to
            </span>
            <p className="mt-0.5 truncate font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple">
              Book Overview
            </p>
          </div>
        </Link>
      )}

      {next ? (
        <Link
          href={`/${locale}/resources/pdfs/${book.slug}/${next.slug}`}
          className="group flex flex-1 items-center justify-end gap-3 rounded-2xl border-3 border-showcase-navy/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-showcase-teal/30 hover:shadow-chunky-sm"
        >
          <div className="min-w-0 text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
              Next
            </span>
            <p className="mt-0.5 truncate font-display text-sm font-bold text-ink-dark group-hover:text-showcase-teal">
              Ch. {next.number}: {next.title}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink-light transition-colors group-hover:text-showcase-teal" />
        </Link>
      ) : (
        <div className="flex flex-1 items-center justify-end gap-3 rounded-2xl border-3 border-dashed border-showcase-green/30 bg-showcase-green/5 p-4">
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-showcase-green">
              Congratulations!
            </span>
            <p className="mt-0.5 font-display text-sm font-bold text-ink-dark">
              You&apos;ve finished the book
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
