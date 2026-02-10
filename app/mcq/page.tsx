"use client";

import dynamic from "next/dynamic";

const MCQMaker = dynamic(
  () => import("@/components/tools/mcq-maker"),
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
 * Full-screen MCQ maker tool.
 * No layout chrome — the tool takes over the entire viewport (like /create and /flashcards).
 */
export default function MCQPage() {
  return <MCQMaker />;
}
