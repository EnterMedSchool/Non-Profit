export interface Resource {
  id: string;
  language: string;
  title: string;
  description: string;
  category: "questions" | "videos" | "pdfs" | "visuals";
  badge: string;
  badgeColor: "green" | "teal" | "purple" | "orange";
  downloadUrl?: string;
  sourceUrl?: string;
  previewUrl?: string;
}

export const resources: Resource[] = [
  // ── Questions ─────────────────────────────────────────────────────────
  {
    id: "q-anatomy-upper-limb",
    language: "en",
    title: "Upper Limb Anatomy – Practice MCQs",
    description:
      "50 exam-style multiple-choice questions covering the brachial plexus, shoulder joint, forearm compartments, and hand innervation.",
    category: "questions",
    badge: "Anatomy",
    badgeColor: "purple",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit",
    previewUrl: "/resources/questions",
  },
  {
    id: "q-physiology-cardio",
    language: "en",
    title: "Cardiovascular Physiology – Mock Exam",
    description:
      "40 questions on cardiac output, blood pressure regulation, ECG interpretation, and the cardiac cycle. Includes detailed explanations.",
    category: "questions",
    badge: "Physiology",
    badgeColor: "teal",
    downloadUrl: "/downloads/cardio-physiology-mcqs.pdf",
    previewUrl: "/resources/questions",
  },
  {
    id: "q-biochem-metabolism",
    language: "en",
    title: "Biochemistry – Metabolism & Enzymes",
    description:
      "35 questions on glycolysis, the TCA cycle, oxidative phosphorylation, and enzyme kinetics. Great for first-year revision.",
    category: "questions",
    badge: "Biochemistry",
    badgeColor: "green",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit",
    previewUrl: "/resources/questions",
  },
  {
    id: "q-pharma-autonomic",
    language: "en",
    title: "Pharmacology – Autonomic Nervous System",
    description:
      "30 clinical-scenario questions on cholinergic and adrenergic drugs, receptor subtypes, and common side effects.",
    category: "questions",
    badge: "Pharmacology",
    badgeColor: "orange",
    downloadUrl: "/downloads/pharma-ans-mcqs.pdf",
  },
  {
    id: "q-histo-tissues",
    language: "en",
    title: "Histology – Tissue Types & Identification",
    description:
      "25 image-based questions with micrographs. Identify epithelial, connective, muscle, and nervous tissue under the microscope.",
    category: "questions",
    badge: "Histology",
    badgeColor: "purple",
    previewUrl: "/resources/questions",
  },
  {
    id: "q-neuro-cranial-nerves",
    language: "en",
    title: "Neuroanatomy – Cranial Nerves Quiz",
    description:
      "20 targeted questions on cranial nerve origins, pathways, and clinical lesions. Perfect for OSCE preparation.",
    category: "questions",
    badge: "Neuroanatomy",
    badgeColor: "teal",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit",
    downloadUrl: "/downloads/cranial-nerves-quiz.pdf",
  },
];
