"use client";

import "@/styles/clinical-semiotics.css";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";

const ClinicalSemioticsEmbedViewer = dynamic(
  () => import("@/components/embed/ClinicalSemioticsEmbedViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-purple-500" />
      </div>
    ),
  },
);

function EmbedContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const examType = params.id as string;

  // Read customization from query params
  const bg = searchParams.get("bg") || "ffffff";
  const accent = searchParams.get("accent") || "6C5CE7";
  const radius = parseInt(searchParams.get("radius") || "12", 10);
  const theme = (searchParams.get("theme") || "light") as "light" | "dark";

  // Validate exam type
  const isValid = useMemo(() => !!EXAM_COPY[examType], [examType]);

  if (!isValid) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          backgroundColor: `#${bg}`,
          color: theme === "dark" ? "#fff" : "#1a1a2e",
        }}
      >
        <div className="text-center">
          <p className="text-lg font-bold">Exam not found</p>
          <p className="mt-1 text-sm opacity-60">
            The clinical semiotics exam &ldquo;{examType}&rdquo; does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClinicalSemioticsEmbedViewer
      examType={examType}
      bg={bg}
      accent={accent}
      radius={radius}
      theme={theme}
    />
  );
}

export default function EmbedClinicalSemioticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-purple-500" />
        </div>
      }
    >
      <EmbedContent />
    </Suspense>
  );
}
