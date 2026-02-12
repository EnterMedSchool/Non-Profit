"use client";

import { useCallback, useEffect, useState } from "react";
import { diseaseCharacters } from "@/data/disease-characters";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CaughtCharacter {
  caughtAt: string;
  caseScore: number;
  xpEarned: number;
}

interface CollectionData {
  characters: Record<string, CaughtCharacter>;
  updatedAt: string;
}

export interface CollectionStats {
  totalCaught: number;
  totalAvailable: number;
  completionPercent: number;
  byCategory: Record<string, { caught: number; total: number }>;
}

const STORAGE_KEY = "character-collection";

// ─── Storage helpers ────────────────────────────────────────────────────────

function readCollection(): CollectionData {
  const defaultData: CollectionData = {
    characters: {},
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof window === "undefined") return defaultData;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<CollectionData>;
    return {
      characters:
        typeof parsed.characters === "object" && parsed.characters
          ? parsed.characters
          : {},
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return defaultData;
  }
}

function writeCollection(data: CollectionData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCharacterCollection() {
  const [collection, setCollection] = useState<CollectionData>({
    characters: {},
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    setCollection(readCollection());
  }, []);

  const catchCharacter = useCallback(
    (characterId: string, caseScore: number, xpEarned: number) => {
      setCollection((prev) => {
        const existing = prev.characters[characterId];
        // Keep the best score if replaying
        const shouldUpdate =
          !existing || caseScore > existing.caseScore;

        const updated: CollectionData = {
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

        writeCollection(updated);
        return updated;
      });
    },
    []
  );

  const isCharacterCaught = useCallback(
    (characterId: string): boolean => {
      return characterId in collection.characters;
    },
    [collection]
  );

  const getCaughtCharacter = useCallback(
    (characterId: string): CaughtCharacter | undefined => {
      return collection.characters[characterId];
    },
    [collection]
  );

  const getCollectionStats = useCallback((): CollectionStats => {
    const totalCaught = Object.keys(collection.characters).length;
    const totalAvailable = diseaseCharacters.length;

    const byCategory: Record<string, { caught: number; total: number }> = {};
    for (const char of diseaseCharacters) {
      if (!byCategory[char.category]) {
        byCategory[char.category] = { caught: 0, total: 0 };
      }
      byCategory[char.category].total++;
      if (collection.characters[char.id]) {
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
  }, [collection]);

  return {
    characters: collection.characters,
    catchCharacter,
    isCharacterCaught,
    getCaughtCharacter,
    getCollectionStats,
  };
}
