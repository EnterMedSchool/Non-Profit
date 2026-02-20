"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Check,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Flag,
  Sparkles,
} from "lucide-react";
import type { Flashcard } from "@/types/flashcard-data";

export interface FlashcardStudyProps {
  cards: Flashcard[];
  deckTitle: string;
  locale: string;
}

export default function FlashcardStudy({
  cards: initialCards,
  deckTitle,
  locale,
}: FlashcardStudyProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knewIds, setKnewIds] = useState<Set<number>>(new Set());
  const [studyAgainIds, setStudyAgainIds] = useState<Set<number>>(new Set());
  const [shuffled, setShuffled] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = knewIds.size + studyAgainIds.size;
  const knewCount = knewIds.size;
  const studyAgainCount = studyAgainIds.size;
  const studyAgainCards = cards.filter((c) => studyAgainIds.has(c.id));

  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped((prev) => !prev);
  }, [currentCard]);

  const handleKnewIt = useCallback(() => {
    if (!currentCard) return;
    setKnewIds((prev) => new Set(prev).add(currentCard.id));
    setCurrentIndex((prev) => Math.min(prev + 1, totalCards - 1));
    setIsFlipped(false);
  }, [currentCard, totalCards]);

  const handleStudyAgain = useCallback(() => {
    if (!currentCard) return;
    setStudyAgainIds((prev) => new Set(prev).add(currentCard.id));
    setCurrentIndex((prev) => Math.min(prev + 1, totalCards - 1));
    setIsFlipped(false);
  }, [currentCard, totalCards]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setIsFlipped(false);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex >= totalCards - 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  }, [currentIndex, totalCards]);

  const toggleShuffle = useCallback(() => {
    setShuffled((prev) => {
      const next = !prev;
      if (next) {
        setCards((c) => [...c].sort(() => Math.random() - 0.5));
      } else {
        setCards(initialCards);
      }
      setCurrentIndex(0);
      setIsFlipped(false);
      return next;
    });
  }, [initialCards]);

  const restartAll = useCallback(() => {
    setCards(shuffled ? [...cards].sort(() => Math.random() - 0.5) : initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnewIds(new Set());
    setStudyAgainIds(new Set());
    setCompleted(false);
  }, [shuffled, cards, initialCards]);

  const studyMissed = useCallback(() => {
    setCards(studyAgainCards.length > 0 ? studyAgainCards : cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnewIds(new Set());
    setStudyAgainIds(new Set());
    setCompleted(false);
  }, [studyAgainCards, cards]);

  useEffect(() => {
    if (progress >= totalCards && totalCards > 0) {
      setCompleted(true);
    }
  }, [progress, totalCards]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (completed) return;
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
        case "1":
          e.preventDefault();
          if (isFlipped) handleKnewIt();
          break;
        case "2":
          e.preventDefault();
          if (isFlipped) handleStudyAgain();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [completed, handleFlip, goPrev, goNext, handleKnewIt, handleStudyAgain, isFlipped]);

  const reportUrl = `mailto:ari@entermedschool.com?subject=${encodeURIComponent(`Flashcard Report: ${deckTitle}`)}`;

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border-3 border-ink-dark bg-white p-8 shadow-chunky-purple">
        <p className="font-display text-lg font-bold text-ink-dark">
          No cards in this deck.
        </p>
      </div>
    );
  }

  if (completed) {
    const percent = totalCards > 0 ? Math.round((knewCount / totalCards) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border-3 border-ink-dark bg-white p-8 shadow-chunky-teal">
        <Sparkles className="h-12 w-12 text-showcase-teal" />
        <h2 className="font-display text-2xl font-bold text-ink-dark">
          Deck Complete!
        </h2>
        <p className="text-lg text-ink-muted">
          You knew <strong>{knewCount}</strong> out of <strong>{totalCards}</strong>{" "}
          ({percent}%)
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={restartAll}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-teal px-5 py-2.5 font-display font-bold text-white shadow-chunky-teal transition-all hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Restart All
          </button>
          {studyAgainCards.length > 0 && (
            <button
              onClick={studyMissed}
              className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-orange px-5 py-2.5 font-display font-bold text-white shadow-chunky-orange transition-all hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              Study Missed Cards
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            className={`inline-flex items-center gap-2 rounded-xl border-3 px-3 py-2 text-sm font-bold transition-all ${
              shuffled
                ? "border-ink-dark bg-showcase-purple text-white shadow-chunky-purple"
                : "border-ink-dark bg-white text-ink-dark hover:bg-pastel-lavender"
            }`}
            title="Shuffle cards"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </button>
          <a
            href={reportUrl}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-white px-3 py-2 text-sm font-bold text-ink-dark transition-all hover:bg-pastel-lavender"
            title="Report issue"
          >
            <Flag className="h-4 w-4" />
            Report
          </a>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-showcase-teal/30">
          <motion.div
            className="h-full rounded-full bg-showcase-teal"
            initial={false}
            animate={{ width: `${(progress / totalCards) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <p className="text-sm font-medium text-ink-muted">
          Card {currentIndex + 1} of {totalCards}
        </p>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCard?.id}-${isFlipped}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="cursor-pointer select-none"
          onClick={handleFlip}
        >
          <div
            className={`min-h-[200px] rounded-2xl border-3 border-ink-dark bg-white p-6 transition-shadow ${
              isFlipped ? "shadow-chunky-teal" : "shadow-chunky-purple"
            }`}
          >
            {isFlipped ? (
              <div data-speakable="answer" className="space-y-4">
                <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-ink-dark">
                  {currentCard?.back}
                </p>
                <p className="text-sm text-ink-muted">
                  Source: entermedschool.org
                </p>
              </div>
            ) : (
              <div data-speakable="question" className="flex min-h-[160px] items-center">
                <p className="whitespace-pre-wrap font-body text-xl font-medium leading-relaxed text-ink-dark">
                  {currentCard?.front}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="inline-flex w-full justify-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-purple px-5 py-3 font-display font-bold text-white shadow-chunky-purple transition-all hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Flip
          </button>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleKnewIt}
              className="inline-flex flex-1 justify-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-green px-5 py-3 font-display font-bold text-white shadow-chunky-green transition-all hover:-translate-y-0.5 sm:flex-initial"
            >
              <Check className="h-4 w-4" />
              I Knew It
            </button>
            <button
              onClick={handleStudyAgain}
              className="inline-flex flex-1 justify-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-orange px-5 py-3 font-display font-bold text-white shadow-chunky-orange transition-all hover:-translate-y-0.5 sm:flex-initial"
            >
              <RotateCcw className="h-4 w-4" />
              Study Again
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-white px-4 py-2 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex >= totalCards - 1}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-white px-4 py-2 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-ink-muted">
        Space: flip · 1: I Knew It · 2: Study Again · ← →: Prev/Next
      </p>
    </div>
  );
}
