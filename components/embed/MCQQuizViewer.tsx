"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MCQQuestion, MCQEmbedTheme } from "@/components/tools/mcq-maker/types";
import { DEFAULT_EMBED_THEME } from "@/components/tools/mcq-maker/types";

import { OPTION_LETTERS } from "@/components/tools/mcq-maker/constants";

interface MCQQuizViewerProps {
  questions: MCQQuestion[];
  theme?: Partial<MCQEmbedTheme>;
  title?: string;
  timeLimit?: number; // minutes
  passingScore?: number; // percentage
}

// ── Timer hook (Phase 1.10 + 6.4 fixes) ─────────────────────────────
function useTimer(totalSeconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Reset when totalSeconds changes
  useEffect(() => {
    if (totalSeconds === null) return;
    setRemaining(totalSeconds);
    expired.current = false;
  }, [totalSeconds]);

  // Tick every second — uses functional updater to avoid `remaining` in deps
  useEffect(() => {
    if (totalSeconds === null) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 0) return prev;
        const next = prev - 1;
        if (next <= 0 && !expired.current) {
          expired.current = true;
          onExpireRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [totalSeconds]);

  const reset = useCallback(() => {
    if (totalSeconds !== null) {
      setRemaining(totalSeconds);
      expired.current = false;
    }
  }, [totalSeconds]);

  const minutes = remaining !== null ? Math.floor(remaining / 60) : 0;
  const seconds = remaining !== null ? remaining % 60 : 0;
  const formatted =
    remaining !== null
      ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : null;

  return { remaining, formatted, reset };
}

// ── Component ────────────────────────────────────────────────────────
export default function MCQQuizViewer({
  questions,
  theme: themeProp,
  title,
  timeLimit,
  passingScore,
}: MCQQuizViewerProps) {
  const theme: MCQEmbedTheme = { ...DEFAULT_EMBED_THEME, ...themeProp };
  const isPractice = theme.mode === "practice";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const currentQ = questions[currentIndex] ?? null;
  const totalQ = questions.length;
  const progress = totalQ > 0 ? ((currentIndex + 1) / totalQ) * 100 : 0;

  // Timer
  const handleTimerExpire = useCallback(() => {
    setSubmitted(true);
  }, []);

  const { formatted: timerDisplay, reset: resetTimer } = useTimer(
    !isPractice && timeLimit ? timeLimit * 60 : null,
    handleTimerExpire,
  );

  // ── Score calculation ──────────────────────────────────────────────
  const score = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const q of questions) {
      total += q.points ?? 1;
      if (answers[q.id] === q.correctOptionId) {
        correct += q.points ?? 1;
      }
    }
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed =
      passingScore !== undefined ? percentage >= passingScore : undefined;
    return { correct, total, percentage, passed };
  }, [questions, answers, passingScore]);

  // ── Handlers ───────────────────────────────────────────────────────
  const selectAnswer = useCallback(
    (qId: string, optId: string) => {
      if (submitted) return;
      if (isPractice && revealed[qId]) return;
      setAnswers((prev) => ({ ...prev, [qId]: optId }));

      if (isPractice) {
        setRevealed((prev) => ({ ...prev, [qId]: true }));
      }
    },
    [submitted, isPractice, revealed],
  );

  const goNext = useCallback(() => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQ]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setShowReview(false);
    resetTimer();
  }, [resetTimer]);

  // ── Keyboard navigation ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitted && !showReview) return;

      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isPractice && currentQ && revealed[currentQ.id]) {
          goNext();
        } else if (!isPractice && currentQ && answers[currentQ.id]) {
          goNext();
        }
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (currentQ) {
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= currentQ.options.length) {
          selectAnswer(currentQ.id, currentQ.options[numKey - 1].id);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    submitted,
    showReview,
    isPractice,
    currentQ,
    revealed,
    answers,
    goNext,
    goPrev,
    selectAnswer,
  ]);

  // ── Styles ─────────────────────────────────────────────────────────
  const isDark = theme.theme === "dark";
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#1a1a2e" : theme.bg,
    color: isDark ? "#e2e8f0" : theme.textColor,
    fontFamily:
      theme.fontFamily === "system"
        ? "system-ui, sans-serif"
        : theme.fontFamily,
    borderRadius: `${theme.borderRadius}px`,
    minHeight: "300px",
  };

  const accentColor = theme.accent;

  // ── Results screen ─────────────────────────────────────────────────
  if (submitted && !showReview && !isPractice) {
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center p-6 text-center"
      >
        {theme.animation ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <ResultsContent />
          </motion.div>
        ) : (
          <div className="w-full max-w-sm">
            <ResultsContent />
          </div>
        )}
      </div>
    );
  }

  function ResultsContent() {
    return (
      <>
        <div
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {score.percentage}%
        </div>

        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: isDark ? "#e2e8f0" : theme.textColor }}
        >
          {score.passed === true
            ? "Passed!"
            : score.passed === false
              ? "Not Passed"
              : "Results"}
        </h2>

        <p className="text-sm opacity-70 mb-4">
          {score.correct} out of {score.total} points
          {passingScore !== undefined && ` (${passingScore}% to pass)`}
        </p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setShowReview(true)}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Review Answers
          </button>
          <button
            onClick={handleRestart}
            className="rounded-xl border-2 px-4 py-2 text-sm font-bold"
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
          >
            Restart
          </button>
        </div>
      </>
    );
  }

  // ── Review mode & Practice complete ────────────────────────────────
  if (
    (submitted && showReview) ||
    (isPractice && currentIndex >= totalQ - 1 && revealed[questions[totalQ - 1]?.id])
  ) {
    const isFullReview =
      submitted ||
      (isPractice &&
        currentIndex >= totalQ - 1 &&
        revealed[questions[totalQ - 1]?.id]);

    return (
      <div
        style={containerStyle}
        className="flex flex-col p-4 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {isPractice ? "Practice Complete" : "Review"}
          </h2>
          <button
            onClick={handleRestart}
            className="rounded-lg px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Restart
          </button>
        </div>

        {theme.showScore && (
          <div
            className="rounded-xl p-3 mb-4 text-center text-sm font-bold"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            Score: {score.correct}/{score.total} ({score.percentage}%)
          </div>
        )}

        <div className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const selectedOpt = answers[q.id];
            const isCorrect = selectedOpt === q.correctOptionId;

            return (
              <div
                key={q.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: isDark ? "#334155" : "#e5e7eb",
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                }}
              >
                <p className="text-sm font-bold mb-2">
                  {i + 1}. {q.question}
                </p>
                <div className="flex flex-col gap-1">
                  {q.options.map((opt, j) => {
                    const isSelected = selectedOpt === opt.id;
                    const isCorrectOpt = opt.id === q.correctOptionId;

                    let optBg = "transparent";
                    let optBorder = isDark ? "#334155" : "#e5e7eb";
                    if (isCorrectOpt) {
                      optBg = "#10b98120";
                      optBorder = "#10b981";
                    } else if (isSelected && !isCorrectOpt) {
                      optBg = "#ef444420";
                      optBorder = "#ef4444";
                    }

                    return (
                      <div
                        key={opt.id}
                        className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs"
                        style={{
                          backgroundColor: optBg,
                          borderColor: optBorder,
                        }}
                      >
                        <span className="font-bold w-5">
                          {OPTION_LETTERS[j]}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isCorrectOpt && (
                          <span className="text-green-500 text-[10px] font-bold">
                            correct
                          </span>
                        )}
                        {isSelected && !isCorrectOpt && (
                          <span className="text-red-500 text-[10px] font-bold">
                            your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {theme.showExplanations && q.explanation && (
                  <div
                    className="mt-2 rounded-lg p-2 text-xs"
                    style={{
                      backgroundColor: `${accentColor}10`,
                      color: isDark ? "#94a3b8" : "#64748b",
                    }}
                  >
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Main question view ─────────────────────────────────────────────
  if (!currentQ) return null;

  const selectedAnswer = answers[currentQ.id];
  const isRevealed = revealed[currentQ.id];
  const canGoNext = isPractice ? isRevealed : !!selectedAnswer;

  const questionContent = (
    <div className="w-full max-w-lg mx-auto">
      {/* Question */}
      <div className="mb-4">
        {currentQ.imageUrl && (
          <img
            src={currentQ.imageUrl}
            alt="Question"
            className="w-full max-h-36 object-contain rounded-xl mb-3"
          />
        )}
        <p className="text-base font-bold leading-relaxed">
          {currentIndex + 1}. {currentQ.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentQ.options.map((opt, j) => {
          const isSelected = selectedAnswer === opt.id;
          const isCorrectOpt = opt.id === currentQ.correctOptionId;

          let bg = isDark ? "#1e293b" : "#ffffff";
          let border = isDark ? "#334155" : "#e5e7eb";
          let textWeight = "normal";

          if (isPractice && isRevealed) {
            if (isCorrectOpt) {
              bg = "#10b98120";
              border = "#10b981";
              textWeight = "bold";
            } else if (isSelected && !isCorrectOpt) {
              bg = "#ef444420";
              border = "#ef4444";
            }
          } else if (isSelected) {
            bg = `${accentColor}15`;
            border = accentColor;
            textWeight = "bold";
          }

          return (
            <button
              key={opt.id}
              onClick={() => selectAnswer(currentQ.id, opt.id)}
              disabled={submitted || (isPractice && isRevealed)}
              className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all text-sm"
              style={{
                backgroundColor: bg,
                borderColor: border,
                fontWeight: textWeight as React.CSSProperties["fontWeight"],
                cursor:
                  submitted || (isPractice && isRevealed)
                    ? "default"
                    : "pointer",
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: isSelected
                    ? accentColor
                    : isDark
                      ? "#334155"
                      : "#f3f4f6",
                  color: isSelected ? "#ffffff" : "inherit",
                }}
              >
                {OPTION_LETTERS[j]}
              </span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Practice mode explanation */}
      {isPractice &&
        isRevealed &&
        theme.showExplanations &&
        currentQ.explanation && (
          <div
            className="mt-3 rounded-xl p-3 text-sm"
            style={{
              backgroundColor: `${accentColor}10`,
              color: isDark ? "#94a3b8" : "#64748b",
            }}
          >
            <span className="font-bold" style={{ color: accentColor }}>
              Explanation:{" "}
            </span>
            {currentQ.explanation}
          </div>
        )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:opacity-30"
          style={{
            borderColor: accentColor,
            color: accentColor,
            border: "2px solid",
          }}
        >
          Previous
        </button>

        {currentIndex < totalQ - 1 ? (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all disabled:opacity-30"
            style={{ backgroundColor: accentColor }}
          >
            Next
          </button>
        ) : !isPractice ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all disabled:opacity-30"
            style={{ backgroundColor: accentColor }}
          >
            Submit
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div style={containerStyle} className="flex flex-col p-4 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        {title && (
          <h2 className="text-sm font-bold truncate">{title}</h2>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {timerDisplay && (
            <span
              className="rounded-lg px-2 py-1 text-xs font-bold font-mono"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {timerDisplay}
            </span>
          )}
          <span className="text-xs opacity-60">
            {currentIndex + 1} / {totalQ}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {theme.showProgress && (
        <div
          className="h-1.5 rounded-full mb-4 overflow-hidden"
          style={{
            backgroundColor: isDark ? "#334155" : "#e5e7eb",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      )}

      {/* Question with animation */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto">
        {theme.animation ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {questionContent}
            </motion.div>
          </AnimatePresence>
        ) : (
          questionContent
        )}
      </div>

      {/* Attribution */}
      <div className="mt-3 pt-2 border-t text-center" style={{ borderColor: isDark ? "#334155" : "#e5e7eb" }}>
        <p className="text-[10px] opacity-40">
          Powered by{" "}
          <a
            href="https://entermedschool.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accentColor }}
          >
            EnterMedSchool.org
          </a>
        </p>
      </div>
    </div>
  );
}
