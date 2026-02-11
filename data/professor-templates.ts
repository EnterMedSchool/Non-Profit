/* ─────────────────────────────────────────────────────────────────
 *  Professor Template Gallery — Data Layer
 *
 *  Each entry represents a downloadable template file (PowerPoint
 *  or Excel) that professors can preview and download from the
 *  /for-professors/templates gallery page.
 *
 *  Files live in public/templates/ and thumbnails in
 *  public/templates/thumbnails/.
 * ────────────────────────────────────────────────────────────────── */

export type TemplateCategory =
  | "lectures"
  | "cases"
  | "anatomy"
  | "pharmacology"
  | "general";

export type TemplateFormat = "pptx" | "xlsx";

export interface ProfessorTemplate {
  id: string;
  language: string;
  title: string;
  description: string;
  category: TemplateCategory;
  /** File extension */
  format: TemplateFormat;
  /** Human-readable format name shown in badges */
  formatLabel: string;
  /** Path to thumbnail image relative to public/ */
  thumbnailPath: string;
  /** Path to the downloadable file relative to public/ */
  downloadPath: string;
  /** Number of slides (pptx) or sheets (xlsx) */
  slideCount?: number;
  /** Searchable tags */
  tags: string[];
  /** Show as featured in the gallery */
  featured?: boolean;
}

/* ── Category metadata for filter pills ──────────────────────────── */

export interface TemplateCategoryMeta {
  id: TemplateCategory;
  label: string;
}

export const templateCategories: TemplateCategoryMeta[] = [
  { id: "lectures", label: "Lectures" },
  { id: "cases", label: "Clinical Cases" },
  { id: "anatomy", label: "Anatomy" },
  { id: "pharmacology", label: "Pharmacology" },
  { id: "general", label: "General" },
];

/* ── Template data ───────────────────────────────────────────────── */

export const professorTemplates: ProfessorTemplate[] = [];

/* ── Helpers ──────────────────────────────────────────────────────── */

export function getTemplatesByCategory(
  category: TemplateCategory,
): ProfessorTemplate[] {
  return professorTemplates.filter((t) => t.category === category);
}

export function getFeaturedTemplates(): ProfessorTemplate[] {
  return professorTemplates.filter((t) => t.featured);
}

export function searchTemplates(query: string): ProfessorTemplate[] {
  const q = query.toLowerCase().trim();
  if (!q) return professorTemplates;
  return professorTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.formatLabel.toLowerCase().includes(q),
  );
}
