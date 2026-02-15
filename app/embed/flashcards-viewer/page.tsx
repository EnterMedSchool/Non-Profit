"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmbedCard {
  front: string;
  back: string;
}

interface EmbedData {
  title: string;
  cards: EmbedCard[];
}

function decodeHashData(hash: string): EmbedData | null {
  try {
    const base64 = hash.slice(1);
    if (!base64) return null;
    const json = decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(json) as EmbedData;
    if (!data.title || !Array.isArray(data.cards) || data.cards.length === 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default function EmbedFlashcardsViewerPage() {
  const [data, setData] = useState<EmbedData | null>(null);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const decoded = decodeHashData(hash);
    if (decoded) {
      setData(decoded);
      setError(false);
    } else {
      setError(true);
    }
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const goNext = useCallback(() => {
    const totalCards = data?.cards.length ?? 0;
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, data?.cards.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, goPrev, goNext]);

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="font-display text-lg font-bold text-ink-dark mb-2">
            Could not load flashcards
          </p>
          <p className="text-sm text-ink-muted">
            {!data && !error
              ? "Loading..."
              : "Invalid or missing flashcard data in URL. Please check the embed link."}
          </p>
        </div>
      </div>
    );
  }

  const totalCards = data.cards.length;
  const currentCard = data.cards[currentIndex];

  if (!currentCard) return null;

  return (
    <div className="flex min-h-screen flex-col p-6">
      <div className="mx-auto w-full max-w-2xl flex-1">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-lg font-bold text-ink-dark">
            {data.title}
          </h1>
          <span className="text-sm text-ink-muted">
            Card {currentIndex + 1} of {totalCards}
          </span>
        </div>

        {/* Card */}
        <button
          type="button"
          onClick={handleFlip}
          className="block w-full cursor-pointer select-none text-left"
        >
          <div
            className={`min-h-[280px] rounded-2xl border-2 border-ink-dark bg-white p-6 transition-shadow ${
              isFlipped ? "shadow-chunky-teal" : "shadow-chunky-purple"
            }`}
          >
            {isFlipped ? (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-ink-dark">
                  {currentCard.back}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[230px] items-center">
                <p className="whitespace-pre-wrap font-body text-xl font-medium leading-relaxed text-ink-dark">
                  {currentCard.front}
                </p>
              </div>
            )}
          </div>
        </button>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Click card to flip · ← → to navigate
        </p>

        {/* Navigation */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-dark bg-white px-4 py-2.5 font-display font-semibold text-ink-dark transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex >= totalCards - 1}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-showcase-purple bg-showcase-purple px-4 py-2.5 font-display font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Attribution footer */}
      <footer className="mt-6 text-center">
        <a
          href="https://entermedschool.org"
          target="_blank"
          rel="dofollow noopener noreferrer"
          className="text-sm font-medium text-ink-muted hover:text-showcase-purple hover:underline"
        >
          Powered by EnterMedSchool.org
        </a>
      </footer>
    </div>
  );
}
