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
  /** SEO-optimized page title for the category landing page */
  seoTitle: string;
  /** Meta description for the category landing page */
  seoDescription: string;
  /** SEO keywords for the category page */
  seoKeywords: string[];
}

export interface MediaAssetCollection {
  /** URL slug for /resources/media/collections/[slug] */
  slug: string;
  /** Display name */
  name: string;
  /** Optimized <title> tag */
  seoTitle: string;
  /** Meta description */
  seoDescription: string;
  /** Long-form editorial description */
  description: string;
  /** Ordered list of asset IDs in the collection */
  assetIds: string[];
  /** SEO keywords */
  seoKeywords: string[];
  /** ISO date string */
  datePublished: string;
  /** ISO date string */
  dateModified: string;
}

/* ── Categories ─────────────────────────────────────────────────── */

export const mediaAssetCategories: MediaAssetCategory[] = [
  {
    id: "anatomy",
    name: "Anatomy",
    icon: "HeartPulse",
    color: "coral",
    seoTitle: "Anatomy Medical Illustrations — Free Downloads for Educators",
    seoDescription: "Browse and download free anatomy diagrams and illustrations for medical education. High-quality SVGs and PNGs for lectures, slides, and study materials — CC BY 4.0 licensed.",
    seoKeywords: ["anatomy diagrams", "free anatomy illustrations", "medical anatomy images", "anatomy SVG", "anatomy teaching materials"],
  },
  {
    id: "cells",
    name: "Cells",
    icon: "Circle",
    color: "teal",
    seoTitle: "Cell Biology Illustrations — Free Downloads for Educators",
    seoDescription: "Download free cell biology diagrams for your lectures. Organelles, cell structures, and microscopy illustrations in SVG and PNG — all CC BY 4.0 licensed.",
    seoKeywords: ["cell biology diagrams", "free cell illustrations", "organelle diagrams", "cell structure images", "cell biology teaching materials"],
  },
  {
    id: "molecules",
    name: "Molecules",
    icon: "Atom",
    color: "purple",
    seoTitle: "Molecular Biology Illustrations — Free Downloads for Educators",
    seoDescription: "Free molecular biology and biochemistry diagrams for medical education. Download SVGs and PNGs of molecules, pathways, and structures — CC BY 4.0 licensed.",
    seoKeywords: ["molecular biology diagrams", "free molecule illustrations", "biochemistry images", "molecular structure diagrams", "molecule teaching materials"],
  },
  {
    id: "organs",
    name: "Organs",
    icon: "Brain",
    color: "pink",
    seoTitle: "Organ System Illustrations — Free Downloads for Educators",
    seoDescription: "Download free organ system illustrations for medical lectures. Brain, lungs, kidneys, and more in SVG and PNG formats — all CC BY 4.0 licensed.",
    seoKeywords: ["organ diagrams", "free organ illustrations", "organ system images", "human organ SVG", "organ teaching materials"],
  },
  {
    id: "equipment",
    name: "Lab Equipment",
    icon: "FlaskConical",
    color: "blue",
    seoTitle: "Lab Equipment Illustrations — Free Downloads for Educators",
    seoDescription: "Free lab equipment and medical instrument diagrams for education. Download SVGs and PNGs of microscopes, flasks, and clinical tools — CC BY 4.0 licensed.",
    seoKeywords: ["lab equipment diagrams", "free medical equipment illustrations", "laboratory images", "clinical tools SVG", "lab teaching materials"],
  },
  {
    id: "diagrams",
    name: "Diagrams",
    icon: "LayoutGrid",
    color: "green",
    seoTitle: "Medical Diagrams & Flowcharts — Free Downloads for Educators",
    seoDescription: "Download free medical diagrams, flowcharts, and conceptual illustrations for teaching. SVG and PNG formats — all CC BY 4.0 licensed.",
    seoKeywords: ["medical diagrams", "free medical flowcharts", "conceptual diagrams", "medical education diagrams", "diagram teaching materials"],
  },
];

/* ── Assets ─────────────────────────────────────────────────────── */

import { blobAsset } from "@/lib/blob-url";

const BASE = blobAsset("/assets/media");

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

/* ── Collections ────────────────────────────────────────────────── */

