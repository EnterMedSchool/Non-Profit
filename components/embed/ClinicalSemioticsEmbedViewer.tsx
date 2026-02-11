"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ExamChain } from "@/components/clinical-semiotics/VideoChainPlayer";
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

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
  // Dynamically load exam chain data
  const [chain, setChain] = useState<ExamChain | null>(null);
  const [title, setTitle] = useState(examType);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    import("@/components/clinical-semiotics/examChains")
      .then((mod) => {
        try {
          setChain(mod.getExamChain(examType));
        } catch {
          setChain(null);
        }
        const copy = mod.EXAM_COPY[examType];
        setTitle(copy?.title ?? examType);
      })
      .finally(() => setLoading(false));
  }, [examType]);
  const isDark = theme === "dark";

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: `#${bg}` }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-purple-500" />
      </div>
    );
  }

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
        lessonUrl={`${BASE_URL}/en/clinical-semiotics`}
        theme={theme}
        accentColor={accent}
      />
    </div>
  );
}
