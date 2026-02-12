"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Coins, Star } from "lucide-react";
import type { ExamZone, Clue } from "@/data/clinical-cases";

interface ExamZoneExplorerProps {
  zones: ExamZone[];
  budgetForExam: number;
  cpSpent: number;
  examinedRegions: string[];
  onExamineZone: (region: string, cpCost: number, clues: Clue[], findingsData: { label: string; findings: string }) => void;
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

    onExamineZone(zone.region, zone.cpCost, zone.cluesRevealed, {
      label: zone.label,
      findings: zone.findings,
    });
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
        <p className="text-sm font-bold text-ink-dark">Physical Examination</p>
        <div className="flex items-center gap-1.5 rounded-full bg-showcase-yellow/10 border-2 border-showcase-yellow/20 px-3 py-1">
          <Coins className="h-3.5 w-3.5 text-showcase-yellow" />
          <span className="text-xs font-bold text-showcase-yellow">
            {remainingBudget} CP remaining
          </span>
        </div>
      </div>

      {/* Body silhouette with clickable zones -- hidden on small screens, shown on sm+ */}
      <div className="relative mx-auto aspect-[3/5] max-w-[280px] rounded-2xl border-3 border-showcase-navy/10 bg-pastel-lavender/20 overflow-hidden hidden sm:block">
        {/* Body outline placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[90%] w-[50%] rounded-full border-2 border-dashed border-showcase-navy/10" />
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
                    ? "border-showcase-navy/15 bg-white/60 hover:border-showcase-teal/50 hover:bg-showcase-teal/10 cursor-pointer"
                    : "border-showcase-navy/5 bg-gray-50/50 cursor-not-allowed opacity-50"
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
                  <Check className="h-4 w-4 text-showcase-green" />
                ) : (
                  <>
                    <span className="text-[9px] font-bold text-ink-muted leading-tight text-center">
                      {zone.label}
                    </span>
                    <span className="text-[8px] text-ink-light mt-0.5">
                      {zone.cpCost} CP
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone labels list -- primary on mobile, secondary on desktop */}
      <div className="grid grid-cols-2 gap-2">
        {zones.map((zone) => {
          const isExamined = examinedRegions.includes(zone.region);
          const canAfford = zone.cpCost <= remainingBudget;

          return (
            <button
              key={`btn-${zone.region}`}
              onClick={() => !isExamined && canAfford && handleExamine(zone)}
              disabled={isExamined || !canAfford}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-all min-h-[48px] ${
                isExamined
                  ? "border-showcase-green/20 bg-showcase-green/5"
                  : canAfford
                    ? "border-showcase-navy/10 bg-white hover:border-showcase-teal/30 hover:bg-pastel-mint/20 hover:shadow-sm active:scale-[0.98]"
                    : "border-showcase-navy/5 bg-gray-50 opacity-40"
              }`}
            >
              {isExamined ? (
                <Check className="h-4 w-4 text-showcase-green shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-showcase-navy/15 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-ink-dark truncate block">
                  {zone.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isExamined && zone.isKeyFinding && (
                  <Star className="h-3 w-3 text-showcase-yellow" />
                )}
                <span className="text-[10px] font-bold text-ink-light">
                  {zone.cpCost} CP
                </span>
              </div>
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
            className="rounded-2xl border-3 border-showcase-teal/20 bg-pastel-mint/30 p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-showcase-teal">
                {selectedZone.label} — Findings
              </p>
              {selectedZone.isKeyFinding && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-showcase-yellow/10 border border-showcase-yellow/20 px-2 py-0.5 text-[9px] font-bold text-showcase-yellow">
                  <Star className="h-2.5 w-2.5" />
                  Key Finding
                </span>
              )}
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {revealedFindings[selectedZone.region]}
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Done button + key findings summary */}
      {hasExaminedAny && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Key findings summary */}
          {(() => {
            const totalKeyFindings = zones.filter((z) => z.isKeyFinding).length;
            if (totalKeyFindings === 0) return null;
            const foundKeyFindings = zones.filter(
              (z) => z.isKeyFinding && examinedRegions.includes(z.region)
            ).length;
            return (
              <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-yellow/15 bg-showcase-yellow/5 px-4 py-2.5">
                <Star className="h-4 w-4 text-showcase-yellow shrink-0" />
                <p className="text-xs text-showcase-yellow font-medium">
                  You found {foundKeyFindings} of {totalKeyFindings} key findings in the physical exam.
                </p>
              </div>
            );
          })()}

          <button
            onClick={onComplete}
            className="flex items-center gap-2 rounded-2xl border-3 border-showcase-teal/30 bg-showcase-teal/10 px-6 py-3.5 font-display text-sm font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:shadow-chunky-sm hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Done examining
            <ChevronRight className="h-4 w-4" />
          </button>
        </m.div>
      )}
    </m.div>
  );
}