export const mediaAssetCollections: MediaAssetCollection[] = [
  {
    slug: "cardiovascular-system",
    name: "Cardiovascular System Illustration Pack",
    seoTitle: "Cardiovascular System Illustration Pack — Free Medical Images",
    seoDescription: "A curated collection of free cardiovascular system illustrations for medical education. Download heart anatomy and circulatory diagrams in SVG and PNG formats.",
    description:
      "This curated pack brings together all cardiovascular-related illustrations in one place. Perfect for building a complete cardiovascular physiology lecture or study guide. Use these assets together to walk students through heart anatomy, blood flow, and circulatory pathways. Each illustration is designed in a consistent style so they work well side by side on slides or handouts.",
    assetIds: ["human-heart-anatomy"],
    seoKeywords: [
      "cardiovascular illustration pack",
      "free heart diagrams",
      "cardiovascular teaching materials",
      "circulatory system images",
      "cardiovascular lecture slides",
    ],
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
  },
  {
    slug: "cell-biology-starter-kit",
    name: "Cell Biology Starter Kit",
    seoTitle: "Cell Biology Starter Kit — Free Illustrations for Educators",
    seoDescription: "A starter collection of free cell biology illustrations for medical education. Download organelle and cell structure diagrams in SVG and PNG — perfect for lectures.",
    description:
      "Everything you need to introduce cell biology in your classroom. This collection covers essential organelles and cell types, from mitochondria to neurons. Use these illustrations together for a cohesive cell biology unit, or pick individual assets for specific topics. All assets share a consistent visual style for professional-looking presentations.",
    assetIds: ["mitochondria-structure", "neuron-cell-diagram"],
    seoKeywords: [
      "cell biology illustrations",
      "free organelle diagrams",
      "cell biology teaching kit",
      "cell structure images",
      "cell biology lecture materials",
    ],
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
  },
  {
    slug: "neuroscience-essentials",
    name: "Neuroscience Essentials",
    seoTitle: "Neuroscience Essentials — Free Illustrations for Medical Education",
    seoDescription: "A curated pack of free neuroscience illustrations. Download neuron diagrams and nervous system images in SVG and PNG — ideal for neuroscience lectures and study materials.",
    description:
      "Essential neuroscience illustrations for introductory neuroanatomy and physiology courses. This collection includes neuron structure diagrams and supporting visuals that help students understand the building blocks of the nervous system. Perfect for building a lecture series on neuroanatomy, synaptic transmission, or clinical neuroscience.",
    assetIds: ["neuron-cell-diagram"],
    seoKeywords: [
      "neuroscience illustrations",
      "free neuron diagrams",
      "nervous system teaching materials",
      "neuroanatomy images",
      "neuroscience lecture slides",
    ],
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

/* ── Tag helpers ────────────────────────────────────────────────── */

/** Convert a tag string to a URL-safe slug */
export function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Reverse lookup: convert a tag slug back to the original tag string */
export function getTagFromSlug(slug: string): string | undefined {
  const all = getAllTags();
  return all.find((tag) => getTagSlug(tag) === slug);
}

/** Get a deduplicated, sorted array of all tags across all assets */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const asset of mediaAssets) {
    for (const tag of asset.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

/** Get all unique tag slugs (for generateStaticParams) */
export function getAllTagSlugs(): string[] {
  return getAllTags().map(getTagSlug);
}

/** Filter assets that contain the given tag (case-insensitive) */
export function getMediaAssetsByTag(tag: string): MediaAsset[] {
  const lower = tag.toLowerCase();
  return mediaAssets.filter((a) =>
    a.tags.some((t) => t.toLowerCase() === lower),
  );
}

/** Get the number of assets for each tag */
export function getTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const asset of mediaAssets) {
    for (const tag of asset.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return counts;
}

/* ── Collection helpers ─────────────────────────────────────────── */

export function getCollectionBySlug(slug: string): MediaAssetCollection | undefined {
  return mediaAssetCollections.find((c) => c.slug === slug);
}

export function getCollectionAssets(collection: MediaAssetCollection): MediaAsset[] {
  return collection.assetIds
    .map((id) => mediaAssets.find((a) => a.id === id))
    .filter(Boolean) as MediaAsset[];
}

/* ── Category helpers ───────────────────────────────────────────── */

export function getCategoryById(categoryId: string): MediaAssetCategory | undefined {
  return mediaAssetCategories.find((c) => c.id === categoryId);
}
