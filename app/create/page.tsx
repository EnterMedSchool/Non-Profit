"use client";

import dynamic from "next/dynamic";

const IllustrationMaker = dynamic(
  () => import("@/components/tools/illustration-maker"),
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
 * Full-screen scientific illustration maker.
 * No layout chrome — just the tool taking over the entire viewport.
 */
export default function CreatePage() {
  return <IllustrationMaker />;
}
