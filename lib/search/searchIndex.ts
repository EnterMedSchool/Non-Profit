export interface SearchItem {
  title: string;
  description: string;
  href: string;
  category: "page" | "resource" | "tool" | "guide" | "visual";
}

/**
 * Static search items — pages, resources, tools (always available).
 */
const staticItems: SearchItem[] = [
  // Pages
  {
    title: "Home",
    description: "Open-source medical education for everyone",
    href: "/en",
    category: "page",
  },
  {
    title: "About",
    description: "Our story, mission, and values",
    href: "/en/about",
    category: "page",
  },
  {
    title: "Resources",
    description: "Browse all free medical education resources",
    href: "/en/resources",
    category: "page",
  },
  {
    title: "Practice Questions",
    description: "Clinical cases and practice questions for deep understanding",
    href: "/en/resources/questions",
    category: "resource",
  },
  {
    title: "Video Lessons",
    description: "Clear video explanations of complex medical topics",
    href: "/en/resources/videos",
    category: "resource",
  },
  {
    title: "PDFs & Summaries",
    description: "Downloadable study materials and reference sheets",
    href: "/en/resources/pdfs",
    category: "resource",
  },
  {
    title: "Medical Visuals",
    description: "Anatomy diagrams and clinical illustrations",
    href: "/en/resources/visuals",
    category: "resource",
  },
  {
    title: "Medical Tools",
    description: "Calculators, simulators, and interactive learning tools",
    href: "/en/tools",
    category: "tool",
  },
  {
    title: "For Professors",
    description: "Teaching resources, templates, and guides for educators",
    href: "/en/for-professors",
    category: "page",
  },
  {
    title: "Medical Calculators",
    description: "Free medical calculators and clinical algorithms",
    href: "/en/calculators",
    category: "tool",
  },
  {
    title: "Teaching Guides",
    description: "Guides on using AI, clinical cases, and resources in teaching",
    href: "/en/for-professors/guides",
    category: "guide",
  },
  {
    title: "Teaching Assets",
    description: "Downloadable logos, diagrams, and visual assets",
    href: "/en/for-professors/assets",
    category: "resource",
  },
  {
    title: "Events & Community",
    description: "Events, community building, and student organization resources",
    href: "/en/events",
    category: "page",
  },
  {
    title: "License & Attribution",
    description: "License info and attribution badge generator",
    href: "/en/license",
    category: "page",
  },
  {
    title: "Privacy Policy",
    description: "How we protect your data",
    href: "/en/privacy",
    category: "page",
  },

  // ── MCQ Maker ──
  {
    title: "MCQ Maker",
    description: "Create, import, and export multiple choice questions & exams. Free quiz maker with PDF export and embeddable quizzes.",
    href: "/mcq",
    category: "tool",
  },

  // ── LaTeX Editor ──
  {
    title: "LaTeX Editor",
    description: "Learn and write LaTeX with live preview, drag-and-drop snippets, and medical templates. Free Overleaf alternative for thesis writing and research papers.",
    href: "/editor",
    category: "tool",
  },
];

/**
 * Async factory — loads visual lessons data on first call, then caches.
 * This avoids eagerly importing ~25KB of visuals data at module scope.
 */
let cachedItems: SearchItem[] | null = null;

export async function getSearchItems(): Promise<SearchItem[]> {
  if (cachedItems) return cachedItems;

  const { visualLessons } = await import("@/data/visuals");
  cachedItems = [
    ...staticItems,
    ...visualLessons.map((lesson: { title: string; description: string }) => ({
      title: `Visual: ${lesson.title}`,
      description: lesson.description,
      href: "/en/resources/visuals",
      category: "visual" as const,
    })),
  ];
  return cachedItems;
}

/**
 * @deprecated Use `getSearchItems()` instead. Kept for backward compat.
 * This eagerly exports only static items (no visuals).
 */
export const searchItems: SearchItem[] = staticItems;
