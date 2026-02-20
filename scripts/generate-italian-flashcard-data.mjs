/**
 * generate-italian-flashcard-data.mjs
 *
 * Reads extracted Italian lesson JSON and generates flashcard deck/card
 * entries to append to data/flashcard-categories.ts and data/flashcard-data.ts.
 *
 * Usage: node scripts/generate-italian-flashcard-data.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");
const ITALIAN = join(DATA, "italian");

const CATEGORY_ID = 17; // existing "medical-italian" category
const DECK_ID_START = 70;
const CARD_ID_START = 7869;
const NOW = new Date().toISOString();

const manifest = JSON.parse(readFileSync(join(ITALIAN, "manifest.json"), "utf8"));

let nextDeckId = DECK_ID_START;
let nextCardId = CARD_ID_START;
const newDecks = [];
const newCards = [];

for (const lessonMeta of manifest.lessons) {
  const lesson = JSON.parse(
    readFileSync(join(ITALIAN, "lessons", `${lessonMeta.slug}.json`), "utf8"),
  );

  const glossarySteps = lesson.steps.filter((s) => s.stepType === "glossary");
  if (glossarySteps.length === 0) continue;

  // Collect all terms across all glossary steps for this lesson into one deck
  const allTerms = [];
  for (const step of glossarySteps) {
    if (step.config?.terms) {
      for (const term of step.config.terms) {
        allTerms.push(term);
      }
    }
  }

  if (allTerms.length === 0) continue;

  const deckId = nextDeckId++;
  const deckSlug = `italian-${lesson.slug}-${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;

  newDecks.push({
    id: deckId,
    slug: deckSlug,
    title: `Medical Italian: ${lesson.title}`,
    description: `Italian medical vocabulary and clinical phrases from Lesson ${lesson.position + 1}: ${lesson.title}. ${allTerms.length} terms covering ward rounds, clinical exams, and patient communication.`,
    categoryId: CATEGORY_ID,
    tags: ["medical-italian", "clinical-italian", "difficulty:intermediate"],
    difficultyLevel: "intermediate",
    cardCount: allTerms.length,
    isVerified: true,
    createdAt: NOW,
    updatedAt: NOW,
  });

  for (let i = 0; i < allTerms.length; i++) {
    const term = allTerms[i];
    newCards.push({
      id: nextCardId++,
      stableId: `it-${lesson.slug}-${String(i + 1).padStart(3, "0")}`,
      deckId,
      ordinal: i + 1,
      front: term.lemma,
      back: term.english,
      cardType: "basic",
      cardTags: ["medical-italian", "clinical-italian"],
      createdAt: NOW,
    });
  }
}

console.log(`Generated ${newDecks.length} decks, ${newCards.length} cards`);

// Append decks to flashcard-categories.ts
const catFile = join(DATA, "flashcard-categories.ts");
let catContent = readFileSync(catFile, "utf8");
// Insert new decks before the final ];
const deckEntries = newDecks
  .map((d) => "  " + JSON.stringify(d, null, 2).replace(/\n/g, "\n  "))
  .join(",\n");
catContent = catContent.replace(/\n\];\s*$/, `,\n${deckEntries}\n];\n`);
writeFileSync(catFile, catContent);
console.log(`Appended ${newDecks.length} decks to flashcard-categories.ts`);

// Append cards to flashcard-data.ts
const cardFile = join(DATA, "flashcard-data.ts");
let cardContent = readFileSync(cardFile, "utf8");
const cardEntries = newCards
  .map((c) => "  " + JSON.stringify(c, null, 2).replace(/\n/g, "\n  "))
  .join(",\n");
cardContent = cardContent.replace(/\n\];\s*$/, `,\n${cardEntries}\n];\n`);
writeFileSync(cardFile, cardContent);
console.log(`Appended ${newCards.length} cards to flashcard-data.ts`);
