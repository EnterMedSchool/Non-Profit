"use client";

import { useState } from "react";
import type {
  ReadRespondStepConfig,
  ItalianLessonStep,
} from "@/lib/italian-data";
import { StepWrapper } from "./StepWrapper";
import { CheckCircle2, XCircle } from "lucide-react";

interface ReadRespondStepViewProps {
  step: ItalianLessonStep;
  config: ReadRespondStepConfig;
}

export function ReadRespondStepView({
  step,
  config,
}: ReadRespondStepViewProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const isRevealed = selected != null;
  const isCorrect = selected === config.answer;

  return (
    <StepWrapper
      stepType={step.stepType}
      title={step.title ?? "Clinical Case"}
      subtitle={step.helper}
    >
      <div className="flex flex-col gap-4">
        {/* Passage */}
        <div className="rounded-xl border-l-4 border-showcase-coral bg-showcase-coral/5 px-5 py-4">
          <p className="text-sm leading-relaxed text-ink-dark">
            {config.passage}
          </p>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-ink-dark">{config.question}</p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {config.options.map((opt, oi) => {
            const isAnswer = oi === config.answer;
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
                onClick={() => {
                  if (!isRevealed) setSelected(oi);
                }}
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
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              isCorrect
                ? "bg-showcase-green/10 text-showcase-green"
                : "bg-showcase-coral/10 text-showcase-coral"
            }`}
          >
            {isCorrect
              ? "Correct!"
              : `The correct answer is ${String.fromCharCode(65 + config.answer)}: ${config.options[config.answer]}`}
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
