#!/usr/bin/env node
/**
 * Generate LaTeX PDFs for all practice-question and flashcard decks.
 *
 * Usage:
 *   node scripts/generate-pdfs.mjs                  # all decks
 *   node scripts/generate-pdfs.mjs --sample          # edge-case samples only
 *   node scripts/generate-pdfs.mjs --deck 57         # single deck by ID
 *   node scripts/generate-pdfs.mjs --type questions   # questions only
 *   node scripts/generate-pdfs.mjs --type flashcards  # flashcards only
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { examTemplate, studyGuideTemplate, flashcardTemplate } from "./lib/latex-templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");
const OUT_TEX = join(ROOT, "generated-pdfs", "tex");
const OUT_PDF = join(ROOT, "generated-pdfs", "out");

const BASE_URL = "https://entermedschool.org";

// Logo asset directory (forward-slashed for LaTeX on Windows)
const LOGO_DIR = join(__dirname, "assets").replace(/\\/g, "/");

// ── CLI args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const SAMPLE_ONLY = args.includes("--sample");
const TYPE_FILTER = args.includes("--type") ? args[args.indexOf("--type") + 1] : null;
const DECK_ID = args.includes("--deck") ? Number(args[args.indexOf("--deck") + 1]) : null;

// Sample deck IDs from the plan
const SAMPLE_QUESTION_DECK_IDS = [57, 46, 2]; // Gas Laws, Blood Buffer, Nucleus
const SAMPLE_FLASHCARD_DECK_IDS = [37, 50];    // Hemoglobin, Cellular Respiration

// ── Data parsing ─────────────────────────────────────────────────────
// The .ts data files export typed arrays. We strip the TS and eval as JS.
function parseDataFile(filename) {
  const raw = readFileSync(join(DATA, filename), "utf-8");
  // Remove import/type lines, extract the array assignment
  const cleaned = raw
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+(\w+):\s*\w[\w<>,\s\[\]]*\s*=/gm, "const $1 =");
  // Wrap in a function that returns the data
  const varMatch = cleaned.match(/const\s+(\w+)\s*=/);
  if (!varMatch) throw new Error(`Cannot find exported const in ${filename}`);
  const varName = varMatch[1];
  const fn = new Function(`${cleaned}\nreturn ${varName};`);
  return fn();
}

console.log("\n  Loading data...");
const practiceCategories = parseDataFile("practice-categories.ts");
const practiceDecks = practiceCategories.filter(d => d.questionCount != null)
  ? parseDataFile("practice-categories.ts") // categories+decks share file
  : [];

// Actually re-read: practice-categories.ts exports both practiceCategories and practiceDecks
const practiceCatRaw = readFileSync(join(DATA, "practice-categories.ts"), "utf-8");
const hasPracticeDecks = practiceCatRaw.includes("practiceDecks");

let allPracticeCategories, allPracticeDecks, allPracticeQuestions;
let allFlashcardCategories, allFlashcardDecks, allFlashcards;

// Parse practice questions
{
  const raw = readFileSync(join(DATA, "practice-categories.ts"), "utf-8");
  const cleaned = raw
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+(\w+):\s*\w[\w<>,\s\[\]]*\s*=/gm, "const $1 =");
  const fn = new Function(`${cleaned}\nreturn { practiceCategories, practiceDecks };`);
  const result = fn();
  allPracticeCategories = result.practiceCategories;
  allPracticeDecks = result.practiceDecks;
}

{
  const raw = readFileSync(join(DATA, "practice-questions.ts"), "utf-8");
  const cleaned = raw
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+(\w+):\s*\w[\w<>,\s\[\]]*\s*=/gm, "const $1 =");
  const fn = new Function(`${cleaned}\nreturn practiceQuestions;`);
  allPracticeQuestions = fn();
}

// Parse flashcards
{
  const raw = readFileSync(join(DATA, "flashcard-categories.ts"), "utf-8");
  const cleaned = raw
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+(\w+):\s*\w[\w<>,\s\[\]]*\s*=/gm, "const $1 =");
  const fn = new Function(`${cleaned}\nreturn { flashcardCategories, flashcardDecks };`);
  const result = fn();
  allFlashcardCategories = result.flashcardCategories;
  allFlashcardDecks = result.flashcardDecks;
}

{
  const raw = readFileSync(join(DATA, "flashcard-data.ts"), "utf-8");
  const cleaned = raw
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+(\w+):\s*\w[\w<>,\s\[\]]*\s*=/gm, "const $1 =");
  const fn = new Function(`${cleaned}\nreturn flashcards;`);
  allFlashcards = fn();
}

console.log(`  Loaded: ${allPracticeDecks.length} question decks, ${allPracticeQuestions.length} questions`);
console.log(`  Loaded: ${allFlashcardDecks.length} flashcard decks, ${allFlashcards.length} flashcards`);

// ── Helpers ──────────────────────────────────────────────────────────
function getCategoryForQuestionDeck(deck) {
  const catId = deck.primaryCategoryId || (deck.categoryIds && deck.categoryIds[0]);
  return allPracticeCategories.find(c => c.id === catId);
}

function getCategoryForFlashcardDeck(deck) {
  if (deck.categoryId) {
    const exact = allFlashcardCategories.find(c => c.id === deck.categoryId);
    if (exact) return exact;
  }
  // Match by slug prefix (e.g. "premed-biology-hemoglobin-bohr" → "premed-biology")
  const sorted = [...allFlashcardCategories].sort((a, b) => b.slug.length - a.slug.length);
  for (const cat of sorted) {
    if (deck.slug.startsWith(cat.slug)) return cat;
  }
  return null;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function compileLatex(texPath, outDir) {
  ensureDir(outDir);
  const baseName = texPath.split(/[\\/]/).pop().replace(/\.tex$/, "");
  const pdfPath = join(outDir, `${baseName}.pdf`);
  const logPath = join(outDir, `${baseName}.log`);
  const cmd = `xelatex -interaction=nonstopmode -output-directory="${outDir}" "${texPath}"`;
  const opts = { stdio: "pipe", timeout: 300000 };

  try {
    // First pass
    execSync(cmd, opts);
    // Second pass for page refs (LastPage)
    execSync(cmd, opts);
  } catch (err) {
    // xelatex may exit non-zero on warnings; check if PDF was produced
  }

  // Check if PDF was actually written
  if (existsSync(pdfPath)) return true;

  // Real failure — show errors from log
  let errorLines = "";
  try {
    const log = readFileSync(logPath, "utf-8");
    const lines = log.split("\n");
    errorLines = lines.filter(l => l.startsWith("!")).slice(0, 10).join("\n");
  } catch { /* no log */ }
  console.error(`    COMPILE ERROR: ${texPath}`);
  if (errorLines) console.error(`    ${errorLines}`);
  return false;
}

