"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import ExamSelection from "./ExamSelection";
import type { ExamType } from "./ExamSelection";
import IntroVideo from "./IntroVideo";
import type { ExamChain } from "./VideoChainPlayer";
import { EXAM_COPY } from "./examChains";
import { useClinicalSemioticsProgress } from "@/hooks/useClinicalSemioticsProgress";

/* ------------------------------------------------------------------ */
/*  Dynamic import — VideoChainPlayer (no SSR)                         */
/* ------------------------------------------------------------------ */
const VideoChainPlayer = dynamic(() => import("./VideoChainPlayer"), {
  ssr: false,
  loading: () => <div className="cs-loader" />,
});

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const LOGO_SRC = "/logo.png";

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
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
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

  /* ---- Auto-skip intro if unlockExam is provided ---- */
  useEffect(() => {
    if (unlockExamParam) {
      setHasSeenIntro(true);
    }
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
  const handleEnterStudio = () => setHasSeenIntro(true);
  const handleSelectExam = (examType: ExamType) => setSelectedExam(examType);
  const handleExitChain = () => {
    setSelectedExam(null);
    setChain(null);
    setChainError(null);
  };
  const handleRetryChain = () => {
    const exam = selectedExam;
    setSelectedExam(null);
    // Re-trigger by resetting and re-selecting
    setTimeout(() => setSelectedExam(exam), 50);
  };

  /* ================================================================ */
  /*  Render: Intro screen                                             */
  /* ================================================================ */
  if (!hasSeenIntro) {
    return <IntroVideo onEnterStudio={handleEnterStudio} />;
  }

  /* ================================================================ */
  /*  Render: Exam selection                                           */
  /* ================================================================ */
  if (!selectedExam) {
    return (
      <div className="semiotics-root">
        <ExamSelection
          onSelect={handleSelectExam}
          unlockedExams={unlockedExams}
          onOpenEmbed={onOpenEmbed}
          onDownload={onDownload}
        />
      </div>
    );
  }

  /* ================================================================ */
  /*  Render: Loading state                                            */
  /* ================================================================ */
  if (isChainLoading) {
    return (
      <div className="semiotics-root">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
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
              <motion.div
                className="cs-progress-fill"
                initial={{ width: "10%" }}
                animate={{ width: "80%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render: Error state                                              */
  /* ================================================================ */
  if (chainError) {
    return (
      <div className="semiotics-root">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
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
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render: Video chain player                                       */
  /* ================================================================ */
  return (
    <div className="semiotics-root">
      {/* ---- Header banner overlay ---- */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="cs-header-banner relative z-30 flex items-center gap-3 px-4 py-2"
      >
        {/* Logo */}
        <Image
          src={LOGO_SRC}
          alt="Logo"
          width={32}
          height={32}
          className="rounded-lg flex-shrink-0"
        />

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h2
            className="cs-font-display text-sm font-bold truncate"
            style={{ color: "var(--cs-text-dark)" }}
          >
            {currentCopy?.title ?? "Clinical Examination"}
          </h2>
          <p
            className="text-xs truncate"
            style={{ color: "var(--cs-text-muted)" }}
          >
            {currentCopy?.description ?? ""}
          </p>
        </div>

        {/* Exit button */}
        <button
          onClick={handleExitChain}
          className="cs-btn cs-btn-ghost cs-btn-sm flex items-center gap-1 flex-shrink-0"
          aria-label="Exit exam"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </motion.div>

      {/* ---- Video player ---- */}
      <div className="flex-1 relative overflow-hidden">
        {chain && (
          <VideoChainPlayer
            examChain={chain}
            completedSegments={completedSegments}
            onSegmentComplete={saveSegmentProgress}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
