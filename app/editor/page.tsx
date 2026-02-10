"use client";

import dynamic from "next/dynamic";

const LaTeXEditor = dynamic(
  () => import("@/components/tools/latex-editor"),
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
 * Full-screen LaTeX editor.
 * No layout chrome — just the tool taking over the entire viewport.
 */
export default function EditorPage() {
  return <LaTeXEditor />;
}
