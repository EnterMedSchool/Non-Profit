"use client";

import dynamic from "next/dynamic";

export const ReadingProgressBar = dynamic(
  () => import("@/components/pdf-viewer/ReadingProgressBar"),
  { ssr: false },
);

export const TableOfContents = dynamic(
  () => import("@/components/articles/TableOfContents"),
  { ssr: false },
);

export const ShareBar = dynamic(
  () => import("@/components/articles/ShareBar"),
  { ssr: false },
);
