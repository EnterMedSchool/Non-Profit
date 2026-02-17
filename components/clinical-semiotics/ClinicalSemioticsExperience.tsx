"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";

import ExamSelection from "./ExamSelection";
import type { ExamType } from "./ExamSelection";
import type { ExamChain } from "./VideoChainPlayer";
import { EXAM_COPY } from "./examChains";
import { useClinicalSemioticsProgress } from "@/hooks/useClinicalSemioticsProgress";

const LANGUAGE_LABELS: Record<string, { flag: string; name: string }> = {
  it: { flag: "\u{1F1EE}\u{1F1F9}", name: "Italian" },
  en: { flag: "\u{1F1EC}\u{1F1E7}", name: "English" },
};

/* ------------------------------------------------------------------ */
/*  Dynamic import — VideoChainPlayer (no SSR)                         */
/* ------------------------------------------------------------------ */
const VideoChainPlayer = dynamic(() => import("./VideoChainPlayer"), {
  ssr: false,
  loading: () => <div className="cs-loader" />,
});

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ClinicalSemioticsExperienceProps {
  onOpenEmbed?: (examType: ExamType) => void;
  onDownload?: (examType: ExamType) => void;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ClinicalSemioticsExperience({
  onOpenEmbed,
  onDownload,
}: ClinicalSemioticsExperienceProps) {
  const searchParams = useSearchParams();

  /* ---- State ---- */
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [chain, setChain] = useState<ExamChain | null>(null);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);

  /* ---- URL param: ?unlockExam= ---- */
  const unlockExamParam = searchParams.get("unlockExam");
  const unlockedExams = useMemo(() => {
    if (!unlockExamParam) return undefined;
    return unlockExamParam.split(",").map((s) => s.trim()).filter(Boolean);
  }, [unlockExamParam]);

  /* ---- Load exam chain when exam is selected ---- */
  useEffect(() => {
    if (!selectedExam) {
      setChain(null);
      setChainError(null);
      return;
    }

    let cancelled = false;
    setIsChainLoading(true);
    setChainError(null);

    (async () => {
      try {
        const { getExamChain } = await import("./examChains");
        const examChain = getExamChain(selectedExam);

        if (cancelled) return;
        setChain(examChain);
        setIsChainLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("[ClinicalSemioticsExperience] Failed to load chain", err);
        setChainError("Failed to load exam content. Please try again.");
        setIsChainLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedExam]);

  /* ---- Progress persistence ---- */
  const {
    completedSegments,
    saveSegmentProgress,
  } = useClinicalSemioticsProgress(selectedExam);

  /* ---- Current exam metadata ---- */
  const currentCopy = selectedExam ? EXAM_COPY[selectedExam] : null;

  /* ---- Handlers ---- */
  const handleSelectExam = (examType: ExamType) => setSelectedExam(examType);
  const handleExitChain = () => {
    setSelectedExam(null);
    setChain(null);
    setChainError(null);
  };
  const handleRetryChain = () => {
    const exam = selectedExam;
    setSelectedExam(null);
    setTimeout(() => setSelectedExam(exam), 50);
  };

  /* ================================================================ */
  /*  Render: Hub page (exam selection)                                */
  /* ================================================================ */
  if (!selectedExam) {
    return (
      <ExamSelection
        onSelect={handleSelectExam}
        unlockedExams={unlockedExams}
        onOpenEmbed={onOpenEmbed}
        onDownload={onDownload}
      />
    );
  }

  /* ================================================================ */
  /*  Render: Loading state                                            */
  /* ================================================================ */
  if (isChainLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cs-card-chunky p-8 flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="cs-loader" style={{ minHeight: 60 }} />
          <p className="cs-font-display text-lg font-bold">
            Loading Exam…
          </p>
          <p className="text-sm" style={{ color: "var(--cs-text-muted)" }}>
            Preparing {currentCopy?.title ?? "exam"} content.
          </p>
          <div className="cs-progress-bar w-full">
            <m.div
              className="cs-progress-fill"
              initial={{ width: "10%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
        </m.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render: Error state                                              */
  /* ================================================================ */
  if (chainError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="cs-card-chunky p-8 flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <span className="cs-badge-sticker cs-badge-coral">Error</span>
          <p
            className="cs-font-display text-lg font-bold"
            style={{ color: "var(--cs-text-dark)" }}
          >
            Something went wrong
          </p>
          <p className="text-sm" style={{ color: "var(--cs-text-muted)" }}>
            {chainError}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetryChain}
              className="cs-btn cs-btn-primary cs-btn-sm"
            >
              Retry
            </button>
            <button
              onClick={handleExitChain}
              className="cs-btn cs-btn-ghost cs-btn-sm"
            >
              Back to Exams
            </button>
          </div>
        </m.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render: Focused player view                                      */
  /* ================================================================ */
  const langInfo = currentCopy?.language ? LANGUAGE_LABELS[currentCopy.language] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      {/* ---- Top navigation bar ---- */}
      <m.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Back button */}
        <button
          onClick={handleExitChain}
          className="group mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white/60"
          style={{ color: "var(--cs-text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to exams
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "var(--cs-text-light)" }}>
          <span>Clinical Semiotics</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: "var(--cs-text-dark)" }} className="font-semibold">
            {currentCopy?.title ?? "Exam"}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1
                className="cs-font-display text-xl md:text-2xl font-extrabold"
                style={{ color: "var(--cs-text-dark)" }}
              >
                {currentCopy?.title ?? "Clinical Examination"}
              </h1>
              {langInfo && (
                <span
                  className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: "var(--cs-bg-sky)",
                    color: "var(--cs-blue)",
                    border: "1px solid var(--cs-blue)",
                  }}
                >
                  {langInfo.flag} {langInfo.name}
                </span>
              )}
            </div>
            <p
              className="text-sm leading-relaxed max-w-xl"
              style={{ color: "var(--cs-text-muted)" }}
            >
              {currentCopy?.description ?? ""}
            </p>
          </div>

          {/* Progress pill */}
          {chain && chain.segments.length > 1 && (
            <div
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: "var(--cs-bg-mint)",
                color: "var(--cs-green)",
                border: "1px solid var(--cs-green)",
              }}
            >
              {completedSegments.length} / {chain.segments.length} completed
            </div>
          )}
        </div>
      </m.div>

      {/* ---- Video player ---- */}
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {chain && (
          <VideoChainPlayer
            examChain={chain}
            completedSegments={completedSegments}
            onSegmentComplete={saveSegmentProgress}
            className="w-full"
          />
        )}
      </m.div>
    </div>
  );
}
