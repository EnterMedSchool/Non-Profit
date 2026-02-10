import type { MCQQuestion } from "./types";

/**
 * A curated set of demo questions shown when the MCQ Maker is first opened
 * (i.e. nothing saved in localStorage). Covers multiple categories and
 * difficulty levels so every feature is immediately visible.
 */

function q(
  id: string,
  question: string,
  opts: [string, string, string, string],
  correctIdx: 0 | 1 | 2 | 3,
  extra: Partial<MCQQuestion> = {},
): MCQQuestion {
  const optIds = [
    `${id}-a`,
    `${id}-b`,
    `${id}-c`,
    `${id}-d`,
  ];
  return {
    id,
    question,
    options: opts.map((text, i) => ({
      id: optIds[i],
      text,
      isCorrect: i === correctIdx,
    })),
    correctOptionId: optIds[correctIdx],
    points: 1,
    tags: [],
    source: "local",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...extra,
  };
}

const DEMO_QUESTIONS: MCQQuestion[] = [
  // ── Cell Biology ────────────────────────────────────────────────────
  q(
    "demo-1",
    "What is the powerhouse of the cell?",
    ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
    1,
    {
      category: "Cell Biology",
      difficulty: "easy",
      explanation:
        "Mitochondria generate most of the cell's supply of ATP, the main energy currency of the cell.",
      tags: ["biology", "cell"],
    },
  ),
  q(
    "demo-2",
    "Which organelle is responsible for protein synthesis?",
    ["Lysosome", "Ribosome", "Peroxisome", "Vacuole"],
    1,
    {
      category: "Cell Biology",
      difficulty: "easy",
      explanation:
        "Ribosomes translate mRNA into polypeptide chains, assembling amino acids into proteins.",
      tags: ["biology", "protein"],
    },
  ),
  q(
    "demo-3",
    "What is the main function of the endoplasmic reticulum?",
    [
      "Energy production",
      "Protein & lipid synthesis and transport",
      "DNA replication",
      "Cell division",
    ],
    1,
    {
      category: "Cell Biology",
      difficulty: "medium",
      explanation:
        "The ER serves as a transport network for molecules. The rough ER synthesizes proteins while the smooth ER synthesizes lipids.",
      tags: ["biology", "cell"],
    },
  ),

  // ── Biochemistry ────────────────────────────────────────────────────
  q(
    "demo-4",
    "Which vitamin is produced when skin is exposed to sunlight?",
    ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
    3,
    {
      category: "Biochemistry",
      difficulty: "easy",
      explanation:
        "Ultraviolet B (UVB) radiation triggers Vitamin D3 synthesis in the epidermis of the skin.",
      tags: ["vitamins", "nutrition"],
    },
  ),
  q(
    "demo-5",
    "Which enzyme is responsible for unwinding DNA during replication?",
    ["DNA polymerase", "Helicase", "Ligase", "Primase"],
    1,
    {
      category: "Biochemistry",
      difficulty: "hard",
      explanation:
        "Helicase unwinds the double helix structure at the replication fork by breaking the hydrogen bonds between complementary base pairs.",
      tags: ["dna", "enzymes"],
    },
  ),
  q(
    "demo-6",
    "What is the end product of glycolysis?",
    ["Acetyl-CoA", "Citrate", "Pyruvate", "Lactate"],
    2,
    {
      category: "Biochemistry",
      difficulty: "medium",
      explanation:
        "Glycolysis converts one molecule of glucose into two molecules of pyruvate, generating 2 ATP and 2 NADH.",
      tags: ["metabolism", "energy"],
    },
  ),

  // ── Physiology ──────────────────────────────────────────────────────
  q(
    "demo-7",
    "What is the normal resting heart rate for adults?",
    ["40–60 bpm", "60–100 bpm", "100–120 bpm", "120–140 bpm"],
    1,
    {
      category: "Physiology",
      difficulty: "easy",
      explanation:
        "A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Well-trained athletes may have lower rates.",
      tags: ["cardiology", "vitals"],
    },
  ),
  q(
    "demo-8",
    "Which chamber of the heart pumps blood to the lungs?",
    [
      "Left atrium",
      "Left ventricle",
      "Right atrium",
      "Right ventricle",
    ],
    3,
    {
      category: "Physiology",
      difficulty: "medium",
      explanation:
        "The right ventricle pumps deoxygenated blood through the pulmonary artery to the lungs for gas exchange.",
      tags: ["cardiology", "anatomy"],
    },
  ),

  // ── Neuroanatomy ────────────────────────────────────────────────────
  q(
    "demo-9",
    "Which cranial nerve is responsible for the sense of smell?",
    [
      "Olfactory (CN I)",
      "Optic (CN II)",
      "Trigeminal (CN V)",
      "Facial (CN VII)",
    ],
    0,
    {
      category: "Neuroanatomy",
      difficulty: "medium",
      explanation:
        "The olfactory nerve (CN I) transmits sensory information for the sense of smell from the nasal cavity to the brain.",
      tags: ["cranial-nerves", "neuroscience"],
    },
  ),
  q(
    "demo-10",
    "The blood-brain barrier is primarily formed by which cells?",
    [
      "Schwann cells",
      "Astrocytes",
      "Oligodendrocytes",
      "Microglia",
    ],
    1,
    {
      category: "Neuroanatomy",
      difficulty: "hard",
      explanation:
        "Astrocytes extend foot processes that surround capillaries, forming the blood-brain barrier and regulating molecular transport.",
      tags: ["neuroscience", "histology"],
    },
  ),

  // ── Pharmacology ────────────────────────────────────────────────────
  q(
    "demo-11",
    "Which drug class is used as first-line treatment for hypertension?",
    [
      "Opioids",
      "ACE inhibitors",
      "Benzodiazepines",
      "Antihistamines",
    ],
    1,
    {
      category: "Pharmacology",
      difficulty: "medium",
      explanation:
        "ACE inhibitors (e.g., lisinopril, enalapril) are recommended as first-line therapy for hypertension by most guidelines.",
      tags: ["drugs", "cardiology"],
    },
  ),
  q(
    "demo-12",
    "What is the mechanism of action of aspirin?",
    [
      "Beta-receptor blockade",
      "Irreversible COX inhibition",
      "Calcium channel blockade",
      "ACE inhibition",
    ],
    1,
    {
      category: "Pharmacology",
      difficulty: "hard",
      explanation:
        "Aspirin irreversibly inhibits cyclooxygenase (COX-1 and COX-2), reducing prostaglandin and thromboxane synthesis.",
      tags: ["drugs", "nsaids"],
      points: 2,
    },
  ),
];

export default DEMO_QUESTIONS;
