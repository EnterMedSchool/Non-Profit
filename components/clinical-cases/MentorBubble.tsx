"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Lightbulb, GraduationCap, X } from "lucide-react";

interface MentorBubbleProps {
  text: string;
  teachingPoint?: string;
  delay?: number;
  autoDismissMs?: number;
}

export default function MentorBubble({
  text,
  teachingPoint,
  delay = 0.5,
  autoDismissMs = 0,
}: MentorBubbleProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => setVisible(false), autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ delay, duration: 0.4 }}
          className="relative mt-6 rounded-2xl border-3 border-showcase-purple/20 bg-pastel-lavender/40 p-4 shadow-sm"
        >
          {/* Dismiss button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 rounded-lg p-1.5 text-ink-light hover:text-ink-muted hover:bg-white/60 transition-colors"
            aria-label="Dismiss mentor comment"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Mentor header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-showcase-purple/15">
              <GraduationCap className="h-3.5 w-3.5 text-showcase-purple" />
            </div>
            <span className="text-xs font-bold text-showcase-purple">
              Dr. Mentor
            </span>
          </div>

          {/* Comment text */}
          <p className="text-sm text-ink-muted leading-relaxed pr-6">
            {text}
          </p>

          {/* Teaching point */}
          {teachingPoint && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-showcase-yellow/10 border-2 border-showcase-yellow/20 px-3 py-2.5">
              <Lightbulb className="h-3.5 w-3.5 text-showcase-yellow shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-showcase-yellow/90 leading-relaxed">
                {teachingPoint}
              </p>
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
