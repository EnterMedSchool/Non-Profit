"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { visualLessons } from "@/data/visuals";

const EmbedLayerViewer = dynamic(
  () => import("@/components/embed/EmbedLayerViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-purple-500" />
      </div>
    ),
  }
);

function EmbedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations("embed.errors");

  const lessonId = params.id as string;

  // Find lesson by embedId
  const lesson = useMemo(
    () => visualLessons.find((l) => l.embedId === lessonId),
    [lessonId]
  );

  // Read customization from query params
  const bg = searchParams.get("bg") || "ffffff";
  const accent = searchParams.get("accent") || "6C5CE7";
  const radius = parseInt(searchParams.get("radius") || "12", 10);
  const theme = (searchParams.get("theme") || "light") as "light" | "dark";

  if (!lesson) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          backgroundColor: `#${bg}`,
          color: theme === "dark" ? "#fff" : "#1a1a2e",
        }}
      >
        <div className="text-center">
          <p className="text-lg font-bold">{t("lessonNotFound")}</p>
          <p className="mt-1 text-sm opacity-60">
            {t("lessonNotFoundDescription", { lessonId })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <EmbedLayerViewer
      lesson={lesson}
      bg={bg}
      accent={accent}
      radius={radius}
      theme={theme}
    />
  );
}

export default function EmbedVisualsPage() {
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
