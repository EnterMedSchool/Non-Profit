"use client";

import { cn } from "@/lib/cn";

interface GlossaryAlphabetBarProps {
  activeLetter: string | null;
  availableLetters: string[];
  onLetterClick: (letter: string | null) => void;
}

export default function GlossaryAlphabetBar({
  activeLetter,
  availableLetters,
  onLetterClick,
}: GlossaryAlphabetBarProps) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <nav
      className="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-center gap-1 bg-white/80 px-4 py-3 backdrop-blur-md sm:gap-1.5"
      aria-label="Alphabet index"
    >
      <button
        onClick={() => onLetterClick(null)}
        className={cn(
          "rounded-lg px-2.5 py-1 text-sm font-bold transition-all",
          activeLetter === null
            ? "bg-showcase-purple text-white shadow-md"
            : "text-ink-muted hover:bg-showcase-purple/10 hover:text-showcase-purple",
        )}
      >
        All
      </button>
      {letters.map((letter) => {
        const hasTerms = availableLetters.includes(letter);
        return (
          <button
            key={letter}
            onClick={() => hasTerms && onLetterClick(letter)}
            disabled={!hasTerms}
            className={cn(
              "h-8 w-8 rounded-lg text-sm font-bold transition-all",
              activeLetter === letter
                ? "bg-showcase-purple text-white shadow-md"
                : hasTerms
                  ? "text-ink-dark hover:bg-showcase-purple/10 hover:text-showcase-purple"
                  : "text-ink-light/40 cursor-not-allowed",
            )}
            aria-label={`Filter by letter ${letter}`}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
}
