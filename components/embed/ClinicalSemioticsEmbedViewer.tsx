"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { getExamChain, EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import EmbedAttribution from "@/components/embed/EmbedAttribution";

const VideoChainPlayer = dynamic(
  () => import("@/components/clinical-semiotics/VideoChainPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-purple-500" />
      </div>
    ),
  },
);

interface ClinicalSemioticsEmbedViewerProps {
  examType: string;
  bg: string;
  accent: string;
  radius: number;
  theme: "light" | "dark";
}

export default function ClinicalSemioticsEmbedViewer({
  examType,
  bg,
  accent,
  radius,
  theme,
}: ClinicalSemioticsEmbedViewerProps) {
  // Derive chain and error state without calling setState during render
  const chain = useMemo(() => {
    try {
      return getExamChain(examType);
    } catch {
      return null;
    }
  }, [examType]);

  const copy = EXAM_COPY[examType];
  const title = copy?.title ?? examType;
  const isDark = theme === "dark";
  const hasError = !chain || chain.segments.length === 0;

  if (hasError) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          backgroundColor: `#${bg}`,
          color: isDark ? "#ffffff" : "#1a1a2e",
        }}
      >
        <div className="text-center px-6">
          <p className="text-lg font-bold">Exam not available</p>
          <p className="mt-1 text-sm opacity-60">
            Could not load the &ldquo;{examType}&rdquo; exam chain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: `#${bg}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Video player container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: `${radius}px`,
            overflow: "hidden",
          }}
        >
          <VideoChainPlayer
            examChain={chain}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Attribution footer */}
      <EmbedAttribution
        lessonTitle={title}
        lessonUrl="https://entermedschool.org/en/clinical-semiotics"
        theme={theme}
        accentColor={accent}
      />
    </div>
  );
}
