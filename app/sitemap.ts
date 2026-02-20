import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";
import { visualLessons } from "@/data/visuals";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import { pdfBooks } from "@/data/pdf-books";
import {
  mediaAssets,
  mediaAssetCategories,
  mediaAssetCollections,
  getAllTags,
  getTagSlug,
} from "@/data/media-assets";
import { glossaryTerms, glossaryCategories, glossaryComparisonPairs, getAllSymptomPages } from "@/data/glossary-terms";
import { clinicalCases } from "@/data/clinical-cases";
import { blogPosts } from "@/data/blog-posts";
import { practiceCategories, practiceDecks } from "@/data/practice-categories";
import { practiceQuestions } from "@/data/practice-questions";
import { flashcardCategories, flashcardDecks } from "@/data/flashcard-categories";
import { flashcards } from "@/data/flashcard-data";
import { getDeckCategory as getFlashcardDeckCategory } from "@/lib/flashcard-data";
import { getAllItalianLessonMeta } from "@/lib/italian-data";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

const locales = routing.locales;
const defaultLocale = routing.defaultLocale;

/**
 * Last-known content update for static / seldom-changing pages.
 * Avoids `new Date()` which changes on every build and causes Google
 * to ignore the lastModified signal entirely.
 */
const CONTENT_UPDATED = "2026-02-18";

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Build per-locale alternate URLs + x-default for a localized path */
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  // x-default points to the default locale
  languages["x-default"] = `${BASE_URL}/${defaultLocale}${path}`;
  return { languages };
}

/* ── Sitemap index ───────────────────────────────────────────────── */

/**
 * Next.js generates a sitemap index at /sitemap.xml that references
 * /sitemap/0.xml, /sitemap/1.xml, etc. — one for each id returned here.
 *
 * Split by content type:
 *   0 – Static pages, tools, calculators, standalone tools
 *   1 – Media assets, categories, tags, collections
 *   2 – Glossary terms & categories
 *   3 – PDF books & chapters, visual lessons, clinical cases
 *   4 – Blog posts
 */
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }];
}

/* ── Sitemap chunks ──────────────────────────────────────────────── */

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  switch (id) {
    case 0:
      return buildStaticAndToolsSitemap();
    case 1:
      return buildMediaSitemap();
    case 2:
      return buildGlossarySitemap();
    case 3:
      return buildContentSitemap();
    case 4:
      return buildArticlesSitemap();
    case 5:
      return buildQuestionsSitemap();
    case 6:
      return buildFlashcardsSitemap();
    case 7:
      return buildItalianSitemap();
    default:
      return [];
  }
}

/* ================================================================== */
/*  Chunk 0 — Static pages + Tools + Calculators                      */
/* ================================================================== */

function buildStaticAndToolsSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── Static pages ──────────────────────────────────────────────── */

  /** [path, priority, changeFrequency] */
  const staticPages: [string, number, "weekly" | "monthly"][] = [
    // Homepage
    ["", 1.0, "weekly"],
    // Core hub pages – 0.9
    ["/resources", 0.9, "weekly"],
    ["/tools", 0.9, "weekly"],
    ["/calculators", 0.9, "weekly"],
    ["/for-professors", 0.9, "monthly"],
    ["/clinical-semiotics", 0.9, "monthly"],
    // Section landing pages – 0.8
    ["/about", 0.8, "monthly"],
    ["/resources/questions", 0.8, "monthly"],
    ["/resources/flashcards", 0.8, "monthly"],
    ["/resources/videos", 0.8, "monthly"],
    ["/resources/pdfs", 0.8, "monthly"],
    ["/resources/visuals", 0.8, "monthly"],
    ["/resources/media", 0.8, "monthly"],
    ["/resources/glossary", 0.8, "monthly"],
    ["/resources/clinical-cases", 0.8, "monthly"],
    ["/resources/italian", 0.8, "weekly"],
    ["/for-professors/guides", 0.7, "monthly"],
    ["/for-professors/assets", 0.7, "monthly"],
    ["/for-professors/templates", 0.7, "monthly"],
    ["/resources/media/collections", 0.7, "monthly"],
    ["/events", 0.7, "monthly"],
    ["/articles", 0.8, "weekly"],
    // Utility pages – 0.5
    ["/resources/media/how-to-cite", 0.5, "monthly"],
    ["/license", 0.5, "monthly"],
    ["/privacy", 0.5, "monthly"],
  ];

  for (const [page, priority, changeFrequency] of staticPages) {
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${page}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency,
      priority,
      alternates: buildAlternates(page),
    });
  }

  /* ── Tool detail pages ─────────────────────────────────────────── */

  for (const tool of tools) {
    const prefix = tool.category === "calculator" ? "/calculators" : "/tools";
    const path = `${prefix}/${tool.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  /* ── Tool embed-code pages ─────────────────────────────────────── */

  for (const tool of tools) {
    const prefix = tool.category === "calculator" ? "/calculators" : "/tools";
    const path = `${prefix}/${tool.id}/embed-code`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: buildAlternates(path),
    });
  }

  /* ── Clinical semiotics embed-code pages ───────────────────────── */

  for (const examType of Object.keys(EXAM_COPY)) {
    const path = `/clinical-semiotics/${examType}/embed-code`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: buildAlternates(path),
    });
  }

  /* ── Standalone tool routes (no locale prefix) ─────────────────── */

  const standaloneTools = [
    { path: "/create", priority: 0.8 },
    { path: "/mcq", priority: 0.8 },
    { path: "/flashcards", priority: 0.8 },
    { path: "/editor", priority: 0.8 },
  ];

  for (const tool of standaloneTools) {
    entries.push({
      url: `${BASE_URL}${tool.path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: tool.priority,
    });
  }

  return entries;
}

/* ================================================================== */
/*  Chunk 1 — Media assets, categories, tags, collections             */
/* ================================================================== */

function buildMediaSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── Media asset detail pages ──────────────────────────────────── */

  for (const asset of mediaAssets) {
    const path = `/resources/media/${asset.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: asset.dateModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  /* ── Media asset embed-code pages ──────────────────────────────── */

  for (const asset of mediaAssets) {
    const path = `/resources/media/${asset.slug}/embed-code`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: asset.dateModified,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: buildAlternates(path),
    });
  }

  /* ── Media category pages ──────────────────────────────────────── */

  for (const category of mediaAssetCategories) {
    const path = `/resources/media/category/${category.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  /* ── Media tag pages ───────────────────────────────────────────── */

  for (const tag of getAllTags()) {
    const tagSlug = getTagSlug(tag);
    const path = `/resources/media/tag/${tagSlug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: buildAlternates(path),
    });
  }

  /* ── Media collection pages ────────────────────────────────────── */

  for (const collection of mediaAssetCollections) {
    const path = `/resources/media/collections/${collection.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: collection.dateModified,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}

/* ================================================================== */
/*  Chunk 2 — Glossary terms & categories                             */
/* ================================================================== */

function buildGlossarySitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── Glossary term pages ───────────────────────────────────────── */

  for (const term of glossaryTerms) {
    const path = `/resources/glossary/${term.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: term.lastModified || CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  /* ── Glossary category pages ───────────────────────────────────── */

  for (const category of glossaryCategories) {
    const path = `/resources/glossary/category/${category.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  /* ── Glossary comparison pages ──────────────────────────────────── */

  for (const pair of glossaryComparisonPairs) {
    const path = `/resources/glossary/compare/${pair.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  /* ── Glossary symptom landing pages ─────────────────────────────── */

  for (const sp of getAllSymptomPages()) {
    const path = `/resources/glossary/symptom/${sp.symptom.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}

/* ================================================================== */
/*  Chunk 3 — PDF books, visual lessons, clinical cases               */
/* ================================================================== */

function buildContentSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── PDF book overview pages ───────────────────────────────────── */

  for (const book of pdfBooks) {
    const bookPath = `/resources/pdfs/${book.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${bookPath}`,
      lastModified: book.lastUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(bookPath),
    });

    /* ── PDF chapter pages ─────────────────────────────────────── */

    for (const chapter of book.chapters) {
      const chapterPath = `/resources/pdfs/${book.slug}/${chapter.slug}`;

      entries.push({
        url: `${BASE_URL}/${defaultLocale}${chapterPath}`,
        lastModified: book.lastUpdated,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: buildAlternates(chapterPath),
      });
    }
  }

  /* ── Visual lesson detail pages ────────────────────────────────── */

  for (const lesson of visualLessons) {
    const path = `/resources/visuals/${lesson.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  /* ── Visual lesson embed-code pages ────────────────────────────── */

  for (const lesson of visualLessons) {
    const path = `/resources/visuals/${lesson.id}/embed-code`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: buildAlternates(path),
    });
  }

  /* ── Clinical case detail pages ────────────────────────────────── */

  for (const clinicalCase of clinicalCases) {
    const path = `/resources/clinical-cases/${clinicalCase.id}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  // Note: /embed/* routes are intentionally excluded (noindex pages)

  return entries;
}

/* ================================================================== */
/*  Chunk 4 — Articles                                                  */
/* ================================================================== */

function buildArticlesSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── Articles listing page ──────────────────────────────────────── */
  entries.push({
    url: `${BASE_URL}/${defaultLocale}/articles`,
    lastModified: blogPosts[0]?.dateModified || CONTENT_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: buildAlternates("/articles"),
  });

  /* ── Individual articles ────────────────────────────────────────── */
  for (const post of blogPosts) {
    const path = `/articles/${post.slug}`;

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: post.dateModified,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}

function buildQuestionsSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const catById = new Map(practiceCategories.map(c => [c.id, c]));

  // Category pages
  for (const cat of practiceCategories) {
    const path = `/resources/questions/${cat.slug}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  // Deck pages
  for (const deck of practiceDecks) {
    const catId = deck.primaryCategoryId ?? deck.categoryIds[0];
    const cat = catId != null ? catById.get(catId) : undefined;
    if (!cat) continue;
    const path = `/resources/questions/${cat.slug}/${deck.slug}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  // Individual question pages
  const deckById = new Map(practiceDecks.map(d => [d.id, d]));
  for (const q of practiceQuestions) {
    const deck = deckById.get(q.deckId);
    if (!deck) continue;
    const catId = deck.primaryCategoryId ?? deck.categoryIds[0];
    const cat = catId != null ? catById.get(catId) : undefined;
    if (!cat) continue;
    const path = `/resources/questions/${cat.slug}/${deck.slug}/${q.stableId}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}

function buildFlashcardsSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const catById = new Map(flashcardCategories.map(c => [c.id, c]));

  // Category pages
  for (const cat of flashcardCategories) {
    const path = `/resources/flashcards/${cat.slug}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  // Deck pages
  for (const deck of flashcardDecks) {
    const cat = getFlashcardDeckCategory(deck);
    if (!cat) continue;
    const path = `/resources/flashcards/${cat.slug}/${deck.slug}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: buildAlternates(path),
    });
  }

  // Individual card pages
  const deckById = new Map(flashcardDecks.map(d => [d.id, d]));
  for (const card of flashcards) {
    const deck = deckById.get(card.deckId);
    if (!deck) continue;
    const cat = getFlashcardDeckCategory(deck);
    if (!cat) continue;
    const path = `/resources/flashcards/${cat.slug}/${deck.slug}/${card.stableId}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}

/* ================================================================== */
/*  Chunk 7 — Italian lessons                                          */
/* ================================================================== */

function buildItalianSitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const italianLessons = getAllItalianLessonMeta();

  // Landing page
  const landingPath = "/resources/italian";
  entries.push({
    url: `${BASE_URL}/${defaultLocale}${landingPath}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: buildAlternates(landingPath),
  });

  // Individual lesson pages
  for (const lesson of italianLessons) {
    const path = `/resources/italian/${lesson.slug}`;
    entries.push({
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: buildAlternates(path),
    });
  }

  return entries;
}
