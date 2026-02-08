import type { ExamChain, VideoSegment, SceneOverlay } from "./VideoChainPlayer";
import type { ExamType } from "./VideoChainPlayer";

export type { ExamType };

export const EXAM_TYPES: ExamType[] = ["manual-bp", "cardiac", "thoracic"];

export const EXAM_COPY: Record<
  string,
  { title: string; description: string; category: string }
> = {
  "manual-bp": {
    title: "Manual Blood Pressure Examination",
    description:
      "Practice accurate manual blood pressure measurement with Italian medical language.",
    category: "vital-signs",
  },
  cardiac: {
    title: "Cardiac Examination",
    description:
      "Master cardiac auscultation and examination skills with interactive video walkthrough.",
    category: "cardiac",
  },
  thoracic: {
    title: "Thoracic Examination Essentials",
    description:
      "Follow the inspection, palpation, and auscultation flow end to end.",
    category: "thoracic",
  },
};

/* ------------------------------------------------------------------ */
/*  Raw internal types – matches the authored data format               */
/* ------------------------------------------------------------------ */

interface RawScene {
  timestamp: number;
  duration?: number;
  type: string;
  xpReward?: number;
  tip?: { title: string; content: string; position?: string; pauseVideo?: boolean };
  question?: {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit?: number;
    xpReward?: number;
    pauseVideo?: boolean;
  };
  subtitle?: { text: string; textItalian?: string; position?: string; style?: string };
  picture?: { imageUrl: string; alt: string; position?: string; width?: string };
  sideVideo?: { videoUrl: string; position?: string; width?: string; muted?: boolean; autoPlay?: boolean };
}

interface RawPausePoint {
  timestamp: number;
  type: string;
  tip?: { title: string; content: string; position?: string; pauseVideo?: boolean };
  question?: {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit?: number;
    xpReward?: number;
    pauseVideo?: boolean;
  };
}

interface RawSegment {
  id: string;
  videoUrl: string;
  duration: number;
  xpReward?: number;
  sourceStartTime?: number;
  sourceEndTime?: number;
  scenes?: RawScene[];
  pausePoints?: RawPausePoint[];
}

