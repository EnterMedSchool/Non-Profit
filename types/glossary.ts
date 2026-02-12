/* ================================================================== */
/*  Glossary Term Types                                               */
/*  Covers all 5 term variants: medical condition, premed, formula,   */
/*  lab-value, and physiological.                                     */
/* ================================================================== */

/* ── Sub-types ─────────────────────────────────────────────────────── */

export interface Differential {
  /** Reference to another glossary term (optional) */
  id?: string;
  /** Display name when no id is present */
  name?: string;
  /** Distinguishing clinical hint */
  hint: string;
}

export interface ClinicalCase {
  /** Patient presentation / stem */
  stem: string;
  /** Key findings that point to the diagnosis */
  clues: string[];
  /** Correct answer / diagnosis */
  answer: string;
  /** Educational explanation */
  teaching: string;
}

export interface TermImage {
  /** Image URL (external) */
  src: string;
  /** Alt text for accessibility & SEO */
  alt: string;
  /** Optional image credit */
  credit?: {
    text: string;
    href: string;
  };
}

export interface Source {
  title: string;
  url: string;
}

export interface Credit {
  display: string;
  url?: string;
  role?: string;
  avatar?: string;
}

/* ── Formula sub-types ─────────────────────────────────────────────── */

export interface FormulaData {
  /** Human-readable expression, e.g. "sodium - (chloride + bicarbonate)" */
  expression: string;
  /** LaTeX representation */
  latex?: string;
  /** Result unit, e.g. "mEq/L" */
  unit: string;
}

export interface FormulaInput {
  id: string;
  label: string;
  unit: string;
  type: "number";
  min: number;
  max: number;
  default: number;
  step: number;
}

export interface FormulaInterpretation {
  /** [min, max] — max can be null for open-ended ranges */
  range: [number, number | null];
  label: string;
  color: string;
  description: string;
}

export interface RelatedFormula {
  name: string;
  formula: string;
  description: string;
}

export interface FormulaVisualization {
  type: string;
  min: number;
  max: number;
  highlight_variable?: string;
}

/* ── Lab-value sub-types ───────────────────────────────────────────── */

export interface ReferenceRange {
  low: number;
  high: number;
  unit: string;
  critical_low?: number;
  critical_high?: number;
}

export interface SeverityLevel {
  range: [number, number];
  label: string;
  color: string;
}

export interface LabInterpretationSide {
  /** Condition name (e.g. "Hyponatremia") */
  term: string;
  /** Link to related glossary term id */
  link?: string;
  severity_levels: SeverityLevel[];
  common_causes: string[];
}

export interface LabInterpretation {
  low: LabInterpretationSide;
  high: LabInterpretationSide;
}

export interface CriticalValues {
  low: number;
  high: number;
  action: string;
}

/* ── Action (rare, e.g. cirrhosis) ─────────────────────────────────── */

export interface TermAction {
  label: string;
  href: string;
  variant?: string;
}

/* ── Main GlossaryTerm ─────────────────────────────────────────────── */

export interface GlossaryTerm {
  /** Unique slug identifier (matches filename, kebab-case) */
  id: string;
  /** Primary name(s) for the term */
  names: string[];
  /** Alternative names */
  aliases?: string[];
  /** Abbreviations */
  abbr?: string[];
  /** Search/match patterns (used by Anki addon & Chrome extension) */
  patterns?: string[];
  /** Primary category tag (maps to tags.json) */
  primary_tag: string;
  /** Additional category tags */
  tags: string[];
  /** Term level / type */
  level?: "premed" | "formula" | "lab-value" | "physiological";
  /** Markdown definition — always present */
  definition: string;

  /* ── Content sections (medical condition terms) ──────────────────── */
  why_it_matters?: string;
  how_youll_see_it?: string[];
  problem_solving?: string[];
  differentials?: Differential[];
  tricks?: string[];
  exam_appearance?: string[];
  treatment?: string[];
  red_flags?: string[];
  algorithm?: string[];
  cases?: ClinicalCase[];
  /** Study tips — primarily used by premed-level terms */
  tips?: string[];
  images?: TermImage[];

  /* ── Formula-specific fields ─────────────────────────────────────── */
  formula?: FormulaData;
  inputs?: FormulaInput[];
  /** Formula interpretation bands OR generic interpretation */
  interpretation?: FormulaInterpretation[] | LabInterpretation;
  clinical_usage?: string[];
  pearls?: string[];
  related_formulas?: RelatedFormula[];
  visualization?: FormulaVisualization;

  /* ── Lab-value-specific fields ───────────────────────────────────── */
  reference_range?: ReferenceRange;
  clinical_significance?: string[];
  key_concepts?: string[];
  critical_values?: CriticalValues;

  /* ── Relationships ───────────────────────────────────────────────── */
  see_also?: string[];
  prerequisites?: string[];

  /* ── Actions (rare) ──────────────────────────────────────────────── */
  actions?: TermAction[];

  /* ── Attribution ─────────────────────────────────────────────────── */
  sources?: Source[];
  credits?: Credit[];
  /** Singular credit form (rare, alternative to credits array) */
  credit?: {
    author?: {
      name: string;
      title?: string;
    };
  };
}

/* ── Tag / Category types ──────────────────────────────────────────── */

export interface GlossaryTag {
  accent: string;
  icon: string;
}

export type GlossaryTagMap = Record<string, GlossaryTag>;

export interface GlossaryCategory {
  /** Tag id, e.g. "cardio" */
  id: string;
  /** Human-readable name, e.g. "Cardiology" */
  name: string;
  /** Number of terms in this category */
  count: number;
  /** Accent color hex */
  accent: string;
  /** Emoji icon */
  icon: string;
}

/* ── Alphabet index entry ──────────────────────────────────────────── */

export interface AlphabetEntry {
  letter: string;
  terms: GlossaryTerm[];
}

/* ── Lightweight term for search index / term cards ────────────────── */

export interface GlossaryTermSummary {
  id: string;
  name: string;
  aliases: string[];
  abbr: string[];
  definition: string;
  primary_tag: string;
  tags: string[];
  level?: string;
}
