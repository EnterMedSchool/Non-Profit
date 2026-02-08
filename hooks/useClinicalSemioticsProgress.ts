"use client";

import { useCallback, useEffect, useState } from "react";

interface ClinicalSemioticsProgress {
  completedSegments: string[];
  lastSegmentId: string | null;
  updatedAt: string;
}

const STORAGE_PREFIX = "cs-progress-";

function getStorageKey(examType: string): string {
  return `${STORAGE_PREFIX}${examType}`;
}

function readProgress(examType: string): ClinicalSemioticsProgress {
  const defaultProgress: ClinicalSemioticsProgress = {
    completedSegments: [],
    lastSegmentId: null,
    updatedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(getStorageKey(examType));
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ClinicalSemioticsProgress>;
    return {
      completedSegments: Array.isArray(parsed.completedSegments)
        ? parsed.completedSegments
        : [],
      lastSegmentId:
        typeof parsed.lastSegmentId === "string"
          ? parsed.lastSegmentId
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

function writeProgress(
  examType: string,
  progress: ClinicalSemioticsProgress
): void {
  try {
    localStorage.setItem(getStorageKey(examType), JSON.stringify(progress));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Hook for managing clinical semiotics exam progress in localStorage.
 * Stores completed segments and last position per exam type.
 */
export function useClinicalSemioticsProgress(examType: string | null) {
  const [progress, setProgress] = useState<ClinicalSemioticsProgress>({
    completedSegments: [],
    lastSegmentId: null,
    updatedAt: new Date().toISOString(),
  });

  // Load progress on mount and when examType changes
  useEffect(() => {
    if (!examType) return;
    setProgress(readProgress(examType));
  }, [examType]);

  const saveSegmentProgress = useCallback(
    (segmentId: string) => {
      if (!examType) return;
      setProgress((prev) => {
        const updated: ClinicalSemioticsProgress = {
          completedSegments: prev.completedSegments.includes(segmentId)
            ? prev.completedSegments
            : [...prev.completedSegments, segmentId],
          lastSegmentId: segmentId,
          updatedAt: new Date().toISOString(),
        };
        writeProgress(examType, updated);
        return updated;
      });
    },
    [examType]
  );

  const resetProgress = useCallback(() => {
    if (!examType) return;
    const fresh: ClinicalSemioticsProgress = {
      completedSegments: [],
      lastSegmentId: null,
      updatedAt: new Date().toISOString(),
    };
    writeProgress(examType, fresh);
    setProgress(fresh);
  }, [examType]);

  return {
    completedSegments: progress.completedSegments,
    lastSegmentId: progress.lastSegmentId,
    updatedAt: progress.updatedAt,
    saveSegmentProgress,
    resetProgress,
  };
}
