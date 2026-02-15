"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";

const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;

interface EmbedOption {
  label: string;
  body: string;
  isCorrect: boolean;
}

interface EmbedQuestion {
  prompt: string;
  options: EmbedOption[];
  explanation?: string;
}

interface EmbedData {
  title: string;
  questions: EmbedQuestion[];
}

function decodeHashData(hash: string): EmbedData | null {
  try {
    const base64 = hash.slice(1);
    if (!base64) return null;
    const json = decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(json) as EmbedData;
    if (!data.title || !Array.isArray(data.questions) || data.questions.length === 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default function EmbedQuestionsPage() {
  const [data, setData] = useState<EmbedData | null>(null);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { selectedIndex: number; correct: boolean }>>({});
  const [showCompletion, setShowCompletion] = useState(false);

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

  const handleCheckAnswer = useCallback(() => {
    if (selectedOptionIndex === null || !currentQ || checked) return;
    const isCorrect = currentQ.options[selectedOptionIndex]?.isCorrect ?? false;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: { selectedIndex: selectedOptionIndex, correct: isCorrect },
    }));
    setChecked(true);
  }, [selectedOptionIndex, currentIndex, checked]);

  const goNext = useCallback(() => {
    if (currentIndex < (data?.questions.length ?? 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setChecked(false);
    }
  }, [currentIndex, data?.questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const prevAnswer = answers[currentIndex - 1];
      setSelectedOptionIndex(prevAnswer?.selectedIndex ?? null);
      setChecked(!!prevAnswer);
    }
  }, [currentIndex, answers]);

  useEffect(() => {
    const totalCount = data?.questions.length ?? 0;
    const answeredCount = Object.keys(answers).length;
    if (totalCount > 0 && answeredCount >= totalCount && !showCompletion) {
      setShowCompletion(true);
    }
  }, [answers, data?.questions.length, showCompletion]);

  const handleTryAgain = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setChecked(false);
    setAnswers({});
    setShowCompletion(false);
  }, []);

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="font-display text-lg font-bold text-ink-dark mb-2">
            Could not load quiz
          </p>
          <p className="text-sm text-ink-muted">
            {!data && !error
              ? "Loading..."
              : "Invalid or missing quiz data in URL. Please check the embed link."}
          </p>
        </div>
      </div>
    );
  }

  const totalCount = data.questions.length;
  const currentQ = data.questions[currentIndex] ?? null;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const allAnswered = Object.keys(answers).length >= totalCount;
  const progressPct = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  // Completion screen
  if (showCompletion && allAnswered) {
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="mx-auto max-w-md rounded-2xl border-2 border-ink-dark bg-white p-6 shadow-chunky">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-showcase-green/20">
              <Check className="h-8 w-8 text-showcase-green" />
            </div>
            <h2 className="font-display text-xl font-bold text-ink-dark">
              Quiz Complete!
            </h2>
            <p className="mt-2 font-semibold text-showcase-purple">
              {correctCount} / {totalCount} correct ({percentage}%)
            </p>
            <button
              onClick={handleTryAgain}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
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

  if (!currentQ) return null;

  const displayChecked = checked;
  const displaySelectedIndex = selectedOptionIndex;

  return (
    <div className="flex min-h-screen flex-col p-6">
      <div className="mx-auto w-full max-w-2xl flex-1">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-lg font-bold text-ink-dark">
            {data.title}
          </h1>
          <span className="rounded-lg border-2 border-showcase-purple/20 bg-showcase-purple/10 px-2.5 py-1 font-display text-sm font-semibold text-showcase-purple">
            {correctCount} / {totalCount}
          </span>
        </div>
        <span className="text-sm text-ink-muted">
          Question {currentIndex + 1} of {totalCount}
        </span>

        {/* Progress bar */}
        <div className="mb-6 mt-2 h-2 w-full overflow-hidden rounded-full bg-showcase-purple/20">
          <div
            className="h-full rounded-full bg-showcase-purple transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question card */}
        <div className="rounded-2xl border-2 border-ink-dark bg-white p-6 shadow-chunky">
          <p className="mb-6 font-display text-lg font-semibold leading-relaxed text-ink-dark">
            {currentQ.prompt}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = displaySelectedIndex === idx;
              const isCorrect = opt.isCorrect;
              const showCorrect = displayChecked && isCorrect;
              const showIncorrect = displayChecked && isSelected && !isCorrect;

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
            <div className="mt-6 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-4 py-3 text-sm text-ink-dark">
              <span className="font-display font-semibold text-showcase-teal">
                Explanation:{" "}
              </span>
              {currentQ.explanation}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark px-4 py-2.5 font-display font-semibold text-ink-dark transition-all disabled:opacity-40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {!displayChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === null}
                className="rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={currentIndex >= totalCount - 1}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
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
