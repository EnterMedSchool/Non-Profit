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
  return flashcardDecks.filter((d) => d.categoryId === categoryId);
}

export function getAllDecks(): FlashcardDeck[] {
  return flashcardDecks;
}

export function getDeckCategory(deck: FlashcardDeck): FlashcardCategory | undefined {
  return deck.categoryId != null ? _catById.get(deck.categoryId) : undefined;
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
  const ids = new Set<number>();
  for (const d of flashcardDecks) {
    if (d.categoryId != null) ids.add(d.categoryId);
  }
  return [...ids]
    .map((id) => _catById.get(id))
    .filter((c): c is FlashcardCategory => !!c)
    .map((c) => c.slug);
}
