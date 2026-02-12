"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
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
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Lightbulb,
  TrendingUp,
  Award,
  GraduationCap,
} from "lucide-react";
import type { ClinicalCase, ScoringKey } from "@/data/clinical-cases";
import type { DiseaseCharacter } from "@/data/disease-characters";
import { rarityConfig } from "@/data/disease-characters";
import type { CaseGameState, CaseScore } from "./CaseEngine";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";

// ─── Props ──────────────────────────────────────────────────────────────────

interface CaseDebriefProps {
  caseData: ClinicalCase;
  scoringKey: ScoringKey;
  gameState: CaseGameState;
  character: DiseaseCharacter | null;
  onReplay?: () => void;
}

// ─── Score Tier System (D1) ─────────────────────────────────────────────────

interface ScoreTier {
  tier: "platinum" | "gold" | "silver" | "bronze";
  gradient: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  ringColor: string;
}

function getScoreTier(score: number): ScoreTier {
  if (score >= 90)
    return {
      tier: "platinum",
      gradient: "from-showcase-purple via-showcase-blue to-showcase-teal",
      textColor: "text-showcase-purple",
      borderColor: "border-showcase-purple/30",
      bgColor: "bg-showcase-purple/10",
      ringColor: "#6C5CE7",
    };
  if (score >= 75)
    return {
      tier: "gold",
      gradient: "from-showcase-yellow via-amber-400 to-orange-400",
      textColor: "text-amber-600",
      borderColor: "border-showcase-yellow/30",
      bgColor: "bg-showcase-yellow/10",
      ringColor: "#FFD93D",
    };
  if (score >= 55)
    return {
      tier: "silver",
      gradient: "from-gray-300 via-gray-400 to-gray-500",
      textColor: "text-gray-600",
      borderColor: "border-gray-300",
      bgColor: "bg-gray-100",
      ringColor: "#9CA3AF",
    };
  return {
    tier: "bronze",
    gradient: "from-orange-300 via-orange-400 to-amber-600",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    bgColor: "bg-orange-50",
    ringColor: "#CD7F32",
  };
}

// ─── XP Level System (D3) ───────────────────────────────────────────────────

interface XpLevel {
  level: number;
  titleKey: string;
  nextXp: number;
}

