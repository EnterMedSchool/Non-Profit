// ─── CaseEngine — Pure TypeScript state machine for clinical case gameplay ──
// No React dependency. Operates on immutable-style CaseGameState records.
// Each action produces a new state, enabling debrief replay.

import type {
  ClinicalCase,
  CaseScene,
  Clue,
  ActType,
  DecisionOption,
} from "@/data/clinical-cases";

// ─── Game State ─────────────────────────────────────────────────────────────

export interface ChoiceRecord {
  sceneId: string;
  optionId: string;
  timestamp: number;
}

export interface DdxSnapshot {
  sceneId: string;
  ddx: string[];
}

export interface ExamRecord {
  sceneId: string;
  regions: string[];
}

export interface CaseGameState {
  // ── Scene navigation ──
  currentSceneId: string;
  currentAct: ActType;
  visitedSceneIds: string[];
  choiceHistory: ChoiceRecord[];

  // ── DDx board ──
  activeDdx: string[];
  ddxHistory: DdxSnapshot[];

  // ── Clinical budget ──
  cpBudget: number;
  cpSpent: number;

  // ── Rapport ──
  rapport: number;

  // ── Clues ──
  collectedClues: Clue[];

  // ── Exam zones ──
  examinedZones: ExamRecord[];

  // ── Timing ──
  startedAt: number;
  sceneStartedAt: number;

  // ── Status ──
  isComplete: boolean;
  finalDiagnosis?: string;

  // ── Score components (populated at end) ──
  score?: CaseScore;
}

export interface CaseScore {
  cpEfficiency: number;       // 0–100 based on cpSpent vs optimalCpSpent
  ddxAccuracy: number;        // 0–100 based on DDx evolution match
  rapportFinal: number;       // final rapport value
  optimalChoices: number;     // count of optimal choices made
  totalChoices: number;       // count of all choices made
  keyFindingsFound: number;   // count of key findings discovered
  keyFindingsTotal: number;   // total key findings in the case
  xpEarned: number;           // total XP from all decisions
  totalScore: number;         // weighted composite 0–100
}

// ─── Engine ─────────────────────────────────────────────────────────────────

export function createInitialState(caseData: ClinicalCase): CaseGameState {
  const startScene = caseData.scenes.find(
    (s) => s.id === caseData.startSceneId
  );

  return {
    currentSceneId: caseData.startSceneId,
    currentAct: startScene?.act ?? "encounter",
    visitedSceneIds: [caseData.startSceneId],
    choiceHistory: [],
    activeDdx: [],
    ddxHistory: [],
    cpBudget: caseData.startingCp,
    cpSpent: 0,
    rapport: caseData.startingRapport,
    collectedClues: [],
    examinedZones: [],
    startedAt: Date.now(),
    sceneStartedAt: Date.now(),
    isComplete: false,
  };
}

/** Get the current scene object from the case data */
export function getCurrentScene(
  state: CaseGameState,
  caseData: ClinicalCase
): CaseScene | undefined {
  return caseData.scenes.find((s) => s.id === state.currentSceneId);
}

/** Advance to a new scene by ID */
export function advanceToScene(
  state: CaseGameState,
  nextSceneId: string,
  caseData: ClinicalCase
): CaseGameState {
  const nextScene = caseData.scenes.find((s) => s.id === nextSceneId);
  if (!nextScene) return state;

  // Collect auto-revealed clues from the next scene
  const newClues = nextScene.cluesRevealed.filter(
    (clue) => !state.collectedClues.some((c) => c.id === clue.id)
  );

  // Apply base costs if present
  const cpCost = nextScene.baseCpCost ?? 0;
  const rapportEffect = nextScene.baseRapportEffect ?? 0;

  return {
    ...state,
    currentSceneId: nextSceneId,
    currentAct: nextScene.act,
    visitedSceneIds: [...state.visitedSceneIds, nextSceneId],
    collectedClues: [...state.collectedClues, ...newClues],
    cpSpent: state.cpSpent + cpCost,
    rapport: clampRapport(state.rapport + rapportEffect),
    sceneStartedAt: Date.now(),
    isComplete: nextScene.interaction.mode === "diagnosis-reveal",
  };
}

