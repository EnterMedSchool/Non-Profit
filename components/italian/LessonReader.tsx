"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  ItalianLesson,
  ItalianLessonStep,
} from "@/lib/italian-data";
import {
  isDialogueConfig,
  isGlossaryConfig,
  isMultiChoiceConfig,
  isReadRespondConfig,
} from "@/lib/italian-data";
import { DialogueStepView } from "./steps/DialogueStep";
import { GlossaryStepView } from "./steps/GlossaryStep";
import { MultiChoiceStepView } from "./steps/MultiChoiceStep";
import { ReadRespondStepView } from "./steps/ReadRespondStep";

interface LessonReaderProps {
  lesson: ItalianLesson;
  /** When true, hides chrome for embed mode */
  embed?: boolean;
}

function StepContent({ step }: { step: ItalianLessonStep }) {
  const config = step.config;

  if (isDialogueConfig(config)) {
    return <DialogueStepView step={step} config={config} />;
  }
  if (isGlossaryConfig(config)) {
    return <GlossaryStepView step={step} config={config} />;
  }
  if (isMultiChoiceConfig(config)) {
    return <MultiChoiceStepView step={step} config={config} />;
  }
  if (isReadRespondConfig(config)) {
    return <ReadRespondStepView step={step} config={config} />;
  }

  return (
    <div className="rounded-xl border-2 border-ink-dark/10 bg-white p-6 text-center text-sm text-ink-muted">
      Unknown step type: {step.stepType}
    </div>
  );
}

export function LessonReader({ lesson, embed = false }: LessonReaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = lesson.steps.length;
  const step = lesson.steps[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const stepCounts = useMemo(() => {
    const counts = { glossary: 0, dialogue: 0, multi_choice: 0, read_respond: 0 };
    for (const s of lesson.steps) {
      if (s.stepType in counts) {
        counts[s.stepType as keyof typeof counts]++;
      }
    }
    return counts;
  }, [lesson.steps]);

  return (
    <div className={`flex flex-col gap-0 ${embed ? "" : ""}`}>
      {/* Progress bar */}
      <div className="sticky top-0 z-20 border-b-3 border-ink-dark/5 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-ink-muted">
              {currentStep + 1} / {totalSteps}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ink-dark/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-showcase-purple to-showcase-teal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {!embed && (
              <div className="hidden items-center gap-2 text-[10px] font-medium text-ink-muted sm:flex">
                <span className="rounded bg-showcase-green/10 px-1.5 py-0.5 text-showcase-green">
                  {stepCounts.glossary} vocab
                </span>
                <span className="rounded bg-showcase-blue/10 px-1.5 py-0.5 text-showcase-blue">
                  {stepCounts.dialogue} dialogues
                </span>
                <span className="rounded bg-showcase-purple/10 px-1.5 py-0.5 text-showcase-purple">
                  {stepCounts.multi_choice} quizzes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <StepContent key={`${lesson.slug}-step-${currentStep}`} step={step} />
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-20 border-t-3 border-ink-dark/5 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border-3 border-ink-dark/10 bg-white px-4 py-2 text-sm font-bold text-ink-dark shadow-chunky transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))
            }
            disabled={currentStep === totalSteps - 1}
            className="inline-flex items-center gap-1.5 rounded-xl border-3 border-showcase-purple bg-showcase-purple px-4 py-2 text-sm font-bold text-white shadow-chunky-purple transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
