export interface SearchItemBase {
  href: string;
  category: "page" | "resource" | "tool" | "guide" | "visual" | "media";
}

export interface SearchItemWithKeys extends SearchItemBase {
  titleKey: string;
  descriptionKey: string;
}

export interface SearchItemWithText extends SearchItemBase {
  title: string;
  description: string;
}

/** Resolved item for display/search (has title and description as strings) */
export type SearchItem = SearchItemBase &
  (SearchItemWithKeys | SearchItemWithText);

/**
 * Static search items — pages, resources, tools (always available).
 * Use titleKey/descriptionKey — consumer translates via search.index namespace.
 */
/** Locale-free paths — consumer must prepend /{locale} when navigating */
const staticItems: (SearchItemWithKeys & SearchItemBase)[] = [
  // Pages
  {
    titleKey: "index.home",
    descriptionKey: "index.homeDesc",
    href: "",
    category: "page",
  },
  {
    titleKey: "index.about",
    descriptionKey: "index.aboutDesc",
    href: "/about",
    category: "page",
  },
  {
    titleKey: "index.resources",
    descriptionKey: "index.resourcesDesc",
    href: "/resources",
    category: "page",
  },
  {
    titleKey: "index.practiceQuestions",
    descriptionKey: "index.practiceQuestionsDesc",
    href: "/resources/questions",
    category: "resource",
  },
  {
    titleKey: "index.videoLessons",
    descriptionKey: "index.videoLessonsDesc",
    href: "/resources/videos",
    category: "resource",
  },
  {
    titleKey: "index.pdfsSummaries",
    descriptionKey: "index.pdfsSummariesDesc",
    href: "/resources/pdfs",
    category: "resource",
  },
  {
    titleKey: "index.medicalVisuals",
    descriptionKey: "index.medicalVisualsDesc",
    href: "/resources/visuals",
    category: "resource",
  },
  {
    titleKey: "index.mediaAssets",
    descriptionKey: "index.mediaAssetsDesc",
    href: "/resources/media",
    category: "resource",
  },
  {
    titleKey: "index.medicalTools",
    descriptionKey: "index.medicalToolsDesc",
    href: "/tools",
    category: "tool",
  },
  {
    titleKey: "index.forProfessors",
    descriptionKey: "index.forProfessorsDesc",
    href: "/for-professors",
    category: "page",
  },
  {
    titleKey: "index.medicalCalculators",
    descriptionKey: "index.medicalCalculatorsDesc",
    href: "/calculators",
    category: "tool",
  },
  {
    titleKey: "index.teachingGuides",
    descriptionKey: "index.teachingGuidesDesc",
    href: "/for-professors/guides",
    category: "guide",
  },
  {
    titleKey: "index.teachingAssets",
    descriptionKey: "index.teachingAssetsDesc",
    href: "/for-professors/assets",
    category: "resource",
  },
  {
    titleKey: "index.eventsCommunity",
    descriptionKey: "index.eventsCommunityDesc",
    href: "/events",
    category: "page",
  },
  {
    titleKey: "index.licenseAttribution",
    descriptionKey: "index.licenseAttributionDesc",
    href: "/license",
    category: "page",
  },
  {
    titleKey: "index.privacyPolicy",
    descriptionKey: "index.privacyPolicyDesc",
    href: "/privacy",
    category: "page",
  },
  {
    titleKey: "index.medicalGlossary",
    descriptionKey: "index.medicalGlossaryDesc",
    href: "/resources/glossary",
    category: "resource",
  },

  // ── MCQ Maker (root-level, no locale) ──
  {
    titleKey: "index.mcqMaker",
    descriptionKey: "index.mcqMakerDesc",
    href: "/mcq",
    category: "tool",
  },

  // ── LaTeX Editor (root-level, no locale) ──
  {
    titleKey: "index.latexEditor",
    descriptionKey: "index.latexEditorDesc",
    href: "/editor",
    category: "tool",
  },
];

/**
 * Async factory — loads visual lessons and media assets on first call, then caches.
 * This avoids eagerly importing data at module scope.
 */
let cachedItems: SearchItem[] | null = null;

export async function getSearchItems(): Promise<SearchItem[]> {
  if (cachedItems) return cachedItems;

  const [{ visualLessons }, { mediaAssets }, { getTermSummaries }] =
    await Promise.all([
      import("@/data/visuals"),
      import("@/data/media-assets"),
      import("@/data/glossary-terms"),
    ]);

  const termSummaries = getTermSummaries();

  cachedItems = [
    ...staticItems,
    ...visualLessons.map((lesson: { title: string; description: string }) => ({
      title: `Visual: ${lesson.title}`,
      description: lesson.description,
      href: "/resources/visuals",
      category: "visual" as const,
    })),
    ...mediaAssets.map(
      (asset: { name: string; seoDescription: string; slug: string }) => ({
        title: asset.name,
        description: asset.seoDescription,
        href: `/resources/media/${asset.slug}`,
        category: "media" as const,
      }),
    ),
    ...termSummaries.map(
      (term: { name: string; definition: string; id: string }) => ({
        title: term.name,
        description: term.definition
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/<[^>]+>/g, "")
          .slice(0, 120),
        href: `/resources/glossary/${term.id}`,
        category: "resource" as const,
      }),
    ),
  ];
  return cachedItems;
}

/**
 * @deprecated Use `getSearchItems()` instead. Kept for backward compat.
 * This eagerly exports only static items (no visuals).
 */
export const searchItems: SearchItem[] = staticItems;