/** Make a choice (for 'choices' and 'timed-choice' interaction modes) */
export function makeChoice(
  state: CaseGameState,
  option: DecisionOption,
  caseData: ClinicalCase
): CaseGameState {
  const record: ChoiceRecord = {
    sceneId: state.currentSceneId,
    optionId: option.id,
    timestamp: Date.now(),
  };

  const withChoice: CaseGameState = {
    ...state,
    choiceHistory: [...state.choiceHistory, record],
    cpSpent: state.cpSpent + option.cpCost,
    rapport: clampRapport(state.rapport + option.rapportEffect),
  };

  return advanceToScene(withChoice, option.nextSceneId, caseData);
}

/** Examine a body region (for 'exam-zones' interaction mode) */
export function examineZone(
  state: CaseGameState,
  sceneId: string,
  region: string,
  cpCost: number,
  clues: Clue[]
): CaseGameState {
  const existingRecord = state.examinedZones.find(
    (ez) => ez.sceneId === sceneId
  );
  const newClues = clues.filter(
    (clue) => !state.collectedClues.some((c) => c.id === clue.id)
  );

  return {
    ...state,
    cpSpent: state.cpSpent + cpCost,
    collectedClues: [...state.collectedClues, ...newClues],
    examinedZones: existingRecord
      ? state.examinedZones.map((ez) =>
          ez.sceneId === sceneId
            ? { ...ez, regions: [...ez.regions, region] }
            : ez
        )
      : [...state.examinedZones, { sceneId, regions: [region] }],
  };
}

/** Complete the exam and advance to the next scene */
export function completeExam(
  state: CaseGameState,
  nextSceneId: string,
  caseData: ClinicalCase
): CaseGameState {
  return advanceToScene(state, nextSceneId, caseData);
}

/** Update the DDx board */
export function updateDdx(
  state: CaseGameState,
  newDdx: string[]
): CaseGameState {
  return {
    ...state,
    activeDdx: [...newDdx],
  };
}

/** Snapshot the current DDx state (called on scene transitions) */
export function snapshotDdx(state: CaseGameState): CaseGameState {
  const snapshot: DdxSnapshot = {
    sceneId: state.currentSceneId,
    ddx: [...state.activeDdx],
  };

  return {
    ...state,
    ddxHistory: [...state.ddxHistory, snapshot],
  };
}

/** Complete the DDx check and advance */
export function completeDdxCheck(
  state: CaseGameState,
  nextSceneId: string,
  caseData: ClinicalCase
): CaseGameState {
  const withSnapshot = snapshotDdx(state);
  return advanceToScene(withSnapshot, nextSceneId, caseData);
}