function getXpLevel(totalXp: number): XpLevel {
  if (totalXp >= 1000) return { level: 5, titleKey: "resident", nextXp: Infinity };
  if (totalXp >= 600) return { level: 4, titleKey: "seniorClerk", nextXp: 1000 };
  if (totalXp >= 300) return { level: 3, titleKey: "juniorClerk", nextXp: 600 };
  if (totalXp >= 100) return { level: 2, titleKey: "clinicalStudent", nextXp: 300 };
  return { level: 1, titleKey: "preClinicalStudent", nextXp: 100 };
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
            stroke="rgba(0,0,0,0.06)"
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
          className="text-lg font-bold text-ink-dark tabular-nums"
        >
          {value}
        </m.p>
        <p className="text-[10px] text-ink-light font-medium">{label}</p>
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
    <div className="flex items-center gap-3 rounded-2xl border-2 border-showcase-navy/8 bg-white px-4 py-3 shadow-sm">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-light">{label}</p>
        <p className="text-sm font-bold text-ink-dark">{value}</p>
      </div>
      {detail && (
        <p className="text-[10px] text-ink-light shrink-0">{detail}</p>
      )}
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon: Icon,
  color,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: typeof Target;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group mb-6 rounded-2xl border-2 border-showcase-navy/8 bg-white shadow-sm overflow-hidden"
    >
      <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 select-none list-none [&::-webkit-details-marker]:hidden">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h2 className="flex-1 font-display text-sm font-bold text-ink-dark">
          {title}
        </h2>
        <ChevronDown className="h-4 w-4 text-ink-light transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}

// ─── Main Debrief ───────────────────────────────────────────────────────────

export default function CaseDebrief({
  caseData,
  scoringKey,
  gameState,
  character,
  onReplay,
}: CaseDebriefProps) {
  const locale = useLocale();
  const t = useTranslations("clinicalCasePlayer");
  const score = gameState.score;
  const profile = usePlayerProfile();

  if (!score) return null;

  const rarity = character ? rarityConfig[character.rarity] : null;
  const tier = getScoreTier(score.totalScore);
  const xpLevel = getXpLevel(profile.totalXp);

  // Time taken
  const timeTaken = Math.round(
    (Date.now() - gameState.startedAt) / 1000 / 60
  );

  // Personal best detection (D2)
  const previousResult = profile.getCaseResult(caseData.id);
  const previousBest = previousResult?.score.totalScore;
  const isNewPersonalBest =
    previousBest !== undefined && score.totalScore > previousBest;

  // Tier label mapping
  const tierLabelMap: Record<string, string> = {
    platinum: t("scoreTierPlatinum"),
    gold: t("scoreTierGold"),
    silver: t("scoreTierSilver"),
    bronze: t("scoreTierBronze"),
  };

  // XP level title mapping
  const levelTitleMap: Record<string, string> = {
    preClinicalStudent: t("preClinicalStudent"),
    clinicalStudent: t("clinicalStudent"),
    juniorClerk: t("juniorClerk"),
    seniorClerk: t("seniorClerk"),
    resident: t("resident"),
  };

  // ── Choice review data (C1) ──
  const choiceReviewData = useMemo(() => {
    return gameState.choiceHistory.map((ch) => {
      const scene = caseData.scenes.find((s) => s.id === ch.sceneId);
      if (
        !scene ||
        (scene.interaction.mode !== "choices" &&
          scene.interaction.mode !== "timed-choice")
      )
        return null;

      const chosenOption = scene.interaction.options.find(
        (o) => o.id === ch.optionId
      );
      if (!chosenOption) return null;

      const wasOptimal =
        scoringKey.optimalFlags[ch.sceneId]?.[ch.optionId] ?? false;

      // Find optimal alternative if this wasn't optimal
      let optimalAlternative: { label: string } | null = null;
      if (!wasOptimal) {
        const optimalId = Object.entries(
          scoringKey.optimalFlags[ch.sceneId] ?? {}
        ).find(([, isOpt]) => isOpt)?.[0];
        if (optimalId) {
          const optOpt = scene.interaction.options.find(
            (o) => o.id === optimalId
          );
          if (optOpt) optimalAlternative = { label: optOpt.label };
        }
      }

      return {
        narration: scene.narration.slice(0, 120) + (scene.narration.length > 120 ? "..." : ""),
        chosenLabel: chosenOption.label,
        feedback: chosenOption.feedback,
        wasOptimal,
        optimalAlternative,
      };
    }).filter(Boolean) as Array<{
      narration: string;
      chosenLabel: string;
      feedback?: string;
      wasOptimal: boolean;
      optimalAlternative: { label: string } | null;
    }>;
  }, [gameState.choiceHistory, caseData.scenes, scoringKey.optimalFlags]);

  // ── Missed findings data (C2) ──
  const findingsData = useMemo(() => {
    const allKeyFindings: Array<{
      id: string;
      label: string;
      zone?: string;
      cpCost?: number;
      found: boolean;
    }> = [];

    for (const scene of caseData.scenes) {
      // Scene-level key findings
      for (const clue of scene.cluesRevealed) {
        if (clue.isKeyFinding) {
          allKeyFindings.push({
            id: clue.id,
            label: clue.label,
            found: gameState.collectedClues.some((c) => c.id === clue.id),
          });
        }
      }
      // Exam zone key findings
      if (scene.interaction.mode === "exam-zones") {
        for (const zone of scene.interaction.zones) {
          if (zone.isKeyFinding) {
            for (const clue of zone.cluesRevealed) {
              if (clue.isKeyFinding) {
                allKeyFindings.push({
                  id: clue.id,
                  label: clue.label,
                  zone: zone.label,
                  cpCost: zone.cpCost,
                  found: gameState.collectedClues.some((c) => c.id === clue.id),
                });
              }
            }
          }
        }
      }
    }

    return allKeyFindings;
  }, [caseData.scenes, gameState.collectedClues]);

  // ── DDx evolution data (C3) ──
  const ddxEvolutionData = useMemo(() => {
    return scoringKey.answerKey.expertDdxEvolution.map((expertSnap) => {
      const studentSnap = gameState.ddxHistory.find(
        (s) => s.sceneId === expertSnap.sceneId
      );
      const scene = caseData.scenes.find((s) => s.id === expertSnap.sceneId);
      return {
        sceneId: expertSnap.sceneId,
        sceneLabel: scene
          ? `${scene.act.charAt(0).toUpperCase() + scene.act.slice(1)}`
          : expertSnap.sceneId,
        expertDdx: expertSnap.ddx,
        studentDdx: studentSnap?.ddx ?? [],
      };
    });
  }, [scoringKey.answerKey.expertDdxEvolution, gameState.ddxHistory, caseData.scenes]);

  // ── Score-gated item thresholds (D4) ──
  const itemThresholds = [60, 75, 90];

  return (
    <div className="min-h-dvh bg-pastel-cream text-ink-dark">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 sm:px-6">
        {/* ─── Header ─── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-showcase-purple/10 border-2 border-showcase-purple/20 px-4 py-1.5 mb-4">
            <Trophy className="h-4 w-4 text-showcase-purple" />
            <span className="text-xs font-bold text-showcase-purple">
              {t("caseComplete")}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-dark">
            {caseData.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {caseData.category} &middot; {timeTaken} min &middot;{" "}
            {gameState.visitedSceneIds.length} scenes visited
          </p>
        </m.div>

        {/* ─── Overall Score with Tier (D1) ─── */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 rounded-2xl border-3 ${tier.borderColor} bg-white p-6 sm:p-8 text-center shadow-chunky-sm`}
        >
          {/* Tier badge */}
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`inline-flex items-center gap-1.5 rounded-full ${tier.bgColor} border-2 ${tier.borderColor} px-3 py-1 mb-3`}
          >
            <Award className="h-3.5 w-3.5" style={{ color: tier.ringColor }} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tier.textColor}`}>
              {tierLabelMap[tier.tier]}
            </span>
          </m.div>

          <m.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`text-5xl sm:text-6xl font-display font-bold tabular-nums ${tier.textColor}`}
          >
            {score.totalScore}
          </m.p>
          <p className="mt-1 text-sm text-ink-muted">{t("overallScore")}</p>

          {/* Score rings */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:flex sm:justify-center sm:gap-6">
            <ScoreRing
              value={score.cpEfficiency}
              label={t("efficiency")}
              color="#6C5CE7"
              icon={Coins}
            />
            <ScoreRing
              value={score.ddxAccuracy}
              label={t("ddxAccuracy")}
              color="#00D9C0"
              icon={ClipboardList}
            />
            <ScoreRing
              value={Math.round(
                score.totalChoices > 0
                  ? (score.optimalChoices / score.totalChoices) * 100
                  : 50
              )}
              label={t("decisions")}
              color="#2ECC71"
              icon={Target}
            />
            <ScoreRing
              value={score.rapportFinal}
              label={t("rapport")}
              color="#FF85A2"
              icon={Heart}
            />
          </div>

          {/* XP + Level */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-showcase-yellow/10 border-2 border-showcase-yellow/20 px-4 py-2">
              <Star className="h-4 w-4 text-showcase-yellow" />
              <span className="text-sm font-bold text-showcase-yellow">
                {t("xpEarned", { count: score.xpEarned })}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-showcase-blue/5 border border-showcase-blue/15 px-3 py-1">
              <GraduationCap className="h-3 w-3 text-showcase-blue" />
              <span className="text-[10px] font-bold text-showcase-blue">
                {t("level", { level: xpLevel.level })} — {levelTitleMap[xpLevel.titleKey]}
              </span>
            </div>
          </m.div>
        </m.div>

        {/* ─── Personal Best (D2) ─── */}
        <AnimatePresence>
          {previousBest !== undefined && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`mb-6 rounded-2xl border-2 p-4 text-center ${
                isNewPersonalBest
                  ? "border-showcase-green/30 bg-showcase-green/5"
                  : "border-showcase-navy/8 bg-white"
              }`}
            >
              {isNewPersonalBest ? (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-showcase-green" />
                  <div>
                    <p className="text-sm font-bold text-showcase-green">
                      {t("newPersonalBest")}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {t("previousBest", { score: previousBest })} → {score.totalScore} (+{score.totalScore - previousBest})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink-muted">
                  {t("yourBest", { score: previousBest })} &middot;{" "}
                  {t("scoredThisTime", { score: score.totalScore })}
                </p>
              )}
            </m.div>
          )}
        </AnimatePresence>

        {/* ─── Performance Breakdown ─── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="font-display text-lg font-bold text-ink-dark mb-4">
            {t("performanceBreakdown")}
          </h2>
          <div className="space-y-2">
            <StatRow
              label={t("clinicalPointsSpent")}
              value={`${gameState.cpSpent} CP`}
              detail={`Budget: ${gameState.cpBudget} CP`}
              icon={Coins}
              color="#6C5CE7"
            />
            <StatRow
              label={t("optimalDecisions")}
              value={`${score.optimalChoices} / ${score.totalChoices}`}
              icon={Target}
              color="#2ECC71"
            />
            <StatRow
              label={t("keyFindingsDiscovered")}
              value={`${score.keyFindingsFound} / ${score.keyFindingsTotal}`}
              icon={Search}
              color="#00D9C0"
            />
            <StatRow
              label={t("finalRapport")}
              value={`${score.rapportFinal}/100`}
              detail={
                score.rapportFinal >= 70
                  ? t("trusting")
                  : score.rapportFinal >= 30
                    ? t("neutral")
                    : t("distant")
              }
              icon={Heart}
              color="#FF85A2"
            />
            <StatRow
              label={t("ddxAccuracy")}
              value={`${score.ddxAccuracy}%`}
              icon={ClipboardList}
              color="#FFD93D"
            />
          </div>
        </m.div>

        {/* ─── C1: Choice-by-Choice Review ─── */}
        {choiceReviewData.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <CollapsibleSection
              title={t("reviewYourDecisions")}
              icon={Target}
              color="#2ECC71"
              defaultOpen
            >
              <div className="space-y-3">
                {choiceReviewData.map((choice, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-4 ${
                      choice.wasOptimal
                        ? "border-showcase-green/15 bg-showcase-green/5"
                        : "border-showcase-coral/15 bg-showcase-coral/5"
                    }`}
                  >
                    {/* Context */}
                    <p className="text-[11px] text-ink-light leading-relaxed mb-2 italic">
                      {choice.narration}
                    </p>

                    {/* Student's choice */}
                    <div className="flex items-start gap-2 mb-2">
                      {choice.wasOptimal ? (
                        <CheckCircle2 className="h-4 w-4 text-showcase-green shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-showcase-coral shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-ink-light mb-0.5">{t("yourChoice")}</p>
                        <p className="text-sm font-bold text-ink-dark">{choice.chosenLabel}</p>
                      </div>
                    </div>

                    {/* Optimal alternative */}
                    {choice.optimalAlternative && (
                      <div className="flex items-start gap-2 mb-2 ml-6 rounded-lg bg-white/60 px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-showcase-green shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-ink-light">{t("optimalAlternative")}</p>
                          <p className="text-xs font-medium text-ink-muted">{choice.optimalAlternative.label}</p>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {choice.feedback && (
                      <div className="ml-6 mt-2 rounded-lg bg-white/60 px-3 py-2 border border-showcase-navy/5">
                        <p className="text-xs text-ink-muted leading-relaxed">
                          {choice.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </m.div>
        )}

        {/* ─── C2: Missed Findings ─── */}
        {findingsData.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <CollapsibleSection
              title={t("missedFindings")}
              icon={Search}
              color="#00D9C0"
            >
              <div className="space-y-2">
                {findingsData.map((finding) => (
                  <div
                    key={finding.id}
                    className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                      finding.found
                        ? "bg-showcase-green/5"
                        : "bg-showcase-coral/5"
                    }`}
                  >
                    {finding.found ? (
                      <CheckCircle2 className="h-4 w-4 text-showcase-green shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-showcase-coral shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-dark">
                        {finding.label}
                      </p>
                      {!finding.found && finding.zone && (
                        <p className="text-[10px] text-ink-light mt-0.5">
                          {t("couldBeFoundIn", {
                            zone: finding.zone,
                            cost: finding.cpCost ?? 0,
                          })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold shrink-0 ${
                        finding.found ? "text-showcase-green" : "text-showcase-coral"
                      }`}
                    >
                      {finding.found ? t("foundFinding") : t("missedFinding")}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </m.div>
        )}

        {/* ─── C3: DDx Evolution Timeline ─── */}
        {ddxEvolutionData.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <CollapsibleSection
              title={t("ddxEvolution")}
              icon={ClipboardList}
              color="#FFD93D"
            >
              <div className="space-y-4">
                {ddxEvolutionData.map((snap, i) => {
                  const expertSet = new Set(snap.expertDdx);
                  const studentSet = new Set(snap.studentDdx);
                  return (
                    <div key={snap.sceneId} className="rounded-xl border-2 border-showcase-navy/8 bg-pastel-cream/40 p-4">
                      <p className="text-xs font-bold text-ink-muted mb-3">
                        Checkpoint {i + 1}: {snap.sceneLabel}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Student DDx */}
                        <div>
                          <p className="text-[10px] font-bold text-showcase-blue mb-1.5">
                            {t("yourDdxAtCheckpoint")}
                          </p>
                          <div className="space-y-1">
                            {snap.studentDdx.length > 0 ? (
                              snap.studentDdx.map((d) => (
                                <div
                                  key={d}
                                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] ${
                                    expertSet.has(d)
                                      ? "bg-showcase-green/10 text-showcase-green font-medium"
                                      : "bg-showcase-coral/10 text-showcase-coral"
                                  }`}
                                >
                                  {expertSet.has(d) ? (
                                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                                  ) : (
                                    <XCircle className="h-2.5 w-2.5 shrink-0" />
                                  )}
                                  {d}
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-ink-light italic">No DDx at this point</p>
                            )}
                          </div>
                        </div>
                        {/* Expert DDx */}
                        <div>
                          <p className="text-[10px] font-bold text-showcase-purple mb-1.5">
                            {t("expertDdxAtCheckpoint")}
                          </p>
                          <div className="space-y-1">
                            {snap.expertDdx.map((d) => (
                              <div
                                key={d}
                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] ${
                                  studentSet.has(d)
                                    ? "bg-showcase-green/10 text-showcase-green font-medium"
                                    : "bg-showcase-navy/5 text-ink-muted"
                                }`}
                              >
                                {studentSet.has(d) ? (
                                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                                ) : (
                                  <span className="h-2.5 w-2.5 shrink-0" />
                                )}
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          </m.div>
        )}

        {/* ─── C4: Learning Objectives ─── */}
        {scoringKey.learningObjectives.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <CollapsibleSection
              title={t("learningObjectives")}
              icon={GraduationCap}
              color="#6C5CE7"
            >
              <div className="space-y-2">
                {scoringKey.learningObjectives.map((obj, i) => {
                  // Simple heuristic: objectives are "met" if the student scored well overall
                  // A more sophisticated check could map specific actions, but this works for now
                  const isMet = score.totalScore >= 60;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                        isMet ? "bg-showcase-green/5" : "bg-showcase-navy/3"
                      }`}
                    >
                      {isMet ? (
                        <CheckCircle2 className="h-4 w-4 text-showcase-green shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-showcase-navy/15 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-ink-muted leading-relaxed">{obj}</p>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          </m.div>
        )}

        {/* ─── C5: Teaching Summary (Key Concepts) ─── */}
        {scoringKey.teachingNotes && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <CollapsibleSection
              title={t("keyConcepts")}
              icon={Lightbulb}
              color="#FFD93D"
            >
              <div className="prose-sm text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                {scoringKey.teachingNotes}
              </div>
            </CollapsibleSection>
          </m.div>
        )}

        {/* ─── Character Caught with Score-Gated Items (D4) ─── */}
        {character && rarity && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mb-8"
          >
            <h2 className="font-display text-lg font-bold text-ink-dark mb-4">
              {t("characterUnlocked")}
            </h2>
            <div
              className={`rounded-2xl border-3 ${rarity.borderColor} bg-white p-5 shadow-chunky-sm`}
            >
              <div className="flex items-center gap-4">
                {/* Character thumbnail placeholder */}
                <div className="h-16 w-16 rounded-xl bg-pastel-lavender/30 border-2 border-showcase-navy/5 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-showcase-purple/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-ink-dark">
                      {character.name}
                    </h3>
                    <span
                      className={`rounded-full ${rarity.bgColor} px-2 py-0.5 text-[9px] font-bold ${rarity.color}`}
                    >
                      {rarity.label}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {character.subtitle}
                  </p>
                </div>
              </div>

              {/* Score-gated items */}
              {character.items.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] text-ink-light font-medium">
                    {t("itemsUnlocked", {
                      count: character.items.filter(
                        (_, i) => score.totalScore >= (itemThresholds[i] ?? 0)
                      ).length,
                      total: character.items.length,
                    })}
                  </p>
                  {character.items.map((item, i) => {
                    const threshold = itemThresholds[i] ?? 0;
                    const isUnlocked = score.totalScore >= threshold;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 ${
                          isUnlocked
                            ? "border-showcase-yellow/20 bg-showcase-yellow/5"
                            : "border-showcase-navy/5 bg-gray-50 opacity-60"
                        }`}
                      >
                        {isUnlocked ? (
                          <Sparkles className="h-4 w-4 text-showcase-yellow shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isUnlocked ? "text-ink-dark" : "text-ink-light"}`}>
                            {isUnlocked ? item.name : t("itemLocked")}
                          </p>
                          {isUnlocked ? (
                            <p className="text-[10px] text-ink-muted mt-0.5">
                              {item.revealText}
                            </p>
                          ) : (
                            <p className="text-[10px] text-ink-light mt-0.5">
                              {t("scoreToUnlock", { score: threshold })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </m.div>
        )}

        {/* ─── Actions ─── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          {/* Replay this case */}
          {onReplay && (
            <button
              onClick={onReplay}
              className="flex w-full items-center justify-between rounded-2xl border-3 border-showcase-yellow/30 bg-showcase-yellow/5 px-5 py-3.5 transition-all hover:bg-showcase-yellow/10 hover:-translate-y-0.5 hover:shadow-chunky-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-showcase-yellow" />
                <div className="text-left">
                  <p className="text-sm font-bold text-showcase-yellow">
                    {t("replayThisCase")}
                  </p>
                  <p className="text-[10px] text-ink-light">
                    {t("tryDifferentApproach")}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-showcase-yellow" />
            </button>
          )}

          {/* Related visuals */}
          {caseData.relatedVisualIds.length > 0 && (
            <Link
              href={`/${locale}/resources/visuals/${caseData.relatedVisualIds[0]}`}
              className="flex items-center justify-between rounded-2xl border-3 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3.5 transition-all hover:bg-showcase-teal/10 hover:-translate-y-0.5 hover:shadow-chunky-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-showcase-teal" />
                <div>
                  <p className="text-sm font-bold text-showcase-teal">
                    {t("studyTheDisease")}
                  </p>
                  <p className="text-[10px] text-ink-light">
                    {t("viewRelatedVisual")}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-showcase-teal" />
            </Link>
          )}

          {/* Collection */}
          <Link
            href={`/${locale}/collection`}
            className="flex items-center justify-between rounded-2xl border-3 border-showcase-purple/20 bg-showcase-purple/5 px-5 py-3.5 transition-all hover:bg-showcase-purple/10 hover:-translate-y-0.5 hover:shadow-chunky-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-showcase-purple" />
              <div>
                <p className="text-sm font-bold text-showcase-purple">
                  {t("viewCollection")}
                </p>
                <p className="text-[10px] text-ink-light">
                  {t("seeAllCharacters")}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-showcase-purple" />
          </Link>

          {/* Try another case */}
          <Link
            href={`/${locale}/resources/clinical-cases`}
            className="flex items-center justify-between rounded-2xl border-3 border-showcase-navy/10 bg-white px-5 py-3.5 transition-all hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-chunky-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-ink-light" />
              <div>
                <p className="text-sm font-bold text-ink-muted">
                  {t("tryAnotherCase")}
                </p>
                <p className="text-[10px] text-ink-light">
                  {t("browseAllCases")}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-light" />
          </Link>
        </m.div>
      </div>
    </div>
  );
}
