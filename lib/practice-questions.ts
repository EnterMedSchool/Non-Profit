/**
 * Helper functions for practice question data lookups.
 * All data is imported from auto-generated static files.
 */
import { practiceCategories, practiceDecks } from "@/data/practice-categories";
import { practiceQuestions } from "@/data/practice-questions";
import type {
  PracticeCategory,
  PracticeQuestionDeck,
  PracticeQuestion,
} from "@/types/practice-questions";

// ── Index maps (built once, cached) ─────────────────────────────────

const _catBySlug = new Map<string, PracticeCategory>();
const _catById = new Map<number, PracticeCategory>();
for (const c of practiceCategories) {
  _catBySlug.set(c.slug, c);
  _catById.set(c.id, c);
}

const _deckBySlug = new Map<string, PracticeQuestionDeck>();
const _deckById = new Map<number, PracticeQuestionDeck>();
for (const d of practiceDecks) {
  _deckBySlug.set(d.slug, d);
  _deckById.set(d.id, d);
}

const _qByStableId = new Map<string, PracticeQuestion>();
const _qById = new Map<number, PracticeQuestion>();
for (const q of practiceQuestions) {
  _qByStableId.set(q.stableId, q);
  _qById.set(q.id, q);
}

// ── Category helpers ────────────────────────────────────────────────

export function getCategoryBySlug(slug: string): PracticeCategory | undefined {
  return _catBySlug.get(slug);
}

export function getCategoryById(id: number): PracticeCategory | undefined {
  return _catById.get(id);
}

/** Get root-level categories (no parent) */
export function getRootCategories(): PracticeCategory[] {
  return practiceCategories.filter((c) => !c.parentId);
}

/** Get child categories of a parent */
export function getChildCategories(parentId: number): PracticeCategory[] {
  return practiceCategories.filter((c) => c.parentId === parentId);
}

/** Build the full ancestry path for a category (root → ... → leaf) */
export function getCategoryBreadcrumb(categoryId: number): PracticeCategory[] {
  const path: PracticeCategory[] = [];
  let current = _catById.get(categoryId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? _catById.get(current.parentId) : undefined;
  }
  return path;
}

/** All categories (flat list) */
export function getAllCategories(): PracticeCategory[] {
  return practiceCategories;
}

// ── Deck helpers ────────────────────────────────────────────────────

export function getDeckBySlug(slug: string): PracticeQuestionDeck | undefined {
  return _deckBySlug.get(slug);
}

export function getDeckById(id: number): PracticeQuestionDeck | undefined {
  return _deckById.get(id);
}

/** Get all decks belonging to a category or any of its descendants */
export function getDecksByCategory(categoryId: number): PracticeQuestionDeck[] {
  // Collect this category + all descendant category IDs
  const ids = new Set<number>([categoryId]);
  const collect = (parentId: number) => {
    for (const c of practiceCategories) {
      if (c.parentId === parentId && !ids.has(c.id)) {
        ids.add(c.id);
        collect(c.id);
      }
    }
  };
  collect(categoryId);

  return practiceDecks.filter((d) =>
    d.categoryIds.some((cid) => ids.has(cid))
  );
}

/** Get decks whose primary category matches */
export function getDecksByPrimaryCategory(categoryId: number): PracticeQuestionDeck[] {
  return practiceDecks.filter((d) => d.primaryCategoryId === categoryId);
}

/** All decks */
export function getAllDecks(): PracticeQuestionDeck[] {
  return practiceDecks;
}

/**
 * Resolve the "display category" for a deck.
 * Uses the primary category if set, otherwise the first category in the list.
 */
export function getDeckCategory(deck: PracticeQuestionDeck): PracticeCategory | undefined {
  const id = deck.primaryCategoryId ?? deck.categoryIds[0];
  return id != null ? _catById.get(id) : undefined;
}

/**
 * Get the dominant difficulty for a deck (most common among its questions).
 * Returns undefined if no questions have difficulty or if mixed.
 */
export function getDeckDominantDifficulty(deckId: number): string | undefined {
  const questions = practiceQuestions.filter((q) => q.deckId === deckId);
  const withDiff = questions.filter((q) => q.difficulty);
  if (withDiff.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const q of withDiff) {
    const d = (q.difficulty ?? "").toLowerCase();
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top || top[1] < withDiff.length * 0.5) return undefined;
  return top[0];
}

// ── Question helpers ────────────────────────────────────────────────

export function getQuestionByStableId(stableId: string): PracticeQuestion | undefined {
  return _qByStableId.get(stableId);
}

export function getQuestionById(id: number): PracticeQuestion | undefined {
  return _qById.get(id);
}

/** Get all questions in a deck, ordered by ordinal */
export function getQuestionsByDeck(deckId: number): PracticeQuestion[] {
  return practiceQuestions.filter((q) => q.deckId === deckId);
}

/** All questions */
export function getAllQuestions(): PracticeQuestion[] {
  return practiceQuestions;
}

// ── Aggregate stats ─────────────────────────────────────────────────

export function getTotalQuestionCount(): number {
  return practiceQuestions.length;
}

export function getTotalDeckCount(): number {
  return practiceDecks.length;
}

/** Get unique category slugs that actually have decks */
export function getActiveCategorySlugs(): string[] {
  const ids = new Set<number>();
  for (const d of practiceDecks) {
    for (const cid of d.categoryIds) ids.add(cid);
  }
  return [...ids]
    .map((id) => _catById.get(id))
    .filter((c): c is PracticeCategory => !!c)
    .map((c) => c.slug);
}
