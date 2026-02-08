"use client";

import { useMemo } from "react";
import {
  Check,
  X,
  HelpCircle,
  BookOpen,
  Tag,
  Award,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import { OPTION_LETTERS } from "./constants";

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-red-100 text-red-700 border-red-300",
};

export default function QuestionPreview() {
  const { questions, selectedQuestionId, editingQuestion } = useMCQ();

  // Show editing question if available, else selected, else last added
  const question = useMemo(() => {
    if (editingQuestion) return editingQuestion;
    if (selectedQuestionId) {
      return questions.find((q) => q.id === selectedQuestionId) ?? null;
    }
    return questions.length > 0 ? questions[questions.length - 1] : null;
  }, [editingQuestion, selectedQuestionId, questions]);

  // ── Empty state ────────────────────────────────────────────────────
  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-pastel-lavender/60 mb-4">
          <HelpCircle className="h-12 w-12 text-showcase-purple/30 animate-float-gentle" />
        </div>
        <p className="font-display text-lg font-bold text-ink-dark">
          Question Preview
        </p>
        <p className="mt-1 text-sm text-ink-muted max-w-xs">
          Create or select a question to see a live preview here.
        </p>
      </div>
    );
  }

  const correctIdx = question.options.findIndex(
    (o) => o.id === question.correctOptionId,
  );

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      {/* Preview card */}
      <div className="w-full max-w-md rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-showcase-purple/10 to-showcase-teal/10 px-5 py-3 border-b-2 border-showcase-navy/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {question.difficulty && (
                <span
                  className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_STYLES[question.difficulty]}`}
                >
                  {question.difficulty}
                </span>
              )}
              {question.category && (
                <span className="text-xs font-bold text-showcase-purple">
                  {question.category}
                </span>
              )}
            </div>
            {question.points !== undefined && question.points !== 1 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-muted">
                <Award className="h-3 w-3" />
                {question.points} pts
              </span>
            )}
          </div>
        </div>

        {/* Question body */}
        <div className="px-5 py-4">
          {/* Image */}
          {question.imageUrl && (
            <div className="mb-3 rounded-xl border-2 border-ink-light/15 overflow-hidden">
              <img
                src={question.imageUrl}
                alt="Question"
                className="w-full max-h-36 object-contain bg-pastel-cream/30"
              />
            </div>
          )}

          {/* Question text */}
          <p className="font-display text-base font-bold text-ink-dark leading-relaxed">
            {question.question || (
              <span className="text-ink-light italic">
                Your question will appear here...
              </span>
            )}
          </p>

          {/* Options */}
          <div className="mt-4 flex flex-col gap-2">
            {question.options.map((opt, idx) => {
              const isCorrect = opt.id === question.correctOptionId;
              const hasText = opt.text.trim().length > 0;

              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all ${
                    isCorrect
                      ? "border-showcase-teal bg-showcase-teal/5"
                      : "border-ink-light/20 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isCorrect
                        ? "bg-showcase-teal text-white"
                        : "bg-gray-100 text-ink-muted"
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      OPTION_LETTERS[idx]
                    )}
                  </span>
                  <span
                    className={`text-sm ${
                      hasText ? "text-ink-dark" : "text-ink-light italic"
                    } ${isCorrect ? "font-bold" : ""}`}
                  >
                    {hasText
                      ? opt.text
                      : `Option ${OPTION_LETTERS[idx]}...`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="mt-4 rounded-xl border-2 border-showcase-blue/20 bg-showcase-blue/5 px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-showcase-blue mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                Explanation
              </div>
              <p className="text-sm text-ink-dark leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Tags */}
          {(question.tags ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(question.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-lg bg-showcase-purple/8 px-2 py-0.5 text-[10px] font-bold text-showcase-purple"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <p className="mt-3 text-[11px] text-ink-light text-center">
        {questions.length > 0
          ? `Showing ${selectedQuestionId ? "selected" : "latest"} of ${questions.length} question${questions.length !== 1 ? "s" : ""}`
          : "Live preview updates as you type"}
      </p>
    </div>
  );
}
