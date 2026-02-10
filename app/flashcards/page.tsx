"use client";

import dynamic from "next/dynamic";

const FlashcardMaker = dynamic(
  () => import("@/components/tools/flashcard-maker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-showcase-purple border-t-transparent" />
      </div>
    ),
  }
);

/**
 * Full-screen flashcard maker tool.
 * No layout chrome — the tool takes over the entire viewport (like /create).
 */
export default function FlashcardsPage() {
  return <FlashcardMaker />;
}
