"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Volume2,
  VolumeX,
  ClipboardList,
  Stethoscope,
  BookOpen,
  ChevronRight,
  X,
} from "lucide-react";
import type { ClinicalCase, CaseScene, DecisionOption, ScoringKey, MentorComment } from "@/data/clinical-cases";
import { actConfig } from "@/data/clinical-cases";
import type { DiseaseCharacter } from "@/data/disease-characters";
import {
  createInitialState,
  getCurrentScene,
  advanceToScene,
  makeChoice,
  examineZone,
  completeExam,
  completeDdxCheck,
  updateDdx,
  snapshotDdx,
  finalizeCase,
  isRegionExamined,
  getExamCpSpent,
  type CaseGameState,
} from "./CaseEngine";
import { useCaseSound } from "@/hooks/useCaseSound";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import CpBudget from "./CpBudget";
import RapportMeter from "./RapportMeter";
import DdxBoard from "./DdxBoard";
import ClueNotebook from "./ClueNotebook";
import ExamZoneExplorer from "./ExamZoneExplorer";
import TimedDecision from "./TimedDecision";
import MentorBubble from "./MentorBubble";
import DiagnosisReveal from "./DiagnosisReveal";
import CaseDebrief from "./CaseDebrief";

// ─── Props ──────────────────────────────────────────────────────────────────

/** Post-choice educational content shown briefly after a decision */
interface PostChoiceInfo {
  feedback: string | null;
  wasOptimal: boolean;
  mentorComments: MentorComment[];
}

/** DDx hints shown after a ddx-check scene */
interface DdxHintInfo {
  shouldConsiderAdding: string[];
  shouldConsiderRemoving: string[];
}

interface CasePlayerProps {
  caseData: ClinicalCase;
  scoringKey: ScoringKey;
  character: DiseaseCharacter | null;
}

// ─── Act Transition Overlay ─────────────────────────────────────────────────

