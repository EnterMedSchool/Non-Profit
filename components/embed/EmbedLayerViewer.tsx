"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  Layers,
  MessageSquareText,
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import EmbedAttribution from "@/components/embed/EmbedAttribution";
import EmbedSubtitleOverlay from "@/components/embed/EmbedSubtitleOverlay";
import EmbedOnboarding, {
  useEmbedOnboarding,
} from "@/components/embed/EmbedOnboarding";
import type { VisualLesson } from "@/data/visuals";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface EmbedLayerViewerProps {
  lesson: VisualLesson;
  bg: string;
  accent: string;
  radius: number;
  theme: "light" | "dark";
}

/** Duration of the clip-path drawing reveal (seconds) */
const DRAW_DURATION = 1.0;

export default function EmbedLayerViewer({
  lesson,
  bg,
  accent,
  radius,
  theme,
}: EmbedLayerViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedLayers, setRevealedLayers] = useState<Set<number>>(
    new Set([0])
  );
  const [loadedLayers, setLoadedLayers] = useState<Set<number>>(new Set());
  const [animatingLayers, setAnimatingLayers] = useState<Set<number>>(
    new Set()
  );
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitlesExpanded, setSubtitlesExpanded] = useState(false);
  const [hasEverPlayed, setHasEverPlayed] = useState(false);

  // Onboarding
  const { shouldShow: showOnboarding, markSeen: dismissOnboarding } =
    useEmbedOnboarding();

  const currentLayer = lesson.layers[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lesson.layers.length - 1;
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

  // ─── Audio ────────────────────────────────────────────────
  const {
    isPlaying,
    isLoading: audioLoading,
    toggle,
    pause,
  } = useAudioPlayer({
    src: currentLayer?.audioPath,
    onEnded: () => {
      if (!isLast) goToLayer(currentIndex + 1);
    },
  });

  // Track if the user has ever played audio
  useEffect(() => {
    if (isPlaying && !hasEverPlayed) setHasEverPlayed(true);
  }, [isPlaying, hasEverPlayed]);

  // Auto-expand subtitles when audio starts playing
  useEffect(() => {
    if (isPlaying && showSubtitles && currentLayer?.narration) {
      setSubtitlesExpanded(true);
    }
  }, [isPlaying, showSubtitles, currentLayer?.narration]);

  // ─── Navigation ───────────────────────────────────────────
  const goToLayer = useCallback(
    (index: number) => {
      if (index < 0 || index >= lesson.layers.length) return;
      pause();
      setCurrentIndex(index);
      // Only reveal layers 0 through index (hide all layers after)
      const revealed = new Set(
        Array.from({ length: index + 1 }, (_, i) => i)
      );
      setRevealedLayers(revealed);
      // Clear loaded/animating state for layers beyond target
      setLoadedLayers((prev) => {
        const next = new Set<number>();
        prev.forEach((l) => {
          if (l <= index) next.add(l);
        });
        return next;
      });
      setAnimatingLayers((prev) => {
        const next = new Set<number>();
        prev.forEach((l) => {
          if (l <= index) next.add(l);
        });
        return next;
      });
    },
    [lesson.layers.length, pause]
  );

  const nextLayer = useCallback(() => {
    if (!isLast) goToLayer(currentIndex + 1);
  }, [isLast, currentIndex, goToLayer]);

  const prevLayer = useCallback(() => {
    if (!isFirst) goToLayer(currentIndex - 1);
  }, [isFirst, currentIndex, goToLayer]);

  // ─── Image load tracking ──────────────────────────────────
  const handleImageLoad = useCallback(
    (index: number, isBackground: boolean) => {
      setLoadedLayers((prev) => new Set([...prev, index]));

      if (!isBackground) {
        setAnimatingLayers((prev) => new Set([...prev, index]));
        setTimeout(() => {
          setAnimatingLayers((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
        }, DRAW_DURATION * 1000 + 200);
      }
    },
    []
  );

  // Is the current layer still loading or animating?
  const isCurrentBusy =
    (revealedLayers.has(currentIndex) && !loadedLayers.has(currentIndex)) ||
    animatingLayers.has(currentIndex);

  // ─── Keyboard nav ─────────────────────────────────────────
  useEffect(() => {
    if (showOnboarding) return; // Don't navigate while onboarding is shown
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextLayer();
      else if (e.key === "ArrowLeft") prevLayer();
      else if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextLayer, prevLayer, toggle, showOnboarding]);

  // ─── Progress ─────────────────────────────────────────────
  const progress =
    lesson.layers.length > 1
      ? (currentIndex / (lesson.layers.length - 1)) * 100
      : 100;

  const lessonUrl = `${BASE_URL}/en/resources/visuals`;

  return (
    <div
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
      {/* ── Header with lesson info ── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${borderCol}` }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${accentHex}, ${accentHex}88)`,
          }}
        >
          <Layers className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: accentHex }}
            >
              {lesson.category}
            </span>
            <span style={{ color: mutedColor, fontSize: 8 }}>&bull;</span>
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: mutedColor }}
            >
              Interactive Visual
            </span>
          </div>
          <p
            className="text-sm font-semibold truncate leading-tight"
            style={{ color: textColor }}
          >
            {lesson.title}
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
          {lesson.layers.length} layers
        </div>
      </div>

      {/* ── Layer canvas area ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Stacked layers with drawing reveal animation */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {lesson.layers.map((layer, i) => {
              const isRevealed = revealedLayers.has(i);
              const isBackground = i === 0;
              const isLoaded = loadedLayers.has(i);

              if (!isRevealed) return null;

              return (
                <m.div
                  key={layer.index}
                  className="absolute inset-0"
                  style={{ zIndex: i + 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoaded ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Drawing reveal via clip-path */}
                  <m.div
                    className="absolute inset-0"
                    initial={{
                      clipPath: isBackground
                        ? "inset(0% 0% 0% 0%)"
                        : "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",
                      filter: isBackground ? "none" : "blur(4px)",
                    }}
                    animate={{
                      clipPath: isBackground
                        ? "inset(0% 0% 0% 0%)"
                        : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                      filter: "none",
                    }}
                    transition={{
                      duration: isBackground ? 0 : DRAW_DURATION,
                      ease: [0.22, 1, 0.36, 1],
                      delay: isBackground ? 0 : 0.1,
                    }}
                  >
                    <Image
                      src={layer.imagePath}
                      alt={layer.name}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={i <= 1}
                      onLoad={() => handleImageLoad(i, isBackground)}
                    />
                  </m.div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Loading spinner overlay */}
        <AnimatePresence>
          {isCurrentBusy && currentIndex > 0 && (
            <m.div
              className="absolute inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  backgroundColor: surfaceBg,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Loader2
                  className="h-4 w-4 animate-spin"
                  style={{ color: accentHex }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: mutedColor }}
                >
                  Loading...
                </span>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Play hint overlay — shown on first layer before any audio is played */}
        <AnimatePresence>
          {!hasEverPlayed && !isPlaying && !showOnboarding && currentIndex === 0 && (
            <m.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <m.button
                onClick={() => toggle()}
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.7)"
                    : "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${borderCol}`,
                  boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.3)"
                    : "0 8px 32px rgba(0,0,0,0.1)",
                }}
                animate={{
                  boxShadow: [
                    `0 0 0 0px ${accentHex}00`,
                    `0 0 0 8px ${accentHex}15`,
                    `0 0 0 0px ${accentHex}00`,
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: accentHex }}
                >
                  <Play className="h-5 w-5 text-white ml-0.5" />
                </div>
                <div className="text-left">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: textColor }}
                  >
                    Press play to start
                  </p>
                  <p className="text-[10px]" style={{ color: mutedColor }}>
                    Listen to the narration for each layer
                  </p>
                </div>
              </m.button>
            </m.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prevLayer}
          disabled={isFirst}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-20 disabled:hover:scale-100"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft className="h-5 w-5" style={{ color: textColor }} />
        </button>
        <button
          onClick={nextLayer}
          disabled={isLast}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-20 disabled:hover:scale-100"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronRight className="h-5 w-5" style={{ color: textColor }} />
        </button>

        {/* Subtitle overlay */}
        <EmbedSubtitleOverlay
          narration={currentLayer?.narration}
          layerName={currentLayer?.name ?? ""}
          layerIndex={currentIndex}
          totalLayers={lesson.layers.length}
          isVisible={showSubtitles && !!currentLayer?.narration}
          isExpanded={subtitlesExpanded}
          onToggleExpand={() => setSubtitlesExpanded((p) => !p)}
          theme={theme}
          accentColor={accent}
        />
      </div>

      {/* ── Controls bar ── */}
      <div
        className="flex-shrink-0 px-3 py-2.5"
        style={{ borderTop: `1px solid ${borderCol}` }}
      >
        {/* Progress bar with layer ticks */}
        <div className="relative mb-2.5">
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
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
          {/* Layer tick marks on the progress bar */}
          {lesson.layers.length > 2 && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              {lesson.layers.map((_, i) => {
                if (i === 0 || i === lesson.layers.length - 1) return null;
                const pos = (i / (lesson.layers.length - 1)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2.5 rounded-full -translate-x-1/2"
                    style={{
                      left: `${pos}%`,
                      backgroundColor: revealedLayers.has(i)
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

        <div className="flex items-center gap-2">
          {/* Play/Pause button */}
          <m.button
            onClick={() => toggle()}
            className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentHex, color: "#fff" }}
            animate={
              !isPlaying && !hasEverPlayed
                ? {
                    scale: [1, 1.08, 1],
                  }
                : {}
            }
            transition={
              !isPlaying && !hasEverPlayed
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : {}
            }
          >
            {audioLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </m.button>

          {/* Layer info */}
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold truncate leading-tight"
              style={{ color: textColor }}
            >
              {currentLayer?.name}
            </p>
            <p
              className="text-[10px] truncate leading-tight"
              style={{ color: mutedColor }}
            >
              Layer {currentIndex + 1} of {lesson.layers.length}
            </p>
          </div>

          {/* Subtitle toggle */}
          {currentLayer?.narration && (
            <button
              onClick={() => {
                setShowSubtitles((p) => !p);
                if (!showSubtitles) setSubtitlesExpanded(false);
              }}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: showSubtitles
                  ? `${accentHex}20`
                  : surfaceBg,
                color: showSubtitles ? accentHex : mutedColor,
                border: `1px solid ${
                  showSubtitles ? `${accentHex}40` : borderCol
                }`,
              }}
              title={showSubtitles ? "Hide narration" : "Show narration"}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Layer dots */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {lesson.layers.map((_, i) => (
              <button
                key={i}
                onClick={() => goToLayer(i)}
                className="rounded-full transition-all hover:scale-125"
                title={lesson.layers[i]?.name}
                style={{
                  width: i === currentIndex ? 10 : 6,
                  height: i === currentIndex ? 10 : 6,
                  backgroundColor:
                    i === currentIndex
                      ? accentHex
                      : revealedLayers.has(i)
                        ? isDark
                          ? "rgba(255,255,255,0.35)"
                          : "rgba(26,26,46,0.2)"
                        : isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(26,26,46,0.08)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Attribution footer ── */}
      <EmbedAttribution
        lessonTitle={lesson.title}
        lessonUrl={lessonUrl}
        theme={theme}
        accentColor={accent}
      />

      {/* ── Onboarding overlay ── */}
      {showOnboarding && (
        <EmbedOnboarding
          theme={theme}
          accentColor={accent}
          onDismiss={dismissOnboarding}
        />
      )}
    </div>
  );
}
