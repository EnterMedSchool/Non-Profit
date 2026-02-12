// ─── Clinical Cases — Interactive branching patient scenarios ────────────────
// Each case is a directed graph of CaseScenes with multiple interaction modes,
// game mechanics (DDx board, clinical budget, rapport, timed moments, exam zones,
// mentor commentary), and ambient sound design.

// ─── Enums & Literal Types ──────────────────────────────────────────────────

export type ActType = "encounter" | "investigation" | "twist" | "resolution";

export type SceneType =
  | "narrative"
  | "history"
  | "physical-exam"
  | "investigation"
  | "critical-moment"
  | "diagnosis"
  | "treatment";

export type PatientEmotion =
  | "neutral"
  | "worried"
  | "pain"
  | "relieved"
  | "confused"
  | "hopeful"
  | "scared"
  | "grateful";

export type AmbientMood = "calm" | "tense" | "urgent" | "hopeful" | "dramatic";

export type ClueType = "lab" | "imaging" | "history" | "physical" | "vital";

export type ExamRegion =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "upper-extremities"
  | "lower-extremities"
  | "skin"
  | "neurological";

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface Clue {
  id: string;
  label: string;
  value: string;
  type: ClueType;
  /** Highlighted in debrief if student missed it */
  isKeyFinding: boolean;
}

export interface DecisionOption {
  id: string;
  label: string;
  /** Brief context shown below the label */
  description?: string;
  nextSceneId: string;
  /** Professor-only — stripped before sending to student client */
  isOptimal: boolean;
  /** Shown after selection (optional) */
  feedback?: string;
  xpModifier: number;
  cpCost: number;
  rapportEffect: number;
}

export interface ExamZone {
  region: ExamRegion;
  label: string;
  findings: string;
  cpCost: number;
  cluesRevealed: Clue[];
  isKeyFinding: boolean;
}

export interface MentorComment {
  /** When to show the comment relative to the student's decision */
  timing: "before-decision" | "after-optimal" | "after-suboptimal";
  text: string;
  /** Bolded key takeaway displayed with a lightbulb icon */
  teachingPoint?: string;
}

export interface SceneSoundCue {
  ambientMood: AmbientMood;
  /** SFX path played when scene loads */
  sfxOnEnter?: string;
  /** SFX when clues are revealed */
  sfxOnReveal?: string;
}

export interface DdxUpdate {
  /** Diseases the expert would consider adding at this point */
  shouldConsiderAdding?: string[];
  /** Diseases the expert would consider removing at this point */
  shouldConsiderRemoving?: string[];
  /** The expert's differential at this point in the case (professor-only) */
  expertDdxAtThisPoint: string[];
}

// ─── Interaction Modes (discriminated union) ────────────────────────────────

export interface ChoicesInteraction {
  mode: "choices";
  prompt: string;
  options: DecisionOption[];
}

export interface ExamZonesInteraction {
  mode: "exam-zones";
  prompt: string;
  zones: ExamZone[];
  /** CP sub-budget for the exam (student can examine zones up to this amount) */
  budgetForExam: number;
  /** Scene to advance to when student clicks "Done examining" */
  nextSceneId: string;
}

export interface TimedChoiceInteraction {
  mode: "timed-choice";
  prompt: string;
  /** Countdown in seconds */
  timeLimit: number;
  options: DecisionOption[];
  /** Auto-selected if time runs out */
  defaultOptionId: string;
}

export interface DdxCheckInteraction {
  mode: "ddx-check";
  instruction: string;
  nextSceneId: string;
}

export interface NarrativeOnlyInteraction {
  mode: "narrative-only";
  nextSceneId: string;
}

export interface DiagnosisRevealInteraction {
  mode: "diagnosis-reveal";
  /** If there's a next scene (e.g. treatment after diagnosis) */
  nextSceneId?: string;
}

export type SceneInteraction =
  | ChoicesInteraction
  | ExamZonesInteraction
  | TimedChoiceInteraction
  | DdxCheckInteraction
  | NarrativeOnlyInteraction
  | DiagnosisRevealInteraction;

// ─── The Core Scene ─────────────────────────────────────────────────────────

export interface CaseScene {
  id: string;
  act: ActType;
  type: SceneType;

  // ── Narrative ──
  narration: string;
  patientDialogue?: string;
  patientEmotion: PatientEmotion;
  illustrationPath: string;

  // ── Mentor ──
  mentorComments?: MentorComment[];

  // ── Interaction (exactly one per scene) ──
  interaction: SceneInteraction;

  // ── Sound ──
  sound: SceneSoundCue;

  // ── Effects ──
  cluesRevealed: Clue[];
  ddxUpdate?: DdxUpdate;

  // ── Base costs (for scenes without per-option costs) ──
  baseCpCost?: number;
  baseRapportEffect?: number;

  // ── Rapport gate: bonus content if rapport is high enough ──
  rapportBonusDialogue?: {
    threshold: number;
    dialogue: string;
    bonusClues?: Clue[];
  };
}

// ─── The Full Case ──────────────────────────────────────────────────────────

export interface ClinicalCase {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  /** Links to DiseaseCharacter.id from disease-characters.ts */
  characterId: string;

  patient: {
    age: number;
    sex: "male" | "female";
    name: string;
    chiefComplaint: string;
    briefHistory: string;
    avatarPath: string;
  };

  // ── Game configuration ──
  startingCp: number;
  startingRapport: number;
  /** All diseases available for the DDx board */
  ddxPool: string[];

  // ── Scenes (the directed graph) ──
  scenes: CaseScene[];
  startSceneId: string;

  // ── Professor-only ──
  teachingNotes: string;
  learningObjectives: string[];
  answerKey: {
    optimalPath: string[];
    optimalCpSpent: number;
    diagnosis: string;
    keyFindings: string[];
    expertDdxEvolution: { sceneId: string; ddx: string[] }[];
  };

  relatedVisualIds: string[];
  tags: string[];
  thumbnailPath: string;
}

// ─── Difficulty & Category Config ───────────────────────────────────────────

export const difficultyConfig: Record<
  ClinicalCase["difficulty"],
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-showcase-green",
    bgColor: "bg-showcase-green/10",
    borderColor: "border-showcase-green",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-showcase-yellow",
    bgColor: "bg-showcase-yellow/10",
    borderColor: "border-showcase-yellow",
  },
  advanced: {
    label: "Advanced",
    color: "text-showcase-coral",
    bgColor: "bg-showcase-coral/10",
    borderColor: "border-showcase-coral",
  },
};

export const actConfig: Record<
  ActType,
  { label: string; subtitle: string; color: string; gradient: string }
