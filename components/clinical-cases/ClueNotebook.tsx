"use client";

import { useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  ScanLine,
  MessageCircle,
  Stethoscope,
  Activity,
} from "lucide-react";
import type { Clue, ClueType } from "@/data/clinical-cases";

interface ExamFinding {
  region: string;
  label: string;
  findings: string;
}

interface ClueNotebookProps {
  clues: Clue[];
  examFindings?: ExamFinding[];
}

const clueTypeConfig: Record<
  ClueType,
  { label: string; icon: typeof FlaskConical; color: string; bgColor: string; borderColor: string }
> = {
  lab: {
    label: "Laboratory",
    icon: FlaskConical,
    color: "text-showcase-purple",
    bgColor: "bg-pastel-lavender/50",
    borderColor: "border-showcase-purple/20",
  },
  imaging: {
    label: "Imaging",
    icon: ScanLine,
    color: "text-showcase-blue",
    bgColor: "bg-pastel-sky/50",
    borderColor: "border-showcase-blue/20",
  },
  history: {
    label: "History",
    icon: MessageCircle,
    color: "text-showcase-teal",
    bgColor: "bg-pastel-mint/50",
    borderColor: "border-showcase-teal/20",
  },
  physical: {
    label: "Physical Exam",
    icon: Stethoscope,
    color: "text-showcase-green",
    bgColor: "bg-pastel-mint/30",
    borderColor: "border-showcase-green/20",
  },
  vital: {
    label: "Vitals",
    icon: Activity,
    color: "text-showcase-coral",
    bgColor: "bg-pastel-peach/50",
    borderColor: "border-showcase-coral/20",
  },
};

export default function ClueNotebook({ clues, examFindings = [] }: ClueNotebookProps) {
  const groupedClues = useMemo(() => {
    const groups: Partial<Record<ClueType, Clue[]>> = {};
    for (const clue of clues) {
      if (!groups[clue.type]) groups[clue.type] = [];
      groups[clue.type]!.push(clue);
    }
    return groups;
  }, [clues]);

  if (clues.length === 0 && examFindings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Stethoscope className="h-8 w-8 text-ink-light/30" />
        <p className="mt-3 text-xs text-ink-light">
          No clues collected yet.
        </p>
        <p className="mt-1 text-[10px] text-ink-light/60">
          Findings will appear here as you investigate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exam findings (persisted across component unmounts) */}
      {examFindings.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Stethoscope className="h-3 w-3 text-showcase-green" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-showcase-green">
              Exam Findings
            </span>
            <span className="text-[10px] text-ink-light">
              ({examFindings.length})
            </span>
          </div>
          <AnimatePresence>
            {examFindings.map((finding) => (
              <m.div
                key={finding.region}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1.5 rounded-xl border-2 border-showcase-green/20 bg-pastel-mint/30 px-3 py-2"
              >
                <p className="text-[10px] font-bold text-showcase-green">
                  {finding.label}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted leading-relaxed">
                  {finding.findings}
                </p>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {(Object.entries(clueTypeConfig) as [ClueType, typeof clueTypeConfig.lab][]).map(
        ([type, config]) => {
          const typeClues = groupedClues[type];
          if (!typeClues || typeClues.length === 0) return null;

          const Icon = config.icon;

          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`h-3 w-3 ${config.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-ink-light">
                  ({typeClues.length})
                </span>
              </div>
              <AnimatePresence>
                {typeClues.map((clue) => (
                  <m.div
                    key={clue.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-1.5 rounded-xl border-2 ${config.borderColor} ${config.bgColor} px-3 py-2`}
                  >
                    <p className={`text-[10px] font-bold ${config.color}`}>
                      {clue.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted leading-relaxed">
                      {clue.value}
                    </p>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          );
        }
      )}
    </div>
  );
}
