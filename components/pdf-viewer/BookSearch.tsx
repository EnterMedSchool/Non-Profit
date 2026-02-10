"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePDFViewer } from "./PDFViewerContext";

interface SearchResult {
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  sectionTitle: string;
  sectionId: string;
  /** The matched text with surrounding context */
  excerpt: string;
  /** Position of the match within the excerpt for highlighting */
  matchStart: number;
  matchLength: number;
}

export default function BookSearch() {
  const { book } = usePDFViewer();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search through all chapter content
  const results = useMemo((): SearchResult[] => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];

    const results: SearchResult[] = [];
    const lowerQuery = debouncedQuery.toLowerCase();

    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        // Strip HTML tags to get plain text
        const plainText = section.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
        const lowerText = plainText.toLowerCase();

        let searchFrom = 0;
        while (searchFrom < lowerText.length) {
          const idx = lowerText.indexOf(lowerQuery, searchFrom);
          if (idx === -1) break;

          // Extract context around the match
          const contextStart = Math.max(0, idx - 40);
          const contextEnd = Math.min(plainText.length, idx + debouncedQuery.length + 40);
          const excerpt = (contextStart > 0 ? "..." : "") +
            plainText.slice(contextStart, contextEnd).trim() +
            (contextEnd < plainText.length ? "..." : "");

          const matchStart = idx - contextStart + (contextStart > 0 ? 3 : 0);

          results.push({
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            chapterNumber: chapter.number,
            sectionTitle: section.title,
            sectionId: section.id,
            excerpt,
            matchStart,
            matchLength: debouncedQuery.length,
          });

          searchFrom = idx + debouncedQuery.length;

          // Limit results per section
          if (results.length >= 50) break;
        }

        if (results.length >= 50) break;
      }
      if (results.length >= 50) break;
    }

    return results;
  }, [query, book.chapters]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  return (
    <>
      {/* Search trigger button (rendered externally via ReaderToolbar) */}
      {isOpen && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          <m.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search in book"
            className="fixed left-1/2 top-[8vh] z-[91] w-[94vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b-2 border-showcase-navy/10 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-ink-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this book..."
                className="flex-1 bg-transparent text-sm text-ink-dark outline-none placeholder:text-ink-light"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="shrink-0 text-ink-light hover:text-ink-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-ink-muted hover:bg-gray-100"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {debouncedQuery.length < 2 ? (
                <div className="px-4 py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-ink-light/40" />
                  <p className="mt-2 text-sm text-ink-muted">
                    Type at least 2 characters to search
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-ink-muted">
                    No results found for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light">
                      {results.length} result{results.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  {results.map((result, i) => (
                    <Link
                      key={`${result.sectionId}-${i}`}
                      href={`/${locale}/resources/pdfs/${book.slug}/${result.chapterSlug}#${result.sectionId}`}
                      onClick={handleClose}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-showcase-purple">
                            Ch. {result.chapterNumber}
                          </span>
                          <ChevronRight className="h-3 w-3 text-ink-light" />
                          <span className="text-[10px] font-semibold text-ink-muted truncate">
                            {result.sectionTitle}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                          {result.excerpt.slice(0, result.matchStart)}
                          <mark className="rounded bg-yellow-200 px-0.5 font-semibold text-ink-dark">
                            {result.excerpt.slice(
                              result.matchStart,
                              result.matchStart + result.matchLength,
                            )}
                          </mark>
                          {result.excerpt.slice(result.matchStart + result.matchLength)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </m.div>
        </AnimatePresence>
      )}
    </>
  );
}

// Export a function to programmatically open search
export function useBookSearch() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