> = {
  encounter: {
    label: "Act I",
    subtitle: "The Encounter",
    color: "text-showcase-teal",
    gradient: "from-showcase-teal to-showcase-green",
  },
  investigation: {
    label: "Act II",
    subtitle: "The Investigation",
    color: "text-showcase-purple",
    gradient: "from-showcase-purple to-showcase-blue",
  },
  twist: {
    label: "Act III",
    subtitle: "The Twist",
    color: "text-showcase-coral",
    gradient: "from-showcase-coral to-showcase-pink",
  },
  resolution: {
    label: "Act IV",
    subtitle: "The Resolution",
    color: "text-showcase-yellow",
    gradient: "from-showcase-yellow to-showcase-orange",
  },
};

// ─── Sound asset paths ──────────────────────────────────────────────────────

export const SOUND_ASSETS = {
  ambient: {
    calm: "/clinical-cases/audio/ambient/calm.mp3",
    tense: "/clinical-cases/audio/ambient/tense.mp3",
    urgent: "/clinical-cases/audio/ambient/urgent.mp3",
    hopeful: "/clinical-cases/audio/ambient/hopeful.mp3",
    dramatic: "/clinical-cases/audio/ambient/dramatic.mp3",
  },
  sfx: {
    clueReveal: "/clinical-cases/audio/sfx/clue-reveal.mp3",
    decisionMade: "/clinical-cases/audio/sfx/decision-made.mp3",
    timerTick: "/clinical-cases/audio/sfx/timer-tick.mp3",
    timerWarning: "/clinical-cases/audio/sfx/timer-warning.mp3",
    rapportUp: "/clinical-cases/audio/sfx/rapport-up.mp3",
    rapportDown: "/clinical-cases/audio/sfx/rapport-down.mp3",
    characterUnlock: "/clinical-cases/audio/sfx/character-unlock.mp3",
    actTransition: "/clinical-cases/audio/sfx/act-transition.mp3",
    examClick: "/clinical-cases/audio/sfx/exam-click.mp3",
    mentorAppear: "/clinical-cases/audio/sfx/mentor-appear.mp3",
  },
} as const;

// ─── Case Data ──────────────────────────────────────────────────────────────

const BETA_THAL_BASE = "/clinical-cases/beta-thalassemia";

