"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Play,
  Pause,
  Loader2,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Check,
  Trophy,
  ExternalLink,
} from "lucide-react";
import type {
  ExamChain,
  VideoChainPlayerHandle,
} from "@/components/clinical-semiotics/VideoChainPlayer";
import EmbedAttribution from "@/components/embed/EmbedAttribution";
import { Fireworks } from "@/components/clinical-semiotics/Fireworks";

/* ------------------------------------------------------------------ */
/*  Lazy-load VideoChainPlayer (no SSR – uses HLS / <video>)           */
/* ------------------------------------------------------------------ */
const VideoChainPlayer = dynamic(
  () => import("@/components/clinical-semiotics/VideoChainPlayer"),
  { ssr: false },
);

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ClinicalSemioticsEmbedViewerProps {
  examType: string;
  bg: string;
  accent: string;
  radius: number;
  theme: "light" | "dark";
}

/* ------------------------------------------------------------------ */
/*  Progress persistence hook                                          */
/* ------------------------------------------------------------------ */
function usePersistedProgress(examType: string) {
  const key = `ems-cs-embed-progress-${examType}`;

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const markComplete = useCallback(
    (segmentId: string) => {
      setCompleted((prev) => {
        if (prev.includes(segmentId)) return prev;
        const next = [...prev, segmentId];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* noop */
        }
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setCompleted([]);
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }, [key]);

  return { completed, markComplete, reset };
}

/* ------------------------------------------------------------------ */
/*  Onboarding hook (separate storage key for CS)                      */
/* ------------------------------------------------------------------ */
const ONBOARDING_KEY = "ems-cs-embed-onboarding-seen";

function useCSOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      setShouldShow(!localStorage.getItem(ONBOARDING_KEY));
    } catch {
      setShouldShow(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      /* noop */
    }
  }, []);

  return { shouldShow, dismiss };
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ClinicalSemioticsEmbedViewer({
  examType,
  bg,
  accent,
  radius,
  theme,
}: ClinicalSemioticsEmbedViewerProps) {
  const locale = useLocale();

  /* ---- Exam data loading ---- */
  const [chain, setChain] = useState<ExamChain | null>(null);
  const [title, setTitle] = useState(examType);
  const [category, setCategory] = useState("");
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
        setCategory(copy?.category ?? "");
      })
      .finally(() => setLoading(false));
  }, [examType]);

  /* ---- Theming (mirrors EmbedLayerViewer) ---- */
  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#1a1a2e";
  const mutedColor = isDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(26,26,46,0.5)";
  const accentHex = `#${accent}`;
  const surfaceBg = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(26,26,46,0.04)";
  const borderCol = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(26,26,46,0.06)";

  /* ---- Player actions ref & synced state ---- */
  const playerRef = useRef<VideoChainPlayerHandle | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStateChange = useCallback(
    (state: {
      currentIndex: number;
      completedCount: number;
      isPlaying: boolean;
    }) => {
      setCurrentIndex(state.currentIndex);
      setCompletedCount(state.completedCount);
      setIsPlaying(state.isPlaying);
    },
    [],
  );

  /* ---- Progress persistence ---- */
  const { completed, markComplete, reset: resetProgress } =
    usePersistedProgress(examType);

  /* ---- Completion state ---- */
  const segments = chain?.segments ?? [];
  const totalSegments = segments.length;
  const allCompleted =
    totalSegments > 0 && completedCount >= totalSegments;
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const handleChainComplete = useCallback(() => {
    setShowCompletion(true);
    setShowFireworks(true);
  }, []);

  const handleSegmentComplete = useCallback(
    (segmentId: string) => {
      markComplete(segmentId);
    },
    [markComplete],
  );

  const handleRestart = useCallback(() => {
    setShowCompletion(false);
    setShowFireworks(false);
    resetProgress();
    playerRef.current?.goToSegment(0);
  }, [resetProgress]);

  /* ---- Onboarding ---- */
  const { shouldShow: showOnboarding, dismiss: dismissOnboarding } =
    useCSOnboarding();

  /* ---- Compact mode via ResizeObserver ---- */
  const rootRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setIsCompact(entry.contentRect.width < 400);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---- Keyboard shortcuts ---- */
  useEffect(() => {
    if (showCompletion) return;

    // During onboarding, any key dismisses
    if (showOnboarding) {
      const handleKey = (e: KeyboardEvent) => {
        e.preventDefault();
        dismissOnboarding();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }

    const handleKey = (e: KeyboardEvent) => {
      const p = playerRef.current;
      if (!p) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (p.currentIndex < p.segmentCount - 1) {
          p.goToSegment(p.currentIndex + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (p.currentIndex > 0) {
          p.goToSegment(p.currentIndex - 1);
        }
      } else if (e.key === " ") {
        e.preventDefault();
        p.togglePlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showOnboarding, showCompletion, dismissOnboarding]);

  /* ---- Progress for controls bar ---- */
  const progress = useMemo(() => {
    if (totalSegments <= 1) return 100;
    return (currentIndex / (totalSegments - 1)) * 100;
  }, [currentIndex, totalSegments]);

  const currentSegmentLabel = segments[currentIndex]?.label ?? "";
  const lessonUrl = `${BASE_URL}/${locale}/clinical-semiotics`;

  /* ================================================================ */
  /*  Themed loading state                                             */
  /* ================================================================ */
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `#${bg}`,
          borderRadius: `${radius}px`,
        }}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: accentHex }}
        />
        <p className="text-sm font-medium" style={{ color: mutedColor }}>
          Loading exam...
        </p>
      </div>
    );
  }

  /* ================================================================ */
  /*  Themed error state                                               */
  /* ================================================================ */
  const hasError = !chain || chain.segments.length === 0;

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `#${bg}`,
          borderRadius: `${radius}px`,
          color: textColor,
        }}
      >
        <div className="text-center px-6">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${accentHex}, ${accentHex}88)`,
            }}
          >
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <p className="text-lg font-bold" style={{ color: textColor }}>
            Exam not available
          </p>
          <p className="mt-1 text-sm" style={{ color: mutedColor }}>
            Could not load the &ldquo;{examType}&rdquo; exam chain.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Main embed layout                                                */
  /* ================================================================ */
  return (
    <div
      ref={rootRef}
      className="flex flex-col overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: `#${bg}`,
        borderRadius: `${radius}px`,
        color: textColor,
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${borderCol}` }}
      >
        <div
          className={`flex-shrink-0 flex items-center justify-center rounded-lg ${isCompact ? "w-5 h-5" : "w-6 h-6"}`}
          style={{
            background: `linear-gradient(135deg, ${accentHex}, ${accentHex}88)`,
          }}
        >
          <Stethoscope
            className={isCompact ? "h-3 w-3 text-white" : "h-3.5 w-3.5 text-white"}
          />
        </div>
        <div className="min-w-0 flex-1">
          {!isCompact && (
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accentHex }}
              >
                {category || "Clinical Semiotics"}
              </span>
              <span style={{ color: mutedColor, fontSize: 8 }}>
                &bull;
              </span>
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: mutedColor }}
              >
                Interactive Exam
              </span>
            </div>
          )}
          <p
            className={`font-semibold truncate leading-tight ${isCompact ? "text-xs" : "text-sm"}`}
            style={{ color: textColor }}
          >
            {title}
          </p>
        </div>
        <div
          className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: surfaceBg,
            color: mutedColor,
            border: `1px solid ${borderCol}`,
          }}
        >
          {totalSegments} segments
        </div>
      </div>

      {/* ── Video canvas ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <VideoChainPlayer
          actionsRef={playerRef}
          examChain={chain}
          variant="embed"
          className="w-full"
          completedSegments={completed}
          onSegmentComplete={handleSegmentComplete}
          onChainComplete={handleChainComplete}
          onStateChange={handleStateChange}
        />

        {/* Completion overlay */}
        <AnimatePresence>
          {showCompletion && (
            <m.div
              className="absolute inset-0 z-[60] flex items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.75)"
                  : "rgba(0,0,0,0.55)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <m.div
                className="mx-4 max-w-sm w-full rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark
                    ? "rgba(30,30,50,0.95)"
                    : "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderCol}`,
                  boxShadow: isDark
                    ? "0 25px 50px rgba(0,0,0,0.5)"
                    : "0 25px 50px rgba(0,0,0,0.15)",
                }}
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="px-5 pt-5 pb-3 text-center">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${accentHex}, ${accentHex}88)`,
                    }}
                  >
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: textColor }}
                  >
                    Exam Complete!
                  </h2>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: mutedColor }}
                  >
                    {title} &mdash; All {totalSegments} segments completed
                  </p>
                </div>
                <div className="px-5 pb-5 flex flex-col gap-2">
                  <a
                    href={lessonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
                    }}
                  >
                    View Full Course
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={handleRestart}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: surfaceBg,
                      color: mutedColor,
                      border: `1px solid ${borderCol}`,
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restart Exam
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls bar ── */}
      <div
        className={`flex-shrink-0 ${isCompact ? "px-2 py-1.5" : "px-3 py-2.5"}`}
        style={{ borderTop: `1px solid ${borderCol}` }}
      >
        {/* Segment progress bar with ticks */}
        <div className={`relative ${isCompact ? "mb-1.5" : "mb-2.5"}`}>
          <div
            className={`${isCompact ? "h-1" : "h-1.5"} w-full rounded-full overflow-hidden`}
            style={{ backgroundColor: surfaceBg }}
          >
            <m.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentHex }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          {/* Segment tick marks */}
          {totalSegments > 2 && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              {segments.map((_, i) => {
                if (i === 0 || i === totalSegments - 1) return null;
                const pos = (i / (totalSegments - 1)) * 100;
                const isDone = completed.includes(segments[i].id);
                return (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2.5 rounded-full -translate-x-1/2"
                    style={{
                      left: `${pos}%`,
                      backgroundColor: isDone
                        ? `${accentHex}60`
                        : isDark
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(26,26,46,0.1)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Play/Pause button */}
          <m.button
            onClick={() => playerRef.current?.togglePlay()}
            className={`flex items-center justify-center rounded-full flex-shrink-0 transition-all hover:scale-105 active:scale-95 ${isCompact ? "h-7 w-7" : "h-9 w-9"}`}
            style={{ backgroundColor: accentHex, color: "#fff" }}
          >
            {isPlaying ? (
              <Pause className={isCompact ? "h-3 w-3" : "h-4 w-4"} />
            ) : (
              <Play
                className={`${isCompact ? "h-3 w-3" : "h-4 w-4"} ms-0.5`}
              />
            )}
          </m.button>

          {/* Segment info */}
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold truncate leading-tight"
                style={{ color: textColor }}
              >
                {currentSegmentLabel}
              </p>
              <p
                className="text-[10px] truncate leading-tight"
                style={{ color: mutedColor }}
              >
                Segment {currentIndex + 1} of {totalSegments}
              </p>
            </div>
          )}

          {/* Segment dots */}
          <div
            className={`flex items-center gap-1 flex-shrink-0 ${isCompact ? "ms-auto" : ""}`}
          >
            {segments.map((seg, i) => {
              const isCurrent = i === currentIndex;
              const isDone = completed.includes(seg.id);
              const hasCheckpoints =
                (seg.overlays?.length ?? 0) > 0;

              return (
                <button
                  key={seg.id}
                  onClick={() => playerRef.current?.goToSegment(i)}
                  className="relative rounded-full transition-all hover:scale-125"
                  title={seg.label}
                  style={{
                    width: isCurrent ? 10 : 6,
                    height: isCurrent ? 10 : 6,
                    backgroundColor: isCurrent
                      ? accentHex
                      : isDone
                        ? `${accentHex}80`
                        : isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(26,26,46,0.08)",
                  }}
                >
                  {/* Tiny checkpoint indicator */}
                  {hasCheckpoints && !isCurrent && !isDone && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(26,26,46,0.2)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Attribution footer ── */}
      <EmbedAttribution
        lessonTitle={title}
        lessonUrl={lessonUrl}
        theme={theme}
        accentColor={accent}
      />

      {/* ── Onboarding overlay ── */}
      <AnimatePresence>
        {showOnboarding && (
          <m.div
            className="absolute inset-0 z-[9999] flex items-center justify-center"
            style={{
              backgroundColor: isDark
                ? "rgba(0,0,0,0.75)"
                : "rgba(0,0,0,0.55)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissOnboarding}
          >
            <m.div
              className="mx-4 max-w-sm w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: isDark
                  ? "rgba(30,30,50,0.95)"
                  : "rgba(255,255,255,0.97)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${borderCol}`,
                boxShadow: isDark
                  ? "0 25px 50px rgba(0,0,0,0.5)"
                  : "0 25px 50px rgba(0,0,0,0.15)",
              }}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 text-center">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${accentHex}, ${accentHex}88)`,
                  }}
                >
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: textColor }}
                >
                  Interactive Clinical Exam
                </h2>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: mutedColor }}
                >
                  Watch video segments, answer checkpoint questions, and track
                  your progress through the exam.
                </p>
              </div>

              {/* Hints grid */}
              <div className="px-5 pb-4 grid grid-cols-2 gap-2">
                {[
                  {
                    icon: Play,
                    title: "Watch & Listen",
                    desc: "Video segments with clinical demonstrations",
                  },
                  {
                    icon: HelpCircle,
                    title: "Answer Questions",
                    desc: "Checkpoint questions test your understanding",
                  },
                  {
                    icon: Check,
                    title: "Track Progress",
                    desc: "Complete segments to advance through the exam",
                  },
                  {
                    icon: Stethoscope,
                    title: "Clinical Skills",
                    desc: "Practice real examination techniques",
                  },
                ].map((hint) => {
                  const Icon = hint.icon;
                  return (
                    <div
                      key={hint.title}
                      className="rounded-xl px-3 py-2.5"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(26,26,46,0.03)",
                        border: `1px solid ${borderCol}`,
                      }}
                    >
                      <Icon
                        className="h-4 w-4 mb-1"
                        style={{ color: accentHex }}
                      />
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: textColor }}
                      >
                        {hint.title}
                      </p>
                      <p
                        className="text-[10px] leading-tight mt-0.5"
                        style={{ color: mutedColor }}
                      >
                        {hint.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={dismissOnboarding}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
                  }}
                >
                  Got it, let&apos;s start!
                </button>
                <p
                  className="mt-2 text-center text-[10px]"
                  style={{ color: mutedColor }}
                >
                  or click anywhere / press any key
                </p>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Fireworks on completion ── */}
      {showFireworks && <Fireworks />}
    </div>
  );
}
