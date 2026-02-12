/* ─────────────────────────────────────────────────────────────────
 *  Media Assets — SEO-Optimized Browsable Asset Library
 *
 *  Each asset has its own page at /resources/media/[slug] with
 *  rich SEO metadata, structured data, and educational content.
 *  Assets live in public/assets/media/.
 * ────────────────────────────────────────────────────────────────── */

export interface MediaAsset {
  /** Internal identifier */
  id: string;
  /** URL slug (SEO-friendly, used in /resources/media/[slug]) */
  slug: string;
  /** Display name */
  name: string;
  /** Optimized <title> tag */
  seoTitle: string;
  /** Meta description (~155 chars) */
  seoDescription: string;
  /** Long-form description for the page body (multiple sentences) */
  description: string;
  /** Category for filtering (e.g., "anatomy", "cells", "equipment") */
  category: string;
  /** Tags for Fuse.js search and filtering */
  tags: string[];
  /** Keywords for <meta keywords> and JSON-LD */
  seoKeywords: string[];
  /** Path relative to /public — used as the image src */
  imagePath: string;
  /** Smaller preview version for catalog cards */
  thumbnailPath: string;
  /** File format */
  format: "svg" | "png";
  /** Natural width in px */
  width: number;
  /** Natural height in px */
  height: number;
  /** License identifier */
  license: string;
  /** Attribution line */
  attribution: string;
  /** Tips for professors on how/where to use this asset */
  usageTips: string[];
  /** IDs of related assets for cross-linking */
  relatedAssetIds: string[];
  /** ISO date string */
  datePublished: string;
  /** ISO date string */
  dateModified: string;
}

export interface MediaAssetCategory {
  id: string;
  name: string;
  /** Lucide icon name */
  icon: string;
  /** Tailwind showcase color key */
  color: string;
}

/* ── Categories ─────────────────────────────────────────────────── */

export const mediaAssetCategories: MediaAssetCategory[] = [
  { id: "anatomy",   name: "Anatomy",        icon: "HeartPulse",   color: "coral" },
  { id: "cells",     name: "Cells",          icon: "Circle",       color: "teal" },
  { id: "molecules", name: "Molecules",      icon: "Atom",         color: "purple" },
  { id: "organs",    name: "Organs",         icon: "Brain",        color: "pink" },
  { id: "equipment", name: "Lab Equipment",  icon: "FlaskConical", color: "blue" },
  { id: "diagrams",  name: "Diagrams",       icon: "LayoutGrid",   color: "green" },
];

/* ── Assets ─────────────────────────────────────────────────────── */

const BASE = "/assets/media";

