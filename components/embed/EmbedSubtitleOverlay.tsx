"use client";

import { useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EmbedSubtitleOverlayProps {
  narration: string | undefined;
  layerName: string;
  layerIndex: number;
  totalLayers: number;
  isVisible: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  theme: "light" | "dark";
  accentColor: string;
}

/**
 * Narration text overlay shown at the bottom of the canvas area.
 * Displays the current layer's narration script as subtitles.
 */
export default function EmbedSubtitleOverlay({
  narration,
  layerName,
  layerIndex,
  totalLayers,
  isVisible,
  isExpanded,
  onToggleExpand,
  theme,
  accentColor,
}: EmbedSubtitleOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";
  const accentHex = `#${accentColor}`;

  // Reset scroll when layer changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [layerIndex]);

  if (!narration || !isVisible) return null;

  const bgColor = isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.92)";
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(26,26,46,0.85)";
  const mutedColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(26,26,46,0.45)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,46,0.08)";

  return (
    <AnimatePresence>
      <m.div
        key={`subtitle-${layerIndex}`}
        className="absolute bottom-0 left-0 right-0 z-40"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="mx-2 mb-2 rounded-xl overflow-hidden"
          style={{
            backgroundColor: bgColor,
            backdropFilter: "blur(16px)",
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header: layer name + expand toggle */}
          <button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 transition-colors hover:opacity-80"
            style={{ borderBottom: isExpanded ? `1px solid ${borderColor}` : "none" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: accentHex, color: "#fff" }}
              >
                {layerIndex + 1}
              </span>
              <span
                className="text-xs font-semibold truncate"
                style={{ color: textColor }}
              >
                {layerName}
              </span>
              <span className="text-[10px]" style={{ color: mutedColor }}>
                {layerIndex + 1}/{totalLayers}
              </span>
            </div>
            <div
              className="flex-shrink-0 flex items-center gap-1"
              style={{ color: mutedColor }}
            >
              <span className="text-[10px]">
                {isExpanded ? "Collapse" : "Read along"}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </div>
          </button>

          {/* Narration text body */}
          <AnimatePresence>
            {isExpanded && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div
                  ref={scrollRef}
                  className="px-3 py-2 overflow-y-auto text-xs leading-relaxed"
                  style={{
                    color: textColor,
                    maxHeight: "120px",
                  }}
                >
                  {narration.split("\n\n").map((paragraph, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {paragraph.split("\n").map((line, j) => (
                        <span key={j}>
                          {j > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </AnimatePresence>
  );
}
