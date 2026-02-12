"use client";

/**
 * @deprecated Use usePlayerProfile instead. This re-exports for backward compatibility.
 */

import { usePlayerProfile } from "./usePlayerProfile";

export type { CaughtCharacter, CollectionStats } from "./usePlayerProfile";

export function useCharacterCollection() {
  const profile = usePlayerProfile();

  return {
    characters: profile.characters,
    catchCharacter: profile.catchCharacter,
    isCharacterCaught: profile.isCharacterCaught,
    getCaughtCharacter: profile.getCaughtCharacter,
    getCollectionStats: profile.getCollectionStats,
  };
}
