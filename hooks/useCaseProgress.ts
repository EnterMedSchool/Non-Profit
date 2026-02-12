"use client";

/**
 * @deprecated Use usePlayerProfile instead. This re-exports for backward compatibility.
 */

import { usePlayerProfile } from "./usePlayerProfile";

export type { CaseResult } from "./usePlayerProfile";

export function useCaseProgress() {
  const profile = usePlayerProfile();

  return {
    completedCases: profile.completedCases,
    totalXp: profile.totalXp,
    saveCaseCompletion: profile.saveCaseCompletion,
    getCaseResult: profile.getCaseResult,
    isCaseCompleted: profile.isCaseCompleted,
    resetCaseProgress: profile.resetCaseProgress,
  };
}
