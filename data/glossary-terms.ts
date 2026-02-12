/* ─────────────────────────────────────────────────────────────────
 *  Glossary Terms — Data Loader & Utilities
 *
 *  Loads all ~458 JSON term files from data/glossary/terms/ at
 *  build time and provides O(1) lookups, category grouping,
 *  alphabetical indexing, and cross-reference resolution.
 * ────────────────────────────────────────────────────────────────── */

import fs from "fs";
import path from "path";
import type {
  GlossaryTerm,
  GlossaryTag,
  GlossaryTagMap,
  GlossaryCategory,
  AlphabetEntry,
  GlossaryTermSummary,
} from "@/types/glossary";

/* ── Load tags ─────────────────────────────────────────────────────── */

const tagsPath = path.join(process.cwd(), "data/glossary/tags.json");
export const glossaryTags: GlossaryTagMap = JSON.parse(
  fs.readFileSync(tagsPath, "utf-8"),
);

/* ── Human-readable category names ─────────────────────────────────── */

const TAG_DISPLAY_NAMES: Record<string, string> = {
  anatomy: "Anatomy",
  histology: "Histology",
  physiology: "Physiology",
  biochemistry: "Biochemistry",
  biology: "Biology",
  genetics: "Genetics",
  cell_bio: "Cell Biology",
  pharmacology: "Pharmacology",
  toxicology: "Toxicology",
  micro_bacteria: "Microbiology — Bacteria",
  micro_virus: "Microbiology — Viruses",
  micro_fungi: "Microbiology — Fungi",
  micro_parasite: "Microbiology — Parasites",
  immunology: "Immunology",
  pathology: "Pathology",
  heme_onc: "Hematology & Oncology",
  neuro: "Neurology",
  cardio: "Cardiology",
  pulm: "Pulmonology",
  renal: "Nephrology",
  gi: "Gastroenterology",
  endo: "Endocrinology",
  endocrine: "Endocrinology",
  repro: "Reproductive Medicine",
  msk_derm: "Musculoskeletal & Dermatology",
  peds: "Pediatrics",
  obgyn: "Obstetrics & Gynecology",
  surgery: "Surgery",
  emerg: "Emergency Medicine",
  radiology: "Radiology",
  psych: "Psychiatry",
  behavior: "Behavioral Science",
  epi_stats: "Epidemiology & Biostatistics",
  ethics: "Medical Ethics",
  infectious_dz: "Infectious Disease",
  rheum: "Rheumatology",
  pulmonology: "Pulmonology",
  oncology: "Oncology",
  ophtho: "Ophthalmology",
  ENT: "ENT (Ear, Nose & Throat)",
};

export function getTagDisplayName(tagId: string): string {
  return TAG_DISPLAY_NAMES[tagId] || tagId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Load all term JSON files recursively ──────────────────────────── */

function loadAllTerms(): GlossaryTerm[] {
  const termsDir = path.join(process.cwd(), "data/glossary/terms");
  const terms: GlossaryTerm[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".json")) {
        try {
          const raw = fs.readFileSync(fullPath, "utf-8");
          const term = JSON.parse(raw) as GlossaryTerm;
          terms.push(term);
        } catch {
          // Skip invalid JSON files silently
        }
      }
    }
  }

  walkDir(termsDir);
  // Sort alphabetically by primary name
  terms.sort((a, b) =>
    a.names[0].toLowerCase().localeCompare(b.names[0].toLowerCase()),
  );
  return terms;
}

/** All glossary terms, sorted alphabetically by primary name */
export const glossaryTerms: GlossaryTerm[] = loadAllTerms();

/* ── Lookup maps ───────────────────────────────────────────────────── */

const termByIdMap = new Map<string, GlossaryTerm>(
  glossaryTerms.map((t) => [t.id, t]),
);

/** O(1) term lookup by id */
export function getTermById(id: string): GlossaryTerm | undefined {
  return termByIdMap.get(id);
}

/** Get terms by primary_tag */
export function getTermsByCategory(tag: string): GlossaryTerm[] {
  return glossaryTerms.filter((t) => t.primary_tag === tag);
}

/** Get all terms whose tags array includes the given tag */
export function getTermsByTag(tag: string): GlossaryTerm[] {
  return glossaryTerms.filter(
    (t) => t.primary_tag === tag || t.tags.includes(tag),
  );
}

/* ── Categories ────────────────────────────────────────────────────── */

function buildCategories(): GlossaryCategory[] {
  const countMap = new Map<string, number>();
  for (const term of glossaryTerms) {
    countMap.set(term.primary_tag, (countMap.get(term.primary_tag) || 0) + 1);
  }

  const categories: GlossaryCategory[] = [];
  for (const [id, count] of countMap.entries()) {
    const tag = glossaryTags[id];
    categories.push({
      id,
      name: getTagDisplayName(id),
      count,
      accent: tag?.accent || "#6C5CE7",
      icon: tag?.icon || "📚",
    });
  }

  // Sort by count descending, then name ascending
  categories.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return categories;
}

