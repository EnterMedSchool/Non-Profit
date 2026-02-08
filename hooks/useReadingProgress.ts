"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChapterProgress {
  chapterSlug: string;
  /** Percentage scrolled (0–100) */
  scrollPercent: number;
  /** Whether the user has reached the bottom of the chapter */
  completed: boolean;
  lastReadAt: string;
}

interface ReadingProgress {
  chapters: Record<string, ChapterProgress>;
  lastChapterSlug: string | null;
  updatedAt: string;
}

// ─── localStorage helpers ───────────────────────────────────────────────────

function getStorageKey(bookSlug: string): string {
  return `ems-pdf-${bookSlug}-progress`;
}

function readProgress(bookSlug: string): ReadingProgress {
  const defaultProgress: ReadingProgress = {
    chapters: {},
    lastChapterSlug: null,
    updatedAt: new Date().toISOString(),
  };
  try {
    const raw = localStorage.getItem(getStorageKey(bookSlug));
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ReadingProgress>;
    return {
      chapters:
        parsed.chapters && typeof parsed.chapters === "object"
          ? parsed.chapters
          : {},
      lastChapterSlug:
        typeof parsed.lastChapterSlug === "string"
          ? parsed.lastChapterSlug
          : null,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return defaultProgress;
  }
}

function writeProgress(bookSlug: string, progress: ReadingProgress): void {
  try {
    localStorage.setItem(getStorageKey(bookSlug), JSON.stringify(progress));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useReadingProgress(bookSlug: string) {
  const [progress, setProgress] = useState<ReadingProgress>({
    chapters: {},
    lastChapterSlug: null,
    updatedAt: new Date().toISOString(),
  });

  // Load on mount
  useEffect(() => {
    setProgress(readProgress(bookSlug));
  }, [bookSlug]);

  const updateChapterProgress = useCallback(
    (chapterSlug: string, scrollPercent: number) => {
      setProgress((prev) => {
        const existing = prev.chapters[chapterSlug];
        const completed =
          scrollPercent >= 95 || (existing?.completed ?? false);
        const updated: ReadingProgress = {
          chapters: {
            ...prev.chapters,
            [chapterSlug]: {
              chapterSlug,
              scrollPercent,
              completed,
              lastReadAt: new Date().toISOString(),
            },
          },
          lastChapterSlug: chapterSlug,
          updatedAt: new Date().toISOString(),
        };
        writeProgress(bookSlug, updated);
        return updated;
      });
    },
    [bookSlug],
  );

  const markChapterComplete = useCallback(
    (chapterSlug: string) => {
      setProgress((prev) => {
        const updated: ReadingProgress = {
          chapters: {
            ...prev.chapters,
            [chapterSlug]: {
              chapterSlug,
              scrollPercent: 100,
              completed: true,
              lastReadAt: new Date().toISOString(),
            },
          },
          lastChapterSlug: chapterSlug,
          updatedAt: new Date().toISOString(),
        };
        writeProgress(bookSlug, updated);
        return updated;
      });
    },
    [bookSlug],
  );

  const getChapterProgress = useCallback(
    (chapterSlug: string): ChapterProgress | null => {
      return progress.chapters[chapterSlug] ?? null;
    },
    [progress],
  );

  const getOverallProgress = useCallback(
    (totalChapters: number): number => {
      if (totalChapters === 0) return 0;
      const completedCount = Object.values(progress.chapters).filter(
        (c) => c.completed,
      ).length;
      return Math.round((completedCount / totalChapters) * 100);
    },
    [progress],
  );

  const resetProgress = useCallback(() => {
    const fresh: ReadingProgress = {
      chapters: {},
      lastChapterSlug: null,
      updatedAt: new Date().toISOString(),
    };
    writeProgress(bookSlug, fresh);
    setProgress(fresh);
  }, [bookSlug]);

  return {
    progress,
    lastChapterSlug: progress.lastChapterSlug,
    updateChapterProgress,
    markChapterComplete,
    getChapterProgress,
    getOverallProgress,
    resetProgress,
  };
}
