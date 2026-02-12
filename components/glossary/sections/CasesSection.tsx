"use client";

import { useState } from "react";
import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import type { ClinicalCase } from "@/types/glossary";

interface CasesSectionProps {
  cases: ClinicalCase[];
  termName: string;
}

function CaseCard({ c, index }: { c: ClinicalCase; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showClues, setShowClues] = useState(false);

  return (
    <div className="rounded-xl border-2 border-showcase-green/20 bg-showcase-green/5 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-showcase-green">
        Case {index + 1}
      </div>

      {/* Stem */}
      <p className="text-sm leading-relaxed text-ink-dark">{c.stem}</p>

      {/* Clues */}
      {c.clues?.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowClues(!showClues)}
            className="text-xs font-bold text-showcase-blue hover:underline"
          >
            {showClues ? "Hide Clues" : `Show ${c.clues.length} Clues`}
          </button>
          {showClues && (
            <ul className="mt-2 space-y-1">
              {c.clues.map((clue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-ink-muted"
                >
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-showcase-blue" />
                  {clue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Answer (spoiler) */}
      <div className="mt-3">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="rounded-lg bg-showcase-green/20 px-3 py-1.5 text-sm font-bold text-showcase-green transition-colors hover:bg-showcase-green/30"
        >
          {showAnswer ? "Hide Answer" : "Reveal Answer"}
        </button>
        {showAnswer && (
          <div className="mt-3 rounded-lg border-2 border-showcase-green/30 bg-white p-3">
            <p className="font-display font-bold text-showcase-green">
              {c.answer}
            </p>
            {c.teaching && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {c.teaching}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CasesSection({
  cases,
  termName,
}: CasesSectionProps) {
  if (!cases.length) return null;

  return (
    <GlossarySectionCard
      id="cases"
      title="Clinical Cases"
      icon="📋"
      accent="#2ECC71"
      seoHeading={`Clinical Cases — ${termName}`}
    >
      <div className="space-y-4">
        {cases.map((c, i) => (
          <CaseCard key={i} c={c} index={i} />
        ))}
      </div>
    </GlossarySectionCard>
  );
}