// ── Generation ───────────────────────────────────────────────────────
let generated = 0;
let errors = 0;
const startTime = Date.now();

function shouldProcessQuestionDeck(deck) {
  if (TYPE_FILTER === "flashcards") return false;
  if (DECK_ID != null) return deck.id === DECK_ID;
  if (SAMPLE_ONLY) return SAMPLE_QUESTION_DECK_IDS.includes(deck.id);
  return true;
}

function shouldProcessFlashcardDeck(deck) {
  if (TYPE_FILTER === "questions") return false;
  if (DECK_ID != null) return deck.id === DECK_ID;
  if (SAMPLE_ONLY) return SAMPLE_FLASHCARD_DECK_IDS.includes(deck.id);
  return true;
}

// ── Process question decks ───────────────────────────────────────────
console.log("\n  Generating question PDFs...");

for (const deck of allPracticeDecks) {
  if (!shouldProcessQuestionDeck(deck)) continue;

  const category = getCategoryForQuestionDeck(deck);
  const catSlug = category ? category.slug : "uncategorized";
  const catName = category ? category.name : "General";

  const questions = allPracticeQuestions
    .filter(q => q.deckId === deck.id)
    .sort((a, b) => a.ordinal - b.ordinal);

  if (questions.length === 0) {
    console.log(`    Skip ${deck.slug} (no questions)`);
    continue;
  }

  const url = `${BASE_URL}/en/resources/questions/${catSlug}/${deck.slug}`;

  // Exam PDF
  {
    const texDir = join(OUT_TEX, "questions", catSlug);
    const pdfDir = join(OUT_PDF, "questions", catSlug);
    ensureDir(texDir);
    ensureDir(pdfDir);

    const texContent = examTemplate({
      title: deck.title,
      categoryName: catName,
      description: deck.description,
      questions,
      url,
      tags: deck.tags,
      logoDir: LOGO_DIR,
      categorySlug: catSlug,
      deckSlug: deck.slug,
    });

    const texFile = join(texDir, `${deck.slug}-exam.tex`);
    writeFileSync(texFile, texContent, "utf-8");
    process.stdout.write(`    Exam: ${deck.slug} (${questions.length}q) ... `);

    if (compileLatex(texFile, pdfDir)) {
      console.log("OK");
      generated++;
    } else {
      console.log("FAILED");
      errors++;
    }
  }

  // Study Guide PDF
  {
    const texDir = join(OUT_TEX, "questions", catSlug);
    const pdfDir = join(OUT_PDF, "questions", catSlug);
    ensureDir(texDir);
    ensureDir(pdfDir);

    const texContent = studyGuideTemplate({
      title: deck.title,
      categoryName: catName,
      description: deck.description,
      questions,
      url,
      tags: deck.tags,
      logoDir: LOGO_DIR,
      categorySlug: catSlug,
      deckSlug: deck.slug,
    });

    const texFile = join(texDir, `${deck.slug}-study-guide.tex`);
    writeFileSync(texFile, texContent, "utf-8");
    process.stdout.write(`    Study: ${deck.slug} (${questions.length}q) ... `);

    if (compileLatex(texFile, pdfDir)) {
      console.log("OK");
      generated++;
    } else {
      console.log("FAILED");
      errors++;
    }
  }
}

