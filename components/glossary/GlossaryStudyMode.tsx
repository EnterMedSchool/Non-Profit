"use client";

import { useState } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

interface GlossaryStudyModeProps {
  children: React.ReactNode;
  sectionIds: string[];
}

/**
 * Wraps term content sections and provides a "study mode" toggle.
 * In study mode, only the definition is visible; other sections
 * are collapsed and can be revealed one at a time.
 */
export default function GlossaryStudyMode({
  children,
  sectionIds,
}: GlossaryStudyModeProps) {
  const t = useTranslations("glossary.term");
  const [studyMode, setStudyMode] = useState(false);
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    new Set(),
  );

  function toggleStudyMode() {
    setStudyMode(!studyMode);
    setRevealedSections(new Set());
  }

  function revealSection(id: string) {
    setRevealedSections((prev) => new Set(prev).add(id));
  }

  return (
    <div>
      {/* Study Mode Toggle */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={toggleStudyMode}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all",
            studyMode
              ? "border-showcase-purple bg-showcase-purple text-white shadow-chunky-sm"
              : "border-ink-dark/10 bg-white text-ink-dark hover:border-showcase-purple/30",
          )}
        >
          <GraduationCap className="h-4 w-4" />
          {t("studyMode")}
          {studyMode ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
        {studyMode && (
          <span className="text-xs text-ink-muted">{t("studyModeHint")}</span>
        )}
      </div>

      {/* Content with study mode overlay */}
      <div className="space-y-6">
        {studyMode
          ? // In study mode, wrap each child with a reveal button
            (Array.isArray(children) ? children : [children]).map(
              (child, i) => {
                const sectionId = sectionIds[i] || `section-${i}`;
                const isDefinition = sectionId === "definition";
                const isRevealed = isDefinition || revealedSections.has(sectionId);

                if (isRevealed) return <div key={sectionId}>{child}</div>;

                return (
                  <div
                    key={sectionId}
                    className="relative overflow-hidden rounded-2xl border-3 border-dashed border-ink-dark/15 bg-ink-dark/[0.02]"
                  >
                    <div className="flex items-center justify-center p-8">
                      <button
                        onClick={() => revealSection(sectionId)}
                        className="inline-flex items-center gap-2 rounded-xl bg-showcase-purple/10 px-5 py-2.5 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20 hover:scale-105"
                      >
                        <Eye className="h-4 w-4" />
                        Reveal Section
                      </button>
                    </div>
                  </div>
                );
              },
            )
          : children}
      </div>
    </div>
  );
}
