"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, MessageSquareText, Layers } from "lucide-react";

const STORAGE_KEY = "ems-embed-onboarding-seen";

interface EmbedOnboardingProps {
  theme: "light" | "dark";
  accentColor: string;
  onDismiss: () => void;
}

/**
 * First-time onboarding overlay for the embed layer viewer.
 * Explains what the viewer is and how to interact with it.
 * Persists dismissal in localStorage so it only shows once.
 */
export default function EmbedOnboarding({
  theme,
  accentColor,
  onDismiss,
}: EmbedOnboardingProps) {
  const isDark = theme === "dark";
  const accentHex = `#${accentColor}`;

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage may not be available in some contexts
    }
    onDismiss();
  }, [onDismiss]);

  // Dismiss on any key press
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  const bgOverlay = isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)";
  const cardBg = isDark ? "rgba(30,30,50,0.95)" : "rgba(255,255,255,0.97)";
  const textColor = isDark ? "#ffffff" : "#1a1a2e";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(26,26,46,0.55)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,46,0.08)";

  const hints = [
    {
      icon: Play,
      title: "Listen & Learn",
      desc: "Press play to hear the narration for each layer",
    },
    {
      icon: ChevronRight,
      title: "Navigate Layers",
      desc: "Use arrows or click the dots to explore",
    },
    {
      icon: MessageSquareText,
      title: "Read Along",
      desc: "Follow the narration text as you listen",
    },
    {
      icon: Layers,
      title: "Build the Picture",
      desc: "Each layer adds new concepts to the scene",
    },
  ];

  return (
    <AnimatePresence>
      <m.div
        className="absolute inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: bgOverlay }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={dismiss}
      >
        <m.div
          className="mx-4 max-w-sm w-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: cardBg,
            backdropFilter: "blur(20px)",
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? "0 25px 50px rgba(0,0,0,0.5)"
              : "0 25px 50px rgba(0,0,0,0.15)",
          }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h2
              className="text-lg font-bold"
              style={{ color: textColor }}
            >
              Interactive Visual Lesson
            </h2>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: mutedColor }}
            >
              Each layer reveals a new medical concept with narration.
              Build up the full picture step by step.
            </p>
          </div>

          {/* Hints grid */}
          <div className="px-5 pb-4 grid grid-cols-2 gap-2">
            {hints.map((hint) => {
              const Icon = hint.icon;
              return (
                <div
                  key={hint.title}
                  className="rounded-xl px-3 py-2.5"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(26,26,46,0.03)",
                    border: `1px solid ${borderColor}`,
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

          {/* CTA button */}
          <div className="px-5 pb-5">
            <button
              onClick={dismiss}
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
    </AnimatePresence>
  );
}

/**
 * Hook to check if the onboarding has been seen before.
 */
export function useEmbedOnboarding(): {
  shouldShow: boolean;
  markSeen: () => void;
} {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      setShouldShow(!seen);
    } catch {
      setShouldShow(false);
    }
  }, []);

  const markSeen = useCallback(() => {
    setShouldShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // noop
    }
  }, []);

  return { shouldShow, markSeen };
}
