/* ================================================================== */
/*  Cross-Content Linking for Glossary Terms                           */
/*  Maps glossary term IDs to related flashcards, questions, & visuals */
/* ================================================================== */

import { glossaryTerms } from "@/data/glossary-terms";
import { visualLessons } from "@/data/visuals";
import { practiceDecks, practiceCategories } from "@/data/practice-categories";
import { flashcardDecks, flashcardCategories } from "@/data/flashcard-categories";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface RelatedVisual {
  id: string;
  title: string;
  category: string;
}

export interface RelatedDeck {
  slug: string;
  categorySlug: string;
  title: string;
  type: "questions" | "flashcards";
  count: number;
}

export interface CrossContentLinks {
  visuals: RelatedVisual[];
  questionDecks: RelatedDeck[];
  flashcardDecks: RelatedDeck[];
}

/* ── Build the index ──────────────────────────────────────────────── */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildCrossContentIndex(): Map<string, CrossContentLinks> {
  const index = new Map<string, CrossContentLinks>();

  // Build lookup maps for categories
  const practiceCatById = new Map(
    practiceCategories.map((c) => [c.id, c]),
  );
  const flashcardCatById = new Map(
    flashcardCategories.map((c) => [c.id, c]),
  );

  // Build name → term ID map for fast matching
  const nameToTermId = new Map<string, string>();
  for (const term of glossaryTerms) {
    for (const name of term.names) {
      nameToTermId.set(normalize(name), term.id);
    }
    for (const alias of term.aliases ?? []) {
      nameToTermId.set(normalize(alias), term.id);
    }
  }

  // Initialize empty entries for all terms
  for (const term of glossaryTerms) {
    index.set(term.id, { visuals: [], questionDecks: [], flashcardDecks: [] });
  }

  // Match visual lessons by tags and keyFacts
  for (const lesson of visualLessons) {
    const matchedTermIds = new Set<string>();

    // Match via keyFacts[].term
    for (const kf of lesson.keyFacts ?? []) {
      const key = normalize(kf.term);
      const termId = nameToTermId.get(key);
      if (termId) matchedTermIds.add(termId);
    }

    // Match via tags
    for (const tag of lesson.tags ?? []) {
      const key = normalize(tag);
      const termId = nameToTermId.get(key);
      if (termId) matchedTermIds.add(termId);
    }

    // Match via title
    const titleKey = normalize(lesson.title);
    for (const [nameKey, termId] of nameToTermId) {
      if (nameKey.length >= 4 && titleKey.includes(nameKey)) {
        matchedTermIds.add(termId);
      }
    }

    for (const termId of matchedTermIds) {
      const entry = index.get(termId);
      if (entry && entry.visuals.length < 5) {
        entry.visuals.push({
          id: lesson.id,
          title: lesson.title,
          category: lesson.category,
        });
      }
    }
  }

  // Match practice question decks by tags and title
  for (const deck of practiceDecks) {
    const catId = deck.primaryCategoryId ?? deck.categoryIds[0];
    const cat = catId != null ? practiceCatById.get(catId) : undefined;
    if (!cat) continue;

    const matchedTermIds = new Set<string>();

    for (const tag of deck.tags ?? []) {
      const key = normalize(tag);
      const termId = nameToTermId.get(key);
      if (termId) matchedTermIds.add(termId);
    }

    const titleKey = normalize(deck.title);
    for (const [nameKey, termId] of nameToTermId) {
      if (nameKey.length >= 4 && titleKey.includes(nameKey)) {
        matchedTermIds.add(termId);
      }
    }

    for (const termId of matchedTermIds) {
      const entry = index.get(termId);
      if (entry && entry.questionDecks.length < 3) {
        entry.questionDecks.push({
          slug: deck.slug,
          categorySlug: cat.slug,
          title: deck.title,
          type: "questions",
          count: deck.questionCount,
        });
      }
    }
  }

  // Match flashcard decks by tags and title
  for (const deck of flashcardDecks) {
    const cat =
      deck.categoryId != null
        ? flashcardCatById.get(deck.categoryId)
        : undefined;
    if (!cat) continue;

    const matchedTermIds = new Set<string>();

    for (const tag of deck.tags ?? []) {
      const stripped = tag
        .replace(/^(topic|subtopic|exam-track|difficulty):/, "")
        .replace(/:/g, "-");
      const key = normalize(stripped);
      const termId = nameToTermId.get(key);
      if (termId) matchedTermIds.add(termId);
    }

    const titleKey = normalize(deck.title);
    for (const [nameKey, termId] of nameToTermId) {
      if (nameKey.length >= 4 && titleKey.includes(nameKey)) {
        matchedTermIds.add(termId);
      }
    }

    for (const termId of matchedTermIds) {
      const entry = index.get(termId);
      if (entry && entry.flashcardDecks.length < 3) {
        entry.flashcardDecks.push({
          slug: deck.slug,
          categorySlug: cat.slug,
          title: deck.title,
          type: "flashcards",
          count: deck.cardCount,
        });
      }
    }
  }

  return index;
}

const crossContentIndex = buildCrossContentIndex();

/** Get cross-content links for a given glossary term */
export function getCrossContentLinks(
  termId: string,
): CrossContentLinks {
  return (
    crossContentIndex.get(termId) ?? {
      visuals: [],
      questionDecks: [],
      flashcardDecks: [],
    }
  );
}

/** Check if a term has any cross-content links */
export function hasCrossContentLinks(termId: string): boolean {
  const links = crossContentIndex.get(termId);
  if (!links) return false;
  return (
    links.visuals.length > 0 ||
    links.questionDecks.length > 0 ||
    links.flashcardDecks.length > 0
  );
}
