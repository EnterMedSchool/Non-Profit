"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { m } from "framer-motion";
import {
  Trophy,
  Target,
  Coins,
  Heart,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  Star,
  ClipboardList,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import type { ClinicalCase } from "@/data/clinical-cases";
import type { DiseaseCharacter } from "@/data/disease-characters";
import { rarityConfig } from "@/data/disease-characters";
import type { CaseGameState } from "./CaseEngine";

// ─── Props ──────────────────────────────────────────────────────────────────

interface CaseDebriefProps {
  caseData: ClinicalCase;
  gameState: CaseGameState;
  character: DiseaseCharacter | null;
}

// ─── Score Ring ─────────────────────────────────────────────────────────────

function ScoreRing({
  value,
  label,
  color,
  icon: Icon,
}: {
  value: number;
  label: string;
  color: string;
  icon: typeof Trophy;
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="72" height="72" className="-rotate-90">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="5"
          />
          <m.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-lg font-bold text-white tabular-nums"
        >
          {value}
        </m.p>
        <p className="text-[10px] text-white/40 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Stat Row ───────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: typeof Target;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
      {detail && (
        <p className="text-[10px] text-white/30 shrink-0">{detail}</p>
      )}
    </div>
  );
}

// ─── Main Debrief ───────────────────────────────────────────────────────────

export default function CaseDebrief({
  caseData,
  gameState,
  character,
}: CaseDebriefProps) {
  const locale = useLocale();
  const score = gameState.score;

  if (!score) return null;

  const rarity = character ? rarityConfig[character.rarity] : null;

  // Time taken
  const timeTaken = Math.round(
    (Date.now() - gameState.startedAt) / 1000 / 60
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-showcase-purple/10 border border-showcase-purple/20 px-4 py-1.5 mb-4">
            <Trophy className="h-4 w-4 text-showcase-purple" />
            <span className="text-xs font-bold text-showcase-purple">
              Case Complete
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            {caseData.title}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {caseData.category} &middot; {timeTaken} min &middot;{" "}
            {gameState.visitedSceneIds.length} scenes visited
          </p>
        </m.div>

        {/* Overall Score */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-2xl border-2 border-showcase-purple/20 bg-gradient-to-b from-showcase-purple/10 to-transparent p-8 text-center"
        >
          <m.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-6xl font-display font-bold text-white tabular-nums"
          >
            {score.totalScore}
          </m.p>
          <p className="mt-1 text-sm text-white/40">Overall Score</p>

          <div className="mt-6 flex justify-center gap-6">
            <ScoreRing
              value={score.cpEfficiency}
              label="Efficiency"
              color="#6C5CE7"
              icon={Coins}
            />
            <ScoreRing
              value={score.ddxAccuracy}
              label="DDx Accuracy"
              color="#00D9C0"
              icon={ClipboardList}
            />
            <ScoreRing
              value={Math.round(
                score.totalChoices > 0
                  ? (score.optimalChoices / score.totalChoices) * 100
                  : 50
              )}
              label="Decisions"
              color="#2ECC71"
              icon={Target}
            />
            <ScoreRing
              value={score.rapportFinal}
              label="Rapport"
              color="#FF85A2"
              icon={Heart}
            />
          </div>

          {/* XP earned */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-showcase-yellow/10 border border-showcase-yellow/20 px-4 py-2"
          >
            <Star className="h-4 w-4 text-showcase-yellow" />
            <span className="text-sm font-bold text-showcase-yellow">
              +{score.xpEarned} XP earned
            </span>
          </m.div>
        </m.div>

        {/* Detailed Stats */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-display text-lg font-bold text-white mb-4">
            Performance Breakdown
          </h2>
          <div className="space-y-2">
            <StatRow
              label="Clinical Points Spent"
              value={`${gameState.cpSpent} CP`}
              detail={`Budget: ${gameState.cpBudget} CP`}
              icon={Coins}
              color="#6C5CE7"
            />
            <StatRow
              label="Optimal Decisions"
              value={`${score.optimalChoices} / ${score.totalChoices}`}
              icon={Target}
              color="#2ECC71"
            />
            <StatRow
              label="Key Findings Discovered"
              value={`${score.keyFindingsFound} / ${score.keyFindingsTotal}`}
              icon={Search}
              color="#00D9C0"
            />
            <StatRow
              label="Final Rapport"
              value={`${score.rapportFinal}/100`}
              detail={
                score.rapportFinal >= 70
                  ? "Trusting"
                  : score.rapportFinal >= 30
                    ? "Neutral"
                    : "Distant"
              }
              icon={Heart}
              color="#FF85A2"
            />
            <StatRow
              label="DDx Accuracy"
              value={`${score.ddxAccuracy}%`}
              icon={ClipboardList}
              color="#FFD93D"
            />
          </div>
        </m.div>

        {/* Character Caught */}
        {character && rarity && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="font-display text-lg font-bold text-white mb-4">
              Character Unlocked
            </h2>
            <div
              className={`rounded-2xl border-2 ${rarity.borderColor} bg-white/5 p-5 ${rarity.glow}`}
            >
              <div className="flex items-center gap-4">
                {/* Character thumbnail placeholder */}
                <div className="h-16 w-16 rounded-xl bg-white/10 border-2 border-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-white/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-white">
                      {character.name}
                    </h3>
                    <span
                      className={`rounded-full ${rarity.bgColor} px-2 py-0.5 text-[9px] font-bold ${rarity.color}`}
                    >
                      {rarity.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    {character.subtitle}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">
                    {character.items.length} items &middot;{" "}
                    {character.category}
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        )}

        {/* Actions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          {/* Related visuals */}
          {caseData.relatedVisualIds.length > 0 && (
            <Link
              href={`/${locale}/resources/visuals/${caseData.relatedVisualIds[0]}`}
              className="flex items-center justify-between rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3.5 transition-all hover:bg-showcase-teal/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-showcase-teal" />
                <div>
                  <p className="text-sm font-bold text-showcase-teal">
                    Study the Disease
                  </p>
                  <p className="text-[10px] text-white/40">
                    View the related visual resource
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-showcase-teal" />
            </Link>
          )}

          {/* Collection */}
          <Link
            href={`/${locale}/collection`}
            className="flex items-center justify-between rounded-xl border-2 border-showcase-purple/20 bg-showcase-purple/5 px-5 py-3.5 transition-all hover:bg-showcase-purple/10 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-showcase-purple" />
              <div>
                <p className="text-sm font-bold text-showcase-purple">
                  View Collection
                </p>
                <p className="text-[10px] text-white/40">
                  See all your caught characters
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-showcase-purple" />
          </Link>

          {/* Try another case */}
          <Link
            href={`/${locale}/resources/clinical-cases`}
            className="flex items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 px-5 py-3.5 transition-all hover:bg-white/10 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-white/50" />
              <div>
                <p className="text-sm font-bold text-white/70">
                  Try Another Case
                </p>
                <p className="text-[10px] text-white/40">
                  Browse all clinical cases
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-white/40" />
          </Link>
        </m.div>
      </div>
    </div>
  );
}
