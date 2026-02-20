"use client";

import type { GlossaryStepConfig, ItalianLessonStep } from "@/lib/italian-data";
import { StepWrapper } from "./StepWrapper";

interface GlossaryStepViewProps {
  step: ItalianLessonStep;
  config: GlossaryStepConfig;
}

export function GlossaryStepView({ step, config }: GlossaryStepViewProps) {
  return (
    <StepWrapper
      stepType={step.stepType}
      title={step.title ?? "Vocabulary"}
      subtitle={step.helper}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {config.terms.map((term, i) => (
          <div
            key={`${term.lemma}-${i}`}
            className="group flex flex-col rounded-xl border-3 border-showcase-green/20 bg-white p-4 shadow-chunky transition-all hover:-translate-y-0.5 hover:border-showcase-green/40 hover:shadow-[0_6px_16px_rgba(16,185,129,0.12)]"
          >
            <span className="font-display text-sm font-bold text-ink-dark">
              {term.lemma}
            </span>
            <span className="mt-1 text-xs leading-relaxed text-ink-muted">
              {term.english}
            </span>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
}
