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
  /** Template not yet available for download */
  comingSoon?: boolean;
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

export const professorTemplates: ProfessorTemplate[] = [
  {
    id: "medical-lecture-template",
    title: "Medical Lecture Template",
    description:
      "Clean, professional slide template for medical lectures. Includes title, content, diagram, and summary layouts with a modern design.",
    category: "lectures",
    format: "pptx",
    formatLabel: "PowerPoint",
    thumbnailPath: "/templates/thumbnails/medical-lecture-template.png",
    downloadPath: "/templates/medical-lecture-template.pptx",
    slideCount: 12,
    tags: ["lecture", "slides", "presentation", "medical", "professional"],
    featured: true,
    comingSoon: true,
  },
  {
    id: "clinical-case-presentation",
    title: "Clinical Case Presentation",
    description:
      "Template for presenting clinical cases with structured sections for patient history, findings, diagnosis, and treatment plans.",
    category: "cases",
    format: "pptx",
    formatLabel: "PowerPoint",
    thumbnailPath: "/templates/thumbnails/clinical-case-presentation.png",
    downloadPath: "/templates/clinical-case-presentation.pptx",
    slideCount: 10,
    tags: ["clinical", "case", "patient", "diagnosis", "treatment"],
    comingSoon: true,
  },
  {
    id: "anatomy-lesson-pack",
    title: "Anatomy Lesson Pack",
    description:
      "Pre-designed slides with anatomy diagram placeholders, labeling exercises, and quiz slides. Perfect for anatomy courses.",
    category: "anatomy",
    format: "pptx",
    formatLabel: "PowerPoint",
    thumbnailPath: "/templates/thumbnails/anatomy-lesson-pack.png",
    downloadPath: "/templates/anatomy-lesson-pack.pptx",
    slideCount: 15,
    tags: ["anatomy", "diagrams", "labeling", "quiz", "lesson"],
    comingSoon: true,
  },
  {
    id: "pharmacology-module",
    title: "Pharmacology Module",
    description:
      "Drug class overview template with mechanism diagrams, side effects tables, clinical pearls, and comparison charts.",
    category: "pharmacology",
    format: "pptx",
    formatLabel: "PowerPoint",
    thumbnailPath: "/templates/thumbnails/pharmacology-module.png",
    downloadPath: "/templates/pharmacology-module.pptx",
    slideCount: 14,
    tags: ["pharmacology", "drugs", "mechanism", "side effects", "clinical"],
    comingSoon: true,
  },
  {
    id: "lab-results-tracker",
    title: "Lab Results Tracker",
    description:
      "Spreadsheet template for tracking and comparing patient lab results over time. Includes auto-calculated reference ranges and highlighting.",
    category: "general",
    format: "xlsx",
    formatLabel: "Excel",
    thumbnailPath: "/templates/thumbnails/lab-results-tracker.png",
    downloadPath: "/templates/lab-results-tracker.xlsx",
    tags: ["lab", "results", "tracker", "spreadsheet", "reference ranges"],
    comingSoon: true,
  },
  {
    id: "pathophysiology-flowchart",
    title: "Pathophysiology Flowchart",
    description:
      "Editable flowchart slides for mapping disease pathways, from etiology through pathogenesis to clinical manifestations.",
    category: "lectures",
    format: "pptx",
    formatLabel: "PowerPoint",
    thumbnailPath: "/templates/thumbnails/pathophysiology-flowchart.png",
    downloadPath: "/templates/pathophysiology-flowchart.pptx",
    slideCount: 8,
    tags: ["pathophysiology", "flowchart", "disease", "pathway", "etiology"],
    comingSoon: true,
  },
];

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