/** Calculate the final score at the end of the case */
export function calculateScore(
  state: CaseGameState,
  caseData: ClinicalCase
): CaseScore {
  const { answerKey } = caseData;

  // ── CP Efficiency (0–100) ──
  // Perfect = used exactly optimal CP. Worse as you go over.
  const cpRatio = answerKey.optimalCpSpent > 0
    ? answerKey.optimalCpSpent / Math.max(state.cpSpent, answerKey.optimalCpSpent)
    : 1;
  const cpEfficiency = Math.round(cpRatio * 100);

  // ── DDx Accuracy (0–100) ──
  // Compare student DDx snapshots against expert evolution
  let ddxMatchTotal = 0;
  let ddxMatchCount = 0;
  for (const expertSnap of answerKey.expertDdxEvolution) {
    const studentSnap = state.ddxHistory.find(
      (s) => s.sceneId === expertSnap.sceneId
    );
    if (studentSnap) {
      const expertSet = new Set(expertSnap.ddx);
      const studentSet = new Set(studentSnap.ddx);
      const intersection = [...studentSet].filter((d) => expertSet.has(d));
      const union = new Set([...expertSet, ...studentSet]);
      ddxMatchTotal += union.size > 0 ? intersection.length / union.size : 0;
      ddxMatchCount++;
    }
  }
  const ddxAccuracy =
    ddxMatchCount > 0 ? Math.round((ddxMatchTotal / ddxMatchCount) * 100) : 50;

  // ── Optimal choices ──
  // Count how many of the student's choices match the optimal path
  const optimalSceneIds = new Set(answerKey.optimalPath);
  const optimalChoices = state.choiceHistory.filter((ch) => {
    const scene = caseData.scenes.find((s) => s.id === ch.sceneId);
    if (!scene) return false;
    if (
      scene.interaction.mode === "choices" ||
      scene.interaction.mode === "timed-choice"
    ) {
      const chosenOpt = scene.interaction.options.find(
        (o) => o.id === ch.optionId
      );
      return chosenOpt?.isOptimal === true;
    }
    return false;
  }).length;
  const totalChoices = state.choiceHistory.length;

  // ── Key findings ──
  const allKeyFindings = caseData.scenes.flatMap((s) => {
    const sceneClues = s.cluesRevealed.filter((c) => c.isKeyFinding);
    if (s.interaction.mode === "exam-zones") {
      const zoneClues = s.interaction.zones
        .filter((z) => z.isKeyFinding)
        .flatMap((z) => z.cluesRevealed.filter((c) => c.isKeyFinding));
      return [...sceneClues, ...zoneClues];
    }
    return sceneClues;
  });
  const keyFindingsTotal = allKeyFindings.length;
  const keyFindingsFoundSet = new Set(
    state.collectedClues.filter((c) => c.isKeyFinding).map((c) => c.id)
  );
  const keyFindingsFound = keyFindingsFoundSet.size;

  // ── XP ──
  let xpEarned = 50; // base XP for completing the case
  for (const ch of state.choiceHistory) {
    const scene = caseData.scenes.find((s) => s.id === ch.sceneId);
    if (!scene) continue;
    if (
      scene.interaction.mode === "choices" ||
      scene.interaction.mode === "timed-choice"
    ) {
      const opt = scene.interaction.options.find((o) => o.id === ch.optionId);
      if (opt) xpEarned += opt.xpModifier;
    }
  }
  xpEarned = Math.max(0, xpEarned); // floor at 0

  // ── Total composite score ──
  const choiceScore = totalChoices > 0 ? (optimalChoices / totalChoices) * 100 : 50;
  const findingScore =
    keyFindingsTotal > 0 ? (keyFindingsFound / keyFindingsTotal) * 100 : 50;
  const rapportScore = state.rapport;

  const totalScore = Math.round(
    cpEfficiency * 0.2 +
    ddxAccuracy * 0.2 +
    choiceScore * 0.25 +
    findingScore * 0.2 +
    rapportScore * 0.15
  );

  return {
    cpEfficiency,
    ddxAccuracy,
    rapportFinal: state.rapport,
    optimalChoices,
    totalChoices,
    keyFindingsFound,
    keyFindingsTotal,
    xpEarned,
    totalScore,
  };
}

/** Apply score to the game state (called after calculateScore) */
export function finalizeCase(
  state: CaseGameState,
  caseData: ClinicalCase
): CaseGameState {
  const score = calculateScore(state, caseData);
  return {
    ...state,
    isComplete: true,
    finalDiagnosis: caseData.answerKey.diagnosis,
    score,
  };
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function clampRapport(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Check if a region has been examined in the current scene */
export function isRegionExamined(
  state: CaseGameState,
  sceneId: string,
  region: string
): boolean {
  const record = state.examinedZones.find((ez) => ez.sceneId === sceneId);
  return record?.regions.includes(region) ?? false;
}

/** Get total CP spent on exam zones in the current scene */
export function getExamCpSpent(
  state: CaseGameState,
  sceneId: string,
  caseData: ClinicalCase
): number {
  const scene = caseData.scenes.find((s) => s.id === sceneId);
  if (!scene || scene.interaction.mode !== "exam-zones") return 0;

  const record = state.examinedZones.find((ez) => ez.sceneId === sceneId);
  if (!record) return 0;

  const interaction = scene.interaction;
  return record.regions.reduce((total, region) => {
    const zone = interaction.zones.find((z: { region: string; cpCost: number }) => z.region === region);
    return total + (zone?.cpCost ?? 0);
  }, 0);
}

/** Get the number of DDx matches at the current point (without revealing which) */
export function getDdxMatchCount(
  state: CaseGameState,
  expertDdx: string[]
): { matched: number; total: number } {
  const expertSet = new Set(expertDdx);
  const matched = state.activeDdx.filter((d) => expertSet.has(d)).length;
  return { matched, total: expertSet.size };
}
