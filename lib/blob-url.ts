/* ─────────────────────────────────────────────────────────────────
 *  Blob Asset URL Helper
 *
 *  Converts a local public-folder path (e.g. "/logo.png") into the
 *  corresponding Vercel Blob URL. All media assets that were
 *  migrated from public/ to Vercel Blob should use this helper.
 *
 *  Set NEXT_PUBLIC_BLOB_URL in .env.local and Vercel project settings.
 * ────────────────────────────────────────────────────────────────── */

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";

/**
 * Build a full Vercel Blob URL for a media asset.
 *
 * @example
 *   blobAsset("/logo.png")
 *   // → "https://<store>.public.blob.vercel-storage.com/logo.png"
 *
 *   blobAsset("/visuals/gi/achalasia/thumbnail.png")
 *   // → "https://<store>.public.blob.vercel-storage.com/visuals/gi/achalasia/thumbnail.png"
 */
export function blobAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BLOB_BASE}${normalized}`;
}

/**
 * Build blob URLs for pre-generated question-deck PDFs.
 *
 * @example
 *   questionPdfUrls("cell-organelles", "premed-biology-nucleus")
 *   // → { exam: "https://…/pdfs/questions/cell-organelles/premed-biology-nucleus-exam.pdf",
 *   //      studyGuide: "https://…/pdfs/questions/cell-organelles/premed-biology-nucleus-study-guide.pdf" }
 */
export function questionPdfUrls(categorySlug: string, deckSlug: string) {
  return {
    exam: blobAsset(`/pdfs/questions/${categorySlug}/${deckSlug}-exam.pdf`),
    studyGuide: blobAsset(`/pdfs/questions/${categorySlug}/${deckSlug}-study-guide.pdf`),
  };
}

/**
 * Build blob URL for a pre-generated flashcard-deck PDF.
 */
export function flashcardPdfUrl(categorySlug: string, deckSlug: string) {
  return blobAsset(`/pdfs/flashcards/${categorySlug}/${deckSlug}.pdf`);
}
