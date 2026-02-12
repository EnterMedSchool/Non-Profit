"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Coins } from "lucide-react";
import type { ExamZone, Clue } from "@/data/clinical-cases";

interface ExamZoneExplorerProps {
  zones: ExamZone[];
  budgetForExam: number;
  cpSpent: number;
  examinedRegions: string[];
  onExamineZone: (region: string, cpCost: number, clues: Clue[]) => void;
  onComplete: () => void;
}

const regionPositions: Record<string, { top: string; left: string; width: string; height: string }> = {
  head: { top: "2%", left: "35%", width: "30%", height: "15%" },
  neck: { top: "17%", left: "38%", width: "24%", height: "6%" },
  chest: { top: "23%", left: "28%", width: "44%", height: "18%" },
  abdomen: { top: "41%", left: "30%", width: "40%", height: "16%" },
  "upper-extremities": { top: "23%", left: "8%", width: "20%", height: "30%" },
  "lower-extremities": { top: "58%", left: "25%", width: "50%", height: "35%" },
  skin: { top: "5%", left: "70%", width: "25%", height: "20%" },
  neurological: { top: "5%", left: "5%", width: "25%", height: "15%" },
};

export default function ExamZoneExplorer({
  zones,
  budgetForExam,
  cpSpent,
  examinedRegions,
  onExamineZone,
  onComplete,
}: ExamZoneExplorerProps) {
  const [selectedZone, setSelectedZone] = useState<ExamZone | null>(null);
  const [revealedFindings, setRevealedFindings] = useState<
    Record<string, string>
  >({});

  const remainingBudget = budgetForExam - cpSpent;
  const hasExaminedAny = examinedRegions.length > 0;

  const handleExamine = (zone: ExamZone) => {
    if (examinedRegions.includes(zone.region)) return;
    if (zone.cpCost > remainingBudget) return;

    onExamineZone(zone.region, zone.cpCost, zone.cluesRevealed);
    setRevealedFindings((prev) => ({
      ...prev,
      [zone.region]: zone.findings,
    }));
    setSelectedZone(zone);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      {/* Exam budget indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white/60">Physical Examination</p>
        <div className="flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-showcase-yellow" />
          <span className="text-xs font-bold text-showcase-yellow">
            {remainingBudget} CP remaining
          </span>
        </div>
      </div>

      {/* Body silhouette with clickable zones */}
      <div className="relative mx-auto aspect-[3/5] max-w-[280px] rounded-2xl border-2 border-white/10 bg-white/[0.03] overflow-hidden">
        {/* Body outline placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[90%] w-[50%] rounded-full border-2 border-dashed border-white/10" />
        </div>

        {/* Clickable zones */}
        {zones.map((zone) => {
          const pos = regionPositions[zone.region];
          if (!pos) return null;
          const isExamined = examinedRegions.includes(zone.region);
          const canAfford = zone.cpCost <= remainingBudget;
          const isSelected = selectedZone?.region === zone.region;

          return (
            <button
              key={zone.region}
              onClick={() => !isExamined && canAfford && handleExamine(zone)}
              disabled={isExamined || !canAfford}
              className={`absolute rounded-xl border-2 transition-all ${
                isExamined
                  ? "border-showcase-green/40 bg-showcase-green/10 cursor-default"
                  : canAfford
                    ? "border-white/20 bg-white/5 hover:border-showcase-teal/50 hover:bg-showcase-teal/10 cursor-pointer"
                    : "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
              } ${isSelected ? "ring-2 ring-showcase-teal/50" : ""}`}
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
              }}
              title={`${zone.label} (${zone.cpCost} CP)`}
            >
              <div className="flex h-full flex-col items-center justify-center p-1">
                {isExamined ? (
                  <Check className="h-3.5 w-3.5 text-showcase-green" />
                ) : (
                  <>
                    <span className="text-[9px] font-bold text-white/60 leading-tight text-center">
                      {zone.label}
                    </span>
                    <span className="text-[8px] text-white/30 mt-0.5">
                      {zone.cpCost} CP
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone labels list (alternative for accessibility) */}
      <div className="grid grid-cols-2 gap-1.5">
        {zones.map((zone) => {
          const isExamined = examinedRegions.includes(zone.region);
          const canAfford = zone.cpCost <= remainingBudget;

          return (
            <button
              key={`btn-${zone.region}`}
              onClick={() => !isExamined && canAfford && handleExamine(zone)}
              disabled={isExamined || !canAfford}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                isExamined
                  ? "border-showcase-green/20 bg-showcase-green/5"
                  : canAfford
                    ? "border-white/10 bg-white/5 hover:border-showcase-teal/30 hover:bg-showcase-teal/5"
                    : "border-white/5 bg-white/[0.02] opacity-40"
              }`}
            >
              {isExamined ? (
                <Check className="h-3 w-3 text-showcase-green shrink-0" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-white/20 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-white/70 truncate block">
                  {zone.label}
                </span>
              </div>
              <span className="text-[9px] text-white/30 shrink-0">
                {zone.cpCost} CP
              </span>
            </button>
          );
        })}
      </div>

      {/* Revealed findings */}
      <AnimatePresence>
        {selectedZone && revealedFindings[selectedZone.region] && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 p-4"
          >
            <p className="text-xs font-bold text-showcase-teal mb-1">
              {selectedZone.label} — Findings
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {revealedFindings[selectedZone.region]}
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Done button */}
      {hasExaminedAny && (
        <m.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onComplete}
          className="flex items-center gap-2 rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10 px-6 py-3 font-display text-sm font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:-translate-y-0.5"
        >
          Done examining
          <ChevronRight className="h-4 w-4" />
        </m.button>
      )}
    </m.div>
  );
}
