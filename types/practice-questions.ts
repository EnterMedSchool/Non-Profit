// ── Practice Questions Type Definitions ──────────────────────────────

/** A hierarchical subject category (e.g. Biology > Cell Biology) */
export interface PracticeCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  parentId?: number;
  depth: number;
  sortOrder: number;
  icon?: string;
  color?: string;
}

/** A deck/set of practice questions */
export interface PracticeQuestionDeck {
  id: number;
  slug: string;
  title: string;
  description?: string;
  tags: string[];
  accessTier: string;
  categoryIds: number[];
  primaryCategoryId?: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** A single answer option for a practice question */
export interface PracticeQuestionOption {
  label: string;
  body: string;
  isCorrect: boolean;
}

/** A single practice question (MCQ) */
export interface PracticeQuestion {
  id: number;
  stableId: string;
  deckId: number;
  ordinal: number;
  prompt: string;
  explanation?: string;
  difficulty?: string;
  options: PracticeQuestionOption[];
  tags: string[];
  createdAt: string;
}