/** All categories derived from term primary_tags, sorted by count */
export const glossaryCategories: GlossaryCategory[] = buildCategories();

/** O(1) category lookup by id */
const categoryByIdMap = new Map<string, GlossaryCategory>(
  glossaryCategories.map((c) => [c.id, c]),
);

export function getCategoryById(id: string): GlossaryCategory | undefined {
  return categoryByIdMap.get(id);
}

/* ── Relationships ─────────────────────────────────────────────────── */

/** Resolve see_also IDs to full term objects */
export function getRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  if (!term.see_also?.length) return [];
  return term.see_also
    .map((id) => termByIdMap.get(id))
    .filter(Boolean) as GlossaryTerm[];
}

/** Resolve prerequisite IDs to full term objects */
export function getPrerequisiteTerms(term: GlossaryTerm): GlossaryTerm[] {
  if (!term.prerequisites?.length) return [];
  return term.prerequisites
    .map((id) => termByIdMap.get(id))
    .filter(Boolean) as GlossaryTerm[];
}

/* ── Alphabet index ────────────────────────────────────────────────── */

export function getAlphabetIndex(): AlphabetEntry[] {
  const map = new Map<string, GlossaryTerm[]>();

  for (const term of glossaryTerms) {
    const letter = term.names[0].charAt(0).toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(term);
  }

  const entries: AlphabetEntry[] = [];
  // Add all 26 letters, even those with no terms
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    entries.push({
      letter,
      terms: map.get(letter) || [],
    });
  }

  // Add # for non-alpha starts
  const nonAlpha = glossaryTerms.filter(
    (t) => !/^[A-Z]/i.test(t.names[0]),
  );
  if (nonAlpha.length > 0) {
    entries.unshift({ letter: "#", terms: nonAlpha });
  }

  return entries;
}

/* ── Navigation helpers ────────────────────────────────────────────── */

/** Get prev/next terms within the same primary_tag category */
export function getTermNavigation(term: GlossaryTerm): {
  prev: GlossaryTerm | null;
  next: GlossaryTerm | null;
} {
  const categoryTerms = getTermsByCategory(term.primary_tag);
  const idx = categoryTerms.findIndex((t) => t.id === term.id);
  return {
    prev: idx > 0 ? categoryTerms[idx - 1] : null,
    next: idx < categoryTerms.length - 1 ? categoryTerms[idx + 1] : null,
  };
}

/* ── Static params ─────────────────────────────────────────────────── */

/** All term slugs for generateStaticParams */
export function getAllTermSlugs(): string[] {
  return glossaryTerms.map((t) => t.id);
}

/** All category IDs for generateStaticParams */
export function getAllCategorySlugs(): string[] {
  return glossaryCategories.map((c) => c.id);
}

/* ── Search / Lightweight summaries ────────────────────────────────── */

/** Set of all term IDs for fast membership testing (used by inline linker) */
export const allTermIds: Set<string> = new Set(
  glossaryTerms.map((t) => t.id),
);

/** Map of all names/aliases/abbr → term id for inline linking */
export function buildTermNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const term of glossaryTerms) {
    for (const name of term.names) {
      map.set(name.toLowerCase(), term.id);
    }
    for (const alias of term.aliases || []) {
      map.set(alias.toLowerCase(), term.id);
    }
    // Skip very short abbreviations (2 chars) to avoid false positives
    for (const abbr of term.abbr || []) {
      if (abbr.length > 2) {
        map.set(abbr.toLowerCase(), term.id);
      }
    }
  }
  return map;
}

/** Lightweight term summaries for client-side search index */
export function getTermSummaries(): GlossaryTermSummary[] {
  return glossaryTerms.map((t) => ({
    id: t.id,
    name: t.names[0],
    aliases: t.aliases || [],
    abbr: t.abbr || [],
    definition: t.definition.slice(0, 200),
    primary_tag: t.primary_tag,
    tags: t.tags,
    level: t.level,
  }));
}

/* ── Stats ─────────────────────────────────────────────────────────── */

export const glossaryStats = {
  totalTerms: glossaryTerms.length,
  totalCategories: glossaryCategories.length,
  premedTerms: glossaryTerms.filter((t) => t.level === "premed").length,
  medicalTerms: glossaryTerms.filter(
    (t) => !t.level || t.level === "physiological",
  ).length,
  formulaTerms: glossaryTerms.filter((t) => t.level === "formula").length,
  labValueTerms: glossaryTerms.filter((t) => t.level === "lab-value").length,
};
