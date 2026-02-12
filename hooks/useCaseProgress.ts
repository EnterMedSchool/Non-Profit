"use client";

import { useCallback, useEffect, useState } from "react";
import type { CaseScore } from "@/components/clinical-cases/CaseEngine";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CaseResult {
  score: CaseScore;
  completedAt: string;
}

interface CaseProgressData {
  completedCases: Record<string, CaseResult>;
  totalXp: number;
  updatedAt: string;
}

const STORAGE_KEY = "clinical-case-progress";

// ─── Storage helpers ────────────────────────────────────────────────────────

function readProgress(): CaseProgressData {
  const defaultData: CaseProgressData = {
    completedCases: {},
    totalXp: 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof window === "undefined") return defaultData;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<CaseProgressData>;
    return {
      completedCases:
        typeof parsed.completedCases === "object" && parsed.completedCases
          ? parsed.completedCases
          : {},
      totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return defaultData;
  }
}

function writeProgress(data: CaseProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCaseProgress() {
  const [progress, setProgress] = useState<CaseProgressData>({
    completedCases: {},
    totalXp: 0,
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const saveCaseCompletion = useCallback(
    (caseId: string, score: CaseScore) => {
      setProgress((prev) => {
        const existing = prev.completedCases[caseId];
        // Keep the best score if replaying
        const shouldUpdate =
          !existing || score.totalScore > existing.score.totalScore;

        const xpDelta = shouldUpdate
          ? score.xpEarned - (existing?.score.xpEarned ?? 0)
          : 0;

        const updated: CaseProgressData = {
          completedCases: {
            ...prev.completedCases,
            ...(shouldUpdate
              ? {
                  [caseId]: {
                    score,
                    completedAt: new Date().toISOString(),
                  },
                }
              : {}),
          },
          totalXp: prev.totalXp + xpDelta,
          updatedAt: new Date().toISOString(),
        };

        writeProgress(updated);
        return updated;
      });
    },
    []
  );

  const getCaseResult = useCallback(
    (caseId: string): CaseResult | undefined => {
      return progress.completedCases[caseId];
    },
    [progress]
  );

  const isCaseCompleted = useCallback(
    (caseId: string): boolean => {
      return caseId in progress.completedCases;
    },
    [progress]
  );

  const resetCaseProgress = useCallback((caseId: string) => {
    setProgress((prev) => {
      const { [caseId]: removed, ...rest } = prev.completedCases;
      const xpDelta = removed?.score.xpEarned ?? 0;
      const updated: CaseProgressData = {
        completedCases: rest,
        totalXp: prev.totalXp - xpDelta,
        updatedAt: new Date().toISOString(),
      };
      writeProgress(updated);
      return updated;
    });
  }, []);

  return {
    completedCases: progress.completedCases,
    totalXp: progress.totalXp,
    saveCaseCompletion,
    getCaseResult,
    isCaseCompleted,
    resetCaseProgress,
  };
}
