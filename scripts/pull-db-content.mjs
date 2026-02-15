/**
 * pull-db-content.mjs
 * ────────────────────────────────────────────────────────────────────
 * Connects to the Neon PostgreSQL database and exports practice
 * questions, flashcards, and all related category / deck data into
 * static TypeScript data-files that the Next.js app consumes.
 *
 * Usage:
 *   node scripts/pull-db-content.mjs
 *
 * Requires the DATABASE_URL env var or falls back to the hard-coded
 * connection string (dev only — never commit secrets to production).
 * ────────────────────────────────────────────────────────────────────
 */

import pg from "pg";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_YgJuKaCj6ny3@ep-bold-mode-a2sorydk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

// ── Helpers ──────────────────────────────────────────────────────────

function ts(obj) {
  return JSON.stringify(obj, null, 2);
}

function writeTsFile(relPath, content) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf-8");
  console.log(`  ✓ ${relPath}`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Connecting to database…");
  const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    // ────────────────────────────────────────────────────────────────
    // 1. PRACTICE QUESTIONS
    // ────────────────────────────────────────────────────────────────

    console.log("\n── Practice Questions ──");

    // Categories (hierarchical)
    const { rows: practiceCategories } = await pool.query(`
      SELECT id, slug, name, description, parent_id, depth, sort_order, icon
      FROM practice_categories
      ORDER BY sort_order, id
    `);
    console.log(`  Categories: ${practiceCategories.length}`);

    // Decks
    const { rows: practiceDecks } = await pool.query(`
      SELECT id, slug, title, description, tags, metadata, access_tier,
             created_at, updated_at
      FROM practice_question_decks
      ORDER BY id
    `);
    console.log(`  Decks: ${practiceDecks.length}`);

    // Deck-Category joins
    const { rows: deckCategories } = await pool.query(`
      SELECT deck_id, category_id, is_primary
      FROM practice_deck_categories
      ORDER BY deck_id, is_primary DESC
    `);

    // Questions
    const { rows: practiceQuestions } = await pool.query(`
      SELECT id, deck_id, stable_id, ordinal, prompt, explanation,
             metadata, difficulty, created_at, updated_at
      FROM practice_questions
      ORDER BY deck_id, ordinal
    `);
    console.log(`  Questions: ${practiceQuestions.length}`);

    // Options
    const { rows: questionOptions } = await pool.query(`
      SELECT id, question_id, label, body, is_correct, order_index, metadata
      FROM practice_question_options
      ORDER BY question_id, order_index
    `);
    console.log(`  Options: ${questionOptions.length}`);

    // Tags
    const { rows: questionTags } = await pool.query(`
      SELECT question_id, tag
      FROM practice_question_tags
      ORDER BY question_id, tag
    `);
    console.log(`  Tags: ${questionTags.length}`);

    // ── Build lookup maps ──

    // Options grouped by question_id
    const optionsByQuestion = {};
    for (const opt of questionOptions) {
      if (!optionsByQuestion[opt.question_id]) optionsByQuestion[opt.question_id] = [];
      optionsByQuestion[opt.question_id].push({
        label: opt.label,
        body: opt.body,
        isCorrect: opt.is_correct,
      });
    }

    // Tags grouped by question_id
    const tagsByQuestion = {};
    for (const t of questionTags) {
      if (!tagsByQuestion[t.question_id]) tagsByQuestion[t.question_id] = [];
      tagsByQuestion[t.question_id].push(t.tag);
    }

    // Deck category mappings
    const categoryIdsByDeck = {};
    const primaryCategoryByDeck = {};
    for (const dc of deckCategories) {
      if (!categoryIdsByDeck[dc.deck_id]) categoryIdsByDeck[dc.deck_id] = [];
      categoryIdsByDeck[dc.deck_id].push(dc.category_id);
      if (dc.is_primary) primaryCategoryByDeck[dc.deck_id] = dc.category_id;
    }

    // Count questions per deck
    const questionCountByDeck = {};
    for (const q of practiceQuestions) {
      questionCountByDeck[q.deck_id] = (questionCountByDeck[q.deck_id] || 0) + 1;
    }

    // ── Format for export ──

    const formattedCategories = practiceCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || undefined,
      parentId: c.parent_id || undefined,
      depth: c.depth,
      sortOrder: c.sort_order,
      icon: c.icon || undefined,
    }));

    const formattedDecks = practiceDecks.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      description: d.description || undefined,
      tags: d.tags || [],
      accessTier: d.access_tier || "free",
      categoryIds: categoryIdsByDeck[d.id] || [],
      primaryCategoryId: primaryCategoryByDeck[d.id] || undefined,
      questionCount: questionCountByDeck[d.id] || 0,
      createdAt: d.created_at?.toISOString?.() || d.created_at,
      updatedAt: d.updated_at?.toISOString?.() || d.updated_at,
    }));

    const formattedQuestions = practiceQuestions.map((q) => ({
      id: q.id,
      stableId: q.stable_id,
      deckId: q.deck_id,
      ordinal: q.ordinal,
      prompt: q.prompt,
      explanation: q.explanation || undefined,
      difficulty: q.difficulty || undefined,
      options: optionsByQuestion[q.id] || [],
      tags: tagsByQuestion[q.id] || [],
      createdAt: q.created_at?.toISOString?.() || q.created_at,
    }));

    // ────────────────────────────────────────────────────────────────
    // 2. FLASHCARDS
    // ────────────────────────────────────────────────────────────────

    console.log("\n── Flashcards ──");

    // Flashcard categories
    const { rows: flashcardCategories } = await pool.query(`
      SELECT id, slug, name, description, icon, color, sort_order,
             parent_id, target_profile_stage, target_exam_tracks
      FROM flashcard_categories
      ORDER BY sort_order, id
    `);
    console.log(`  Categories: ${flashcardCategories.length}`);

    // Flashcard decks
    const { rows: flashcardDecks } = await pool.query(`
      SELECT id, slug, title, description, is_active, tags, settings,
             access_scope, category_id, target_tracks, target_study_years,
             target_specialties, difficulty_level, estimated_minutes,
             author_display_name, is_verified, created_at, updated_at
      FROM flashcard_decks
      WHERE is_active = true
      ORDER BY category_id, id
    `);
    console.log(`  Decks: ${flashcardDecks.length}`);

    // Flashcards
    const { rows: flashcards } = await pool.query(`
      SELECT id, deck_id, stable_id, ordinal, front, back, source,
             is_active, card_type, hint, explanation, card_tags,
             created_at, updated_at
      FROM flashcards
      WHERE is_active = true
      ORDER BY deck_id, ordinal
    `);
    console.log(`  Cards: ${flashcards.length}`);

    // Count cards per deck
    const cardCountByDeck = {};
    for (const c of flashcards) {
      cardCountByDeck[c.deck_id] = (cardCountByDeck[c.deck_id] || 0) + 1;
    }

    // ── Format for export ──

    const formattedFlashcardCategories = flashcardCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || undefined,
      icon: c.icon || undefined,
      color: c.color || undefined,
      sortOrder: c.sort_order,
      parentId: c.parent_id || undefined,
    }));

    const formattedFlashcardDecks = flashcardDecks.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      description: d.description || undefined,
      categoryId: d.category_id || undefined,
      tags: d.tags || [],
      difficultyLevel: d.difficulty_level || undefined,
      estimatedMinutes: d.estimated_minutes || undefined,
      cardCount: cardCountByDeck[d.id] || 0,
      authorDisplayName: d.author_display_name || undefined,
      isVerified: d.is_verified || false,
      createdAt: d.created_at?.toISOString?.() || d.created_at,
      updatedAt: d.updated_at?.toISOString?.() || d.updated_at,
    }));

    const formattedFlashcards = flashcards.map((c) => ({
      id: c.id,
      stableId: c.stable_id,
      deckId: c.deck_id,
      ordinal: c.ordinal,
      front: c.front,
      back: c.back,
      cardType: c.card_type || "basic",
      hint: c.hint || undefined,
      explanation: c.explanation || undefined,
      cardTags: c.card_tags || [],
      createdAt: c.created_at?.toISOString?.() || c.created_at,
    }));

    // ────────────────────────────────────────────────────────────────
    // 3. WRITE FILES
    // ────────────────────────────────────────────────────────────────

    console.log("\n── Writing data files ──");

    // Practice categories & decks
    writeTsFile(
      "data/practice-categories.ts",
      `// Auto-generated by scripts/pull-db-content.mjs — do not edit manually
import type { PracticeCategory, PracticeQuestionDeck } from "@/types/practice-questions";

export const practiceCategories: PracticeCategory[] = ${ts(formattedCategories)};

export const practiceDecks: PracticeQuestionDeck[] = ${ts(formattedDecks)};
`,
    );

    // Practice questions
    writeTsFile(
      "data/practice-questions.ts",
      `// Auto-generated by scripts/pull-db-content.mjs — do not edit manually
import type { PracticeQuestion } from "@/types/practice-questions";

export const practiceQuestions: PracticeQuestion[] = ${ts(formattedQuestions)};
`,
    );

    // Flashcard categories & decks
    writeTsFile(
      "data/flashcard-categories.ts",
      `// Auto-generated by scripts/pull-db-content.mjs — do not edit manually
import type { FlashcardCategory, FlashcardDeck } from "@/types/flashcard-data";

export const flashcardCategories: FlashcardCategory[] = ${ts(formattedFlashcardCategories)};

export const flashcardDecks: FlashcardDeck[] = ${ts(formattedFlashcardDecks)};
`,
    );

    // Flashcards
    writeTsFile(
      "data/flashcard-data.ts",
      `// Auto-generated by scripts/pull-db-content.mjs — do not edit manually
import type { Flashcard } from "@/types/flashcard-data";

export const flashcards: Flashcard[] = ${ts(formattedFlashcards)};
`,
    );

    // ── Summary ──
    console.log("\n── Summary ──");
    console.log(`  Practice categories: ${formattedCategories.length}`);
    console.log(`  Practice decks:      ${formattedDecks.length}`);
    console.log(`  Practice questions:   ${formattedQuestions.length}`);
    console.log(`  Flashcard categories: ${formattedFlashcardCategories.length}`);
    console.log(`  Flashcard decks:      ${formattedFlashcardDecks.length}`);
    console.log(`  Flashcards:           ${formattedFlashcards.length}`);
    console.log("\nDone ✓");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
