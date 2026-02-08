"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface RichTooltipProps {
  children: ReactNode;
  content: {
    title: string;
    description: string;
    preview?: string;
    shortcut?: string;
    code?: string;
  };
  position?: "top" | "bottom";
}

export default function RichTooltip({
  children,
  content,
  position = "bottom",
}: RichTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = 240;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        // Keep within viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
        const top =
          position === "top"
            ? rect.top - 8
            : rect.bottom + 8;
        setCoords({ top, left });
        setIsVisible(true);
      }
    }, 400);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-flex"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[80] pointer-events-none"
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={hide}
        >
          <div
            className={`w-60 bg-white rounded-xl border-2 border-ink-dark/10 shadow-xl p-3 ${
              position === "top" ? "-translate-y-full" : ""
            }`}
          >
            {/* Title */}
            <p className="text-xs font-bold text-ink-dark mb-1">{content.title}</p>

            {/* Description */}
            <p className="text-[11px] text-ink-muted leading-relaxed mb-2">
              {content.description}
            </p>

            {/* Rendered preview */}
            {content.preview && (
              <div className="px-2 py-1.5 bg-pastel-cream/50 rounded-lg mb-2 border border-ink-dark/5">
                <p className="text-[10px] text-ink-light mb-0.5">Output:</p>
                <p
                  className="text-xs text-ink-dark"
                  dangerouslySetInnerHTML={{ __html: content.preview }}
                />
              </div>
            )}

            {/* Code */}
            {content.code && (
              <div className="px-2 py-1 bg-gray-50 rounded-md border border-ink-dark/5 mb-2">
                <code className="text-[10px] font-mono text-showcase-purple">
                  {content.code}
                </code>
              </div>
            )}

            {/* Shortcut */}
            {content.shortcut && (
              <div className="flex items-center gap-1.5 text-[10px] text-ink-light">
                <span>Shortcut:</span>
                <kbd className="font-mono bg-pastel-cream px-1.5 py-0.5 rounded border border-ink-dark/10 text-ink-dark">
                  {content.shortcut}
                </kbd>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
