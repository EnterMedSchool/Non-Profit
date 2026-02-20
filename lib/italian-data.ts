import manifestJson from "@/data/italian/manifest.json";
import termsJson from "@/data/italian/terms.json";

/* ── Step config types ─────────────────────────────────────────────── */

export interface DialogueLine {
  italian: string;
  english: string;
  speaker: string;
}

export interface DialogueStepConfig {
  mode: "dialogue";
  lines: DialogueLine[];
}

export interface GlossaryTerm {
  lemma: string;
  english: string;
}

export interface GlossaryStepConfig {
  mode: "glossary";
  terms: GlossaryTerm[];
}

export interface MultiChoiceQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

export interface MultiChoiceStepConfig {
  mode: "multi_choice" | "multi-choice" | "quiz";
  questions: MultiChoiceQuestion[];
}

export interface ReadRespondStepConfig {
  mode: "read_respond" | "read-respond";
  passage: string;
  question: string;
  options: string[];
  answer: number;
}

export type LessonStepConfig =
  | DialogueStepConfig
  | GlossaryStepConfig
  | MultiChoiceStepConfig
  | ReadRespondStepConfig;

/* ── Step & lesson types ───────────────────────────────────────────── */

export interface ItalianLessonStep {
  slug: string;
  stepType: "glossary" | "dialogue" | "multi_choice" | "read_respond";
  title: string | null;
  helper: string | null;
  prompt: string | null;
  mascotPose: string | null;
  position: number;
  config: LessonStepConfig;
  termIds: number[];
}

export interface ItalianLesson {
  slug: string;
  title: string;
  summary: string | null;
  objectives: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  position: number;
  steps: ItalianLessonStep[];
}

export interface ItalianLessonMeta {
  slug: string;
  title: string;
  summary: string | null;
  stepCount: number;
  position: number;
  stepTypes: string[];
}

export interface ItalianManifest {
  extractedAt: string;
  moduleId: number;
  moduleSlug: string;
  moduleName: string;
  programSlug: string;
  lessons: ItalianLessonMeta[];
  audioBaseUrl: string;
  artworkBlobBase: string;
}

export interface ItalianTerm {
  id: number;
  lemma: string;
  english: string;
  partOfSpeech: string | null;
  register: string | null;
  gender: string | null;
  plurality: string | null;
  audioUrl: string | null;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
}

/* ── Loaders ───────────────────────────────────────────────────────── */

export function getItalianManifest(): ItalianManifest {
  return manifestJson as ItalianManifest;
}

export function getItalianLessonSlugs(): string[] {
  return manifestJson.lessons.map((l) => l.slug);
}

export function getItalianLessonMeta(slug: string): ItalianLessonMeta | null {
  return manifestJson.lessons.find((l) => l.slug === slug) ?? null;
}

export function getAllItalianLessonMeta(): ItalianLessonMeta[] {
  return manifestJson.lessons;
}

export async function getItalianLesson(
  slug: string,
): Promise<ItalianLesson | null> {
  try {
    const mod = await import(`@/data/italian/lessons/${slug}.json`);
    return mod.default as ItalianLesson;
  } catch {
    return null;
  }
}

export function getItalianTerms(): ItalianTerm[] {
  return termsJson as ItalianTerm[];
}

/* ── Type guards ───────────────────────────────────────────────────── */

export function isDialogueConfig(
  config: LessonStepConfig,
): config is DialogueStepConfig {
  return config.mode === "dialogue" && Array.isArray((config as DialogueStepConfig).lines);
}

export function isGlossaryConfig(
  config: LessonStepConfig,
): config is GlossaryStepConfig {
  return config.mode === "glossary";
}

export function isMultiChoiceConfig(
  config: LessonStepConfig,
): config is MultiChoiceStepConfig {
  return (
    config.mode === "multi_choice" ||
    config.mode === "multi-choice" ||
    config.mode === "quiz"
  );
}

export function isReadRespondConfig(
  config: LessonStepConfig,
): config is ReadRespondStepConfig {
  return config.mode === "read_respond" || config.mode === "read-respond";
}
