// ── MCQ Option ────────────────────────────────────────────────────────
export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// ── Core Question Model ──────────────────────────────────────────────
export interface MCQQuestion {
  id: string;
  /** The question text / stem */
  question: string;
  /** 2-6 answer options */
  options: MCQOption[];
  /** ID of the correct option */
  correctOptionId: string;
  /** Optional explanation for the answer */
  explanation?: string;
  /** User-defined category / topic */
  category?: string;
  /** Difficulty level */
  difficulty?: "easy" | "medium" | "hard";
  /** Point value (default 1) */
  points?: number;
  /** Optional image (base64 data URL) */
  imageUrl?: string;
  /** Free-form tags */
  tags?: string[];
  createdAt: number;
  updatedAt: number;

  // ── Archive-ready fields (for future community question bank) ──
  /** Where this question came from */
  source?: "local" | "import" | "archive";
  /** ID linking to the community archive (future) */
  archiveId?: string;
  /** Original author / contributor name */
  author?: string;
  /** License string, e.g. "CC-BY-4.0" */
  license?: string;
}

// ── Exam Section ─────────────────────────────────────────────────────
export interface MCQExamSection {
  id: string;
  title: string;
  description?: string;
  /** References to MCQQuestion.id */
  questionIds: string[];
  /** Override points per question for this section */
  pointsPerQuestion?: number;
}

// ── Exam Settings ────────────────────────────────────────────────────
export interface MCQExamSettings {
  /** Time limit in minutes. undefined = no limit */
  timeLimit?: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  /** Show correct/incorrect after answering */
  showFeedback: boolean;
  showExplanations: boolean;
  /** Passing score as a percentage. undefined = no threshold */
  passingScore?: number;
  /** Allow reviewing answers before final submit */
  allowReview: boolean;
  showScore: boolean;
  /** Number of randomized exam variants (1 = no variants) */
  variants: number;
}

// ── Exam Model ───────────────────────────────────────────────────────
export interface MCQExam {
  id: string;
  title: string;
  description?: string;
  sections: MCQExamSection[];
  settings: MCQExamSettings;
  createdAt: number;
  updatedAt: number;
}

// ── PDF Theme ────────────────────────────────────────────────────────
export interface MCQPdfTheme {
  primaryColor: string;
  secondaryColor: string;
  headerBgColor: string;
  textColor: string;
  fontFamily: "helvetica" | "times" | "courier";
  fontSize: number;
  paperSize: "a4" | "letter";
  showLogo: boolean;
  logoDataUrl?: string;
  logoPosition: "left" | "center" | "right";
  answerStyle: "bubbles" | "letters" | "checkboxes" | "lines";
  headerTemplate: string;
  footerTemplate: string;
  /** Optional watermark text displayed diagonally (e.g. "DRAFT") */
  watermarkText: string;
  showQuestionNumbers: boolean;
  showPointValues: boolean;
  pageMargins: { top: number; right: number; bottom: number; left: number };
}

// ── Embed Theme ──────────────────────────────────────────────────────
export interface MCQEmbedTheme {
  bg: string;
  accent: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
  mode: "quiz" | "practice";
  showProgress: boolean;
  showScore: boolean;
  showExplanations: boolean;
  theme: "light" | "dark";
  animation: boolean;
}

// ── Column Mapping (for CSV/TSV import) ──────────────────────────────
export interface MCQColumnMapping {
  question: string;
  options: string[];
  correct: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  tags?: string;
}

// ── Export Settings ──────────────────────────────────────────────────
export interface MCQExportSettings {
  format: "pdf-exam" | "pdf-answer-key" | "pdf-study-guide" | "csv" | "tsv";
  /** Which questions to include */
  scope: "all" | "exam" | "category" | "selected";
  /** If scope = "exam", which exam */
  examId?: string;
  /** If scope = "category", which category */
  categoryFilter?: string;
  /** If scope = "selected", which question IDs */
  selectedIds?: string[];
  /** CSV/TSV delimiter */
  delimiter?: "," | "\t" | ";";
  /** Columns to include in CSV/TSV export */
  csvColumns?: string[];
  includeExplanations: boolean;
}

// ── Active panel tabs ────────────────────────────────────────────────
export type MCQPanel =
  | "editor"
  | "bank"
  | "import"
  | "exam"
  | "export"
  | "embed";

// ── Defaults ─────────────────────────────────────────────────────────
export const DEFAULT_EXAM_SETTINGS: MCQExamSettings = {
  timeLimit: undefined,
  randomizeQuestions: false,
  randomizeOptions: false,
  showFeedback: true,
  showExplanations: true,
  passingScore: undefined,
  allowReview: true,
  showScore: true,
  variants: 1,
};

export const DEFAULT_PDF_THEME: MCQPdfTheme = {
  primaryColor: "#6C5CE7",
  secondaryColor: "#00D9C0",
  headerBgColor: "#f8f7ff",
  textColor: "#1a1a2e",
  fontFamily: "helvetica",
  fontSize: 11,
  paperSize: "a4",
  showLogo: false,
  logoDataUrl: undefined,
  logoPosition: "left",
  answerStyle: "bubbles",
  headerTemplate: "",
  footerTemplate: "Page {page} of {pages}",
  watermarkText: "",
  showQuestionNumbers: true,
  showPointValues: true,
  pageMargins: { top: 20, right: 15, bottom: 20, left: 15 },
};

export const DEFAULT_EMBED_THEME: MCQEmbedTheme = {
  bg: "#ffffff",
  accent: "#6C5CE7",
  textColor: "#1a1a2e",
  fontFamily: "system",
  borderRadius: 12,
  mode: "practice",
  showProgress: true,
  showScore: true,
  showExplanations: true,
  theme: "light",
  animation: true,
};

export const DEFAULT_EXPORT_SETTINGS: MCQExportSettings = {
  format: "pdf-exam",
  scope: "all",
  delimiter: ",",
  csvColumns: [
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "option_e",
    "option_f",
    "correct",
    "explanation",
    "category",
    "difficulty",
  ],
  includeExplanations: true,
};