export const mediaAssets: MediaAsset[] = [
  {
    id: "human-heart-anatomy",
    slug: "human-heart-anatomy",
    name: "Human Heart Anatomy",
    seoTitle: "Human Heart Anatomy Diagram — Free Medical Illustration",
    seoDescription:
      "Download a free, high-quality human heart anatomy diagram for medical presentations, lectures, and educational materials. SVG format with CC BY 4.0 license.",
    description:
      "A clear, detailed illustration of the human heart showing its basic external anatomy. This diagram is designed for use in medical education presentations, lecture slides, and study materials. The heart is one of the most commonly taught structures in cardiovascular physiology and anatomy courses, making this asset essential for any medical educator's toolkit. The illustration uses a clean, modern style with labeled color regions to help students quickly identify key anatomical features.",
    category: "anatomy",
    tags: ["heart", "cardiac", "cardiovascular", "anatomy", "organ", "physiology", "circulation"],
    seoKeywords: [
      "heart anatomy diagram",
      "free heart illustration",
      "cardiac anatomy SVG",
      "medical heart diagram",
      "cardiovascular anatomy image",
      "heart anatomy for presentations",
      "free medical illustration heart",
    ],
    imagePath: `${BASE}/human-heart-anatomy.svg`,
    thumbnailPath: `${BASE}/human-heart-anatomy.svg`,
    format: "svg",
    width: 400,
    height: 400,
    license: "CC BY 4.0",
    attribution: "EnterMedSchool.org",
    usageTips: [
      "Use in cardiovascular physiology lecture slides to introduce heart structure before discussing function.",
      "Add labels and arrows in PowerPoint or Google Slides to highlight specific chambers or vessels.",
      "Combine with a blood flow diagram to create a complete cardiovascular overview slide.",
      "Print as a handout for students to label during anatomy lab sessions.",
      "Embed in your LMS (Moodle, Canvas) alongside quiz questions about heart anatomy.",
    ],
    relatedAssetIds: ["mitochondria-structure", "neuron-cell-diagram"],
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
  },
  {
    id: "mitochondria-structure",
    slug: "mitochondria-structure",
    name: "Mitochondria Structure",
    seoTitle: "Mitochondria Structure Diagram — Free Cell Biology Illustration",
    seoDescription:
      "Download a free mitochondria structure diagram for cell biology lectures. SVG format showing cristae and matrix — perfect for medical education slides.",
    description:
      "A clean, educational illustration of mitochondria showing the characteristic double-membrane structure with cristae folds. Mitochondria are the powerhouses of the cell, responsible for ATP production through oxidative phosphorylation. This diagram is designed to help students visualize the inner membrane folds (cristae) that increase surface area for the electron transport chain. Ideal for cell biology, biochemistry, and physiology courses where energy metabolism is a core topic.",
    category: "cells",
    tags: ["mitochondria", "cell", "organelle", "ATP", "energy", "cristae", "biochemistry", "cell biology"],
    seoKeywords: [
      "mitochondria diagram",
      "free mitochondria illustration",
      "cell organelle SVG",
      "mitochondria structure image",
      "ATP powerhouse diagram",
      "cell biology illustration",
      "free medical education mitochondria",
    ],
    imagePath: `${BASE}/mitochondria-structure.svg`,
    thumbnailPath: `${BASE}/mitochondria-structure.svg`,
    format: "svg",
    width: 400,
    height: 400,
    license: "CC BY 4.0",
    attribution: "EnterMedSchool.org",
    usageTips: [
      "Use in cell biology lectures when introducing organelle structure and function.",
      "Pair with a diagram of the electron transport chain to connect structure to function.",
      "Add to biochemistry slides covering oxidative phosphorylation and the citric acid cycle.",
      "Use as a base image and overlay labels for cristae, matrix, outer membrane, and inner membrane.",
      "Include in study guides alongside quiz questions about mitochondrial diseases.",
    ],
    relatedAssetIds: ["human-heart-anatomy", "neuron-cell-diagram"],
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
  },
  {
    id: "neuron-cell-diagram",
    slug: "neuron-cell-diagram",
    name: "Neuron Cell Diagram",
    seoTitle: "Neuron Cell Diagram — Free Neuroscience Illustration",
    seoDescription:
      "Download a free neuron cell diagram for neuroscience and anatomy lectures. SVG showing cell body, axon, and dendrites — ideal for medical education slides.",
    description:
      "A simplified illustration of a neuron (nerve cell) showing the cell body (soma), axon, dendrites, and axon terminal. Neurons are the fundamental units of the nervous system, transmitting electrical and chemical signals throughout the body. This diagram is designed for introductory neuroscience, neuroanatomy, and physiology courses. The clean design makes it easy to add custom labels pointing to the dendrites, cell body, axon hillock, myelin sheath, nodes of Ranvier, and synaptic terminals.",
    category: "cells",
    tags: ["neuron", "nerve", "cell", "axon", "dendrite", "nervous system", "neuroscience", "neuroanatomy"],
    seoKeywords: [
      "neuron diagram",
      "free neuron illustration",
      "nerve cell SVG",
      "neuroscience diagram",
      "neuron anatomy image",
      "free neuron cell diagram",
      "nervous system illustration",
    ],
    imagePath: `${BASE}/neuron-cell-diagram.svg`,
    thumbnailPath: `${BASE}/neuron-cell-diagram.svg`,
    format: "svg",
    width: 400,
    height: 400,
    license: "CC BY 4.0",
    attribution: "EnterMedSchool.org",
    usageTips: [
      "Use in neuroanatomy lectures when introducing the structure of the nervous system.",
      "Add labels for each part: dendrites, soma, axon hillock, axon, myelin sheath, and synaptic terminal.",
      "Pair with a diagram of synaptic transmission to show how neurons communicate.",
      "Use in pharmacology lectures to illustrate where neurotransmitter drugs act.",
      "Print as a worksheet for students to color-code and label different neuronal structures.",
    ],
    relatedAssetIds: ["human-heart-anatomy", "mitochondria-structure"],
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
  },
];

/* ── Helpers ────────────────────────────────────────────────────── */

export function getMediaAssetBySlug(slug: string): MediaAsset | undefined {
  return mediaAssets.find((a) => a.slug === slug);
}

export function getMediaAssetsByCategory(categoryId: string): MediaAsset[] {
  return mediaAssets.filter((a) => a.category === categoryId);
}

export function getRelatedAssets(asset: MediaAsset): MediaAsset[] {
  return asset.relatedAssetIds
    .map((id) => mediaAssets.find((a) => a.id === id))
    .filter(Boolean) as MediaAsset[];
}

export function searchMediaAssets(query: string): MediaAsset[] {
  const q = query.toLowerCase().trim();
  if (!q) return mediaAssets;
  return mediaAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)) ||
      a.category.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
  );
}
