/**
 * Asset registry for flashcard backgrounds and decorations.
 *
 * Add your own PNGs to:
 *   public/assets/flashcards/backgrounds/
 *   public/assets/flashcards/decorations/
 *
 * Then register them here so they appear in the customization panel.
 */

export interface FlashcardAsset {
  id: string;
  language: string;
  label: string;
  /** Path relative to /public */
  src: string;
  /** Thumbnail for the picker (defaults to src) */
  thumbnail?: string;
}

export interface FlashcardAssetCategory {
  id: string;
  label: string;
  assets: FlashcardAsset[];
}

// ── Backgrounds ──────────────────────────────────────────────────────
// Add your background PNGs here. Example:
// { id: "bg-dots", label: "Dots", src: "/assets/flashcards/backgrounds/dots.png" }
export const backgrounds: FlashcardAsset[] = [];

// ── Decorations / Stickers ───────────────────────────────────────────
// Add your decoration PNGs here. Example:
// { id: "deco-star", label: "Star", src: "/assets/flashcards/decorations/star.png" }
export const decorations: FlashcardAsset[] = [];

/** Built-in solid color backgrounds as fallback when no PNGs are added */
export const solidBackgrounds = [
  { id: "solid-white", label: "White", color: "#ffffff" },
  { id: "solid-cream", label: "Cream", color: "#faf6f0" },
  { id: "solid-lavender", label: "Lavender", color: "#ede9fe" },
  { id: "solid-mint", label: "Mint", color: "#d1fae5" },
  { id: "solid-peach", label: "Peach", color: "#ffe4d6" },
  { id: "solid-lemon", label: "Lemon", color: "#fef9c3" },
  { id: "solid-sky", label: "Sky", color: "#dbeafe" },
  { id: "solid-rose", label: "Rose", color: "#ffe4e6" },
];

/** Get a background asset by id */
export function getBackgroundById(id: string): FlashcardAsset | undefined {
  return backgrounds.find((b) => b.id === id);
}

/** Get a decoration asset by id */
export function getDecorationById(id: string): FlashcardAsset | undefined {
  return decorations.find((d) => d.id === id);
}
