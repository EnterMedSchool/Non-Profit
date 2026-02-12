"use client";

/**
 * Unified player profile that merges case progress and character collection
 * into a single localStorage store. This prevents inconsistency and enables
 * cross-cutting features like XP levels affecting the collection display.
 *
 * Replaces: useCaseProgress + useCharacterCollection
 * Storage key: "player-profile" (migrates from old keys on first load)
 */

import { useCallback, useEffect, useState } from "react";
import { diseaseCharacters } from "@/data/disease-characters";
import type { CaseScore } from "@/components/clinical-cases/CaseEngine";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CaseResult {
  score: CaseScore;
  completedAt: string;
}

export interface CaughtCharacter {
  caughtAt: string;
  caseScore: number;
  xpEarned: number;
}

export interface CollectionStats {
  totalCaught: number;
  totalAvailable: number;
  completionPercent: number;
  byCategory: Record<string, { caught: number; total: number }>;
}

interface PlayerProfileData {
  // Case progress
  completedCases: Record<string, CaseResult>;
  totalXp: number;
  // Character collection
  characters: Record<string, CaughtCharacter>;
  // Metadata
  updatedAt: string;
}

const STORAGE_KEY = "player-profile";
const OLD_PROGRESS_KEY = "clinical-case-progress";
const OLD_COLLECTION_KEY = "character-collection";

// ─── Storage helpers ────────────────────────────────────────────────────────

function readProfile(): PlayerProfileData {
  const defaultData: PlayerProfileData = {
    completedCases: {},
    totalXp: 0,
    characters: {},
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof window === "undefined") return defaultData;

    // Try reading the unified store first
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerProfileData>;
      return {
        completedCases:
          typeof parsed.completedCases === "object" && parsed.completedCases
            ? parsed.completedCases
            : {},
        totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
        characters:
          typeof parsed.characters === "object" && parsed.characters
            ? parsed.characters
            : {},
        updatedAt:
          typeof parsed.updatedAt === "string"
            ? parsed.updatedAt
            : new Date().toISOString(),
      };
    }

    // Migration: read from old stores and merge
    const oldProgress = localStorage.getItem(OLD_PROGRESS_KEY);
    const oldCollection = localStorage.getItem(OLD_COLLECTION_KEY);

    if (oldProgress || oldCollection) {
      const progressData = oldProgress ? JSON.parse(oldProgress) : {};
      const collectionData = oldCollection ? JSON.parse(oldCollection) : {};

      const migrated: PlayerProfileData = {
        completedCases: progressData.completedCases ?? {},
        totalXp: progressData.totalXp ?? 0,
        characters: collectionData.characters ?? {},
        updatedAt: new Date().toISOString(),
      };

      // Write the merged store
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      // Clean up old stores
      localStorage.removeItem(OLD_PROGRESS_KEY);
      localStorage.removeItem(OLD_COLLECTION_KEY);

      return migrated;
    }

    return defaultData;
  } catch {
    return defaultData;
  }
}

function writeProfile(data: PlayerProfileData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfileData>({
    completedCases: {},
    totalXp: 0,
    characters: {},
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  // ── Case Progress ──

  const saveCaseCompletion = useCallback(
    (caseId: string, score: CaseScore) => {
      setProfile((prev) => {
        const existing = prev.completedCases[caseId];
        const shouldUpdate =
          !existing || score.totalScore > existing.score.totalScore;

        const xpDelta = shouldUpdate
          ? score.xpEarned - (existing?.score.xpEarned ?? 0)
          : 0;

        const updated: PlayerProfileData = {
          ...prev,
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

        writeProfile(updated);
        return updated;
      });
    },
    []
  );

  const getCaseResult = useCallback(
    (caseId: string): CaseResult | undefined => {
      return profile.completedCases[caseId];
    },
    [profile]
  );

  const isCaseCompleted = useCallback(
    (caseId: string): boolean => {
      return caseId in profile.completedCases;
    },
    [profile]
  );

  const resetCaseProgress = useCallback((caseId: string) => {
    setProfile((prev) => {
      const { [caseId]: removed, ...rest } = prev.completedCases;
      const xpDelta = removed?.score.xpEarned ?? 0;
      const updated: PlayerProfileData = {
        ...prev,
        completedCases: rest,
        totalXp: prev.totalXp - xpDelta,
        updatedAt: new Date().toISOString(),
      };
      writeProfile(updated);
      return updated;
    });
  }, []);

  // ── Character Collection ──

  const catchCharacter = useCallback(
    (characterId: string, caseScore: number, xpEarned: number) => {
      setProfile((prev) => {
        const existing = prev.characters[characterId];
        const shouldUpdate =
          !existing || caseScore > existing.caseScore;

        const updated: PlayerProfileData = {
          ...prev,
          characters: {
            ...prev.characters,
            ...(shouldUpdate
              ? {
                  [characterId]: {
                    caughtAt: existing?.caughtAt ?? new Date().toISOString(),
                    caseScore,
                    xpEarned,
                  },
                }
              : {}),
          },
          updatedAt: new Date().toISOString(),
        };

        writeProfile(updated);
        return updated;
      });
    },
    []
  );

  const isCharacterCaught = useCallback(
    (characterId: string): boolean => {
      return characterId in profile.characters;
    },
    [profile]
  );

  const getCaughtCharacter = useCallback(
    (characterId: string): CaughtCharacter | undefined => {
      return profile.characters[characterId];
    },
    [profile]
  );

  const getCollectionStats = useCallback((): CollectionStats => {
    const totalCaught = Object.keys(profile.characters).length;
    const totalAvailable = diseaseCharacters.length;

    const byCategory: Record<string, { caught: number; total: number }> = {};
    for (const char of diseaseCharacters) {
      if (!byCategory[char.category]) {
        byCategory[char.category] = { caught: 0, total: 0 };
      }
      byCategory[char.category].total++;
      if (profile.characters[char.id]) {
        byCategory[char.category].caught++;
      }
    }

    return {
      totalCaught,
      totalAvailable,
      completionPercent:
        totalAvailable > 0
          ? Math.round((totalCaught / totalAvailable) * 100)
          : 0,
      byCategory,
    };
  }, [profile]);

  return {
    // Case progress
    completedCases: profile.completedCases,
    totalXp: profile.totalXp,
    saveCaseCompletion,
    getCaseResult,
    isCaseCompleted,
    resetCaseProgress,

    // Character collection
    characters: profile.characters,
    catchCharacter,
    isCharacterCaught,
    getCaughtCharacter,
    getCollectionStats,
  };
}