// ── Process flashcard decks ──────────────────────────────────────────
console.log("\n  Generating flashcard PDFs...");

for (const deck of allFlashcardDecks) {
  if (!shouldProcessFlashcardDeck(deck)) continue;

  const category = getCategoryForFlashcardDeck(deck);
  const catSlug = category ? category.slug : "uncategorized";
  const catName = category ? category.name : "General";

  const cards = allFlashcards
    .filter(c => c.deckId === deck.id)
    .sort((a, b) => a.ordinal - b.ordinal);

  if (cards.length === 0) {
    console.log(`    Skip ${deck.slug} (no cards)`);
    continue;
  }

  const url = `${BASE_URL}/en/resources/flashcards/${catSlug}/${deck.slug}`;

  const texDir = join(OUT_TEX, "flashcards", catSlug);
  const pdfDir = join(OUT_PDF, "flashcards", catSlug);
  ensureDir(texDir);
  ensureDir(pdfDir);

  const texContent = flashcardTemplate({
    title: deck.title,
    categoryName: catName,
    description: deck.description,
    cards,
    url,
    tags: deck.tags,
    logoDir: LOGO_DIR,
    categorySlug: catSlug,
    deckSlug: deck.slug,
  });

  const texFile = join(texDir, `${deck.slug}.tex`);
  writeFileSync(texFile, texContent, "utf-8");
  process.stdout.write(`    Cards: ${deck.slug} (${cards.length}) ... `);

  if (compileLatex(texFile, pdfDir)) {
    console.log("OK");
    generated++;
  } else {
    console.log("FAILED");
    errors++;
  }
}

// ── Summary ──────────────────────────────────────────────────────────
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n  Done! Generated ${generated} PDFs, ${errors} errors, in ${elapsed}s\n`);
if (errors > 0) process.exit(1);