export const clinicalCases: ClinicalCase[] = [
  {
    id: "beta-thalassemia",
    title: "The Tired Student",
    category: "Hematology",
    subcategory: "Hemoglobinopathies",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    characterId: "thalasseus",
    thumbnailPath: `${BETA_THAL_BASE}/thumbnail.png`,

    patient: {
      age: 19,
      sex: "female",
      name: "Maria",
      chiefComplaint: "I've been so tired lately, I can barely stay awake in lectures.",
      briefHistory:
        "A 19-year-old female university student of Greek descent presents to the campus health clinic with progressive fatigue and pallor over the past several months.",
      avatarPath: `${BETA_THAL_BASE}/patient-avatar.png`,
    },

    // ── Game config ──
    startingCp: 35,
    startingRapport: 50,
    ddxPool: [
      "Beta Thalassemia",
      "Iron Deficiency Anemia",
      "Alpha Thalassemia",
      "Sickle Cell Disease",
      "Anemia of Chronic Disease",
      "Sideroblastic Anemia",
      "Lead Poisoning",
      "Vitamin B12 Deficiency",
      "Folate Deficiency",
      "Aplastic Anemia",
    ],

    // ── Professor-only ──
    teachingNotes:
      "This case teaches the approach to microcytic anemia with emphasis on distinguishing thalassemia from iron deficiency. Key teaching points: (1) ethnic background is a critical clue for hemoglobinopathies, (2) CBC with peripheral smear is the correct first test, not iron studies alone, (3) hemoglobin electrophoresis is confirmatory, (4) splenomegaly on exam should raise suspicion beyond simple iron deficiency, (5) management of thalassemia intermedia focuses on monitoring and supportive care, not aggressive transfusion.",
    learningObjectives: [
      "Develop a differential diagnosis for microcytic anemia",
      "Recognize clinical and laboratory features of beta thalassemia",
      "Distinguish beta thalassemia from iron deficiency anemia",
      "Select appropriate confirmatory testing for hemoglobinopathies",
      "Understand the initial management approach for thalassemia intermedia",
    ],
    answerKey: {
      optimalPath: [
        "encounter-intro",
        "history-family",
        "history-family-result",
        "ddx-initial",
        "investigation-initial",
        "investigation-cbc-results",
        "physical-exam",
        "investigation-confirmatory",
        "twist-acute",
        "twist-stabilize",
        "resolution-results",
        "resolution-treatment",
        "resolution-reveal",
      ],
      optimalCpSpent: 19,
      diagnosis: "Beta Thalassemia Intermedia",
      keyFindings: [
        "Greek descent (Mediterranean ancestry)",
        "Family history of anemia",
        "Microcytic anemia (MCV 62 fL)",
        "Target cells on peripheral smear",
        "Splenomegaly on physical exam",
        "Elevated HbA2 on hemoglobin electrophoresis",
      ],
      expertDdxEvolution: [
        {
          sceneId: "ddx-initial",
          ddx: [
            "Iron Deficiency Anemia",
            "Beta Thalassemia",
            "Alpha Thalassemia",
            "Anemia of Chronic Disease",
          ],
        },
        {
          sceneId: "investigation-cbc-results",
          ddx: ["Beta Thalassemia", "Iron Deficiency Anemia", "Alpha Thalassemia"],
        },
        {
          sceneId: "physical-exam",
          ddx: ["Beta Thalassemia", "Alpha Thalassemia"],
        },
        {
          sceneId: "resolution-results",
          ddx: ["Beta Thalassemia"],
        },
      ],
    },

    relatedVisualIds: ["anemia-overview"],
    tags: [
      "beta thalassemia",
      "microcytic anemia",
      "hemoglobinopathy",
      "Mediterranean",
      "hemoglobin electrophoresis",
      "splenomegaly",
      "target cells",
      "HbA2",
    ],

    // ═══════════════════════════════════════════════════════════════════════
    //  SCENES — The Directed Graph
    // ═══════════════════════════════════════════════════════════════════════

    startSceneId: "encounter-intro",

    scenes: [
      // ─────────────────────────────────────────────────────────────────────
      //  ACT I — THE ENCOUNTER
      // ─────────────────────────────────────────────────────────────────────

      {
        id: "encounter-intro",
        act: "encounter",
        type: "narrative",
        narration:
          "You're finishing up paperwork at the university health clinic when the door opens. A young woman walks in slowly, looking exhausted. Her skin appears notably pale, and she seems short of breath after just walking down the hallway.",
        patientDialogue:
          "Hi, doctor. I'm Maria. I've been so tired lately... I can barely stay awake during my lectures. My friends keep telling me I look pale. I thought it would go away but it's been months now.",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/encounter-intro.png`,
        sound: { ambientMood: "calm", sfxOnEnter: SOUND_ASSETS.sfx.actTransition },
        cluesRevealed: [
          {
            id: "cc-fatigue",
            label: "Chief Complaint",
            value: "Progressive fatigue for several months, pallor noted by friends",
            type: "history",
            isKeyFinding: false,
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "encounter-history-choice",
        },
      },

      {
        id: "encounter-history-choice",
        act: "encounter",
        type: "history",
        narration:
          "Maria settles into the chair and looks at you expectantly. You need to start gathering information. What area of her history do you want to explore first?",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/encounter-history-choice.png`,
        sound: { ambientMood: "calm" },
        cluesRevealed: [],
        mentorComments: [
          {
            timing: "before-decision",
            text: "When a young patient presents with chronic fatigue and pallor, think about what historical features could narrow your differential before you even touch a lab order form.",
            teachingPoint:
              "Family history and ethnic background are free, fast, and incredibly informative for anemia workup.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "Which aspect of Maria's history do you want to explore first?",
          options: [
            {
              id: "family-hx",
              label: "Family & Ethnic History",
              description: "Ask about family heritage, any relatives with blood disorders",
              nextSceneId: "history-family",
              isOptimal: true,
              feedback:
                "Excellent instinct. Family and ethnic history is often the most valuable first question in a young patient with unexplained anemia.",
              xpModifier: 10,
              cpCost: 1,
              rapportEffect: 1,
            },
            {
              id: "social-hx",
              label: "Social & Diet History",
              description: "Ask about diet, lifestyle, menstrual history, substance use",
              nextSceneId: "history-social",
              isOptimal: false,
              feedback:
                "Social history is important but less likely to narrow your differential as quickly. Diet could point to iron deficiency, though.",
              xpModifier: 3,
              cpCost: 1,
              rapportEffect: 0,
            },
            {
              id: "ros-hx",
              label: "Full Review of Systems",
              description: "Comprehensive symptom review across all organ systems",
              nextSceneId: "history-ros",
              isOptimal: false,
              feedback:
                "A full ROS is thorough but time-consuming. Sometimes a targeted approach gets you further, faster.",
              xpModifier: 0,
              cpCost: 2,
              rapportEffect: -1,
            },
          ],
        },
      },

      // ── Family history (optimal path) ──

      {
        id: "history-family",
        act: "encounter",
        type: "history",
        narration:
          "You ask Maria about her family background and whether anyone in her family has had blood problems.",
        patientDialogue:
          "My family is from Greece — my grandparents moved here. My mom always said she was 'a little anemic' but never really got treated for it. My younger brother was told he has some kind of blood trait... I don't remember the exact name. Is that important?",
        patientEmotion: "confused",
        illustrationPath: `${BETA_THAL_BASE}/scenes/history-family.png`,
        sound: { ambientMood: "calm", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "ethnicity",
            label: "Ethnic Background",
            value: "Greek descent (Mediterranean ancestry)",
            type: "history",
            isKeyFinding: true,
          },
          {
            id: "family-anemia",
            label: "Family History",
            value:
              "Mother has chronic mild anemia (untreated). Brother has an unspecified 'blood trait'.",
            type: "history",
            isKeyFinding: true,
          },
        ],
        mentorComments: [
          {
            timing: "after-optimal",
            text: "Mediterranean ancestry with a family history of mild anemia and a sibling with a 'blood trait' — this is a classic pattern. You should be thinking about hemoglobinopathies, particularly thalassemia.",
            teachingPoint:
              "In Mediterranean populations, thalassemia trait is present in up to 5-15% of the population.",
          },
        ],
        rapportBonusDialogue: {
          threshold: 60,
          dialogue:
            "Actually, now that I think about it... my grandmother used to say she had 'Mediterranean anemia.' I never understood what that meant. Does that help?",
          bonusClues: [
            {
              id: "grandmother-hint",
              label: "Grandmother's History",
              value: "Grandmother referred to having 'Mediterranean anemia'",
              type: "history",
              isKeyFinding: false,
            },
          ],
        },
        interaction: {
          mode: "narrative-only",
          nextSceneId: "ddx-initial",
        },
      },

      // ── Social history (suboptimal path) ──

      {
        id: "history-social",
        act: "encounter",
        type: "history",
        narration:
          "You ask Maria about her diet, lifestyle, and menstrual history.",
        patientDialogue:
          "I eat pretty normally, I think. I'm vegetarian but I try to eat well. My periods are regular, maybe a bit heavy sometimes. I don't drink much, just socially. No drugs or anything.",
        patientEmotion: "neutral",
        illustrationPath: `${BETA_THAL_BASE}/scenes/history-social.png`,
        sound: { ambientMood: "calm", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "diet",
            label: "Diet",
            value: "Vegetarian diet — possible reduced iron intake",
            type: "history",
            isKeyFinding: false,
          },
          {
            id: "menses",
            label: "Menstrual History",
            value: "Regular cycles, occasionally heavy",
            type: "history",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "The vegetarian diet and heavy periods could point toward iron deficiency — a reasonable thought. But have you asked about her family background yet? That might change your entire differential.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "This gives you some information. What would you like to do next?",
          options: [
            {
              id: "now-family",
              label: "Ask About Family & Ethnic History",
              description: "Explore hereditary and ancestral factors",
              nextSceneId: "history-family",
              isOptimal: true,
              xpModifier: 5,
              cpCost: 1,
              rapportEffect: 0,
            },
            {
              id: "skip-to-labs",
              label: "Move Straight to Lab Tests",
              description: "You've heard enough — time to order some bloodwork",
              nextSceneId: "ddx-initial",
              isOptimal: false,
              feedback:
                "Jumping to labs before completing the history means you'll miss crucial context that guides your test selection.",
              xpModifier: -5,
              cpCost: 0,
              rapportEffect: -1,
            },
          ],
        },
      },

      // ── Full ROS (suboptimal path) ──

      {
        id: "history-ros",
        act: "encounter",
        type: "history",
        narration:
          "You run through a comprehensive review of systems. Maria answers patiently but seems a bit overwhelmed by the number of questions.",
        patientDialogue:
          "Um... no chest pain, no cough. Sometimes I get dizzy when I stand up too fast. No bleeding anywhere weird. My appetite is okay, I guess. I haven't lost weight. Can I ask — is something seriously wrong?",
        patientEmotion: "scared",
        illustrationPath: `${BETA_THAL_BASE}/scenes/history-ros.png`,
        sound: { ambientMood: "calm" },
        cluesRevealed: [
          {
            id: "orthostatic",
            label: "Review of Systems",
            value:
              "Positive for orthostatic dizziness. Negative for chest pain, bleeding, weight loss, lymphadenopathy.",
            type: "history",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "A full ROS gives you some data, but notice Maria seems anxious now. Consider that targeted questions about family and ethnicity would have been higher yield and less stressful for the patient.",
            teachingPoint:
              "Rapport matters — an overwhelmed patient may withhold information or become less cooperative.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "Maria is looking worried. What do you want to explore next?",
          options: [
            {
              id: "reassure-then-family",
              label: "Reassure Her, Then Ask About Family History",
              description: "Take a moment to calm her, then explore hereditary factors",
              nextSceneId: "history-family",
              isOptimal: true,
              xpModifier: 5,
              cpCost: 1,
              rapportEffect: 2,
            },
            {
              id: "rush-to-exam",
              label: "Move On to Physical Exam",
              description: "Enough questions — let's examine her",
              nextSceneId: "ddx-initial",
              isOptimal: false,
              feedback:
                "Skipping family history in a young patient with chronic anemia means missing a critical piece of the puzzle.",
              xpModifier: -5,
              cpCost: 0,
              rapportEffect: -2,
            },
          ],
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      //  ACT II — THE INVESTIGATION
      // ─────────────────────────────────────────────────────────────────────

      {
        id: "ddx-initial",
        act: "investigation",
        type: "investigation",
        narration:
          "Before ordering any tests, take a moment to organize your thinking. Based on what you know so far — a young woman with chronic fatigue, pallor, and whatever history you've gathered — what conditions are you considering?",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/ddx-initial.png`,
        sound: { ambientMood: "tense", sfxOnEnter: SOUND_ASSETS.sfx.actTransition },
        cluesRevealed: [],
        ddxUpdate: {
          expertDdxAtThisPoint: [
            "Iron Deficiency Anemia",
            "Beta Thalassemia",
            "Alpha Thalassemia",
            "Anemia of Chronic Disease",
          ],
        },
        mentorComments: [
          {
            timing: "before-decision",
            text: "Pause here. Good clinicians formulate a differential BEFORE ordering tests. What's on your list? This will determine which tests are actually useful.",
            teachingPoint:
              "The differential drives the workup — not the other way around.",
          },
        ],
        interaction: {
          mode: "ddx-check",
          instruction:
            "Review the disease bank and build your initial differential diagnosis. Drag conditions you're considering onto your DDx board, ordered by likelihood. Click Continue when you're ready to order tests.",
          nextSceneId: "investigation-initial",
        },
      },

      {
        id: "investigation-initial",
        act: "investigation",
        type: "investigation",
        narration:
          "Now it's time to order your initial workup. Remember — every test has a cost. What would you like to order first?",
        patientDialogue: "Will I need a blood test? I'm not great with needles...",
        patientEmotion: "scared",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-initial.png`,
        sound: { ambientMood: "tense" },
        cluesRevealed: [],
        mentorComments: [
          {
            timing: "before-decision",
            text: "Think about what single test gives you the most information per dollar spent. In anemia workup, what's the classic first-line test?",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "What initial lab test do you want to order?",
          options: [
            {
              id: "cbc-smear",
              label: "CBC with Peripheral Blood Smear",
              description: "Complete blood count + manual smear review (3 CP)",
              nextSceneId: "investigation-cbc-results",
              isOptimal: true,
              feedback:
                "Perfect. The CBC with smear is the single most informative first test in anemia. It tells you severity, MCV (microcytic vs macro), and morphology clues.",
              xpModifier: 10,
              cpCost: 3,
              rapportEffect: 0,
            },
            {
              id: "iron-only",
              label: "Iron Studies Only",
              description: "Serum iron, ferritin, TIBC, transferrin saturation (3 CP)",
              nextSceneId: "investigation-iron-results",
              isOptimal: false,
              feedback:
                "Iron studies are important but ordering them without a CBC means you're assuming the diagnosis before characterizing the anemia. What if it's not iron deficiency?",
              xpModifier: 0,
              cpCost: 3,
              rapportEffect: 0,
            },
            {
              id: "full-panel",
              label: "Comprehensive Metabolic Panel + CBC + Iron + B12 + Folate",
              description: "The 'shotgun' approach — order everything (8 CP)",
              nextSceneId: "investigation-shotgun-results",
              isOptimal: false,
              feedback:
                "You'll get the answer eventually, but at a steep cost. In real practice, this approach wastes resources and can generate false-positive results that lead to unnecessary follow-up.",
              xpModifier: -5,
              cpCost: 8,
              rapportEffect: -1,
            },
          ],
        },
      },

      // ── CBC results (optimal path) ──

      {
        id: "investigation-cbc-results",
        act: "investigation",
        type: "investigation",
        narration:
          "The CBC results come back. You review them carefully.",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-cbc-results.png`,
        sound: { ambientMood: "tense", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "cbc-hgb",
            label: "Hemoglobin",
            value: "8.2 g/dL (low — normal: 12-16 g/dL)",
            type: "lab",
            isKeyFinding: true,
          },
          {
            id: "cbc-mcv",
            label: "MCV",
            value: "62 fL (low — normal: 80-100 fL) → Microcytic anemia",
            type: "lab",
            isKeyFinding: true,
          },
          {
            id: "cbc-rbc",
            label: "RBC Count",
            value: "5.8 × 10⁶/μL (elevated — normal: 4.0-5.5 × 10⁶/μL)",
            type: "lab",
            isKeyFinding: true,
          },
          {
            id: "cbc-rdw",
            label: "RDW",
            value: "14.5% (normal — normal: 11.5-14.5%)",
            type: "lab",
            isKeyFinding: true,
          },
          {
            id: "smear-targets",
            label: "Peripheral Smear",
            value: "Target cells (codocytes) present. Microcytic hypochromic red cells.",
            type: "lab",
            isKeyFinding: true,
          },
        ],
        ddxUpdate: {
          shouldConsiderRemoving: [
            "Vitamin B12 Deficiency",
            "Folate Deficiency",
            "Aplastic Anemia",
          ],
          expertDdxAtThisPoint: [
            "Beta Thalassemia",
            "Iron Deficiency Anemia",
            "Alpha Thalassemia",
          ],
        },
        mentorComments: [
          {
            timing: "after-optimal",
            text: "Look at this pattern: low MCV but HIGH RBC count with a normal RDW. In iron deficiency, you'd expect a LOW RBC count and a HIGH RDW. This pattern is classic for thalassemia. And those target cells on the smear? Another big clue.",
            teachingPoint:
              "Mentzer Index (MCV/RBC): <13 suggests thalassemia, >13 suggests iron deficiency. Here it's 62/5.8 ≈ 10.7 — pointing toward thalassemia.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "physical-exam",
        },
      },

      // ── Iron studies only (suboptimal path) ──

      {
        id: "investigation-iron-results",
        act: "investigation",
        type: "investigation",
        narration:
          "The iron studies come back. The results are... surprisingly normal.",
        patientEmotion: "confused",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-iron-results.png`,
        sound: { ambientMood: "tense", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "iron-normal",
            label: "Iron Studies",
            value:
              "Serum iron: 85 μg/dL (normal). Ferritin: 120 ng/mL (normal). TIBC: 310 μg/dL (normal). Transferrin sat: 27% (normal).",
            type: "lab",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "Normal iron studies in an anemic patient is actually a very informative result — it rules OUT iron deficiency. But now you still need a CBC to characterize the anemia. You could have gotten more information upfront with a different first test.",
            teachingPoint:
              "When iron studies are normal in an anemic patient, think: thalassemia, anemia of chronic disease, or sideroblastic anemia.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "Iron studies are normal. What's your next step?",
          options: [
            {
              id: "now-cbc",
              label: "Order CBC with Peripheral Smear",
              description: "Get the complete blood count you should have started with",
              nextSceneId: "investigation-cbc-results",
              isOptimal: true,
              xpModifier: 5,
              cpCost: 3,
              rapportEffect: 0,
            },
            {
              id: "hb-electrophoresis-early",
              label: "Jump to Hemoglobin Electrophoresis",
              description: "Go straight for the confirmatory test",
              nextSceneId: "investigation-cbc-results",
              isOptimal: false,
              feedback:
                "Jumping to a confirmatory test without characterizing the anemia first is putting the cart before the horse. You need baseline data.",
              xpModifier: -3,
              cpCost: 5,
              rapportEffect: 0,
            },
          ],
        },
      },

      // ── Shotgun labs (suboptimal path) ──

      {
        id: "investigation-shotgun-results",
        act: "investigation",
        type: "investigation",
        narration:
          "A flood of lab results comes back. That's a lot of data to sort through. The key findings emerge from the noise:",
        patientDialogue:
          "They took a lot of blood from me... I'm already anemic, isn't that a bit ironic?",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-shotgun-results.png`,
        sound: { ambientMood: "tense", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "shotgun-cbc",
            label: "CBC Highlights",
            value:
              "Hb 8.2 g/dL (low), MCV 62 fL (low), RBC 5.8 × 10⁶/μL (high), RDW 14.5% (normal)",
            type: "lab",
            isKeyFinding: true,
          },
          {
            id: "shotgun-iron",
            label: "Iron Studies",
            value: "All within normal limits",
            type: "lab",
            isKeyFinding: false,
          },
          {
            id: "shotgun-b12-folate",
            label: "B12 & Folate",
            value: "Both within normal limits",
            type: "lab",
            isKeyFinding: false,
          },
          {
            id: "shotgun-cmp",
            label: "CMP",
            value:
              "Mildly elevated indirect bilirubin (1.4 mg/dL). Remainder within normal limits.",
            type: "lab",
            isKeyFinding: false,
          },
          {
            id: "shotgun-smear",
            label: "Peripheral Smear",
            value: "Target cells present. Microcytic hypochromic red cells.",
            type: "lab",
            isKeyFinding: true,
          },
        ],
        ddxUpdate: {
          shouldConsiderRemoving: [
            "Vitamin B12 Deficiency",
            "Folate Deficiency",
            "Aplastic Anemia",
          ],
          expertDdxAtThisPoint: [
            "Beta Thalassemia",
            "Iron Deficiency Anemia",
            "Alpha Thalassemia",
          ],
        },
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "You got the answer, but at a cost — literally. Many of those tests were unnecessary. The elevated indirect bilirubin is a nice bonus clue though — it suggests chronic hemolysis, consistent with thalassemia.",
            teachingPoint:
              "Shotgun workups cost more and can generate incidental findings that lead to unnecessary follow-up. Be targeted.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "physical-exam",
        },
      },

      // ── Physical examination ──

      {
        id: "physical-exam",
        act: "investigation",
        type: "physical-exam",
        narration:
          "With lab results in hand, it's time to examine Maria. You have a limited exam budget — choose the areas most relevant to your differential. What do you want to examine?",
        patientDialogue: "Go ahead, doctor. I just want to know what's going on.",
        patientEmotion: "hopeful",
        illustrationPath: `${BETA_THAL_BASE}/scenes/physical-exam.png`,
        sound: { ambientMood: "tense" },
        cluesRevealed: [],
        ddxUpdate: {
          expertDdxAtThisPoint: ["Beta Thalassemia", "Alpha Thalassemia"],
        },
        interaction: {
          mode: "exam-zones",
          prompt:
            "Click on body regions to examine them. Each exam costs clinical points. Focus on what's most relevant to your differential.",
          budgetForExam: 8,
          nextSceneId: "investigation-confirmatory",
          zones: [
            {
              region: "head",
              label: "Head & Face",
              findings:
                "Mild frontal bossing noted. Maxillary prominence. These skeletal changes suggest chronic extramedullary hematopoiesis.",
              cpCost: 2,
              cluesRevealed: [
                {
                  id: "frontal-bossing",
                  label: "Head Exam",
                  value:
                    "Frontal bossing and maxillary prominence — signs of extramedullary hematopoiesis",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "neck",
              label: "Neck",
              findings:
                "No lymphadenopathy. No thyromegaly. Neck supple. This is a reassuringly normal exam.",
              cpCost: 1,
              cluesRevealed: [
                {
                  id: "neck-normal",
                  label: "Neck Exam",
                  value: "No lymphadenopathy or thyromegaly",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "chest",
              label: "Chest & Heart",
              findings:
                "Heart rate 92 bpm, regular. Soft systolic flow murmur at the left sternal border — likely a physiologic murmur from anemia. Lungs clear.",
              cpCost: 2,
              cluesRevealed: [
                {
                  id: "flow-murmur",
                  label: "Cardiac Exam",
                  value:
                    "Soft systolic flow murmur — consistent with high-output state from chronic anemia",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "abdomen",
              label: "Abdomen",
              findings:
                "Abdomen soft, non-tender. Spleen tip is palpable 3 cm below the left costal margin — splenomegaly! This is a critical finding.",
              cpCost: 2,
              cluesRevealed: [
                {
                  id: "splenomegaly",
                  label: "Abdominal Exam",
                  value:
                    "Splenomegaly — spleen palpable 3 cm below left costal margin",
                  type: "physical",
                  isKeyFinding: true,
                },
              ],
              isKeyFinding: true,
            },
            {
              region: "upper-extremities",
              label: "Upper Extremities",
              findings:
                "Pallor of the nail beds and palmar creases. No koilonychia (spoon nails). Capillary refill 2 seconds.",
              cpCost: 1,
              cluesRevealed: [
                {
                  id: "pallor-nails",
                  label: "Extremity Exam",
                  value:
                    "Pallor of nail beds and palmar creases. No koilonychia (absence of spoon nails makes iron deficiency less likely).",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "lower-extremities",
              label: "Lower Extremities",
              findings:
                "No edema. No ulcers. Pulses intact. Unremarkable lower extremity exam.",
              cpCost: 1,
              cluesRevealed: [
                {
                  id: "lower-ext-normal",
                  label: "Lower Extremity Exam",
                  value: "No edema, ulcers, or vascular compromise",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "skin",
              label: "Skin & Integument",
              findings:
                "Generalized pallor. Mild scleral icterus (yellowish tint to the whites of the eyes). No rashes, petechiae, or bruising.",
              cpCost: 1,
              cluesRevealed: [
                {
                  id: "scleral-icterus",
                  label: "Skin Exam",
                  value:
                    "Generalized pallor with mild scleral icterus — suggests underlying hemolysis",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
            {
              region: "neurological",
              label: "Neurological",
              findings:
                "Alert, oriented. Cranial nerves intact. No peripheral neuropathy. Normal neurological exam.",
              cpCost: 2,
              cluesRevealed: [
                {
                  id: "neuro-normal",
                  label: "Neurological Exam",
                  value:
                    "Normal — helps rule out B12 deficiency (which can cause subacute combined degeneration)",
                  type: "physical",
                  isKeyFinding: false,
                },
              ],
              isKeyFinding: false,
            },
          ],
        },
      },

      // ── Confirmatory test decision ──

      {
        id: "investigation-confirmatory",
        act: "investigation",
        type: "investigation",
        narration:
          "Your physical exam has given you more data. With microcytic anemia, elevated RBC count, normal RDW, target cells on smear, and splenomegaly — your differential is narrowing. What confirmatory test do you want to order?",
        patientEmotion: "hopeful",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-confirmatory.png`,
        sound: { ambientMood: "tense" },
        cluesRevealed: [],
        mentorComments: [
          {
            timing: "before-decision",
            text: "You have a strong clinical suspicion now. What single test would confirm your leading diagnosis?",
          },
        ],
        interaction: {
          mode: "choices",
          prompt:
            "Which confirmatory test do you want to order?",
          options: [
            {
              id: "hb-electrophoresis",
              label: "Hemoglobin Electrophoresis",
              description:
                "Separates hemoglobin variants — gold standard for hemoglobinopathies (4 CP)",
              nextSceneId: "twist-waiting",
              isOptimal: true,
              feedback:
                "Exactly right. Hemoglobin electrophoresis is the definitive test for diagnosing thalassemia and other hemoglobin disorders.",
              xpModifier: 10,
              cpCost: 4,
              rapportEffect: 0,
            },
            {
              id: "bone-marrow",
              label: "Bone Marrow Biopsy",
              description:
                "Invasive procedure to examine marrow cellularity (10 CP)",
              nextSceneId: "investigation-marrow-detour",
              isOptimal: false,
              feedback:
                "A bone marrow biopsy is invasive, expensive, and unnecessary here. There are much less invasive ways to confirm your suspicion.",
              xpModifier: -10,
              cpCost: 10,
              rapportEffect: -3,
            },
            {
              id: "genetic-testing",
              label: "Genetic Testing (HBB gene)",
              description:
                "DNA analysis for beta-globin gene mutations (6 CP)",
              nextSceneId: "twist-waiting",
              isOptimal: false,
              feedback:
                "Genetic testing can confirm the exact mutation but it's more expensive and slower than electrophoresis. It's usually reserved for prenatal counseling or when electrophoresis is equivocal.",
              xpModifier: 2,
              cpCost: 6,
              rapportEffect: 0,
            },
          ],
        },
      },

      // ── Bone marrow detour (suboptimal) ──

      {
        id: "investigation-marrow-detour",
        act: "investigation",
        type: "investigation",
        narration:
          "You explain the bone marrow biopsy to Maria. She looks terrified.",
        patientDialogue:
          "A... a needle in my hip bone? Is there really no other way to find out what's wrong with me? I'm scared...",
        patientEmotion: "scared",
        illustrationPath: `${BETA_THAL_BASE}/scenes/investigation-marrow-detour.png`,
        sound: { ambientMood: "tense" },
        cluesRevealed: [],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "Look at your patient. She's terrified, and for good reason — a bone marrow biopsy is painful and invasive. In this clinical picture, a simple blood test (hemoglobin electrophoresis) would give you the answer. Always consider the least invasive path to the diagnosis.",
            teachingPoint:
              "Invasive tests should be reserved for when non-invasive options have been exhausted or are insufficient.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "Maria is visibly distressed. What do you do?",
          options: [
            {
              id: "reconsider",
              label: "Reconsider — Order Hemoglobin Electrophoresis Instead",
              description: "Switch to the less invasive confirmatory test",
              nextSceneId: "twist-waiting",
              isOptimal: true,
              feedback:
                "Good decision to reconsider. Recognizing when to change course is a sign of clinical maturity.",
              xpModifier: 5,
              cpCost: 4,
              rapportEffect: 2,
            },
            {
              id: "proceed-marrow",
              label: "Proceed With the Biopsy Anyway",
              description: "You've already committed to this path",
              nextSceneId: "twist-waiting",
              isOptimal: false,
              feedback:
                "The biopsy will show erythroid hyperplasia consistent with thalassemia, but at what cost? Maria's trust in you has dropped significantly.",
              xpModifier: -10,
              cpCost: 0,
              rapportEffect: -5,
            },
          ],
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      //  ACT III — THE TWIST
      // ─────────────────────────────────────────────────────────────────────

      {
        id: "twist-waiting",
        act: "twist",
        type: "narrative",
        narration:
          "You're waiting for the confirmatory test results. Maria is sitting in the exam room, scrolling her phone. Then — her phone slips from her hand. She looks up at you, eyes wide.",
        patientDialogue:
          "Doctor... I feel really dizzy all of a sudden. My heart is racing. I think I'm going to—",
        patientEmotion: "pain",
        illustrationPath: `${BETA_THAL_BASE}/scenes/twist-waiting.png`,
        sound: { ambientMood: "dramatic", sfxOnEnter: SOUND_ASSETS.sfx.actTransition },
        cluesRevealed: [],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "twist-acute",
        },
      },

      {
        id: "twist-acute",
        act: "twist",
        type: "critical-moment",
        narration:
          "Maria suddenly becomes pale and diaphoretic. She nearly falls out of her chair. Her heart is pounding visibly in her neck. This needs immediate attention.",
        patientEmotion: "pain",
        illustrationPath: `${BETA_THAL_BASE}/scenes/twist-acute.png`,
        sound: { ambientMood: "urgent" },
        cluesRevealed: [],
        interaction: {
          mode: "timed-choice",
          prompt: "Maria is acutely symptomatic! What do you do RIGHT NOW?",
          timeLimit: 20,
          defaultOptionId: "attending-steps-in",
          options: [
            {
              id: "check-vitals-stabilize",
              label: "Check Vitals & Stabilize",
              description:
                "Lay her down, check BP/HR/O2, start IV access, prepare for possible transfusion",
              nextSceneId: "twist-stabilize",
              isOptimal: true,
              feedback:
                "Quick, composed, and systematic. You stabilized the patient while gathering the information needed to decide next steps.",
              xpModifier: 15,
              cpCost: 2,
              rapportEffect: 3,
            },
            {
              id: "call-code",
              label: "Call a Code Blue",
              description: "Activate the emergency response team immediately",
              nextSceneId: "twist-code-overreaction",
              isOptimal: false,
              feedback:
                "Maria is hemodynamically symptomatic but conscious and talking. A code blue is for cardiac arrest or imminent arrest. This is an overreaction that will alarm the patient and waste resources.",
              xpModifier: -5,
              cpCost: 3,
              rapportEffect: -2,
            },
            {
              id: "wait-for-results",
              label: "Wait — The Lab Results Should Be Back Soon",
              description: "She's been anemic for months, a few more minutes won't matter",
              nextSceneId: "twist-wait-dangerous",
              isOptimal: false,
              feedback:
                "Dangerous thinking. An acutely decompensating anemic patient needs immediate assessment regardless of pending lab results. Chronic conditions can have acute-on-chronic deterioration.",
              xpModifier: -10,
              cpCost: 0,
              rapportEffect: -4,
            },
            {
              id: "attending-steps-in",
              label: "The attending steps in...",
              description: "Time ran out — the attending physician takes over",
              nextSceneId: "twist-stabilize",
              isOptimal: false,
              feedback:
                "You froze. In real life, hesitation in an acute situation can cost precious time. The attending stabilized Maria while you watched.",
              xpModifier: -15,
              cpCost: 0,
              rapportEffect: -3,
            },
          ],
        },
      },

      // ── Stabilization (optimal path) ──

      {
        id: "twist-stabilize",
        act: "twist",
        type: "narrative",
        narration:
          "You help Maria lie down on the exam table, elevate her legs, and quickly check her vitals. The nurse starts an IV line.",
        patientEmotion: "scared",
        illustrationPath: `${BETA_THAL_BASE}/scenes/twist-stabilize.png`,
        sound: { ambientMood: "tense", sfxOnReveal: SOUND_ASSETS.sfx.clueReveal },
        cluesRevealed: [
          {
            id: "acute-vitals",
            label: "Acute Vitals",
            value:
              "BP 95/60 mmHg (low), HR 118 bpm (tachycardic), O2 98% RA, Temp 37.1°C",
            type: "vital",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-optimal",
            text: "She's hemodynamically symptomatic — tachycardic, borderline hypotensive. This is likely acute decompensation of her chronic anemia. Maybe she was slowly compensating until a stressor pushed her over the edge. The good news? Your confirmatory test results just came back.",
            teachingPoint:
              "Chronic anemia patients compensate remarkably well until a tipping point. Watch for acute decompensation triggers: infection, dehydration, increased demand.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "resolution-results",
        },
      },

      // ── Code blue overreaction (suboptimal path) ──

      {
        id: "twist-code-overreaction",
        act: "twist",
        type: "narrative",
        narration:
          "The code team rushes in. Maria's eyes go wide with terror as a dozen healthcare workers surround her. After a rapid assessment, the team leader turns to you.",
        patientDialogue: "Oh my God, am I dying?! What's happening?!",
        patientEmotion: "scared",
        illustrationPath: `${BETA_THAL_BASE}/scenes/twist-code-overreaction.png`,
        sound: { ambientMood: "urgent" },
        cluesRevealed: [
          {
            id: "code-vitals",
            label: "Code Team Vitals",
            value:
              "BP 95/60 mmHg, HR 118 bpm, O2 98% RA. Patient is conscious, oriented, not in arrest.",
            type: "vital",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "The code team assessed her and found she's hemodynamically symptomatic but stable. This wasn't a code situation. The experience has been traumatic for Maria. In the future, start with rapid bedside assessment — ABCs, vitals, lay flat, IV access — before escalating.",
            teachingPoint:
              "Code Blue = cardiac arrest or imminent arrest. Symptomatic anemia = urgent, not emergent. Know the difference.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "resolution-results",
        },
      },

      // ── Dangerous wait (suboptimal path) ──

      {
        id: "twist-wait-dangerous",
        act: "twist",
        type: "narrative",
        narration:
          "You hesitate. Maria's head drops. The nurse rushing past notices and grabs you.",
        patientEmotion: "pain",
        illustrationPath: `${BETA_THAL_BASE}/scenes/twist-wait-dangerous.png`,
        sound: { ambientMood: "urgent" },
        cluesRevealed: [
          {
            id: "nurse-vitals",
            label: "Nurse's Vitals Check",
            value:
              "BP 88/55 mmHg, HR 125 bpm. Maria is pre-syncopal. IV started, legs elevated.",
            type: "vital",
            isKeyFinding: false,
          },
        ],
        mentorComments: [
          {
            timing: "after-suboptimal",
            text: "A nurse just saved your patient from hitting the floor. 'She's been anemic for months' is NEVER a reason to ignore acute decompensation. Chronic conditions can deteriorate acutely. Always assess and stabilize first, think second.",
            teachingPoint:
              "When a patient decompensates, stabilize FIRST — diagnostics can wait, hemodynamic collapse cannot.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "resolution-results",
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      //  ACT IV — THE RESOLUTION
      // ─────────────────────────────────────────────────────────────────────

      {
        id: "resolution-results",
        act: "resolution",
        type: "investigation",
        narration:
          "Maria has been stabilized with IV fluids. Color is returning to her face. Just then, the confirmatory test results arrive on your screen.",
        patientEmotion: "hopeful",
        illustrationPath: `${BETA_THAL_BASE}/scenes/resolution-results.png`,
        sound: {
          ambientMood: "hopeful",
          sfxOnEnter: SOUND_ASSETS.sfx.actTransition,
          sfxOnReveal: SOUND_ASSETS.sfx.clueReveal,
        },
        cluesRevealed: [
          {
            id: "hb-electrophoresis",
            label: "Hemoglobin Electrophoresis",
            value:
              "HbA: 65% (low, normal >95%). HbA2: 6.2% (elevated, normal <3.5%). HbF: 15% (elevated, normal <1%). Interpretation: consistent with Beta Thalassemia Intermedia.",
            type: "lab",
            isKeyFinding: true,
          },
        ],
        ddxUpdate: {
          shouldConsiderRemoving: [
            "Iron Deficiency Anemia",
            "Alpha Thalassemia",
            "Sickle Cell Disease",
            "Sideroblastic Anemia",
          ],
          expertDdxAtThisPoint: ["Beta Thalassemia"],
        },
        mentorComments: [
          {
            timing: "after-optimal",
            text: "There it is. Elevated HbA2 and HbF with decreased HbA. This confirms beta thalassemia. The severity — intermedia — means she has a clinically significant reduction in beta-globin chain production, but not complete absence (which would be major/transfusion-dependent).",
            teachingPoint:
              "HbA2 >3.5% is the hallmark of beta thalassemia. HbF elevation suggests compensatory gamma-globin production.",
          },
        ],
        interaction: {
          mode: "narrative-only",
          nextSceneId: "resolution-treatment",
        },
      },

      {
        id: "resolution-treatment",
        act: "resolution",
        type: "treatment",
        narration:
          "The diagnosis is clear: Beta Thalassemia Intermedia. Now you need to discuss the plan with Maria. She's looking at you, waiting for answers.",
        patientDialogue:
          "So... what does this mean for me, doctor? Is it serious? Can it be treated?",
        patientEmotion: "worried",
        illustrationPath: `${BETA_THAL_BASE}/scenes/resolution-treatment.png`,
        sound: { ambientMood: "hopeful" },
        cluesRevealed: [],
        mentorComments: [
          {
            timing: "before-decision",
            text: "Treatment of thalassemia intermedia is mainly supportive. Think about what this patient needs right now and long-term.",
          },
        ],
        interaction: {
          mode: "choices",
          prompt: "What is your initial management plan for Maria?",
          options: [
            {
              id: "supportive-plan",
              label: "Folic Acid, Monitoring, Genetic Counseling",
              description:
                "Start folic acid supplementation, schedule regular follow-up for CBC monitoring, and refer for genetic counseling",
              nextSceneId: "resolution-reveal",
              isOptimal: true,
              feedback:
                "Perfect management for thalassemia intermedia. Folic acid supports the increased erythropoiesis. Regular monitoring watches for complications. Genetic counseling helps Maria understand her condition and its implications for future family planning.",
              xpModifier: 15,
              cpCost: 2,
              rapportEffect: 3,
            },
            {
              id: "chelation-now",
              label: "Start Iron Chelation Therapy Immediately",
              description:
                "Begin deferoxamine or deferasirox to address iron overload",
              nextSceneId: "resolution-reveal",
              isOptimal: false,
              feedback:
                "Iron chelation may eventually be needed, but only AFTER documented iron overload (ferritin >1000 ng/mL or liver iron >5 mg/g). Maria's ferritin was normal. Starting chelation now would be premature and potentially harmful.",
              xpModifier: -5,
              cpCost: 4,
              rapportEffect: -1,
            },
            {
              id: "chronic-transfusion",
              label: "Start a Chronic Transfusion Program",
              description:
                "Schedule regular blood transfusions every 3-4 weeks",
              nextSceneId: "resolution-reveal",
              isOptimal: false,
              feedback:
                "Chronic transfusions are reserved for thalassemia MAJOR (transfusion-dependent). Maria has intermedia — she maintains a baseline hemoglobin without regular transfusions. Unnecessary transfusions would accelerate iron overload.",
              xpModifier: -10,
              cpCost: 6,
              rapportEffect: -2,
            },
          ],
        },
      },

      // ── Diagnosis reveal (the grand finale) ──

      {
        id: "resolution-reveal",
        act: "resolution",
        type: "diagnosis",
        narration:
          "You explain the diagnosis to Maria clearly and compassionately. Relief washes over her face — for the first time, she understands why she's been feeling this way her whole life.",
        patientDialogue:
          "Thank you, doctor. I finally understand what my family has been dealing with. It feels good to finally have an answer... and to know it can be managed.",
        patientEmotion: "grateful",
        illustrationPath: `${BETA_THAL_BASE}/scenes/resolution-reveal.png`,
        sound: {
          ambientMood: "dramatic",
          sfxOnEnter: SOUND_ASSETS.sfx.characterUnlock,
        },
        cluesRevealed: [],
        interaction: {
          mode: "diagnosis-reveal",
        },
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getCaseById(id: string): ClinicalCase | undefined {
  return clinicalCases.find((c) => c.id === id);
}

export function getCasesByCategory(category: string): ClinicalCase[] {
  return clinicalCases.filter((c) => c.category === category);
}

export function getCasesByDifficulty(
  difficulty: ClinicalCase["difficulty"]
): ClinicalCase[] {
  return clinicalCases.filter((c) => c.difficulty === difficulty);
}

export function getAllCaseCategories(): string[] {
  return [...new Set(clinicalCases.map((c) => c.category))];
}

/**
 * Strips professor-only data from a case for the student-facing player.
 * CRITICAL: Call this in the server component before passing to client.
 */
export function stripProfessorData(caseData: ClinicalCase): ClinicalCase {
  return {
    ...caseData,
    teachingNotes: "",
    answerKey: {
      optimalPath: [],
      optimalCpSpent: 0,
      diagnosis: "", // revealed through the diagnosis-reveal scene interaction
      keyFindings: [],
      expertDdxEvolution: [],
    },
    scenes: caseData.scenes.map((scene) => ({
      ...scene,
      // Remove professor-only mentor comments
      mentorComments: scene.mentorComments?.filter(
        (mc) => mc.timing === "before-decision"
      ),
      // Remove optimal/suboptimal markers from options
      interaction:
        scene.interaction.mode === "choices" ||
        scene.interaction.mode === "timed-choice"
          ? {
              ...scene.interaction,
              options: scene.interaction.options.map((opt) => ({
                ...opt,
                isOptimal: false, // hide from student
                feedback: undefined, // hide from student
              })),
            }
          : scene.interaction,
      // Remove expert DDx data
      ddxUpdate: scene.ddxUpdate
        ? {
            ...scene.ddxUpdate,
            expertDdxAtThisPoint: [],
          }
        : undefined,
    })),
  };
}
