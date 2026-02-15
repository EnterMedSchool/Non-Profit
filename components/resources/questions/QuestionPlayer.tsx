"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Flag,
  ExternalLink,
} from "lucide-react";
import type { PracticeQuestion } from "@/types/practice-questions";

const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;

interface QuestionPlayerProps {
  questions: PracticeQuestion[];
  deckTitle: string;
  locale: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuestionPlayer({
  questions,
  deckTitle,
  locale,
}: QuestionPlayerProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<PracticeQuestion[]>(
    () => questions,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [checked, setChecked] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, { selectedIndex: number; correct: boolean }>
  >({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const totalCount = shuffledQuestions.length;
  const currentQ = shuffledQuestions[currentIndex] ?? null;
  const correctCount = useMemo(() => {
    return Object.values(answers).filter((a) => a.correct).length;
  }, [answers]);
  const allAnswered = answeredCount >= totalCount && totalCount > 0;
  const progressPct =
    totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  const handleShuffle = useCallback(() => {
    const next = !shuffleEnabled;
    setShuffleEnabled(next);
    if (next) {
      setShuffledQuestions((prev) => shuffleArray(prev));
      setCurrentIndex(0);
      setSelectedOptionIndex(null);
      setChecked(false);
      setAnsweredCount(0);
      setAnswers({});
      setShowCompletion(false);
      setReviewMode(false);
    } else {
      setShuffledQuestions(questions);
      setCurrentIndex(0);
      setSelectedOptionIndex(null);
      setChecked(false);
      setAnsweredCount(0);
      setAnswers({});
      setShowCompletion(false);
      setReviewMode(false);
    }
  }, [shuffleEnabled, questions]);

  const handleCheckAnswer = useCallback(() => {
    if (selectedOptionIndex === null || !currentQ || checked) return;
    const isCorrect =
      currentQ.options[selectedOptionIndex]?.isCorrect ?? false;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: { selectedIndex: selectedOptionIndex, correct: isCorrect },
    }));
    setChecked(true);
    setAnsweredCount((prev) => prev + 1);
  }, [selectedOptionIndex, currentQ, checked, currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < totalCount - 1) {
      if (reviewMode) {
        setCurrentIndex((prev) => prev + 1);
        const nextAnswer = answers[currentIndex + 1];
        setSelectedOptionIndex(nextAnswer?.selectedIndex ?? null);
        setChecked(!!nextAnswer);
      } else if (checked) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOptionIndex(null);
        setChecked(false);
      }
    }
  }, [currentIndex, totalCount, checked, reviewMode, answers]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const prevAnswer = answers[currentIndex - 1];
      setSelectedOptionIndex(prevAnswer?.selectedIndex ?? null);
      setChecked(!!prevAnswer);
    }
  }, [currentIndex, answers]);

  const handleTryAgain = useCallback(() => {
    if (shuffleEnabled) {
      setShuffledQuestions(shuffleArray(questions));
    } else {
      setShuffledQuestions(questions);
    }
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setChecked(false);
    setAnsweredCount(0);
    setAnswers({});
    setShowCompletion(false);
    setReviewMode(false);
  }, [shuffleEnabled, questions]);

  const handleReviewAnswers = useCallback(() => {
    setCurrentIndex(0);
    const firstAnswer = answers[0];
    setSelectedOptionIndex(firstAnswer?.selectedIndex ?? null);
    setChecked(!!firstAnswer);
    setShowCompletion(false);
    setReviewMode(true);
  }, [answers]);

  const handleBackToResults = useCallback(() => {
    setShowCompletion(true);
    setReviewMode(false);
  }, []);

  useEffect(() => {
    if (allAnswered && !showCompletion && !reviewMode) {
      setShowCompletion(true);
    }
  }, [allAnswered, showCompletion, reviewMode]);

  // Keyboard: 1-5 options, Enter to check, right arrow next
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showCompletion) return;

      if (e.key === "ArrowRight") {
        if (reviewMode || (checked && currentIndex < totalCount - 1)) {
          goNext();
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        goPrev();
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (reviewMode) {
          goNext();
        } else if (!checked && selectedOptionIndex !== null) {
          handleCheckAnswer();
        } else if (checked && currentIndex < totalCount - 1) {
          goNext();
        }
        e.preventDefault();
      } else if (!reviewMode) {
        const num = parseInt(e.key, 10);
        if (
          num >= 1 &&
          num <= 5 &&
          currentQ &&
          num <= currentQ.options.length &&
          !checked
        ) {
          setSelectedOptionIndex(num - 1);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    showCompletion,
    reviewMode,
    checked,
    selectedOptionIndex,
    currentIndex,
    totalCount,
    currentQ,
    goNext,
    goPrev,
    handleCheckAnswer,
  ]);

  // Completion screen
  if (showCompletion) {
    const percentage =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl rounded-2xl border-3 border-ink-dark bg-white p-6 shadow-chunky sm:p-8"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-showcase-green/20">
            <Check className="h-10 w-10 text-showcase-green" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-dark">
            Quiz Complete!
          </h2>
          <p className="mt-2 text-lg font-semibold text-showcase-purple">
            {correctCount} / {totalCount} correct ({percentage}%)
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleTryAgain}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              <Shuffle className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={handleReviewAnswers}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-dark bg-white px-5 py-2.5 font-display font-semibold text-ink-dark transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              <ChevronRight className="h-4 w-4" />
              Review Answers
            </button>
          </div>
        </div>
        <p className="mt-6 pt-4 text-center text-sm text-ink-muted">
          Source:{" "}
          <a
            href="https://entermedschool.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-showcase-purple hover:underline"
          >
            entermedschool.org
          </a>
        </p>
      </m.div>
    );
  }

  if (!currentQ) return null;

  // In review mode, use stored answer for current question (locale reserved for future i18n)
  const displayChecked = reviewMode || checked;
  const displaySelectedIndex = reviewMode
    ? answers[currentIndex]?.selectedIndex ?? null
    : selectedOptionIndex;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-ink-dark">
            {deckTitle}
          </h1>
          <span className="rounded-lg border-2 border-showcase-purple/20 bg-showcase-purple/10 px-2.5 py-1 font-display text-sm font-semibold text-showcase-purple">
            {correctCount} / {totalCount}
          </span>
          {!reviewMode && (
            <button
              onClick={handleShuffle}
              title="Shuffle questions"
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                shuffleEnabled
                  ? "border-showcase-purple bg-showcase-purple text-white"
                  : "border-ink-dark/20 bg-white text-ink-muted hover:border-showcase-purple/30 hover:text-showcase-purple"
              }`}
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </button>
          )}
          {reviewMode && (
            <button
              onClick={handleBackToResults}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/20 bg-white px-3 py-1.5 text-sm font-semibold text-ink-muted transition-all hover:border-showcase-purple/30 hover:text-showcase-purple"
            >
              Back to Results
            </button>
          )}
        </div>
        <span className="text-sm text-ink-muted">
          Question {currentIndex + 1} of {totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-showcase-purple/20">
        <m.div
          className="h-full rounded-full bg-showcase-purple"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <m.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border-3 border-ink-dark bg-white p-6 shadow-chunky sm:p-8"
        >
          {/* Report button */}
          <div className="mb-4 flex justify-end">
            <a
              href={`mailto:ari@entermedschool.com?subject=${encodeURIComponent(`Question Report: ${currentQ.stableId}`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-dark/15 px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-showcase-purple/30 hover:text-showcase-purple"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </a>
          </div>

          {/* Prompt */}
          <p className="mb-6 font-display text-lg font-semibold leading-relaxed text-ink-dark">
            {currentQ.prompt}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = displaySelectedIndex === idx;
              const isCorrect = opt.isCorrect;
              const showCorrect = displayChecked && isCorrect;
              const showIncorrect =
                displayChecked && isSelected && !isCorrect;

              let optionClasses =
                "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ";
              if (showCorrect) {
                optionClasses +=
                  "border-showcase-green bg-showcase-green/10 text-ink-dark";
              } else if (showIncorrect) {
                optionClasses += "border-red-500 bg-red-500/10 text-ink-dark";
              } else if (isSelected) {
                optionClasses +=
                  "border-showcase-purple bg-showcase-purple/10 text-ink-dark";
              } else {
                optionClasses +=
                  "border-ink-dark/15 bg-white text-ink-dark hover:border-showcase-purple/40 hover:bg-showcase-purple/5";
              }

              const isDisabled = displayChecked;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!displayChecked) setSelectedOptionIndex(idx);
                  }}
                  disabled={isDisabled}
                  className={optionClasses}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      showCorrect
                        ? "bg-showcase-green text-white"
                        : showIncorrect
                          ? "bg-red-500 text-white"
                          : isSelected
                            ? "bg-showcase-purple text-white"
                            : "bg-ink-dark/10 text-ink-dark"
                    }`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="flex-1 pt-0.5">{opt.body}</span>
                  {showCorrect && (
                    <Check className="h-5 w-5 shrink-0 text-showcase-green" />
                  )}
                  {showIncorrect && (
                    <X className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {displayChecked && currentQ.explanation && (
            <div
              data-speakable="explanation"
              className="mt-6 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-4 py-3 text-sm text-ink-dark"
            >
              <span className="font-display font-semibold text-showcase-teal">
                Explanation:{" "}
              </span>
              {currentQ.explanation}
            </div>
          )}

          {/* Check Answer / Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark px-4 py-2.5 font-display font-semibold text-ink-dark transition-all disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-chunky-sm disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {!displayChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === null}
                className="rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-chunky disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={currentIndex >= totalCount - 1}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-chunky disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </m.div>
      </AnimatePresence>

      {/* Attribution footer */}
      <p className="mt-6 text-center text-sm text-ink-muted">
        Source:{" "}
        <a
          href="https://entermedschool.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-showcase-purple hover:underline"
        >
          entermedschool.org
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </p>
    </div>
  );
}
