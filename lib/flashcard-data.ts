/**
 * Helper functions for flashcard data lookups.
 * All data is imported from auto-generated static files.
 */
import { flashcardCategories, flashcardDecks } from "@/data/flashcard-categories";
import { flashcards } from "@/data/flashcard-data";
import type {
  FlashcardCategory,
  FlashcardDeck,
  Flashcard,
} from "@/types/flashcard-data";

// ── Slug aliases for decks whose prefix doesn't match their category ─
// Maps a non-standard deck-slug prefix → the canonical category slug.
const SLUG_ALIASES: Record<string, string> = {
  "premed-cellbio": "premed-biology",
};

// ── Index maps (built once, cached) ─────────────────────────────────

const _catBySlug = new Map<string, FlashcardCategory>();
const _catById = new Map<number, FlashcardCategory>();
for (const c of flashcardCategories) {
  _catBySlug.set(c.slug, c);
  _catById.set(c.id, c);
}

const _deckBySlug = new Map<string, FlashcardDeck>();
const _deckById = new Map<number, FlashcardDeck>();
for (const d of flashcardDecks) {
  _deckBySlug.set(d.slug, d);
  _deckById.set(d.id, d);
}

const _cardByStableId = new Map<string, Flashcard>();
const _cardById = new Map<number, Flashcard>();
for (const c of flashcards) {
  _cardByStableId.set(c.stableId, c);
  _cardById.set(c.id, c);
}

// ── Category helpers ────────────────────────────────────────────────

export function getCategoryBySlug(slug: string): FlashcardCategory | undefined {
  return _catBySlug.get(slug);
}

export function getCategoryById(id: number): FlashcardCategory | undefined {
  return _catById.get(id);
}

export function getRootCategories(): FlashcardCategory[] {
  return flashcardCategories.filter((c) => !c.parentId);
}

export function getChildCategories(parentId: number): FlashcardCategory[] {
  return flashcardCategories.filter((c) => c.parentId === parentId);
}

export function getCategoryBreadcrumb(categoryId: number): FlashcardCategory[] {
  const path: FlashcardCategory[] = [];
  let current = _catById.get(categoryId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? _catById.get(current.parentId) : undefined;
  }
  return path;
}

export function getAllCategories(): FlashcardCategory[] {
  return flashcardCategories;
}

// ── Deck helpers ────────────────────────────────────────────────────

export function getDeckBySlug(slug: string): FlashcardDeck | undefined {
  return _deckBySlug.get(slug);
}

export function getDeckById(id: number): FlashcardDeck | undefined {
  return _deckById.get(id);
}

export function getDecksByCategory(categoryId: number): FlashcardDeck[] {
  // Collect this category + all descendant category IDs
  const ids = new Set<number>([categoryId]);
  const collect = (parentId: number) => {
    for (const c of flashcardCategories) {
      if (c.parentId === parentId && !ids.has(c.id)) {
        ids.add(c.id);
        collect(c.id);
      }
    }
  };
  collect(categoryId);

  // Build the set of slugs (including aliases) that belong to this subtree
  const slugs = new Set<string>();
  for (const id of ids) {
    const c = _catById.get(id);
    if (c) slugs.add(c.slug);
  }
  // Also include alias prefixes that map to any slug in our set
  for (const [alias, target] of Object.entries(SLUG_ALIASES)) {
    if (slugs.has(target)) slugs.add(alias);
  }

  // Match by explicit categoryId first, then by slug prefix as fallback
  return flashcardDecks.filter((d) => {
    if (d.categoryId != null) return ids.has(d.categoryId);
    // Fallback: match deck slug against any category/alias slug in the subtree
    for (const slug of slugs) {
      if (d.slug.startsWith(slug + "-")) return true;
    }
    return false;
  });
}

export function getAllDecks(): FlashcardDeck[] {
  return flashcardDecks;
}

export function getDeckCategory(deck: FlashcardDeck): FlashcardCategory | undefined {
  if (deck.categoryId != null) return _catById.get(deck.categoryId);
  // Fallback: find the most specific category whose slug is a prefix of the deck slug
  let best: FlashcardCategory | undefined;
  for (const cat of flashcardCategories) {
    if (deck.slug.startsWith(cat.slug + "-")) {
      if (!best || cat.slug.length > best.slug.length) best = cat;
    }
  }
  if (best) return best;
  // Try slug aliases (e.g. "premed-cellbio-*" → "premed-biology")
  for (const [alias, target] of Object.entries(SLUG_ALIASES)) {
    if (deck.slug.startsWith(alias + "-")) return _catBySlug.get(target);
  }
  return undefined;
}

// ── Card helpers ────────────────────────────────────────────────────

export function getCardByStableId(stableId: string): Flashcard | undefined {
  return _cardByStableId.get(stableId);
}

export function getCardById(id: number): Flashcard | undefined {
  return _cardById.get(id);
}

export function getCardsByDeck(deckId: number): Flashcard[] {
  return flashcards.filter((c) => c.deckId === deckId);
}

export function getAllCards(): Flashcard[] {
  return flashcards;
}

// ── Aggregate stats ─────────────────────────────────────────────────

export function getTotalCardCount(): number {
  return flashcards.length;
}

export function getTotalDeckCount(): number {
  return flashcardDecks.length;
}

export function getActiveCategorySlugs(): string[] {
  const slugs = new Set<string>();
  for (const d of flashcardDecks) {
    const cat = getDeckCategory(d);
    if (cat) slugs.add(cat.slug);
  }
  return [...slugs];
}
