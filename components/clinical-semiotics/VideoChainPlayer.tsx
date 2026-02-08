"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type Hls from "hls.js";
import {
  Play, Pause, Volume2, VolumeX,
  RotateCcw, AlertTriangle,
  Check, X, Lightbulb, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Local ExamType (replaces import from ExamSelection)                */
/* ------------------------------------------------------------------ */
export type ExamType = string;

/* ------------------------------------------------------------------ */
/*  Exported types                                                     */
/* ------------------------------------------------------------------ */

export interface SceneOverlay {
  /** Unique id for this overlay */
  id: string;
  /** When to show the overlay – seconds from segment start */
  atTime: number;
  /** Type of overlay */
  kind: "tip" | "question" | "info" | "warning";
  /** Title shown in the overlay header */
  title?: string;
  /** Body content (supports markdown-ish plain text) */
  body: string;
  /** For "question" overlays – the available answers */
  answers?: { id: string; label: string; correct?: boolean; explanation?: string }[];
  /** Auto-dismiss after N seconds (0 = manual dismiss) */
  autoDismissSeconds?: number;
}

export interface VideoSegment {
  /** Unique segment id */
  id: string;
  /** Human-readable label */
  label: string;
  /** HLS manifest URL or direct MP4 URL */
  src: string;
  /** Poster / thumbnail URL */
  poster?: string;
  /** Duration in seconds (used for progress UI before metadata loads) */
  durationHint?: number;
  /** Overlays attached to this segment */
  overlays?: SceneOverlay[];
  /** Whether the segment is a "teaser" (partial / preview content) */
  teaser?: boolean;
  /** For time-windowed segments: start time within the source file (seconds) */
  sourceStartTime?: number;
  /** For time-windowed segments: end time within the source file (seconds) */
  sourceEndTime?: number;
}

export interface ExamChain {
  /** The exam type identifier */
  examType: ExamType;
  /** Display name for the exam */
  examLabel: string;
  /** Ordered list of segments */
  segments: VideoSegment[];
}

export interface VideoChainPlayerProps {
  /** The exam chain to play */
  examChain: ExamChain;
  /** Called when a segment finishes playing */
  onSegmentComplete?: (segmentId: string) => void;
  /** Called when the entire chain finishes */
  onChainComplete?: () => void;
  /** Already-completed segment ids (for progress restoration) */
  completedSegments?: string[];
  /** Variant: "default" is the full player, "teaser" is a compact preview */
  variant?: "default" | "teaser";
  /** Additional class names for the root container */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Overlay background values (light mode)                             */
/* ------------------------------------------------------------------ */
const overlayBg = "rgba(255, 255, 255, 0.92)";
const overlayBgStrong = "rgba(255, 255, 255, 0.97)";
const overlayBgLoading = "rgba(255, 255, 255, 0.88)";

/* ------------------------------------------------------------------ */
/*  TipContent – renders the body of a tip / info overlay              */
/* ------------------------------------------------------------------ */
function TipContent({ body }: { body: string }) {
  // Split by double-newlines into paragraphs, support **bold** and *italic*
  const paragraphs = body.split(/\n{2,}/);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-700">
      {paragraphs.map((p, i) => {
        // Bold: **text**
        let formatted: React.ReactNode = p;
        const parts = p.split(/(\*\*[^*]+\*\*)/g);
        if (parts.length > 1) {
          formatted = parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="font-semibold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            // Italic: *text*
            const italicParts = part.split(/(\*[^*]+\*)/g);
            if (italicParts.length > 1) {
              return italicParts.map((ip, k) =>
                ip.startsWith("*") && ip.endsWith("*") ? (
                  <em key={`${j}-${k}`}>{ip.slice(1, -1)}</em>
                ) : (
                  <span key={`${j}-${k}`}>{ip}</span>
                ),
              );
            }
            return part;
          });
        }
        return <p key={i}>{formatted}</p>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: format seconds → m:ss                                      */
/* ------------------------------------------------------------------ */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function VideoChainPlayer({
  examChain,
  onSegmentComplete,
  onChainComplete,
  completedSegments = [],
  variant = "default",
  className,
}: VideoChainPlayerProps) {
  const { segments, examLabel } = examChain;

  /* ---- refs ---- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- state ---- */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<SceneOverlay | null>(null);
  const [answeredOverlays, setAnsweredOverlays] = useState<Set<string>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [completedSet, setCompletedSet] = useState<Set<string>>(
    () => new Set(completedSegments),
  );

  const currentSegment = segments[currentIndex] ?? null;
  const isTeaser = variant === "teaser" || currentSegment?.teaser;
  const isLastSegment = currentIndex === segments.length - 1;

  /* ---- sync external completed set ---- */
  useEffect(() => {
    setCompletedSet(new Set(completedSegments));
  }, [completedSegments]);

  /* ---- merged progress percentage ---- */
  const progressPercent = useMemo(() => {
    if (segments.length === 0) return 0;
    const done = segments.filter((s) => completedSet.has(s.id)).length;
    return Math.round((done / segments.length) * 100);
  }, [segments, completedSet]);

  /* ================================================================ */
  /*  HLS / native video loading                                      */
  /* ================================================================ */
  const loadSource = useCallback(
    async (src: string) => {
      const video = videoRef.current;
      if (!video) return;

      // Tear down previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      setIsLoading(true);
      setHasError(false);
      setCurrentTime(0);
      setDuration(0);

      const isHls =
        src.endsWith(".m3u8") || src.includes("m3u8");

      if (isHls) {
        try {
          const HlsModule = (await import("hls.js")).default;

          if (HlsModule.isSupported()) {
            const hls = new HlsModule({
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
            });
            hlsRef.current = hls;

            hls.on(HlsModule.Events.ERROR, (_event, data) => {
              if (data.fatal) {
                console.error("[VideoChainPlayer] HLS fatal error", data);
                setHasError(true);
                setIsLoading(false);
              }
            });

            hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
            });

            hls.loadSource(src);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS
            video.src = src;
          } else {
            console.error("[VideoChainPlayer] HLS not supported");
            setHasError(true);
            setIsLoading(false);
          }
        } catch (err) {
          console.error("[VideoChainPlayer] Failed to load HLS", err);
          setHasError(true);
          setIsLoading(false);
        }
      } else {
        // Direct MP4 or other native source
        video.src = src;
      }
    },
    [],
  );

  /* Load source when segment changes */
  useEffect(() => {
    if (currentSegment) {
      loadSource(currentSegment.src);
    }
    // Reset overlay state for new segment
    setActiveOverlay(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentSegment?.src]);

  /* Seek to sourceStartTime once video metadata is ready */
  const seekedToStartRef = useRef(false);
  useEffect(() => {
    seekedToStartRef.current = false;
  }, [currentIndex]);

  /* Cleanup HLS on unmount */
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  /* ================================================================ */
  /*  Video event handlers                                             */
  /* ================================================================ */
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const startTime = currentSegment?.sourceStartTime ?? 0;
    const endTime = currentSegment?.sourceEndTime;
    const segDuration = endTime != null ? endTime - startTime : video.duration;

    setDuration(segDuration);
    setIsLoading(false);

    // Seek to sourceStartTime for time-windowed segments
    if (startTime > 0 && !seekedToStartRef.current) {
      seekedToStartRef.current = true;
      video.currentTime = startTime;
    }
  }, [currentSegment]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (currentSegment) {
      setCompletedSet((prev) => new Set([...prev, currentSegment.id]));
      onSegmentComplete?.(currentSegment.id);
    }

    if (isLastSegment) {
      onChainComplete?.();
    } else {
      // Auto-advance to next segment
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentSegment, isLastSegment, onSegmentComplete, onChainComplete]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !currentSegment) return;

    const startTime = currentSegment.sourceStartTime ?? 0;
    const endTime = currentSegment.sourceEndTime;

    // Display time relative to segment start
    const relativeTime = Math.max(0, video.currentTime - startTime);
    setCurrentTime(relativeTime);

    // End segment when we reach sourceEndTime
    if (endTime != null && video.currentTime >= endTime) {
      video.pause();
      handleEnded();
      return;
    }

    // Check for overlays that should trigger (atTime is relative to segment start)
    if (currentSegment.overlays) {
      for (const overlay of currentSegment.overlays) {
        if (
          !answeredOverlays.has(overlay.id) &&
          relativeTime >= overlay.atTime &&
          relativeTime < overlay.atTime + 1 &&
          activeOverlay?.id !== overlay.id
        ) {
          setActiveOverlay(overlay);
          if (overlay.kind === "question") {
            video.pause();
            setIsPlaying(false);
          }
          break;
        }
      }
    }
  }, [currentSegment, answeredOverlays, activeOverlay, handleEnded]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    // Also seek on canPlay in case loadedMetadata fired before HLS was ready
    const video = videoRef.current;
    const startTime = currentSegment?.sourceStartTime ?? 0;
    if (video && startTime > 0 && !seekedToStartRef.current) {
      seekedToStartRef.current = true;
      video.currentTime = startTime;
    }
  }, [currentSegment]);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  /* ================================================================ */
  /*  Playback controls                                                */
  /* ================================================================ */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const video = videoRef.current;
    if (!video || !currentSegment) return;
    const startTime = currentSegment.sourceStartTime ?? 0;
    const endTime = currentSegment.sourceEndTime ?? video.duration;
    const segDuration = endTime - startTime;
    if (!Number.isFinite(segDuration) || segDuration <= 0) return;
    video.currentTime = startTime + fraction * segDuration;
  }, [currentSegment]);

  const restartSegment = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const startTime = currentSegment?.sourceStartTime ?? 0;
    video.currentTime = startTime;
    setCurrentTime(0);
    setActiveOverlay(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredOverlays(new Set());
    video.play().catch(() => {});
    setIsPlaying(true);
  }, [currentSegment]);

  const goToSegment = useCallback(
    (index: number) => {
      if (index < 0 || index >= segments.length) return;
      setCurrentIndex(index);
      setAnsweredOverlays(new Set());
    },
    [segments.length],
  );

  /* ================================================================ */
  /*  Controls auto-hide                                               */
  /* ================================================================ */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  /* ================================================================ */
  /*  Overlay interaction handlers                                     */
  /* ================================================================ */
  const handleDismissOverlay = useCallback(() => {
    if (activeOverlay) {
      setAnsweredOverlays((prev) => new Set([...prev, activeOverlay.id]));
    }
    setActiveOverlay(null);
    setSelectedAnswer(null);
    setShowExplanation(false);

    // Resume playback after dismissing
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [activeOverlay]);

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      setSelectedAnswer(answerId);
      setShowExplanation(true);
    },
    [],
  );

  /* ================================================================ */
  /*  Auto-dismiss for non-question overlays                           */
  /* ================================================================ */
  useEffect(() => {
    if (
      activeOverlay &&
      activeOverlay.kind !== "question" &&
      activeOverlay.autoDismissSeconds &&
      activeOverlay.autoDismissSeconds > 0
    ) {
      const timer = setTimeout(() => {
        handleDismissOverlay();
      }, activeOverlay.autoDismissSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [activeOverlay, handleDismissOverlay]);

  /* ================================================================ */
  /*  Overlay icon helper                                              */
  /* ================================================================ */
  const overlayIcon = useMemo(() => {
    if (!activeOverlay) return null;
    switch (activeOverlay.kind) {
      case "tip":
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case "question":
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      case "info":
        return <FileText className="w-5 h-5 text-indigo-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  }, [activeOverlay]);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (!currentSegment) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12",
          className,
        )}
      >
        <p className="text-sm text-gray-500">No segments available.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-200 bg-black",
        variant === "teaser" && "max-w-md",
        className,
      )}
      onMouseMove={showControls}
      onMouseEnter={showControls}
    >
      {/* ---- Video element ---- */}
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        poster={currentSegment.poster}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onError={handleError}
        onClick={togglePlay}
      />

      {/* ---- Loading overlay ---- */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: overlayBgLoading }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
              <p className="text-sm font-medium text-gray-600">Loading…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Error overlay ---- */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: overlayBgStrong }}
          >
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-semibold text-gray-800">
                Failed to load video
              </p>
              <p className="text-xs text-gray-500">
                Please check your connection and try again.
              </p>
              <button
                onClick={() => {
                  if (currentSegment) loadSource(currentSegment.src);
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Scene overlay (tips / questions / info / warnings) ---- */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            key={activeOverlay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
            style={{
              backgroundColor: isTeaser
                ? "rgba(255, 255, 255, 0.90)"
                : overlayBg,
            }}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-lg"
              style={{ backgroundColor: overlayBgStrong }}
            >
              {/* Overlay header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {overlayIcon}
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeOverlay.title ??
                      (activeOverlay.kind === "tip"
                        ? "Tip"
                        : activeOverlay.kind === "question"
                          ? "Question"
                          : activeOverlay.kind === "warning"
                            ? "Warning"
                            : "Info")}
                  </h3>
                </div>
                {activeOverlay.kind !== "question" && (
                  <button
                    onClick={handleDismissOverlay}
                    className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Overlay body */}
              <TipContent body={activeOverlay.body} />

              {/* Question answers */}
              {activeOverlay.kind === "question" && activeOverlay.answers && (
                <div className="mt-4 space-y-2">
                  {activeOverlay.answers.map((answer) => {
                    const isSelected = selectedAnswer === answer.id;
                    const isCorrect = answer.correct === true;
                    const showResult = showExplanation && isSelected;

                    return (
                      <div key={answer.id}>
                        <button
                          onClick={() => handleSelectAnswer(answer.id)}
                          disabled={showExplanation}
                          className={cn(
                            "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-all",
                            !showExplanation &&
                              "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50",
                            showResult && isCorrect &&
                              "border-green-300 bg-green-50 text-green-800",
                            showResult && !isCorrect &&
                              "border-red-300 bg-red-50 text-red-800",
                            showExplanation && !isSelected &&
                              "border-gray-100 bg-gray-50/50 opacity-60",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {showResult && isCorrect && (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            {showResult && !isCorrect && (
                              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <span>{answer.label}</span>
                          </div>
                        </button>
                        {showResult && answer.explanation && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-1.5 pl-6 text-xs leading-relaxed text-gray-600"
                          >
                            {answer.explanation}
                          </motion.p>
                        )}
                      </div>
                    );
                  })}

                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex justify-end"
                    >
                      <button
                        onClick={handleDismissOverlay}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600"
                      >
                        Continue
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Teaser badge ---- */}
      {isTeaser && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-300">
          Preview
        </div>
      )}

      {/* ---- Controls overlay ---- */}
      <AnimatePresence>
        {(controlsVisible || !isPlaying) && !activeOverlay && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-10"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

            <div className="relative px-4 pb-3 pt-8">
              {/* Progress bar */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/70 tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <div
                  className="group relative flex-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const fraction = (e.clientX - rect.left) / rect.width;
                    seekTo(Math.max(0, Math.min(1, fraction)));
                  }}
                >
                  <div className="h-1 rounded-full bg-white/25 transition-all group-hover:h-1.5">
                    <div
                      className="h-full rounded-full bg-indigo-400 transition-all"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-mono text-white/70 tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>

                  {/* Restart */}
                  <button
                    onClick={restartSegment}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Restart segment"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Mute / Unmute */}
                  <button
                    onClick={toggleMute}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Segment indicator */}
                  {variant === "default" && segments.length > 1 && (
                    <span className="text-[11px] font-medium text-white/60">
                      {currentIndex + 1} / {segments.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Big play button (shown when paused, not loading/error) ---- */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !hasError && !activeOverlay && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={togglePlay}
            className="absolute inset-0 z-5 flex items-center justify-center"
            aria-label="Play"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110 active:scale-95">
              <Play className="w-7 h-7 text-gray-800 ml-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---- Segment list (below video for default variant) ---- */}
      {variant === "default" && segments.length > 1 && (
        <div className="border-t border-gray-200 bg-white">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-indigo-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Segment selector */}
          <div className="flex items-center gap-1 overflow-x-auto p-2 scrollbar-none">
            {segments.map((seg, i) => {
              const isCurrent = i === currentIndex;
              const isDone = completedSet.has(seg.id);

              return (
                <button
                  key={seg.id}
                  onClick={() => goToSegment(i)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                    isCurrent
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                      : isDone
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                  )}
                >
                  {isDone && <Check className="w-3 h-3 text-green-500" />}
                  <span className="truncate max-w-[120px]">{seg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Header with exam label */}
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-600">{examLabel}</p>
            <p className="text-[11px] text-gray-400">
              {completedSet.size} / {segments.length} completed
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
