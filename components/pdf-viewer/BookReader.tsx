"use client";

import { useRef } from "react";
import { PDFViewerProvider, usePDFViewer } from "./PDFViewerContext";
import TableOfContents from "./TableOfContents";
import ChapterRenderer from "./ChapterRenderer";
import ChapterNav from "./ChapterNav";
import ReaderToolbar from "./ReaderToolbar";
import HighlightLayer from "./HighlightLayer";
import NotesSidebar from "./NotesSidebar";
import DownloadPanel from "./DownloadPanel";
import ReadingProgressBar from "./ReadingProgressBar";
import { themeClasses } from "@/hooks/useReaderPreferences";
import type { PDFBook, PDFChapter } from "@/data/pdf-books";

interface BookReaderProps {
  book: PDFBook;
  chapter: PDFChapter;
}

export default function BookReader({ book, chapter }: BookReaderProps) {
  return (
    <PDFViewerProvider book={book} currentChapter={chapter}>
      <BookReaderInner chapter={chapter} />
    </PDFViewerProvider>
  );
}

function BookReaderInner({ chapter }: { chapter: PDFChapter }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = usePDFViewer();
  const colors = themeClasses[theme];

  return (
    <div className={`${colors.bg} min-h-screen transition-colors duration-200`}>
      <ReadingProgressBar />

      <div className="flex">
        {/* Sidebar */}
        <TableOfContents />

        {/* Main content area */}
        <main className="flex-1 pb-20 lg:pb-8">
          {/* Chapter header */}
          <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="inline-block rounded-full bg-showcase-purple/10 px-3 py-1 text-xs font-bold text-showcase-purple">
                Chapter {chapter.number}
              </span>
              <h1 className={`mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${colors.text}`}>
                {chapter.title}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {chapter.estimatedReadTime} min read &middot;{" "}
                {chapter.keyTopics.join(", ")}
              </p>
            </div>

            {/* Content with highlight layer */}
            <div ref={contentRef}>
              <ChapterRenderer sections={chapter.sections} />
              <HighlightLayer contentRef={contentRef} />
            </div>

            {/* Chapter navigation */}
            <ChapterNav />
          </div>
        </main>
      </div>

      {/* Floating toolbar */}
      <ReaderToolbar />

      {/* Notes panel */}
      <NotesSidebar />

      {/* Download panel */}
      <DownloadPanel />
    </div>
  );
}