function ActTransition({
  act,
  onComplete,
}: {
  act: CaseScene["act"];
  onComplete: () => void;
}) {
  const config = actConfig[act];

  useEffect(() => {
    const timer = setTimeout(onComplete, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${config.gradient}`}
    >
      <div className="text-center px-4">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-lg font-bold uppercase tracking-[0.3em] text-white/90"
        >
          {config.label}
        </m.p>
        <m.h2
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl"
        >
          {config.subtitle}
        </m.h2>
        <m.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mx-auto mt-4 h-0.5 w-32 bg-white/60 rounded-full"
        />
      </div>
    </m.div>
  );
}

// ─── Typewriter Text ────────────────────────────────────────────────────────

function TypewriterText({
  text,
  speed = 20,
  className,
  onComplete,
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const isCompleteRef = useRef(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsComplete(false);
    isCompleteRef.current = false;
    indexRef.current = 0;
    if (containerRef.current) containerRef.current.textContent = "";
    if (cursorRef.current) cursorRef.current.style.display = "";

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      if (containerRef.current) {
        containerRef.current.textContent = text.slice(0, indexRef.current);
      }
      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        isCompleteRef.current = true;
        setIsComplete(true);
        if (cursorRef.current) cursorRef.current.style.display = "none";
        onComplete?.();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    if (!isCompleteRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (containerRef.current) containerRef.current.textContent = text;
      if (cursorRef.current) cursorRef.current.style.display = "none";
      isCompleteRef.current = true;
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <p
      className={`${className} cursor-pointer`}
      onClick={handleSkip}
      title={!isComplete ? "Tap to skip" : undefined}
      role="status"
      aria-live="polite"
    >
      <span ref={containerRef} />
      <span
        ref={cursorRef}
        className="inline-block h-4 w-0.5 animate-pulse bg-showcase-purple/40 ml-0.5"
      />
    </p>
  );
}

// ─── Patient Dialogue Bubble ────────────────────────────────────────────────

function PatientDialogue({
  text,
  patientName,
  emotion,
}: {
  text: string;
  patientName: string;
  emotion: CaseScene["patientEmotion"];
}) {
  const emotionEmoji: Record<string, string> = {
    neutral: "",
    worried: "",
    pain: "",
    relieved: "",
    confused: "",
    hopeful: "",
    scared: "",
    grateful: "",
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="relative mt-4 rounded-2xl border-3 border-showcase-teal/20 bg-pastel-mint/30 px-5 py-4"
    >
      {/* Speech bubble tail */}
      <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l-3 border-t-3 border-showcase-teal/20 bg-pastel-mint/30" />
      <p className="text-xs font-bold text-showcase-teal mb-1">
        {emotionEmoji[emotion]} {patientName}
      </p>
      <p className="text-sm text-ink-muted italic leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </m.div>
  );
}

// ─── Bottom Sheet Wrapper (mobile sidebars) ─────────────────────────────────

function BottomSheet({
  isOpen,
  onClose,
  title,
  accentColor,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          {/* Panel -- bottom sheet on mobile, side panel on desktop */}
          <m.aside
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] rounded-t-3xl border-t-3 ${accentColor} bg-white shadow-2xl overflow-hidden lg:absolute lg:top-0 lg:bottom-0 lg:rounded-t-none lg:max-h-full lg:w-80 ${
              title === "Differential Diagnosis"
                ? "lg:left-0 lg:right-auto lg:rounded-none lg:border-t-0 lg:border-r-3"
                : "lg:right-0 lg:left-auto lg:rounded-none lg:border-t-0 lg:border-l-3"
            }`}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center py-2 lg:hidden">
              <div className="h-1 w-10 rounded-full bg-showcase-navy/15" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 pt-1 lg:pt-4">
              <h3 className="font-display text-sm font-bold text-ink-dark">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-ink-light hover:bg-gray-100 hover:text-ink-muted transition-colors"
                aria-label={`Close ${title}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto px-4 pb-6 lg:pb-4" style={{ maxHeight: "calc(75vh - 60px)" }}>
              {children}
            </div>
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main CasePlayer ────────────────────────────────────────────────────────

export default function CasePlayer({ caseData, scoringKey, character }: CasePlayerProps) {
  const t = useTranslations("clinicalCasePlayer");

  // ── State ──
  const [gameState, setGameState] = useState<CaseGameState>(() =>
    createInitialState(caseData)
  );
  const [showActTransition, setShowActTransition] = useState(true);
  const [previousAct, setPreviousAct] = useState<CaseScene["act"] | null>(null);
  const [showDdxBoard, setShowDdxBoard] = useState(false);
  const [showClueNotebook, setShowClueNotebook] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showDiagnosisReveal, setShowDiagnosisReveal] = useState(false);

  // ── Post-choice educational feedback (B1 + B2) ──
  const [postChoiceInfo, setPostChoiceInfo] = useState<PostChoiceInfo | null>(null);

  // ── DDx hints after ddx-check (B3) ──
  const [ddxHints, setDdxHints] = useState<DdxHintInfo | null>(null);

  const mainRef = useRef<HTMLDivElement>(null);

  // ── Hooks ──
  const sound = useCaseSound();
  const profile = usePlayerProfile();

  // ── Derived ──
  const currentScene = useMemo(
    () => getCurrentScene(gameState, caseData),
    [gameState, caseData]
  );

  const sceneIndex = useMemo(
    () => caseData.scenes.findIndex((s) => s.id === gameState.currentSceneId),
    [gameState.currentSceneId, caseData.scenes]
  );

  const progressPct = useMemo(
    () => caseData.scenes.length > 0 ? ((sceneIndex + 1) / caseData.scenes.length) * 100 : 0,
    [sceneIndex, caseData.scenes.length]
  );

  // ── Sound mood sync ──
  useEffect(() => {
    if (currentScene && !showActTransition) {
      sound.setAmbientMood(currentScene.sound.ambientMood);
      if (currentScene.sound.sfxOnEnter) {
        sound.playSfx(currentScene.sound.sfxOnEnter);
      }
    }
  }, [currentScene?.id, showActTransition]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Act transition detection ──
  useEffect(() => {
    if (currentScene && previousAct !== null && currentScene.act !== previousAct) {
      setShowActTransition(true);
      sound.playActTransition();
    }
    if (currentScene) {
      setPreviousAct(currentScene.act);
    }
  }, [currentScene?.act]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll to top on scene change ──
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [gameState.currentSceneId]);

  // ── Handlers ──

  const handleAdvance = useCallback(
    (nextSceneId: string) => {
      setGameState((prev) => {
        const withSnapshot = snapshotDdx(prev);
        return advanceToScene(withSnapshot, nextSceneId, caseData);
      });
      sound.playDecisionMade();
    },
    [caseData, sound]
  );

  const handleChoice = useCallback(
    (option: DecisionOption) => {
      // Capture feedback before advancing
      const wasOptimal = scoringKey.optimalFlags[gameState.currentSceneId]?.[option.id] ?? false;
      const scene = getCurrentScene(gameState, caseData);
      const afterMentors = (scene?.mentorComments ?? []).filter((mc) =>
        wasOptimal ? mc.timing === "after-optimal" : mc.timing === "after-suboptimal"
      );

      // Show feedback if there's any educational content
      if (option.feedback || afterMentors.length > 0) {
        setPostChoiceInfo({
          feedback: option.feedback ?? null,
          wasOptimal,
          mentorComments: afterMentors,
        });
      }

      setGameState((prev) => {
        const withSnapshot = snapshotDdx(prev);
        return makeChoice(withSnapshot, option, caseData);
      });
      sound.playDecisionMade();
      if (option.rapportEffect > 0) sound.playRapportUp();
      if (option.rapportEffect < 0) sound.playRapportDown();
    },
    [caseData, scoringKey, gameState, sound]
  );

  const handleExamZone = useCallback(
    (region: string, cpCost: number, clues: typeof gameState.collectedClues, findingsData: { label: string; findings: string }) => {
      setGameState((prev) =>
        examineZone(prev, prev.currentSceneId, region, cpCost, clues, findingsData)
      );
      sound.playClueReveal();
    },
    [sound]
  );

  const handleExamComplete = useCallback(
    (nextSceneId: string) => {
      setGameState((prev) => completeExam(prev, nextSceneId, caseData));
      sound.playDecisionMade();
    },
    [caseData, sound]
  );

  const handleDdxUpdate = useCallback(
    (newDdx: string[]) => {
      setGameState((prev) => updateDdx(prev, newDdx));
    },
    []
  );

  const handleDdxCheckComplete = useCallback(
    (nextSceneId: string) => {
      // Capture DDx hints before advancing
      const scene = getCurrentScene(gameState, caseData);
      if (scene?.ddxUpdate) {
        const { shouldConsiderAdding, shouldConsiderRemoving } = scene.ddxUpdate;
        // Only show hints where the student's DDx actually differs
        const studentDdx = new Set(gameState.activeDdx);
        const relevantAdds = (shouldConsiderAdding ?? []).filter((d) => !studentDdx.has(d));
        const relevantRemoves = (shouldConsiderRemoving ?? []).filter((d) => studentDdx.has(d));
        if (relevantAdds.length > 0 || relevantRemoves.length > 0) {
          setDdxHints({
            shouldConsiderAdding: relevantAdds,
            shouldConsiderRemoving: relevantRemoves,
          });
        }
      }

      setGameState((prev) => completeDdxCheck(prev, nextSceneId, caseData));
      sound.playDecisionMade();
    },
    [caseData, gameState, sound]
  );

  const handleDiagnosisReveal = useCallback(() => {
    setShowDiagnosisReveal(true);
    sound.playCharacterUnlock();
  }, [sound]);

  const handleDiagnosisComplete = useCallback(() => {
    setShowDiagnosisReveal(false);

    // Finalize with real scoring key for accurate scores
    setGameState((prev) => {
      const finalState = finalizeCase(prev, caseData, scoringKey);
      // Save progress with the freshly calculated score
      if (finalState.score) {
        profile.saveCaseCompletion(caseData.id, finalState.score);
        if (character) {
          profile.catchCharacter(
            character.id,
            finalState.score.totalScore,
            finalState.score.xpEarned
          );
        }
      }
      return finalState;
    });

    setShowDebrief(true);
  }, [caseData, scoringKey, character, profile]);

  const handleReplay = useCallback(() => {
    setGameState(createInitialState(caseData));
    setShowDebrief(false);
    setShowDiagnosisReveal(false);
    setShowActTransition(true);
    setPreviousAct(null);
    setShowDdxBoard(false);
    setShowClueNotebook(false);
  }, [caseData]);

  // ── Check for diagnosis reveal interaction ──
  useEffect(() => {
    if (currentScene?.interaction.mode === "diagnosis-reveal" && !showDiagnosisReveal && !showDebrief) {
      // If character exists, show reveal animation; otherwise skip to debrief
      if (character) {
        handleDiagnosisReveal();
      } else {
        handleDiagnosisComplete();
      }
    }
  }, [currentScene, showDiagnosisReveal, showDebrief, character, handleDiagnosisReveal, handleDiagnosisComplete]);

  if (!currentScene) return null;

  // ── Debrief screen ──
  if (showDebrief && gameState.score) {
    return (
      <CaseDebrief
        caseData={caseData}
        scoringKey={scoringKey}
        gameState={gameState}
        character={character}
        onReplay={handleReplay}
      />
    );
  }

  // ── Render ──
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-pastel-cream">
      {/* ── Act Transition Overlay ── */}
      <AnimatePresence>
        {showActTransition && (
          <ActTransition
            act={currentScene.act}
            onComplete={() => setShowActTransition(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Post-Choice Feedback Overlay (B1 + B2) ── */}
      <AnimatePresence>
        {postChoiceInfo && (
          <m.div
            key="post-choice-feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/10 backdrop-blur-[2px] p-4"
            onClick={() => setPostChoiceInfo(null)}
          >
            <m.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl border-3 bg-white shadow-chunky-sm overflow-hidden"
              style={{
                borderColor: postChoiceInfo.wasOptimal ? "rgb(46 204 113 / 0.3)" : "rgb(255 133 162 / 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Optimal/suboptimal banner */}
              <div
                className={`px-5 py-2.5 text-center text-xs font-bold ${
                  postChoiceInfo.wasOptimal
                    ? "bg-showcase-green/10 text-showcase-green"
                    : "bg-showcase-coral/10 text-showcase-coral"
                }`}
              >
                {postChoiceInfo.wasOptimal ? t("optimalChoice") : t("couldImprove")}
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Choice feedback text */}
                {postChoiceInfo.feedback && (
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {postChoiceInfo.feedback}
                  </p>
                )}

                {/* After-decision mentor comments */}
                {postChoiceInfo.mentorComments.map((mc, i) => (
                  <div key={i} className="rounded-xl border-2 border-showcase-purple/15 bg-pastel-lavender/20 px-4 py-3">
                    <p className="text-xs font-bold text-showcase-purple mb-1">{t("drMentor")}</p>
                    <p className="text-sm text-ink-muted leading-relaxed">{mc.text}</p>
                    {mc.teachingPoint && (
                      <p className="mt-2 text-xs font-bold text-showcase-purple/80">
                        💡 {mc.teachingPoint}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setPostChoiceInfo(null)}
                  className="w-full rounded-xl border-2 border-showcase-navy/10 bg-pastel-cream/50 px-4 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:bg-pastel-cream active:scale-[0.98]"
                >
                  {t("continue")}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── DDx Hints Overlay (B3) ── */}
      <AnimatePresence>
        {ddxHints && (
          <m.div
            key="ddx-hints"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/10 backdrop-blur-[2px] p-4"
            onClick={() => setDdxHints(null)}
          >
            <m.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl border-3 border-showcase-blue/20 bg-white shadow-chunky-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-2.5 text-center text-xs font-bold bg-showcase-blue/10 text-showcase-blue">
                {t("ddxFeedback")}
              </div>
              <div className="px-5 py-4 space-y-3">
                {ddxHints.shouldConsiderAdding.length > 0 && (
                  <div className="rounded-xl border-2 border-showcase-green/15 bg-showcase-green/5 px-4 py-3">
                    <p className="text-xs font-bold text-showcase-green mb-1.5">{t("considerAdding")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ddxHints.shouldConsiderAdding.map((d) => (
                        <span key={d} className="rounded-full bg-showcase-green/10 border border-showcase-green/20 px-2.5 py-0.5 text-xs text-showcase-green font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ddxHints.shouldConsiderRemoving.length > 0 && (
                  <div className="rounded-xl border-2 border-showcase-coral/15 bg-showcase-coral/5 px-4 py-3">
                    <p className="text-xs font-bold text-showcase-coral mb-1.5">{t("mightReconsider")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ddxHints.shouldConsiderRemoving.map((d) => (
                        <span key={d} className="rounded-full bg-showcase-coral/10 border border-showcase-coral/20 px-2.5 py-0.5 text-xs text-showcase-coral font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setDdxHints(null)}
                  className="w-full rounded-xl border-2 border-showcase-navy/10 bg-pastel-cream/50 px-4 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:bg-pastel-cream active:scale-[0.98]"
                >
                  {t("continue")}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Diagnosis Reveal Overlay ── */}
      <AnimatePresence>
        {showDiagnosisReveal && character && (
          <DiagnosisReveal
            character={character}
            caseTitle={caseData.title}
            onComplete={handleDiagnosisComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Top HUD ── */}
      <header className="relative z-20 border-b-3 border-showcase-navy/10 bg-white/80 backdrop-blur-md px-3 py-2 safe-top">
        {/* Main row: act + controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Act indicator (compact on mobile) */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`shrink-0 rounded-xl bg-gradient-to-r ${actConfig[currentScene.act].gradient} px-2.5 py-1`}
            >
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                <span className="sm:hidden">{actConfig[currentScene.act].label}</span>
                <span className="hidden sm:inline">{actConfig[currentScene.act].label}: {actConfig[currentScene.act].subtitle}</span>
              </span>
            </div>
            <span className="hidden sm:block text-xs text-ink-light truncate">
              {caseData.title}
            </span>
          </div>

          {/* Center: Budget + Rapport (hidden on mobile, shown below) */}
          <div className="hidden sm:flex items-center gap-3">
            <CpBudget spent={gameState.cpSpent} budget={gameState.cpBudget} />
            <RapportMeter rapport={gameState.rapport} />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowDdxBoard(!showDdxBoard); setShowClueNotebook(false); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                showDdxBoard
                  ? "bg-showcase-purple text-white shadow-sm"
                  : "text-ink-light hover:bg-pastel-lavender/40 hover:text-showcase-purple"
              }`}
              title={t("differentialDiagnosis")}
              aria-label={t("differentialDiagnosis")}
            >
              <ClipboardList className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => { setShowClueNotebook(!showClueNotebook); setShowDdxBoard(false); }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                showClueNotebook
                  ? "bg-showcase-teal text-white shadow-sm"
                  : "text-ink-light hover:bg-pastel-mint/40 hover:text-showcase-teal"
              }`}
              title={t("clueNotebook")}
              aria-label={t("clueNotebook")}
            >
              <BookOpen className="h-4.5 w-4.5" />
              {gameState.collectedClues.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-showcase-teal text-[9px] font-bold text-white shadow-sm">
                  {gameState.collectedClues.length}
                </span>
              )}
            </button>
            <button
              onClick={sound.toggleMute}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-light hover:bg-gray-100 hover:text-ink-muted transition-all"
              title={sound.isMuted ? t("unmute") : t("mute")}
              aria-label={sound.isMuted ? t("unmute") : t("mute")}
            >
              {sound.isMuted ? (
                <VolumeX className="h-4.5 w-4.5" />
              ) : (
                <Volume2 className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile: Budget + Rapport + Progress bar */}
        <div className="flex items-center justify-between gap-3 mt-1.5 sm:hidden">
          <CpBudget spent={gameState.cpSpent} budget={gameState.cpBudget} />
          <RapportMeter rapport={gameState.rapport} />
        </div>

        {/* Progress bar */}
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-showcase-navy/5">
          <m.div
            className="h-full rounded-full bg-gradient-to-r from-showcase-purple to-showcase-teal"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
          />
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* DDx Board -- Bottom sheet on mobile, side panel on desktop */}
        <BottomSheet
          isOpen={showDdxBoard}
          onClose={() => setShowDdxBoard(false)}
          title={t("differentialDiagnosis")}
          accentColor="border-showcase-purple/30"
        >
          <DdxBoard
            ddxPool={caseData.ddxPool}
            activeDdx={gameState.activeDdx}
            onUpdate={handleDdxUpdate}
          />
        </BottomSheet>

        {/* Center: Scene Area */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 lg:px-12"
          aria-live="polite"
        >
          <div className="mx-auto max-w-2xl">
            <AnimatePresence mode="wait">
              <m.div
                key={currentScene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Scene illustration placeholder */}
                <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl border-3 border-showcase-navy/10 bg-pastel-lavender/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Stethoscope className="mx-auto h-10 w-10 text-showcase-purple/15" />
                      <p className="mt-2 text-xs text-ink-light font-medium">
                        {t("sceneIllustration")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Narration (tap to skip) */}
                <TypewriterText
                  text={currentScene.narration}
                  speed={15}
                  className="text-sm sm:text-base leading-relaxed text-ink-dark"
                />

                {/* Patient dialogue */}
                {currentScene.patientDialogue && (
                  <PatientDialogue
                    text={currentScene.patientDialogue}
                    patientName={caseData.patient.name}
                    emotion={currentScene.patientEmotion}
                  />
                )}

                {/* Rapport bonus dialogue */}
                {currentScene.rapportBonusDialogue &&
                  gameState.rapport >=
                    currentScene.rapportBonusDialogue.threshold && (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                      className="mt-3 rounded-2xl border-3 border-showcase-yellow/20 bg-showcase-yellow/5 px-5 py-4"
                    >
                      <p className="text-xs font-bold text-showcase-yellow mb-1">
                        {t("highRapportBonus")}
                      </p>
                      <p className="text-sm text-ink-muted italic">
                        &ldquo;{currentScene.rapportBonusDialogue.dialogue}&rdquo;
                      </p>
                    </m.div>
                  )}

                {/* Clues revealed */}
                {currentScene.cluesRevealed.length > 0 && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 space-y-2"
                  >
                    {currentScene.cluesRevealed.map((clue, i) => (
                      <m.div
                        key={clue.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + i * 0.2 }}
                        className="rounded-xl border-2 border-showcase-teal/15 bg-pastel-mint/20 px-4 py-3"
                      >
                        <p className="text-xs font-bold text-showcase-teal">
                          {clue.label}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {clue.value}
                        </p>
                      </m.div>
                    ))}
                  </m.div>
                )}

                {/* Mentor comments (before-decision) */}
                {currentScene.mentorComments
                  ?.filter((mc) => mc.timing === "before-decision")
                  .map((mc, i) => (
                    <MentorBubble
                      key={`before-${i}`}
                      text={mc.text}
                      teachingPoint={mc.teachingPoint}
                      delay={1.2}
                    />
                  ))}

                {/* ── Interaction Area ── */}
                <div className="mt-6">
                  {/* Narrative only: continue button */}
                  {currentScene.interaction.mode === "narrative-only" && (() => {
                    const interaction = currentScene.interaction as { mode: "narrative-only"; nextSceneId: string };
                    return (
                      <m.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        onClick={() => handleAdvance(interaction.nextSceneId)}
                        className="flex items-center gap-2 rounded-2xl border-3 border-showcase-purple/30 bg-showcase-purple/10 px-6 py-3.5 font-display text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20 hover:shadow-chunky-sm hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        {t("continue")}
                        <ChevronRight className="h-4 w-4" />
                      </m.button>
                    );
                  })()}

                  {/* Choices */}
                  {currentScene.interaction.mode === "choices" && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-ink-muted">
                        {currentScene.interaction.prompt}
                      </p>
                      {currentScene.interaction.options.map((option, i) => (
                        <m.button
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + i * 0.15 }}
                          onClick={() => handleChoice(option)}
                          className="group w-full rounded-2xl border-3 border-showcase-navy/10 bg-white p-4 text-left transition-all hover:border-showcase-purple/40 hover:shadow-chunky-sm hover:-translate-y-0.5 active:scale-[0.99]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                                {option.label}
                              </p>
                              {option.description && (
                                <p className="mt-1 text-xs text-ink-muted">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {option.cpCost > 0 && (
                                <span className="rounded-full bg-showcase-purple/10 px-2 py-0.5 text-[10px] font-bold text-showcase-purple">
                                  {option.cpCost} CP
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-ink-light group-hover:text-showcase-purple transition-colors" />
                            </div>
                          </div>
                        </m.button>
                      ))}
                    </div>
                  )}

                  {/* Timed choice */}
                  {currentScene.interaction.mode === "timed-choice" && (
                    <TimedDecision
                      prompt={currentScene.interaction.prompt}
                      options={currentScene.interaction.options}
                      timeLimit={currentScene.interaction.timeLimit}
                      defaultOptionId={currentScene.interaction.defaultOptionId}
                      onChoice={handleChoice}
                      onTimeout={(defaultOption) => handleChoice(defaultOption)}
                    />
                  )}

                  {/* Exam zones */}
                  {currentScene.interaction.mode === "exam-zones" && (
                    <ExamZoneExplorer
                      zones={currentScene.interaction.zones}
                      budgetForExam={currentScene.interaction.budgetForExam}
                      cpSpent={getExamCpSpent(
                        gameState,
                        currentScene.id,
                        caseData
                      )}
                      examinedRegions={
                        gameState.examinedZones.find(
                          (ez) => ez.sceneId === currentScene.id
                        )?.regions ?? []
                      }
                      onExamineZone={handleExamZone}
                      onComplete={() => {
                        const interaction = currentScene.interaction as { mode: "exam-zones"; nextSceneId: string };
                        handleExamComplete(interaction.nextSceneId);
                      }}
                    />
                  )}

                  {/* DDx check */}
                  {currentScene.interaction.mode === "ddx-check" && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="space-y-4"
                    >
                      <div className="rounded-2xl border-3 border-showcase-purple/20 bg-pastel-lavender/30 p-4">
                        <p className="text-sm text-ink-muted">
                          {currentScene.interaction.instruction}
                        </p>
                      </div>
                      {!showDdxBoard && (
                        <button
                          onClick={() => setShowDdxBoard(true)}
                          className="flex items-center gap-2 rounded-2xl border-3 border-showcase-purple/30 bg-showcase-purple/10 px-5 py-3 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20 active:scale-[0.98]"
                        >
                          <ClipboardList className="h-4 w-4" />
                          {t("openDdxBoard")}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const interaction = currentScene.interaction as { mode: "ddx-check"; nextSceneId: string };
                          handleDdxCheckComplete(interaction.nextSceneId);
                        }}
                        className="flex items-center gap-2 rounded-2xl border-3 border-showcase-teal/30 bg-showcase-teal/10 px-6 py-3.5 font-display text-sm font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:shadow-chunky-sm hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        {t("continueWithDdx")}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </m.div>
                  )}
                </div>

                {/* After-decision mentor comments are now shown in the post-choice feedback overlay */}
              </m.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Clue Notebook -- Bottom sheet on mobile, side panel on desktop */}
        <BottomSheet
          isOpen={showClueNotebook}
          onClose={() => setShowClueNotebook(false)}
          title={t("clueNotebook")}
          accentColor="border-showcase-teal/30"
        >
          <ClueNotebook clues={gameState.collectedClues} examFindings={gameState.examFindings} />
        </BottomSheet>
      </div>
    </div>
  );
}
