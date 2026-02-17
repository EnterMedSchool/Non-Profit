import { practiceCategories, practiceDecks } from "@/data/practice-categories";
import { flashcardDecks } from "@/data/flashcard-categories";
import { questionPdfUrls, flashcardPdfUrl } from "@/lib/blob-url";
import {
  getDeckCategory as getFlashcardDeckCategory,
} from "@/lib/flashcard-data";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const defaultLocale = routing.defaultLocale;

/**
 * PDF Sitemap — helps Google discover and index all downloadable PDF
 * resources (exam papers, study guides, printable flashcards).
 *
 * Each `<url>` points to the HTML deck page and includes `<xhtml:link>`
 * alternates referencing the associated PDF files on Vercel Blob.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 */
export async function GET() {
  const entries: string[] = [];

  /* ── Practice-question decks (exam + study guide PDFs) ──────────── */
  const qCatById = new Map(practiceCategories.map((c) => [c.id, c]));

  for (const deck of practiceDecks) {
    const catId = deck.primaryCategoryId ?? deck.categoryIds[0];
    const cat = catId != null ? qCatById.get(catId) : undefined;
    if (!cat) continue;

    const pageUrl = `${BASE_URL}/${defaultLocale}/resources/questions/${cat.slug}/${deck.slug}`;
    const pdfs = questionPdfUrls(cat.slug, deck.slug);

    entries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <xhtml:link rel="alternate" type="application/pdf"
      href="${escapeXml(pdfs.exam)}"
      title="${escapeXml(`${deck.title} — Printable Exam PDF — ${deck.questionCount} multiple-choice questions`)}" />
    <xhtml:link rel="alternate" type="application/pdf"
      href="${escapeXml(pdfs.studyGuide)}"
      title="${escapeXml(`${deck.title} — Study Guide PDF with answers and explanations`)}" />
  </url>`);
  }

  /* ── Flashcard decks (single PDF per deck) ──────────────────────── */
  for (const deck of flashcardDecks) {
    const cat = getFlashcardDeckCategory(deck);
    if (!cat) continue;

    const pageUrl = `${BASE_URL}/${defaultLocale}/resources/flashcards/${cat.slug}/${deck.slug}`;
    const pdfUrl = flashcardPdfUrl(cat.slug, deck.slug);

    entries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <xhtml:link rel="alternate" type="application/pdf"
      href="${escapeXml(pdfUrl)}"
      title="${escapeXml(`${deck.title} — Printable Flashcards PDF — ${deck.cardCount} cards`)}" />
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
