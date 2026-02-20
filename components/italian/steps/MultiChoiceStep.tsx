"use client";

import { useState } from "react";
import type {
  MultiChoiceStepConfig,
  ItalianLessonStep,
} from "@/lib/italian-data";
import { StepWrapper } from "./StepWrapper";
import { CheckCircle2, XCircle } from "lucide-react";

interface MultiChoiceStepViewProps {
  step: ItalianLessonStep;
  config: MultiChoiceStepConfig;
}

export function MultiChoiceStepView({
  step,
  config,
}: MultiChoiceStepViewProps) {
  const [revealed, setRevealed] = useState<Record<number, number | null>>({});

  function selectOption(qIndex: number, optIndex: number) {
    if (revealed[qIndex] != null) return;
    setRevealed((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  return (
    <StepWrapper
      stepType={step.stepType}
      title={step.title ?? "Comprehension Quiz"}
      subtitle={step.helper}
    >
      <div className="flex flex-col gap-6">
        {config.questions.map((q, qi) => {
          const selected = revealed[qi];
          const isRevealed = selected != null;
          const isCorrect = selected === q.answer;

          return (
            <div
              key={qi}
              className="rounded-xl border-3 border-showcase-purple/15 bg-white p-5 shadow-chunky"
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-showcase-purple text-xs font-bold text-white">
                  {qi + 1}
                </span>
                <p className="text-sm font-semibold text-ink-dark">
                  {q.prompt}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answer;
                  const isSelected = selected === oi;

                  let optClass =
                    "cursor-pointer border-2 border-ink-dark/10 bg-white hover:border-showcase-purple/40 hover:bg-showcase-purple/5";

                  if (isRevealed) {
                    if (isAnswer) {
                      optClass =
                        "border-2 border-showcase-green bg-showcase-green/10";
                    } else if (isSelected) {
                      optClass =
                        "border-2 border-showcase-coral bg-showcase-coral/10";
                    } else {
                      optClass = "border-2 border-ink-dark/5 bg-gray-50 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectOption(qi, oi)}
                      disabled={isRevealed}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-all ${optClass}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-showcase-purple/10 text-xs font-bold text-showcase-purple">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1 text-ink-dark">{opt}</span>
                      {isRevealed && isAnswer && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-showcase-green" />
                      )}
                      {isRevealed && isSelected && !isAnswer && (
                        <XCircle className="h-5 w-5 shrink-0 text-showcase-coral" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isRevealed && (
                <div
                  className={`mt-3 rounded-lg px-4 py-2 text-xs font-medium ${
                    isCorrect
                      ? "bg-showcase-green/10 text-showcase-green"
                      : "bg-showcase-coral/10 text-showcase-coral"
                  }`}
                >
                  {isCorrect
                    ? "Correct!"
                    : `The correct answer is ${String.fromCharCode(65 + q.answer)}: ${q.options[q.answer]}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StepWrapper>
  );
}