interface RawExamChain {
  examType: string;
  segments: RawSegment[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Turn a segment id like "cardiac-prep-positioning" into "Prep & Positioning" */
function humanizeSegmentId(id: string): string {
  // Strip exam-type prefix (everything before the first hyphen group)
  const withoutPrefix = id.replace(/^[a-z]+-/, "");
  return withoutPrefix
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Build SceneOverlay[] from raw scenes + pausePoints */
function buildOverlays(raw: RawSegment): SceneOverlay[] | undefined {
  const overlays: SceneOverlay[] = [];
  let idx = 0;

  // --- Transform scenes ---
  for (const scene of raw.scenes ?? []) {
    if (scene.type === "tip" && scene.tip) {
      overlays.push({
        id: `${raw.id}-s-${idx++}`,
        atTime: scene.timestamp,
        kind: "tip",
        title: scene.tip.title,
        body: scene.tip.content,
        // If pauseVideo is set, don't auto-dismiss (user must dismiss manually)
        autoDismissSeconds: scene.tip.pauseVideo ? undefined : (scene.duration && scene.duration > 0 ? scene.duration : undefined),
      });
    } else if (scene.type === "question" && scene.question) {
      const q = scene.question;
      overlays.push({
        id: `${raw.id}-s-${idx++}`,
        atTime: scene.timestamp,
        kind: "question",
        title: q.question,
        body: q.question,
        answers: q.options.map((opt, i) => ({
          id: `${raw.id}-s-${idx - 1}-a${i}`,
          label: opt,
          correct: i === q.correctAnswer,
        })),
      });
    }
    // Subtitles, pictures, sideVideos are skipped – they need dedicated rendering
  }

  // --- Transform pausePoints ---
  for (const pp of raw.pausePoints ?? []) {
    if (pp.type === "tip" && pp.tip) {
      overlays.push({
        id: `${raw.id}-p-${idx++}`,
        atTime: pp.timestamp,
        kind: "tip",
        title: pp.tip.title,
        body: pp.tip.content,
        // pausePoints tips are always manual-dismiss (substantial content)
      });
    } else if (pp.type === "question" && pp.question) {
      const q = pp.question;
      overlays.push({
        id: `${raw.id}-p-${idx++}`,
        atTime: pp.timestamp,
        kind: "question",
        title: q.question,
        body: q.question,
        answers: q.options.map((opt, i) => ({
          id: `${raw.id}-p-${idx - 1}-a${i}`,
          label: opt,
          correct: i === q.correctAnswer,
        })),
      });
    }
  }

  return overlays.length > 0 ? overlays : undefined;
}

/** Convert a RawSegment into a VideoSegment */
function transformSegment(raw: RawSegment): VideoSegment {
  return {
    id: raw.id,
    label: humanizeSegmentId(raw.id),
    src: raw.videoUrl,
    durationHint: raw.duration,
    overlays: buildOverlays(raw),
    sourceStartTime: raw.sourceStartTime,
    sourceEndTime: raw.sourceEndTime,
  };
}

/* ------------------------------------------------------------------ */
/*  Raw exam chain data                                                 */
/* ------------------------------------------------------------------ */

const RAW_CHAINS: Record<string, RawExamChain> = {
  thoracic: {
    examType: "thoracic",
    segments: [
      {
        id: "thoracic-intro",
        videoUrl: "/placeholder-thoracic-intro.mp4",
        duration: 30,
        xpReward: 15,
        scenes: [
          { timestamp: 5, duration: 3, type: "subtitle", subtitle: { text: "Introduction to Thoracic Examination", position: "bottom", style: "default" } },
          { timestamp: 10, duration: 5, type: "tip", tip: { title: "Inspection First", content: "Always start with inspection. Look for visible deformities, asymmetry, or signs of respiratory distress.", position: "top" }, xpReward: 5 },
          { timestamp: 15, type: "picture", duration: 4, picture: { imageUrl: "/placeholder-anatomy.jpg", alt: "Chest anatomy diagram", position: "top-right", width: "300px" } },
          { timestamp: 20, type: "question", duration: 0, question: { question: "What should you look for during inspection of the chest?", options: ["Symmetry and deformities", "Heart sounds only", "Blood pressure", "Temperature"], correctAnswer: 0, timeLimit: 30, xpReward: 10, pauseVideo: true } },
        ],
      },
      {
        id: "thoracic-palpation",
        videoUrl: "/placeholder-thoracic-palpation.mp4",
        duration: 45,
        xpReward: 20,
        scenes: [
          { timestamp: 5, type: "subtitle", duration: 2, subtitle: { text: "Palpation Technique", position: "bottom" } },
          { timestamp: 10, type: "sideVideo", duration: 20, sideVideo: { videoUrl: "/placeholder-closeup.mp4", position: "right", width: "35%", muted: true, autoPlay: true } },
          { timestamp: 15, duration: 5, type: "tip", tip: { title: "Palpation Technique", content: "Use the palms of your hands to assess chest expansion. Ask the patient to take a deep breath.", position: "top" }, xpReward: 5 },
          { timestamp: 35, type: "question", duration: 0, question: { question: "What is the normal chest expansion range?", options: ["1-2 cm", "3-5 cm", "6-8 cm", "10-12 cm"], correctAnswer: 1, timeLimit: 25, xpReward: 10, pauseVideo: true } },
        ],
      },
      {
        id: "thoracic-auscultation",
        videoUrl: "/placeholder-thoracic-auscultation.mp4",
        duration: 60,
        xpReward: 25,
        scenes: [
          { timestamp: 5, type: "subtitle", duration: 3, subtitle: { text: "Auscultation - Listen Carefully", position: "bottom", style: "highlight" } },
          { timestamp: 20, duration: 5, type: "tip", tip: { title: "Auscultation Pattern", content: "Listen systematically: anterior, posterior, and lateral. Compare side to side.", position: "center" }, xpReward: 5 },
          { timestamp: 30, type: "picture", duration: 8, picture: { imageUrl: "/placeholder-lung-fields.jpg", alt: "Lung fields diagram", position: "bottom-left", width: "250px" } },
          { timestamp: 45, type: "question", duration: 0, question: { question: "How many lung fields should you auscultate?", options: ["2 fields", "4 fields", "6 fields", "8 fields"], correctAnswer: 3, timeLimit: 30, xpReward: 15, pauseVideo: true } },
        ],
      },
    ],
  },
  cardiac: {
    examType: "cardiac",
    segments: [
      {
        id: "cardiac-prep-positioning", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 0, sourceEndTime: 8.28, duration: 8.28, xpReward: 10, scenes: [],
        pausePoints: [
          { timestamp: 8.18, type: "tip", tip: { title: "Prep & Positioning", content: "- Hand hygiene, introductions, ID check, and consent.\n- Raise the bed to roughly a 30-45 degree semi-recumbent angle.\n- Expose only the chest; keep the rest covered so the patient stays warm and respected.\n- Quiet room, warm stethoscope, minimal clothing noise.\n- Let the patient know you'll examine the legs and feet later to look for edema.", position: "center", pauseVideo: true } },
          { timestamp: 8.18, type: "question", question: { question: "Which initial step is MOST important before beginning the cardiac exam?", options: ["Immediately placing the stethoscope on the chest", "Confirming patient identity and gaining consent", "Asking about family history of heart disease", "Checking blood pressure"], correctAnswer: 1, timeLimit: 30, pauseVideo: true } },
          { timestamp: 8.18, type: "question", question: { question: "What is the recommended bed position for examining the heart?", options: ["0 degrees (fully flat)", "30-45 degree incline", "90 degrees (sitting upright)", "Prone (lying face down)"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 8.18, type: "question", question: { question: "Why should the patient lift their shirt yet remain covered elsewhere?", options: ["To warm them up", "To expose the chest for auscultation while preserving modesty", "Listening through clothing is fine so exposure is optional", "To check for chest tattoos"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-four-areas-pass1", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 8.28, sourceEndTime: 27.25, duration: 18.97, xpReward: 15,
        scenes: [
          { timestamp: 5.88, type: "subtitle", subtitle: { text: "Aortic area \u00b7 2nd ICS right sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 9.72, type: "subtitle", subtitle: { text: "Pulmonic area \u00b7 2nd ICS left sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 12.72, type: "subtitle", subtitle: { text: "Tricuspid area \u00b7 4th ICS lower left sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 16, type: "subtitle", subtitle: { text: "Mitral area (apex) \u00b7 5th ICS mid-clavicular line", position: "bottom", style: "highlight" }, duration: 3 },
        ],
        pausePoints: [
          { timestamp: 18.87, type: "tip", tip: { title: "Stay Systematic", content: "- Follow the same order every time (A->P->T->M).\n- Start with the diaphragm for high-pitched S1/S2, add the bell later for low-pitched sounds.\n- Listen for at least one to two full cycles in each spot; longer if something seems off.\n- Brief end-expiration can reduce lung noise if the patient is comfortable.\n- Re-landmark ribs and sternal borders if placement feels unsure.", position: "center", pauseVideo: true } },
          { timestamp: 18.87, type: "question", question: { question: "Which heart sound is best heard at the mitral (apex) area?", options: ["S2 only", "S1 only", "Both S1 and S2 (often with S1 louder)", "Neither; only murmurs are heard there"], correctAnswer: 2, timeLimit: 30, pauseVideo: true } },
          { timestamp: 18.87, type: "question", question: { question: "Why does the trainee palpate the carotid pulse while listening?", options: ["To distract the patient", "To measure blood pressure manually", "To time the first heart sound (S1) with the pulse", "It is unnecessary during a cardiac exam"], correctAnswer: 2, timeLimit: 25, pauseVideo: true } },
          { timestamp: 18.87, type: "question", question: { question: "What part of the stethoscope is used first for heart auscultation, and why?", options: ["Bell, because it detects high-pitched sounds", "Diaphragm, because it detects high-pitched sounds (S1, S2)", "Bell, because it detects low-pitched sounds like S3", "End of the tube; it does not matter"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 18.87, type: "question", question: { question: "The trainee reports no abnormal sounds at the pulmonary area. Which valve is located there?", options: ["Aortic valve", "Mitral valve", "Pulmonary valve", "Tricuspid valve"], correctAnswer: 2, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-auscultation-with-pulse", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 27.25, sourceEndTime: 40.16, duration: 12.91, xpReward: 15,
        scenes: [{ timestamp: 0, type: "subtitle", subtitle: { text: "Radial pulse palpated while auscultating - sync sounds with beats", position: "bottom", style: "default" }, duration: 4 }],
        pausePoints: [
          { timestamp: 12.81, type: "tip", tip: { title: "Pair Auscultation + Pulse", content: "- Use the radial (or carotid) pulse to time systole and confirm the rate and rhythm.\n- Watch for a pulse deficit (more heart sounds than palpable beats) - think arrhythmia.\n- If the rhythm feels irregular, listen longer and consider an apical-radial comparison.\n- Use index and middle fingers, not the thumb, and apply gentle pressure.\n- Count at least 15-30 seconds (full minute if irregular).", position: "center", pauseVideo: true } },
          { timestamp: 12.81, type: "question", question: { question: "Why is it important to palpate the radial pulse during heart auscultation?", options: ["To count respirations", "To confirm that each heartbeat heard matches a pulse wave", "Pulse and heart sounds are independent", "To measure blood pressure directly"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 12.81, type: "question", question: { question: "What does a pulse deficit suggest (fewer palpable beats than heart sounds)?", options: ["Normal finding in everyone", "Possible arrhythmia such as atrial fibrillation or frequent ectopy", "Too much wrist pressure", "The stethoscope is misplaced"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 12.81, type: "question", question: { question: "Which of the following is NOT a common site to check peripheral pulses?", options: ["Radial artery at the wrist", "Dorsalis pedis on the foot", "Popliteal artery behind the knee", "All are common sites"], correctAnswer: 3, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-four-areas-pass2", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 40.16, sourceEndTime: 57.22, duration: 17.06, xpReward: 15,
        scenes: [
          { timestamp: 4.85, type: "subtitle", subtitle: { text: "Aortic area \u00b7 2nd ICS right sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 8.02, type: "subtitle", subtitle: { text: "Pulmonic area \u00b7 2nd ICS left sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 11.12, type: "subtitle", subtitle: { text: "Tricuspid area \u00b7 4th ICS lower left sternal border", position: "bottom", style: "highlight" }, duration: 3 },
          { timestamp: 14.04, type: "subtitle", subtitle: { text: "Mitral area (apex) \u00b7 5th ICS mid-clavicular line", position: "bottom", style: "highlight" }, duration: 3 },
        ],
        pausePoints: [
          { timestamp: 16.96, type: "tip", tip: { title: "Second Pass Insights", content: "- A different viewing angle can reveal subtle findings.\n- Stay consistent with the A->P->T->M order for every pass.\n- If something is borderline, re-check placement and listen longer.\n- Advanced maneuvers: left lateral decubitus for apex lows, sit forward with end-expiration for early diastolic sounds along the left sternal border.", position: "center", pauseVideo: true } },
          { timestamp: 16.96, type: "question", question: { question: "Which maneuver accentuates an early diastolic murmur of aortic regurgitation?", options: ["Mitral stenosis position", "Sitting forward with full exhalation", "Pulmonary stenosis maneuver", "Tricuspid regurgitation maneuver"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 16.96, type: "question", question: { question: "Which stethoscope position best hears a mitral stenosis murmur?", options: ["Aortic area with diaphragm", "Mitral area (apex) with bell during expiration", "Pulmonic area with diaphragm", "Tricuspid area with diaphragm"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 16.96, type: "question", question: { question: "In a normal exam, what should you hear at each valve area?", options: ["Only S1 at mitral, only S2 at aortic, nothing elsewhere", "S1 and S2 at every site; S1 tends louder at apex, S2 louder at the base", "No sounds at the pulmonary area", "A continuous bruit"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-edema-history", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 57.22, sourceEndTime: 60.25, duration: 3.03, xpReward: 10, scenes: [],
        pausePoints: [
          { timestamp: 2.93, type: "tip", tip: { title: "Ask About Swelling", content: "- Clarify ankle/leg swelling, timing, and symmetry.\n- Screen for orthopnea, paroxysmal nocturnal dyspnea, and rapid weight gain.\n- Remember meds (e.g., certain calcium channel blockers) and salt intake can drive edema.\n- Bilateral swelling suggests systemic causes; unilateral swelling points to local issues like DVT or cellulitis.", position: "center", pauseVideo: true } },
          { timestamp: 2.93, type: "question", question: { question: "Why did the trainee ask about swelling in the legs or feet?", options: ["It is a standard social question", "To assess for signs of right heart failure (pedal edema)", "Patients with edema are allergic to stethoscopes", "She plans to check shoes for damage"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 2.93, type: "question", question: { question: "Which finding suggests bilateral edema due to heart failure rather than a localized issue?", options: ["Swelling in one foot only", "Swelling that moves up both legs symmetrically", "Redness and pain in one calf only", "Fingernail clubbing"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 2.93, type: "question", question: { question: "What type of edema leaves a pit (indentation) when pressed?", options: ["Non-pitting edema", "Pitting edema", "Cerebral edema", "Pulmonary edema"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-remove-shoes", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 60.25, sourceEndTime: 69.05, duration: 8.8, xpReward: 10, scenes: [],
        pausePoints: [
          { timestamp: 8.7, type: "tip", tip: { title: "Inspect Feet & Ankles", content: "- Remove shoes and socks to look directly for edema, skin changes, and ulcers.\n- Compare both sides; inspect from multiple angles.\n- Palpate dorsalis pedis (top of foot) and posterior tibial (behind medial malleolus) pulses.\n- Press over the shin/ankle for 5-10 seconds to test for pitting.\n- Note color, temperature, hair distribution, venous patterns, and any clubbing or cyanosis.", position: "center", pauseVideo: true } },
          { timestamp: 8.7, type: "question", question: { question: "Why should the patient remove shoes during a cardiac exam?", options: ["To check foot fungus", "To inspect ankles/feet for edema, pulses, and other signs", "Feet are not part of a cardiac exam", "To make the patient more comfortable"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 8.7, type: "question", question: { question: "Which pulse is felt on the top of the foot?", options: ["Femoral pulse", "Brachial pulse", "Radial pulse", "Dorsalis pedis pulse"], correctAnswer: 3, timeLimit: 25, pauseVideo: true } },
          { timestamp: 8.7, type: "question", question: { question: "Clubbing of the toes (rounded nail beds) is most associated with:", options: ["Chronic lung disease or cyanotic congenital heart disease", "Acute heart failure", "Pitting edema", "Venous insufficiency only"], correctAnswer: 0, timeLimit: 25, pauseVideo: true } },
        ],
      },
      {
        id: "cardiac-edema-exam", videoUrl: "/videos/hls/CardiacModuleVideo/master.m3u8",
        sourceStartTime: 69.05, sourceEndTime: 72.7, duration: 3.65, xpReward: 10, scenes: [],
        pausePoints: [
          { timestamp: 3.55, type: "tip", tip: { title: "Checking for Pitting Edema", content: "- Press over the shin and ankle for 5-10 seconds; look for a lasting indentation.\n- Grade edema (1+ to 4+) by depth and rebound time, and document symmetry.\n- In bedbound patients also inspect the sacrum for hidden fluid pooling.\n- Correlate with symptoms and daily weight trends before wrapping up the exam.", position: "center", pauseVideo: true } },
          { timestamp: 3.55, type: "question", question: { question: "Pressing the shin and ankle to test for pitting edema is done to assess:", options: ["Muscle strength", "Fluid retention (edema)", "Bone density", "Skin sensitivity"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 3.55, type: "question", question: { question: "Which condition is most likely to cause non-pitting edema in the legs?", options: ["Congestive heart failure", "Hypothyroidism (myxedema)", "Pulmonary embolism", "Bilateral deep vein thrombosis"], correctAnswer: 1, timeLimit: 25, pauseVideo: true } },
          { timestamp: 3.55, type: "question", question: { question: "What is the primary reason to inspect the sacral area in a hospitalized patient?", options: ["To assess lumbar mobility", "To check solely for pressure ulcers", "To detect pitting edema that may accumulate when lying flat", "It is not typically examined"], correctAnswer: 2, timeLimit: 25, pauseVideo: true } },
        ],
      },
    ],
  },
  "manual-bp": {
    examType: "manual-bp",
    segments: [
      { id: "bp-pre-examination-checklist", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 0, sourceEndTime: 2.13, duration: 2.13, xpReward: 5, scenes: [
        { timestamp: 0, type: "tip", duration: 0, tip: { title: "Pre-Examination Checklist", content: "Before measuring BP, ensure: (1) Patient has rested for 5 minutes, (2) No caffeine or exercise in last 30 minutes, (3) Patient has empty bladder, (4) Patient is seated comfortably with back supported, (5) Feet flat on floor, (6) No talking during measurement. These conditions ensure accurate readings.", position: "center", pauseVideo: true }, xpReward: 5 },
        { timestamp: 0, type: "question", duration: 0, question: { question: "How long should a patient rest before measuring blood pressure?", options: ["1 minute", "3 minutes", "5 minutes", "10 minutes"], correctAnswer: 2, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-intro-consent", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 2.13, sourceEndTime: 5.13, duration: 3, xpReward: 5, scenes: [
        { timestamp: 0, type: "subtitle", duration: 2, subtitle: { textItalian: "Ora testeremo la pressione sanguigna", text: "Now we will test the blood pressure", position: "bottom", style: "default" } },
        { timestamp: 2, type: "question", duration: 0, question: { question: "How do you say 'blood pressure' in Italian?", options: ["Pressione sanguigna", "Pressione arteriosa", "Pressione del sangue", "Pressione corporea"], correctAnswer: 0, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-intro-consent-angles", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 5.13, sourceEndTime: 8.13, duration: 3, xpReward: 5, scenes: [
        { timestamp: 0, type: "subtitle", duration: 3, subtitle: { textItalian: "Ripetiamo la frase con un'altra angolazione", text: "Let's repeat the Italian consent from another angle", position: "bottom" } },
        { timestamp: 1.5, type: "tip", duration: 1.5, tip: { title: "Repetition Builds Fluency", content: "Use this quick replay to shadow the Italian sentence and observe posture, hand placement, and patient cues.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-raising-sleeve", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 8.13, sourceEndTime: 11.24, duration: 3.11, xpReward: 5, scenes: [
        { timestamp: 0, type: "subtitle", duration: 3, subtitle: { textItalian: "Va bene se ti alzo la manica?", text: "Is it okay if I raise your sleeve?", position: "bottom", style: "default" } },
        { timestamp: 1.5, type: "tip", duration: 1.5, tip: { title: "\u26a0\ufe0f Common Mistake Warning", content: "Never measure BP over clothing! Always place the cuff directly on the skin. Clothing can cause inaccurate readings and prevent proper cuff placement over the brachial artery.", position: "top" }, xpReward: 5 },
        { timestamp: 3, type: "question", duration: 0, question: { question: "What is a normal blood pressure value for a male adult?", options: ["90/60 mmHg", "120/80 mmHg", "140/90 mmHg", "160/100 mmHg"], correctAnswer: 1, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-raising-sleeve-2", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 11.24, sourceEndTime: 15.03, duration: 3.79, xpReward: 5, scenes: [
        { timestamp: 0, type: "subtitle", duration: 3, subtitle: { textItalian: "Va bene se ti alzo la manica?", text: "Is it okay if I raise your sleeve?", position: "bottom", style: "default" } },
      ]},
      { id: "bp-putting-on-patient", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 15.03, sourceEndTime: 26.16, duration: 11.13, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 3, tip: { title: "Patient Positioning", content: "Ensure patient positioning: back supported, feet flat on floor, arm relaxed and supported at heart level. Poor positioning can cause inaccurate readings. Arm should be at the same level as the heart (mid-sternum level).", position: "top" }, xpReward: 5 },
        { timestamp: 3, type: "tip", duration: 5, tip: { title: "Cuff at Heart Level", content: "The pressure cuff must be positioned at the same level as the heart to ensure accurate readings. This eliminates the effect of hydrostatic pressure. We use a manual (non-electric) sphygmomanometer for this test, which requires proper technique for accurate results.", position: "top" }, xpReward: 5 },
        { timestamp: 9, type: "tip", duration: 2, tip: { title: "The Dial (Manometer)", content: "The dial shows the pressure in millimeters of mercury (mmHg). We use mmHg because mercury was historically used in pressure measurement devices. The dial should be positioned so you can easily read it while operating the pump.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-putting-on-patient-2", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 26.16, sourceEndTime: 35.06, duration: 8.9, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 4, tip: { title: "Proper Cuff Positioning", content: "Position the cuff correctly based on the triangle area of the arm. The cuff should be placed over the brachial artery, approximately 2-3 cm above the antecubital fossa. The cuff should be snug but not too tight - you should be able to fit two fingers between the cuff and the arm. The bladder inside the cuff should encircle at least 80% of the arm circumference.", position: "top" }, xpReward: 5 },
        { timestamp: 4, type: "tip", duration: 4, tip: { title: "\u26a0\ufe0f Common Mistake: Wrong Cuff Size", content: "Using wrong cuff size causes errors: Too small cuff = falsely HIGH reading. Too large cuff = falsely LOW reading. Always check cuff size matches arm circumference. For large arms, use a large adult cuff. Standard adult cuff fits arms 22-32 cm circumference.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-correct-position", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 35.06, sourceEndTime: 37.09, duration: 2.03, xpReward: 5, scenes: [
        { timestamp: 0, type: "tip", duration: 2, tip: { title: "Final Cuff Position Check", content: "Verify the cuff is positioned correctly: centered over the brachial artery, at heart level, and snug but not constricting. The lower edge should be 2-3 cm above the antecubital fossa.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-closing-valve", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 37.09, sourceEndTime: 40, duration: 2.91, xpReward: 5, scenes: [
        { timestamp: 0, type: "tip", duration: 2, tip: { title: "The Valve and Pump", content: "Before inflating, ensure the valve is fully closed. The valve controls the rate of deflation - closing it completely allows you to pump air into the cuff. The pump is used to inflate the cuff, and you'll use the valve to control deflation rate when listening for Korotkoff sounds.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-closing-valve-and-pumping", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 40, sourceEndTime: 46.27, duration: 6.27, xpReward: 5, scenes: [
        { timestamp: 0, type: "tip", duration: 6, tip: { title: "Closing Valve and Pumping", content: "Close the valve completely and begin pumping. Pump smoothly and steadily until you reach approximately 180 mmHg (or 30 mmHg above the expected systolic pressure). Watch the dial carefully as you pump.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-positioning-steth", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 46.27, sourceEndTime: 52, duration: 5.73, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 5, tip: { title: "Stethoscope Placement", content: "Place the stethoscope under the cuff, directly over the brachial artery. This position allows you to hear the Korotkoff sounds clearly. Different types of blood flow occur at different pressures - laminar flow becomes turbulent as the cuff pressure decreases, creating the sounds we listen for. You'll hear heartbeats at different points in time as the pressure changes.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-positioning-steth-2", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 52, sourceEndTime: 57.23, duration: 5.23, xpReward: 5, scenes: [
        { timestamp: 0, type: "tip", duration: 5, tip: { title: "Stethoscope Technique", content: "Use the bell or diaphragm of the stethoscope with light pressure. Ensure good contact with the skin but don't press too hard. The bell is better for low-frequency sounds like Korotkoff sounds. Make sure the earpieces are angled forward in your ears for optimal sound transmission.", position: "top" }, xpReward: 5 },
      ]},
      { id: "bp-pumping-to-180", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 57.23, sourceEndTime: 66.24, duration: 9.01, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 4, tip: { title: "Why Pump to 180 mmHg?", content: "We pump to 180 mmHg (or 30 mmHg above the expected systolic pressure) to ensure we start well above the systolic pressure. This ensures we don't miss the first Korotkoff sound. As we deflate, the cuff pressure decreases. When cuff pressure equals systolic pressure, blood first flows through the artery (Phase I - first sound). When cuff pressure drops below diastolic pressure, flow becomes continuous and sounds disappear (Phase V - diastolic reading).", position: "top" }, xpReward: 5 },
        { timestamp: 4, type: "tip", duration: 5, tip: { title: "\u26a0\ufe0f CRITICAL: Deflation Rate", content: "Deflate at 2-3 mmHg per second (about 1-2 mmHg per heartbeat). Too fast = inaccurate readings (miss sounds). Too slow = patient discomfort and venous congestion. Watch the dial carefully and control the valve smoothly. This is one of the most common sources of measurement errors!", position: "top" }, xpReward: 5 },
        { timestamp: 0, type: "sideVideo", duration: 9, sideVideo: { videoUrl: "/videos/hls/BPClosingValveandBumpingTo180/master.m3u8", position: "right", width: "40%", muted: false, autoPlay: true } },
      ]},
      { id: "bp-review-and-knowledge-check", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 57.23, sourceEndTime: 66.24, duration: 1, xpReward: 20, scenes: [
        { timestamp: 0, type: "question", duration: 0, question: { question: "What happens when the cuff pressure equals the systolic blood pressure?", options: ["Blood flow stops completely", "Blood first flows through the artery (first Korotkoff sound)", "The dial stops moving", "The valve opens automatically"], correctAnswer: 1, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-knowledge-check-2", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 57.23, sourceEndTime: 66.24, duration: 1, xpReward: 20, scenes: [
        { timestamp: 0, type: "question", duration: 0, question: { question: "Why do we position the cuff at heart level?", options: ["For patient comfort", "To eliminate hydrostatic pressure effects", "To make it easier to read", "Because it's the standard position"], correctAnswer: 1, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-clinical-knowledge", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 57.23, sourceEndTime: 66.24, duration: 1, xpReward: 25, scenes: [
        { timestamp: 0, type: "question", duration: 0, question: { question: "What is the Italian term for 'sphygmomanometer'?", options: ["Stetoscopio", "Sfigmomanometro", "Misuratore di pressione", "Monitor cardiaco"], correctAnswer: 1, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-clinical-reasoning", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 57.23, sourceEndTime: 66.24, duration: 1, xpReward: 15, scenes: [
        { timestamp: 0, type: "question", duration: 0, question: { question: "What does a difference of >10 mmHg between arms suggest?", options: ["Normal variation", "Possible arterial obstruction or anatomical variation", "Measurement error", "Patient anxiety"], correctAnswer: 1, timeLimit: 30, xpReward: 15, pauseVideo: true } },
      ]},
      { id: "bp-final-measurement", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 66.24, sourceEndTime: 90.74, duration: 24.5, xpReward: 25, scenes: [
        { timestamp: 0, type: "subtitle", duration: 3, subtitle: { text: "Listen carefully to when the heartbeat becomes audible, and when it stops being audible. Watch the dial carefully.", position: "bottom", style: "highlight" } },
        { timestamp: 15, type: "tip", duration: 3, tip: { title: "\u26a0\ufe0f Troubleshooting: Can't Hear Sounds?", content: "If you can't hear Korotkoff sounds: (1) Check stethoscope placement over brachial artery, (2) Ensure good skin contact, (3) Increase pressure higher (up to 200-220 mmHg), (4) Check stethoscope earpieces are properly fitted, (5) Ensure quiet environment. Sometimes auscultatory gap occurs - sounds disappear then reappear.", position: "top" }, xpReward: 5 },
        { timestamp: 20, type: "tip", duration: 3, tip: { title: "Remember", content: "Systolic pressure is when you first hear Korotkoff sounds. Diastolic pressure is when the sounds disappear. Watch and listen carefully!", position: "top" }, xpReward: 5 },
        { timestamp: 23, type: "question", duration: 0, question: { question: "Based on what you heard and saw in the video, what was this patient's blood pressure reading?", options: ["110/70 mmHg", "120/80 mmHg", "130/90 mmHg", "140/100 mmHg"], correctAnswer: 1, timeLimit: 45, xpReward: 20, pauseVideo: true } },
      ]},
      { id: "bp-clinical-interpretation", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 66.24, sourceEndTime: 90.74, duration: 1, xpReward: 15, scenes: [
        { timestamp: 0, type: "tip", duration: 0, tip: { title: "Blood Pressure Classification (2024 Guidelines)", content: "Normal: <120/<80 mmHg | Elevated: 120-129/<80 mmHg | Stage 1 Hypertension: 130-139/80-89 mmHg | Stage 2 Hypertension: >=140/>=90 mmHg | Hypertensive Crisis: >180/>120 mmHg. The reading 120/80 mmHg is NORMAL. For elevated or higher readings, repeat measurement, check both arms, and consider lifestyle modifications or medication.", position: "center" }, xpReward: 5 },
        { timestamp: 0, type: "question", duration: 0, question: { question: "What category does a reading of 120/80 mmHg fall into?", options: ["Normal", "Elevated", "Stage 1 Hypertension", "Stage 2 Hypertension"], correctAnswer: 0, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-documentation", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 66.24, sourceEndTime: 90.74, duration: 1, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 0, tip: { title: "Proper Documentation", content: "Always document: BP value, arm used (right/left), patient position (seated/standing/lying), and cuff size if non-standard. Example: 'BP: 120/80 mmHg, right arm, seated' or 'BP: 135/85 mmHg, left arm, seated, large cuff'. If auscultatory gap present, document it. Multiple readings? Document all and average if needed.", position: "center" }, xpReward: 5 },
        { timestamp: 0, type: "question", duration: 0, question: { question: "How should you document a BP reading of 120/80 taken on the right arm with patient seated?", options: ["BP: 120/80", "BP: 120/80 mmHg, right arm", "BP: 120/80 mmHg, right arm, seated", "120 over 80"], correctAnswer: 2, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
      { id: "bp-multiple-readings-protocol", videoUrl: "/videos/hls/BPFullVideoFull/master.m3u8", sourceStartTime: 66.24, sourceEndTime: 90.74, duration: 1, xpReward: 10, scenes: [
        { timestamp: 0, type: "tip", duration: 0, tip: { title: "When to Repeat BP Measurements", content: "Repeat measurements if: (1) First reading is abnormal, (2) Large difference between arms (>10 mmHg), (3) Irregular rhythm detected, (4) Patient seems anxious. Wait 1-2 minutes between readings. If readings differ by >5 mmHg, take a third reading and average. Always measure both arms on first visit to establish baseline.", position: "center" }, xpReward: 5 },
        { timestamp: 0, type: "question", duration: 0, question: { question: "How long should you wait between BP measurements?", options: ["30 seconds", "1-2 minutes", "5 minutes", "10 minutes"], correctAnswer: 1, timeLimit: 30, xpReward: 10, pauseVideo: true } },
      ]},
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export function getExamChain(examType: ExamType): ExamChain {
  const raw = RAW_CHAINS[examType];
  if (!raw) {
    return {
      examType,
      examLabel: examType,
      segments: [],
    };
  }

  const copy = EXAM_COPY[examType];

  return {
    examType: raw.examType,
    examLabel: copy?.title ?? raw.examType,
    segments: raw.segments.map(transformSegment),
  };
}

/** Returns a short teaser chain (no questions) for preview purposes. */
export function getManualBPTeaserChain(): ExamChain {
  const full = getExamChain("manual-bp");
  const laterSegments = full.segments.slice(2, 10);
  const segments = laterSegments.map((seg) => ({
    ...seg,
    overlays: seg.overlays?.filter((o) => o.kind !== "question"),
  }));
  return {
    examType: "manual-bp",
    examLabel: full.examLabel,
    segments,
  };
}
