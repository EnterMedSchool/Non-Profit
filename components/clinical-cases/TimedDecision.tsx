"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { m } from "framer-motion";
import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
import type { DecisionOption } from "@/data/clinical-cases";
import { useCaseSound } from "@/hooks/useCaseSound";

interface TimedDecisionProps {
  prompt: string;
  options: DecisionOption[];
  timeLimit: number;
  defaultOptionId: string;
  onChoice: (option: DecisionOption) => void;
  onTimeout: (defaultOption: DecisionOption) => void;
}

export default function TimedDecision({
  prompt,
  options,
  timeLimit,
  defaultOptionId,
  onChoice,
  onTimeout,
}: TimedDecisionProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hasChosen, setHasChosen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sound = useCaseSound();

  const progress = timeLeft / timeLimit;
  const isWarning = timeLeft <= 5;

  // Countdown timer
  useEffect(() => {
    if (hasChosen) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Time's up
          const defaultOption = options.find((o) => o.id === defaultOptionId);
          if (defaultOption) {
            onTimeout(defaultOption);
          }
          return 0;
        }
        if (prev === 6) sound.playTimerWarning();
        if (prev <= 10) sound.playTimerTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasChosen, defaultOptionId, options, onTimeout, sound]);

  const handleChoice = useCallback(
    (option: DecisionOption) => {
      if (hasChosen) return;
      setHasChosen(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onChoice(option);
    },
    [hasChosen, onChoice]
  );

  // SVG circle properties
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Urgent banner */}
      <m.div
        animate={isWarning ? { borderColor: ["rgba(239,68,68,0.3)", "rgba(239,68,68,0.7)", "rgba(239,68,68,0.3)"] } : {}}
        transition={isWarning ? { repeat: Infinity, duration: 0.8 } : {}}
        className="rounded-xl border-2 border-red-400/30 bg-red-400/5 p-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm font-bold text-red-400">{prompt}</p>
        </div>
      </m.div>

      {/* Timer */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={isWarning ? "#ef4444" : "#6C5CE7"}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Clock className={`mx-auto h-4 w-4 ${isWarning ? "text-red-400" : "text-white/50"}`} />
              <span
                className={`block text-lg font-bold tabular-nums ${
                  isWarning ? "text-red-400" : "text-white/80"
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {options
          .filter((o) => o.id !== defaultOptionId)
          .map((option, i) => (
            <m.button
              key={option.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => handleChoice(option)}
              disabled={hasChosen}
              className={`group w-full rounded-xl border-2 p-4 text-left transition-all ${
                isWarning
                  ? "border-red-400/20 bg-red-400/5 hover:border-red-400/40"
                  : "border-white/10 bg-white/5 hover:border-showcase-purple/40 hover:bg-showcase-purple/10"
              } hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="mt-1 text-xs text-white/50">
                      {option.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {option.cpCost > 0 && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/60">
                      {option.cpCost} CP
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </div>
              </div>
            </m.button>
          ))}
      </div>
    </m.div>
  );
}
