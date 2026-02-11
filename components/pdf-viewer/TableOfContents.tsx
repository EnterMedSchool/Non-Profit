"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  X,
} from "lucide-react";
import { usePDFViewer } from "./PDFViewerContext";

export default function TableOfContents() {
  const { book, currentChapter, readingProgress, sidebarOpen, setSidebarOpen } =
    usePDFViewer();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set([currentChapter.slug]),
  );

  const toggleChapter = (slug: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const overallProgress = readingProgress.getOverallProgress(
    book.chapters.length,
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <m.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r-3 border-showcase-navy/10 bg-white shadow-lg lg:sticky lg:top-20 lg:z-10 lg:h-[calc(100vh-5rem)] lg:shadow-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-showcase-purple" />
                <span className="font-display text-sm font-bold text-ink-dark">
                  Table of Contents
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-gray-100 lg:hidden"
                aria-label={t("ariaCloseToc")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>{t("completePercent", { percent: overallProgress })}</span>
                <span>
                  {t("chaptersCount", {
                    completed: Object.values(readingProgress.progress.chapters).filter(
                      (c) => c.completed,
                    ).length,
                    total: book.chapters.length,
                  })}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <m.div
                  className="h-full rounded-full bg-gradient-to-r from-showcase-purple to-showcase-teal"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Chapter list */}
            <nav className="flex-1 overflow-y-auto px-2 py-2">
              <ul className="space-y-1">
                {book.chapters.map((chapter) => {
                  const isActive = chapter.slug === currentChapter.slug;
                  const isExpanded = expandedChapters.has(chapter.slug);
                  const chProgress =
                    readingProgress.getChapterProgress(chapter.slug);
                  const isComplete = chProgress?.completed ?? false;

                  return (
                    <li key={chapter.id}>
                      {/* Chapter header */}
                      <div
                        className={`group flex items-start gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                          isActive
                            ? "bg-showcase-purple/10 text-showcase-purple"
                            : "text-ink-dark hover:bg-gray-50"
                        }`}
                      >
                        <button
                          onClick={() => toggleChapter(chapter.slug)}
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <Link
                          href={`/${locale}/resources/pdfs/${book.slug}/${chapter.slug}`}
                          className="flex-1"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-light">
                              {t("chPrefix")} {chapter.number}
                            </span>
                            {isComplete && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-showcase-green" />
                            )}
                          </div>
                          <span
                            className={`block text-sm font-semibold leading-snug ${isActive ? "text-showcase-purple" : ""}`}
                          >
                            {chapter.title}
                          </span>
                        </Link>
                      </div>

                      {/* Sections */}
                      <AnimatePresence>
                        {isExpanded && (
                          <m.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-7 overflow-hidden border-l-2 border-gray-100 pl-3"
                          >
                            {chapter.sections.map((section) => (
                              <li key={section.id}>
                                <Link
                                  href={`/${locale}/resources/pdfs/${book.slug}/${chapter.slug}#${section.id}`}
                                  className={`block rounded-lg px-2 py-1.5 text-xs transition-colors ${
                                    isActive
                                      ? "text-showcase-purple/80 hover:bg-showcase-purple/5"
                                      : "text-ink-muted hover:bg-gray-50 hover:text-ink-dark"
                                  }`}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <span className="mr-1.5 font-mono text-[10px] text-ink-light">
                                    {section.number}
                                  </span>
                                  {section.title}
                                </Link>
                              </li>
                            ))}
                          </m.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Book info footer */}
            <div className="border-t-2 border-showcase-navy/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-light">
                {book.subject}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                v{book.version} &middot; {book.totalPages} {t("pages")}
              </p>
            </div>
          </m.aside>
        )}
      </AnimatePresence>
    </>
  );
}
