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

interface ClueNotebookProps {
  clues: Clue[];
}

const clueTypeConfig: Record<
  ClueType,
  { label: string; icon: typeof FlaskConical; color: string; borderColor: string }
> = {
  lab: {
    label: "Laboratory",
    icon: FlaskConical,
    color: "text-showcase-purple",
    borderColor: "border-showcase-purple/30",
  },
  imaging: {
    label: "Imaging",
    icon: ScanLine,
    color: "text-showcase-blue",
    borderColor: "border-showcase-blue/30",
  },
  history: {
    label: "History",
    icon: MessageCircle,
    color: "text-showcase-teal",
    borderColor: "border-showcase-teal/30",
  },
  physical: {
    label: "Physical Exam",
    icon: Stethoscope,
    color: "text-showcase-green",
    borderColor: "border-showcase-green/30",
  },
  vital: {
    label: "Vitals",
    icon: Activity,
    color: "text-showcase-coral",
    borderColor: "border-showcase-coral/30",
  },
};

export default function ClueNotebook({ clues }: ClueNotebookProps) {
  const groupedClues = useMemo(() => {
    const groups: Partial<Record<ClueType, Clue[]>> = {};
    for (const clue of clues) {
      if (!groups[clue.type]) groups[clue.type] = [];
      groups[clue.type]!.push(clue);
    }
    return groups;
  }, [clues]);

  if (clues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Stethoscope className="h-8 w-8 text-white/10" />
        <p className="mt-3 text-xs text-white/30">
          No clues collected yet.
        </p>
        <p className="mt-1 text-[10px] text-white/20">
          Findings will appear here as you investigate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                <span className="text-[10px] text-white/30">
                  ({typeClues.length})
                </span>
              </div>
              <AnimatePresence>
                {typeClues.map((clue) => (
                  <m.div
                    key={clue.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-1.5 rounded-lg border ${config.borderColor} bg-white/[0.03] px-3 py-2`}
                  >
                    <p className="text-[10px] font-bold text-white/60">
                      {clue.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45 leading-relaxed">
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
