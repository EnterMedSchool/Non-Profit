"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  ClipboardList,
  Stethoscope,
  BookOpen,
  ChevronRight,
  X,
} from "lucide-react";
import type { ClinicalCase, CaseScene, DecisionOption } from "@/data/clinical-cases";
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
import { useCaseProgress } from "@/hooks/useCaseProgress";
import { useCharacterCollection } from "@/hooks/useCharacterCollection";
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

interface CasePlayerProps {
  caseData: ClinicalCase;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]"
    >
      <div className="text-center">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`font-display text-lg font-bold uppercase tracking-[0.3em] bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
        >
          {config.label}
        </m.p>
        <m.h2
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl"
        >
          {config.subtitle}
        </m.h2>
        <m.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className={`mx-auto mt-4 h-0.5 w-32 bg-gradient-to-r ${config.gradient}`}
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
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block h-4 w-0.5 animate-pulse bg-white/60 ml-0.5" />
      )}
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
      className="relative mt-4 rounded-2xl border-2 border-showcase-teal/20 bg-showcase-teal/5 backdrop-blur-sm px-5 py-4"
    >
      {/* Speech bubble tail */}
      <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l-2 border-t-2 border-showcase-teal/20 bg-showcase-teal/5" />
      <p className="text-xs font-bold text-showcase-teal mb-1">
        {emotionEmoji[emotion]} {patientName}
      </p>
      <p className="text-sm text-white/80 italic leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </m.div>
  );
}

// ─── Main CasePlayer ────────────────────────────────────────────────────────

export default function CasePlayer({ caseData, character }: CasePlayerProps) {
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

  const mainRef = useRef<HTMLDivElement>(null);

  // ── Hooks ──
  const sound = useCaseSound();
  const progress = useCaseProgress();
  const collection = useCharacterCollection();

  // ── Derived ──
  const currentScene = useMemo(
    () => getCurrentScene(gameState, caseData),
    [gameState, caseData]
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
      setGameState((prev) => {
        const withSnapshot = snapshotDdx(prev);
        return makeChoice(withSnapshot, option, caseData);
      });
      sound.playDecisionMade();
      if (option.rapportEffect > 0) sound.playRapportUp();
      if (option.rapportEffect < 0) sound.playRapportDown();
    },
    [caseData, sound]
  );

  const handleExamZone = useCallback(
    (region: string, cpCost: number, clues: typeof gameState.collectedClues) => {
      setGameState((prev) =>
        examineZone(prev, prev.currentSceneId, region, cpCost, clues)
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
      setGameState((prev) => completeDdxCheck(prev, nextSceneId, caseData));
      sound.playDecisionMade();
    },
    [caseData, sound]
  );

  const handleDiagnosisReveal = useCallback(() => {
    setShowDiagnosisReveal(true);
    sound.playCharacterUnlock();
  }, [sound]);

  const handleDiagnosisComplete = useCallback(() => {
    setShowDiagnosisReveal(false);
    setGameState((prev) => finalizeCase(prev, caseData));
    setShowDebrief(true);

    // Save progress
    if (gameState.score || true) {
      const finalState = finalizeCase(gameState, caseData);
      if (finalState.score) {
        progress.saveCaseCompletion(caseData.id, finalState.score);
        if (character) {
          collection.catchCharacter(
            character.id,
            finalState.score.totalScore,
            finalState.score.xpEarned
          );
        }
      }
    }
  }, [caseData, character, gameState, progress, collection]);

  // ── Check for diagnosis reveal interaction ──
  useEffect(() => {
    if (currentScene?.interaction.mode === "diagnosis-reveal" && !showDiagnosisReveal && !showDebrief) {
      handleDiagnosisReveal();
    }
  }, [currentScene, showDiagnosisReveal, showDebrief, handleDiagnosisReveal]);

  if (!currentScene) return null;

  // ── Debrief screen ──
  if (showDebrief && gameState.score) {
    return (
      <CaseDebrief
        caseData={caseData}
        gameState={gameState}
        character={character}
      />
    );
  }

  // ── Render ──
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0a0a1a] text-white">
      {/* ── Act Transition Overlay ── */}
      <AnimatePresence>
        {showActTransition && (
          <ActTransition
            act={currentScene.act}
            onComplete={() => setShowActTransition(false)}
          />
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
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-md px-4 py-2.5">
        {/* Left: Act indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg bg-gradient-to-r ${actConfig[currentScene.act].gradient} px-3 py-1`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {actConfig[currentScene.act].label}: {actConfig[currentScene.act].subtitle}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {caseData.title}
          </span>
        </div>

        {/* Center: Budget + Rapport */}
        <div className="hidden items-center gap-4 sm:flex">
          <CpBudget spent={gameState.cpSpent} budget={gameState.cpBudget} />
          <RapportMeter rapport={gameState.rapport} />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDdxBoard(!showDdxBoard)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
              showDdxBoard
                ? "bg-showcase-purple text-white"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            }`}
            title="Differential Diagnosis Board"
          >
            <ClipboardList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowClueNotebook(!showClueNotebook)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
              showClueNotebook
                ? "bg-showcase-teal text-white"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            }`}
            title="Clue Notebook"
          >
            <BookOpen className="h-4 w-4" />
            {gameState.collectedClues.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-showcase-teal text-[10px] font-bold text-white">
                {gameState.collectedClues.length}
              </span>
            )}
          </button>
          <button
            onClick={sound.toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
            title={sound.isMuted ? "Unmute" : "Mute"}
          >
            {sound.isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Budget + Rapport (shown below header on small screens) ── */}
      <div className="flex items-center justify-center gap-4 border-b border-white/5 bg-[#0a0a1a]/60 px-4 py-1.5 sm:hidden">
        <CpBudget spent={gameState.cpSpent} budget={gameState.cpBudget} />
        <RapportMeter rapport={gameState.rapport} />
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* DDx Board Sidebar */}
        <AnimatePresence>
          {showDdxBoard && (
            <m.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 z-30 h-full w-72 border-r border-white/10 bg-[#0f0f24]/95 backdrop-blur-xl p-4 overflow-y-auto lg:relative lg:w-80"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-white">
                  Differential Diagnosis
                </h3>
                <button
                  onClick={() => setShowDdxBoard(false)}
                  className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DdxBoard
                ddxPool={caseData.ddxPool}
                activeDdx={gameState.activeDdx}
                onUpdate={handleDdxUpdate}
              />
            </m.aside>
          )}
        </AnimatePresence>

        {/* Center: Scene Area */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12"
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
                <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border-2 border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Stethoscope className="mx-auto h-12 w-12 text-white/20" />
                      <p className="mt-2 text-xs text-white/30 font-medium">
                        Scene Illustration
                      </p>
                      <p className="mt-1 text-[10px] text-white/20">
                        {currentScene.illustrationPath}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Narration */}
                <TypewriterText
                  text={currentScene.narration}
                  speed={15}
                  className="text-sm leading-relaxed text-white/80"
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
                      className="mt-3 rounded-2xl border-2 border-showcase-yellow/20 bg-showcase-yellow/5 px-5 py-4"
                    >
                      <p className="text-xs font-bold text-showcase-yellow mb-1">
                        High rapport bonus
                      </p>
                      <p className="text-sm text-white/80 italic">
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
                    className="mt-6 space-y-2"
                  >
                    {currentScene.cluesRevealed.map((clue, i) => (
                      <m.div
                        key={clue.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + i * 0.2 }}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <p className="text-xs font-bold text-showcase-teal">
                          {clue.label}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {clue.value}
                        </p>
                      </m.div>
                    ))}
                  </m.div>
                )}

                {/* Mentor comment (before-decision) */}
                {currentScene.mentorComments
                  ?.filter((mc) => mc.timing === "before-decision")
                  .map((mc, i) => (
                    <MentorBubble
                      key={i}
                      text={mc.text}
                      teachingPoint={mc.teachingPoint}
                      delay={1.2}
                    />
                  ))}

                {/* ── Interaction Area ── */}
                <div className="mt-8">
                  {/* Narrative only: continue button */}
                  {currentScene.interaction.mode === "narrative-only" && (() => {
                    const interaction = currentScene.interaction as { mode: "narrative-only"; nextSceneId: string };
                    return (
                      <m.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        onClick={() => handleAdvance(interaction.nextSceneId)}
                        className="flex items-center gap-2 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/10 px-6 py-3 font-display text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20 hover:border-showcase-purple/50 hover:-translate-y-0.5"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </m.button>
                    );
                  })()}

                  {/* Choices */}
                  {currentScene.interaction.mode === "choices" && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-white/60">
                        {currentScene.interaction.prompt}
                      </p>
                      {currentScene.interaction.options.map((option, i) => (
                        <m.button
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + i * 0.15 }}
                          onClick={() => handleChoice(option)}
                          className="group w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-left transition-all hover:border-showcase-purple/40 hover:bg-showcase-purple/10 hover:-translate-y-0.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white group-hover:text-showcase-purple transition-colors">
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
                              <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-showcase-purple transition-colors" />
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
                      <div className="rounded-xl border-2 border-showcase-purple/20 bg-showcase-purple/5 p-4">
                        <p className="text-sm text-white/80">
                          {currentScene.interaction.instruction}
                        </p>
                      </div>
                      {/* Force DDx board open */}
                      {!showDdxBoard && (
                        <button
                          onClick={() => setShowDdxBoard(true)}
                          className="flex items-center gap-2 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/10 px-5 py-2.5 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Open DDx Board
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const interaction = currentScene.interaction as { mode: "ddx-check"; nextSceneId: string };
                          handleDdxCheckComplete(interaction.nextSceneId);
                        }}
                        className="flex items-center gap-2 rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10 px-6 py-3 font-display text-sm font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:-translate-y-0.5"
                      >
                        Continue with my DDx
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </m.div>
                  )}
                </div>
              </m.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Clue Notebook Sidebar */}
        <AnimatePresence>
          {showClueNotebook && (
            <m.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 z-30 h-full w-72 border-l border-white/10 bg-[#0f0f24]/95 backdrop-blur-xl p-4 overflow-y-auto lg:relative lg:w-80"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-white">
                  Clue Notebook
                </h3>
                <button
                  onClick={() => setShowClueNotebook(false)}
                  className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ClueNotebook clues={gameState.collectedClues} />
            </m.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
