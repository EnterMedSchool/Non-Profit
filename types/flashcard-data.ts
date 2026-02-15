// ── Flashcard Type Definitions ───────────────────────────────────────

/** A hierarchical flashcard category (e.g. Pre-Med Biology) */
export interface FlashcardCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  parentId?: number;
}

/** A deck/set of flashcards */
export interface FlashcardDeck {
  id: number;
  slug: string;
  title: string;
  description?: string;
  categoryId?: number;
  tags: string[];
  difficultyLevel?: string;
  estimatedMinutes?: number;
  cardCount: number;
  authorDisplayName?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A single flashcard */
export interface Flashcard {
  id: number;
  stableId: string;
  deckId: number;
  ordinal: number;
  front: string;
  back: string;
  cardType: string;
  hint?: string;
  explanation?: string;
  cardTags: string[];
  createdAt: string;
}
