import type { Tool } from "@/data/tools";
import type { Resource } from "@/data/resources";
import type { PDFBook, PDFChapter } from "@/data/pdf-books";
import type { VisualLesson } from "@/data/visuals";
import type { MediaAsset } from "@/data/media-assets";
import type { GlossaryTerm, GlossaryCategory } from "@/types/glossary";
import type { ClinicalCase } from "@/data/clinical-cases";
import type { PracticeQuestion } from "@/types/practice-questions";
import type { Flashcard } from "@/types/flashcard-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ── Shared provider reference ────────────────────────────────────── */
const ORGANIZATION_REF = {
  "@type": "Organization",
  name: "EnterMedSchool.org",
  url: BASE_URL,
};

/* ── Glossary: primary_tag → schema.org MedicalSpecialty ──────────── */
const TAG_TO_SPECIALTY: Record<string, string> = {
  cardio: "Cardiovascular",
  neuro: "Neurologic",
  gi: "Gastroenterologic",
  renal: "Renal",
  peds: "Pediatric",
  endocrine: "Endocrine",
  emerg: "Emergency",
  rheum: "Musculoskeletal",
  obgyn: "Obstetric",
  heme_onc: "Hematologic",
  msk_derm: "Dermatologic",
  infectious_dz: "InfectiousDisease",
  surgery: "Surgical",
  pulm: "Pulmonary",
  biochemistry: "Pathology",
  anatomy: "Anesthesia",
  biology: "PublicHealth",
};

/**
 * JSON-LD Organization schema for the homepage
 */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: "EnterMedSchool.org",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Free, open-source medical education resources, tools, and guides for educators worldwide.",
    foundingDate: "2019",
    founder: {
      "@type": "Person",
      name: "Ari Horesh",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "ari@entermedschool.com",
      contactType: "General",
    },
    sameAs: [
      "https://entermedschool.com",
      "https://github.com/enterMedSchool/Non-Profit",
      "https://x.com/entermedschool",
    ],
    knowsAbout: [
      "Medical Education",
      "Clinical Medicine",
      "Anatomy",
      "Pathology",
      "Pharmacology",
    ],
  };
}

/**
 * JSON-LD WebSite schema with SearchAction
 */
export function getWebSiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EnterMedSchool.org",
    url: BASE_URL,
    inLanguage: locale,
    description:
      "Free, open-source medical education resources for educators worldwide.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/${locale}/resources?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * JSON-LD structured data for an individual tool page.
 *
 * Emits two schemas:
 * 1. MedicalWebPage — signals authoritative medical content to Google
 * 2. SoftwareApplication — marks it as a free web app in search results
 */
export function getToolJsonLd(
  tool: Tool,
  title: string,
  description: string,
  locale: string,
  urlOverride?: string,
) {
  const toolUrl = urlOverride || `${BASE_URL}/${locale}/tools/${tool.id}`;

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: title,
    description,
    url: toolUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Clinician",
    },
    lastReviewed: "2025-06-01",
    ...(tool.seoKeywords && { keywords: tool.seoKeywords.join(", ") }),
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    url: toolUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
  };

  return [medicalWebPage, softwareApp];
}

/* ================================================================== */
/*  New schema generators for site-wide SEO                           */
/* ================================================================== */

/**
 * Generic WebPage schema for simple pages (privacy, license, etc.)
 */
export function getWebPageJsonLd(
  title: string,
  description: string,
  url: string,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: "EnterMedSchool.org", url: BASE_URL },
    provider: ORGANIZATION_REF,
  };
}

/**
 * AboutPage schema with enhanced organization info
 */
export function getAboutPageJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About EnterMedSchool",
    url: `${BASE_URL}/${locale}/about`,
    inLanguage: locale,
    description:
      "Learn about EnterMedSchool's mission to provide free, open-source medical education resources worldwide.",
    mainEntity: {
      "@type": ["Organization", "EducationalOrganization"],
      name: "EnterMedSchool.org",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      foundingDate: "2019",
      founder: {
        "@type": "Person",
        name: "Ari Horesh",
      },
      description:
        "Free, open-source medical education resources, tools, and guides for educators worldwide.",
      sameAs: [
        "https://entermedschool.com",
        "https://github.com/enterMedSchool/Non-Profit",
      ],
    },
  };
}

/**
 * CollectionPage schema for listing pages
 */
export function getCollectionPageJsonLd(
  title: string,
  description: string,
  url: string,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: "EnterMedSchool.org", url: BASE_URL },
    provider: ORGANIZATION_REF,
  };
}

/**
 * ItemList schema for resource/tool collections
 */
export function getItemListJsonLd(
  items: Array<{ name: string; url: string; position: number }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * VideoObject schema for video resources
 */
export function getVideoObjectJsonLd(
  video: Resource,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    uploadDate: new Date().toISOString().split("T")[0],
    ...(video.sourceUrl && { contentUrl: video.sourceUrl }),
    ...(video.previewUrl && { thumbnailUrl: video.previewUrl }),
    publisher: ORGANIZATION_REF,
    inLanguage: locale,
    isAccessibleForFree: true,
  };
}

/**
 * Event schema for events page
 */
export function getEventJsonLd(event: {
  name: string;
  description: string;
  location?: string;
  startDate?: string;
  locale?: string;
}) {
  const { locale, ...eventData } = event;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    ...(locale && { inLanguage: locale }),
    organizer: ORGANIZATION_REF,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.location && {
      location: {
        "@type": "Place",
        name: event.location,
      },
    }),
    ...(event.startDate && { startDate: event.startDate }),
    isAccessibleForFree: true,
  };
}

/**
 * LearningResource schema for educational content (PDFs, questions, visuals)
 */
export function getLearningResourceJsonLd(
  resource: Resource,
  locale: string,
) {
  const learningResourceType: Record<string, string> = {
    questions: "Practice",
    pdfs: "Reading",
    visuals: "Visual",
    videos: "Video",
  };

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description,
    learningResourceType: learningResourceType[resource.category] || "Other",
    educationalLevel: "University",
    isAccessibleForFree: true,
    inLanguage: locale,
    provider: ORGANIZATION_REF,
    ...(resource.downloadUrl && { url: resource.downloadUrl }),
    ...(resource.sourceUrl && { url: resource.sourceUrl }),
  };
}

/**
 * Course schema for structured visual lessons
 */
export function getCourseJsonLd(
  title: string,
  description: string,
  url: string,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    url,
    provider: ORGANIZATION_REF,
    inLanguage: locale,
    isAccessibleForFree: true,
    educationalLevel: "University",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "Self-paced",
    },
  };
}

/**
 * Book schema for PDF textbooks
 */
export function getBookJsonLd(book: PDFBook, locale: string) {
  const bookUrl = `${BASE_URL}/${locale}/resources/pdfs/${book.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternateName: book.subtitle,
    description: book.description,
    url: bookUrl,
    inLanguage: locale,
    author: book.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      ...(a.affiliation && {
        affiliation: { "@type": "Organization", name: a.affiliation },
      }),
    })),
    publisher: ORGANIZATION_REF,
    dateModified: book.lastUpdated,
    bookEdition: book.version,
    numberOfPages: book.totalPages,
    isAccessibleForFree: true,
    license: `${BASE_URL}/${locale}/license`,
    educationalLevel: "University",
    about: {
      "@type": "Thing",
      name: book.subject,
    },
    hasPart: book.chapters.map((ch, i) => ({
      "@type": "Chapter",
      name: ch.title,
      position: i + 1,
      url: `${bookUrl}/${ch.slug}`,
      description: ch.description,
    })),
    keywords: book.tags.join(", "),
  };
}

/**
 * Chapter schema for individual PDF chapters
 */
export function getChapterJsonLd(
  book: PDFBook,
  chapter: PDFChapter,
  locale: string,
) {
  const bookUrl = `${BASE_URL}/${locale}/resources/pdfs/${book.slug}`;
  const chapterUrl = `${bookUrl}/${chapter.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `${chapter.title} — ${book.title}`,
    description: chapter.description,
    url: chapterUrl,
    position: chapter.number,
    isPartOf: {
      "@type": "Book",
      name: book.title,
      url: bookUrl,
    },
    author: book.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
    })),
    publisher: ORGANIZATION_REF,
    inLanguage: locale,
    isAccessibleForFree: true,
    educationalLevel: "University",
    keywords: chapter.keyTopics.join(", "),
    timeRequired: `PT${chapter.estimatedReadTime}M`,
  };
}

/**
 * JSON-LD structured data for an individual visual lesson page.
 *
 * Emits three schemas:
 * 1. MedicalWebPage — signals authoritative medical content to Google
 * 2. Course — marks it as educational content with layers as parts
 * 3. LearningResource — educational metadata with key facts
 */
export function getVisualLessonJsonLd(lesson: VisualLesson, locale: string) {
  const lessonUrl = `${BASE_URL}/${locale}/resources/visuals/${lesson.id}`;

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: lesson.title,
    description: lesson.description,
    url: lessonUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Clinician",
    },
    lastReviewed: "2025-06-01",
    keywords: lesson.tags.join(", "),
    thumbnailUrl: lesson.thumbnailPath,
  };

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${lesson.title} — Visual Medical Lesson`,
    description: lesson.description,
    url: lessonUrl,
    provider: ORGANIZATION_REF,
    inLanguage: locale,
    isAccessibleForFree: true,
    educationalLevel: "University",
    timeRequired: `PT${lesson.duration.replace(/[^0-9]/g, "")}M`,
    image: lesson.thumbnailPath,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "Self-paced",
    },
    hasPart: lesson.layers.map((layer, i) => ({
      "@type": "CreativeWork",
      name: layer.name,
      position: i + 1,
    })),
    about: lesson.keyFacts.map((fact) => ({
      "@type": "DefinedTerm",
      name: fact.term,
      description: fact.description,
    })),
    keywords: lesson.tags.join(", "),
  };

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.description,
    url: lessonUrl,
    learningResourceType: "Visual",
    educationalLevel: "University",
    isAccessibleForFree: true,
    inLanguage: locale,
    provider: ORGANIZATION_REF,
    author: {
      "@type": "Person",
      name: lesson.creator.name,
      ...(lesson.creator.url && { url: lesson.creator.url }),
    },
    thumbnailUrl: lesson.thumbnailPath,
    keywords: lesson.tags.join(", "),
  };

  return [medicalWebPage, course, learningResource];
}

/**
 * SoftwareSourceCode schema for embed-code pages.
 * Helps Google understand the page offers embeddable source code
 * and links to the full repository.
 */
export function getSoftwareSourceCodeJsonLd(opts: {
  codePageUrl: string;
  title: string;
  description: string;
  locale: string;
  sourceUrl?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${opts.title} — Embeddable HTML Code`,
    description: opts.description,
    url: opts.codePageUrl,
    codeRepository: opts.sourceUrl || `https://github.com/enterMedSchool/Non-Profit`,
    programmingLanguage: "HTML",
    runtimePlatform: "Web Browser",
    license: `${BASE_URL}/${opts.locale}/license`,
    isAccessibleForFree: true,
    provider: ORGANIZATION_REF,
    ...(opts.keywords && { keywords: opts.keywords.join(", ") }),
  };
}

/**
 * JSON-LD structured data for an individual media asset page.
 *
 * Emits two schemas:
 * 1. ImageObject — optimised for Google Images rich results
 * 2. MedicalWebPage — signals authoritative medical content
 */
export function getMediaAssetJsonLd(asset: MediaAsset, locale: string) {
  const assetUrl = `${BASE_URL}/${locale}/resources/media/${asset.slug}`;
  const contentUrl = asset.imagePath;
  const licenseUrl =
    asset.license === "CC BY 4.0"
      ? "https://creativecommons.org/licenses/by/4.0/"
      : `${BASE_URL}/${locale}/license`;

  const imageObject = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: asset.name,
    description: asset.seoDescription,
    contentUrl,
    thumbnailUrl: asset.thumbnailPath,
    url: assetUrl,
    width: { "@type": "QuantitativeValue", value: asset.width, unitCode: "E37" },
    height: { "@type": "QuantitativeValue", value: asset.height, unitCode: "E37" },
    encodingFormat: asset.format === "svg" ? "image/svg+xml" : "image/png",
    license: licenseUrl,
    acquireLicensePage: `${BASE_URL}/${locale}/license`,
    creditText: asset.attribution,
    creator: ORGANIZATION_REF,
    copyrightHolder: ORGANIZATION_REF,
    datePublished: asset.datePublished,
    dateModified: asset.dateModified,
    keywords: asset.seoKeywords.join(", "),
    isAccessibleForFree: true,
    inLanguage: locale,
  };

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: asset.seoTitle,
    description: asset.seoDescription,
    url: assetUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Clinician",
    },
    lastReviewed: asset.dateModified,
    keywords: asset.seoKeywords.join(", "),
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl,
    },
    mainEntity: {
      "@type": "ImageObject",
      contentUrl,
      name: asset.name,
    },
  };

  return [imageObject, medicalWebPage];
}

/**
 * FAQPage schema (ready for future use)
 */
export function getFAQPageJsonLd(
  items: Array<{ question: string; answer: string }>,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/* ================================================================== */
/*  Clinical Case SEO schemas                                         */
/* ================================================================== */

/**
 * JSON-LD structured data for an individual clinical case page.
 *
 * Emits two schemas:
 * 1. MedicalWebPage — signals authoritative medical content
 * 2. LearningResource — educational content with objectives & metadata
 */
export function getClinicalCaseJsonLd(
  clinicalCase: ClinicalCase,
  locale: string,
) {
  const caseUrl = `${BASE_URL}/${locale}/resources/clinical-cases/${clinicalCase.id}`;

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${clinicalCase.title} — Clinical Case`,
    description: `${clinicalCase.difficulty} ${clinicalCase.category} clinical case: ${clinicalCase.patient.briefHistory}`,
    url: caseUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    medicalAudience: [
      { "@type": "MedicalAudience", audienceType: "Clinician" },
      { "@type": "MedicalAudience", audienceType: "MedicalStudent" },
    ],
    about: {
      "@type": "MedicalCondition",
      name: clinicalCase.answerKey.diagnosis,
    },
    keywords: clinicalCase.tags.join(", "),
  };

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: clinicalCase.title,
    description: `Interactive ${clinicalCase.difficulty} clinical case in ${clinicalCase.category}. ${clinicalCase.patient.briefHistory}`,
    url: caseUrl,
    learningResourceType: "Case Study",
    educationalLevel: "University",
    isAccessibleForFree: true,
    inLanguage: locale,
    provider: ORGANIZATION_REF,
    timeRequired: `PT${clinicalCase.estimatedMinutes}M`,
    teaches: clinicalCase.learningObjectives.join("; "),
    typicalAgeRange: "18-",
    interactivityType: "active",
    keywords: clinicalCase.tags.join(", "),
  };

  return [medicalWebPage, learningResource];
}

/* ================================================================== */
/*  Glossary SEO schemas                                              */
/* ================================================================== */

/**
 * Count total words across all text content in a glossary term.
 * Used to compute reading time for LearningResource.timeRequired.
 */
function countTermWords(term: GlossaryTerm): number {
  const texts: string[] = [term.definition];
  if (term.why_it_matters) texts.push(term.why_it_matters);
  for (const arr of [
    term.how_youll_see_it, term.problem_solving, term.treatment,
    term.tricks, term.exam_appearance, term.red_flags, term.algorithm,
    term.tips, term.clinical_usage, term.pearls, term.clinical_significance,
    term.key_concepts,
  ]) {
    if (arr?.length) texts.push(...arr);
  }
  if (term.differentials?.length) {
    texts.push(...term.differentials.map((d) => `${d.name || ""} ${d.hint}`));
  }
  if (term.cases?.length) {
    texts.push(...term.cases.map((c) => `${c.stem} ${c.clues.join(" ")} ${c.answer} ${c.teaching}`));
  }
  return texts.join(" ").split(/\s+/).length;
}

/**
 * Compute ISO 8601 duration string from word count (200 wpm average).
 * Returns at least PT2M (minimum reading time).
 */
function computeReadingTimeISO(wordCount: number): string {
  const minutes = Math.max(2, Math.round(wordCount / 200));
  return `PT${minutes}M`;
}

/**
 * Build a human-readable "teaches" string for the LearningResource schema.
 */
function buildTeachesString(term: GlossaryTerm): string {
  const name = term.names[0];
  switch (term.level) {
    case "formula":
      return `how to calculate and interpret ${name}`;
    case "lab-value":
      return `normal ranges and clinical interpretation of ${name}`;
    case "premed":
      return `key concepts and exam preparation for ${name}`;
    case "physiological":
      return `normal values, calculation, and clinical relevance of ${name}`;
    default: {
      const parts = ["diagnosis"];
      if (term.treatment?.length) parts.push("treatment");
      if (term.differentials?.length) parts.push("differential diagnosis");
      return `${name} ${parts.join(", ")}`;
    }
  }
}

/**
 * Build the learningResourceType string based on term level.
 */
function getLearningResourceType(term: GlossaryTerm): string {
  switch (term.level) {
    case "formula": return "interactive calculator";
    case "lab-value": return "reference table";
    case "premed": return "study guide";
    case "physiological": return "reference guide";
    default: return "glossary entry";
  }
}

/** Strip markdown bold/underline for plain text meta descriptions */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<u>(.*?)<\/u>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** Truncate to max length at a word boundary, adding ellipsis */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Build an SEO-optimized title tag for a glossary term.
 * Varies by term type (medical condition, premed, formula, lab-value).
 */
export function buildGlossaryTermTitle(term: GlossaryTerm): string {
  const name = term.names[0];
  const alias = term.abbr?.[0] || term.aliases?.[0];
  const parenthetical = alias ? ` (${alias})` : "";

  switch (term.level) {
    case "formula":
      return `${name}${parenthetical} Calculator & Formula — Medical Calculator | EnterMedSchool`;
    case "lab-value":
      return `${name}${parenthetical} — Normal Range, High & Low Interpretation | EnterMedSchool`;
    case "premed":
      return `${name}${parenthetical} — Definition & Key Concepts for Medical Students | EnterMedSchool`;
    default: {
      const hasTreatment = !!term.treatment?.length;
      const hasDifferentials = !!term.differentials?.length;
      const suffix = hasTreatment
        ? "Definition, Causes & Treatment"
        : hasDifferentials
          ? "Definition, Diagnosis & Differentials"
          : "Definition & Clinical Overview";
      return `${name}${parenthetical} — ${suffix} | EnterMedSchool`;
    }
  }
}

/**
 * Build an SEO-optimized meta description for a glossary term.
 * 150-160 chars, compelling, leads with hooks & exam relevance.
 */
export function buildGlossaryTermDescription(term: GlossaryTerm): string {
  const name = term.names[0];
  const alias = term.abbr?.[0] || term.aliases?.[0];
  const paren = alias ? ` (${alias})` : "";

  switch (term.level) {
    case "formula": {
      const expr = term.formula?.expression || "";
      const pearl = term.pearls?.[0] ? ` ${stripMarkdown(term.pearls[0]).split(".")[0]}.` : "";
      return truncate(
        `${name} calculator: ${expr}.${pearl} Interactive tool with interpretation bands & clinical pearls. Free for med students.`,
        160,
      );
    }
    case "lab-value": {
      const range = term.reference_range;
      const rangeStr = range ? `${range.low}–${range.high} ${range.unit}` : "";
      const interp = term.interpretation as import("@/types/glossary").LabInterpretation | undefined;
      const highTerm = interp?.high?.term;
      const lowTerm = interp?.low?.term;
      const versus = highTerm && lowTerm ? ` ${lowTerm} vs ${highTerm} causes, severity levels & when to panic.` : "";
      return truncate(
        `${name}${paren} normal: ${rangeStr}.${versus} Free lab reference for med students.`,
        160,
      );
    }
    case "premed": {
      const firstTip = term.tips?.[0] ? stripMarkdown(term.tips[0]).split(".")[0] + "." : "";
      return truncate(
        `${name}${paren}: ${firstTip || stripMarkdown(term.definition).split(".")[0] + "."} Exam buzzwords & key concepts explained. Free pre-med study guide.`,
        160,
      );
    }
    default: {
      const mnemonic = term.tricks?.[0] ? stripMarkdown(term.tricks[0]).split(".")[0] + "." : "";
      const hasExam = term.exam_appearance?.length;
      const examTag = hasExam ? " High-yield exam scenarios included." : "";
      if (mnemonic) {
        return truncate(
          `${name}${paren}: ${mnemonic}${examTag} Diagnosis, treatment & mnemonics. Free study guide for medical students.`,
          160,
        );
      }
      return truncate(
        `${name}${paren}: ${stripMarkdown(term.definition).split(".")[0]}.${examTag} Diagnosis, treatment & mnemonics. Free study guide for medical students.`,
        160,
      );
    }
  }
}

/**
 * JSON-LD structured data for a glossary term page.
 *
 * Emits up to 8 schemas for maximum rich-result eligibility:
 * 1. DefinedTerm — glossary term definition
 * 2. MedicalCondition — medical knowledge panel (condition terms only)
 * 3. MedicalWebPage — authority & audience signals
 * 4. BreadcrumbList — breadcrumb rich snippets
 * 5. FAQPage — auto-generated from term sections (expanded with type-specific Qs)
 * 6. LearningResource — educational content targeting
 * 7. ImageObject — for terms with medical images
 * 8. HowTo — for terms with clinical algorithm steps
 */
export function getGlossaryTermJsonLd(
  term: GlossaryTerm,
  locale: string,
  categoryName: string,
) {
  const termUrl = `${BASE_URL}/${locale}/resources/glossary/${term.id}`;
  const glossaryUrl = `${BASE_URL}/${locale}/resources/glossary`;
  const categoryUrl = `${BASE_URL}/${locale}/resources/glossary/category/${term.primary_tag}`;

  const schemas: Record<string, unknown>[] = [];

  // 1. DefinedTerm
  schemas.push({
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.names[0],
    ...(term.aliases?.length || term.abbr?.length
      ? {
          alternateName: [
            ...(term.aliases || []),
            ...(term.abbr || []),
          ],
        }
      : {}),
    description: stripMarkdown(term.definition),
    termCode: term.id,
    url: termUrl,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "EnterMedSchool Medical Glossary",
      url: glossaryUrl,
    },
  });

  // 2. MedicalCondition (for medical-level terms with clinical content)
  if (!term.level || term.level === "physiological") {
    const specialty = TAG_TO_SPECIALTY[term.primary_tag];
    const medicalCondition: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      name: term.names[0],
      ...(term.aliases?.length ? { alternateName: term.aliases } : {}),
      description: stripMarkdown(term.definition),
      url: termUrl,
      ...(specialty ? { medicalSpecialty: { "@type": "MedicalSpecialty", name: specialty } } : {}),
    };

    if (term.how_youll_see_it?.length) {
      medicalCondition.signOrSymptom = term.how_youll_see_it.slice(0, 3).map((s) => ({
        "@type": "MedicalSignOrSymptom",
        name: stripMarkdown(s).slice(0, 100),
      }));
    }
    if (term.treatment?.length) {
      medicalCondition.possibleTreatment = term.treatment.slice(0, 3).map((t) => ({
        "@type": "MedicalTherapy",
        name: stripMarkdown(t).slice(0, 100),
      }));
    }
    if (term.differentials?.length) {
      medicalCondition.differentialDiagnosis = term.differentials.map((d) => ({
        "@type": "DDxElement",
        diagnosis: {
          "@type": "MedicalCondition",
          name: d.name || d.id || "Unknown",
        },
        distinguishingSign: d.hint,
      }));
    }
    schemas.push(medicalCondition);
  }

  // 3. MedicalWebPage
  schemas.push({
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: buildGlossaryTermTitle(term),
    description: buildGlossaryTermDescription(term),
    url: termUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    lastReviewed: term.lastModified || "2025-06-01",
    reviewedBy: ORGANIZATION_REF,
    medicalAudience: [
      { "@type": "MedicalAudience", audienceType: "Clinician" },
      { "@type": "MedicalAudience", audienceType: "MedicalStudent" },
    ],
    about: { "@type": "DefinedTerm", name: term.names[0] },
    ...(term.sources?.length
      ? {
          citation: term.sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.title,
            url: s.url,
          })),
        }
      : {}),
    keywords: [
      term.names[0],
      ...(term.aliases || []),
      ...(term.abbr || []),
      ...(term.tags || []),
    ].join(", "),
  });

  // 4. BreadcrumbList
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${BASE_URL}/${locale}/resources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Medical Glossary",
        item: glossaryUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: categoryName,
        item: categoryUrl,
      },
      { "@type": "ListItem", position: 5, name: term.names[0] },
    ],
  });

  // 5. FAQPage — auto-generated from term sections (expanded with type-specific questions)
  const faqItems: Array<{ question: string; answer: string }> = [];
  const name = term.names[0];

  faqItems.push({
    question: `What is ${name}?`,
    answer: stripMarkdown(term.definition),
  });

  // Medical condition FAQs
  if (term.treatment?.length) {
    faqItems.push({
      question: `How is ${name} treated?`,
      answer: stripMarkdown(term.treatment.join(" ")),
    });
  }
  if (term.red_flags?.length) {
    faqItems.push({
      question: `What are the red flags for ${name}?`,
      answer: stripMarkdown(term.red_flags.join(" ")),
    });
  }
  if (term.algorithm?.length) {
    faqItems.push({
      question: `How is ${name} diagnosed?`,
      answer: stripMarkdown(term.algorithm.join(" ")),
    });
  }
  if (term.differentials?.length) {
    faqItems.push({
      question: `What are the differential diagnoses for ${name}?`,
      answer: term.differentials
        .map((d) => `${d.name || d.id}: ${d.hint}`)
        .join(". "),
    });
  }
  // Exam-oriented FAQs (medical terms)
  if (term.exam_appearance?.length) {
    faqItems.push({
      question: `How does ${name} appear on medical exams?`,
      answer: stripMarkdown(term.exam_appearance.join(" ")),
    });
  }
  if (term.tricks?.length) {
    faqItems.push({
      question: `What is the best mnemonic for ${name}?`,
      answer: stripMarkdown(term.tricks.join(" ")),
    });
  }

  // Formula-specific FAQs
  if (term.level === "formula") {
    if (term.formula?.expression) {
      faqItems.push({
        question: `How do you calculate ${name}?`,
        answer: `${name} is calculated as: ${term.formula.expression}. The result is measured in ${term.formula.unit}.`,
      });
    }
    if (term.clinical_usage?.length) {
      faqItems.push({
        question: `When is ${name} clinically useful?`,
        answer: stripMarkdown(term.clinical_usage.join(" ")),
      });
    }
  }

  // Lab-value-specific FAQs
  if (term.level === "lab-value") {
    if (term.reference_range) {
      const r = term.reference_range;
      faqItems.push({
        question: `What is the normal range for ${name}?`,
        answer: `The normal range for ${name} is ${r.low}–${r.high} ${r.unit}.${r.critical_low ? ` Critical low: <${r.critical_low} ${r.unit}.` : ""}${r.critical_high ? ` Critical high: >${r.critical_high} ${r.unit}.` : ""}`,
      });
    }
    const labInterp = term.interpretation as import("@/types/glossary").LabInterpretation | undefined;
    if (labInterp?.high?.common_causes?.length) {
      faqItems.push({
        question: `What causes high ${name}?`,
        answer: `Common causes of elevated ${name}: ${labInterp.high.common_causes.join(", ")}.`,
      });
    }
    if (labInterp?.low?.common_causes?.length) {
      faqItems.push({
        question: `What causes low ${name}?`,
        answer: `Common causes of low ${name}: ${labInterp.low.common_causes.join(", ")}.`,
      });
    }
  }

  if (faqItems.length > 1) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  // 6. LearningResource — educational content targeting
  const wordCount = countTermWords(term);
  schemas.push({
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${name} — Study Guide for Medical Students`,
    description: buildGlossaryTermDescription(term),
    url: termUrl,
    inLanguage: locale,
    learningResourceType: getLearningResourceType(term),
    educationalLevel: term.level === "premed" ? "Undergraduate" : "University",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Medical Student",
    },
    teaches: buildTeachesString(term),
    timeRequired: computeReadingTimeISO(wordCount),
    isAccessibleForFree: true,
    provider: ORGANIZATION_REF,
    ...(term.sources?.length
      ? {
          citation: term.sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.title,
            url: s.url,
          })),
        }
      : {}),
  });

  // 7. ImageObject — for terms with images
  if (term.images?.length) {
    for (const img of term.images) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl: img.src,
        description: img.alt,
        ...(img.credit
          ? { creditText: img.credit.text, acquireLicensePage: img.credit.href }
          : {}),
        isPartOf: { "@type": "WebPage", url: termUrl },
      });
    }
  }

  // 8. HowTo — for terms with clinical algorithm steps
  if (term.algorithm?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to diagnose ${name}`,
      description: `Step-by-step clinical algorithm for diagnosing ${name}`,
      url: termUrl,
      step: term.algorithm.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text: stripMarkdown(step),
      })),
      provider: ORGANIZATION_REF,
    });
  }

  return schemas;
}

/**
 * JSON-LD for the glossary hub page.
 * DefinedTermSet + CollectionPage
 */
export function getGlossaryHubJsonLd(
  totalTerms: number,
  locale: string,
) {
  const glossaryUrl = `${BASE_URL}/${locale}/resources/glossary`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "EnterMedSchool Medical Glossary",
      description: `A comprehensive medical glossary with ${totalTerms} terms covering 30+ specialties. Free definitions, mnemonics, clinical cases, and treatment guides.`,
      url: glossaryUrl,
      inLanguage: locale,
      publisher: ORGANIZATION_REF,
      isAccessibleForFree: true,
      educationalLevel: "University",
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Medical Glossary — ${totalTerms} Free Medical Terms`,
      description: `Browse ${totalTerms} free medical terms with definitions, mnemonics, clinical cases & treatment guides.`,
      url: glossaryUrl,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: "EnterMedSchool.org",
        url: BASE_URL,
      },
      provider: ORGANIZATION_REF,
    },
  ];
}

/**
 * JSON-LD for a glossary category page.
 * CollectionPage + ItemList + BreadcrumbList
 */
export function getGlossaryCategoryJsonLd(
  category: GlossaryCategory,
  terms: Array<{ id: string; name: string }>,
  locale: string,
) {
  const categoryUrl = `${BASE_URL}/${locale}/resources/glossary/category/${category.id}`;
  const glossaryUrl = `${BASE_URL}/${locale}/resources/glossary`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} Medical Terms`,
      description: `${category.count} ${category.name.toLowerCase()} terms with definitions, clinical cases, and study guides.`,
      url: categoryUrl,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: "EnterMedSchool.org",
        url: BASE_URL,
      },
      provider: ORGANIZATION_REF,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: terms.length,
      itemListElement: terms.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${BASE_URL}/${locale}/resources/glossary/${t.id}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: `${BASE_URL}/${locale}/resources`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Medical Glossary",
          item: glossaryUrl,
        },
        { "@type": "ListItem", position: 4, name: category.name },
      ],
    },
  ];
}

/* ================================================================== */
/*  SEO Enhancement Schemas                                            */
/* ================================================================== */

/**
 * SiteNavigationElement — tells Google about the site's main navigation
 * structure, helping trigger sitelinks in search results.
 */
export function getSiteNavigationJsonLd(locale: string) {
  const nav = [
    { name: "Resources", url: `${BASE_URL}/${locale}/resources` },
    { name: "Medical Glossary", url: `${BASE_URL}/${locale}/resources/glossary` },
    { name: "Visual Lessons", url: `${BASE_URL}/${locale}/resources/visuals` },
    { name: "PDF Textbooks", url: `${BASE_URL}/${locale}/resources/pdfs` },
    { name: "Media Library", url: `${BASE_URL}/${locale}/resources/media` },
    { name: "Tools", url: `${BASE_URL}/${locale}/tools` },
    { name: "Calculators", url: `${BASE_URL}/${locale}/calculators` },
    { name: "For Professors", url: `${BASE_URL}/${locale}/for-professors` },
    { name: "Clinical Cases", url: `${BASE_URL}/${locale}/resources/clinical-cases` },
    { name: "About", url: `${BASE_URL}/${locale}/about` },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Main Navigation",
    url: BASE_URL,
    hasPart: nav.map((item) => ({
      "@type": "WebPage",
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * HowTo schema for tool pages — targets featured snippets for
 * "how to create medical flashcards" etc.
 */
export function getHowToJsonLd(
  tool: Tool,
  title: string,
  description: string,
  locale: string,
  steps: { name: string; text: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    url: `${BASE_URL}/${locale}/tools/${tool.id}`,
    totalTime: "PT5M",
    tool: {
      "@type": "HowToTool",
      name: "Web browser",
    },
    supply: [],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${BASE_URL}/${locale}/tools/${tool.id}#step-${i + 1}`,
    })),
    provider: ORGANIZATION_REF,
  };
}

/**
 * Add speakable property to glossary term JSON-LD — helps voice assistants
 * surface term definitions in voice search results.
 */
export function getGlossarySpeakableJsonLd(
  term: GlossaryTerm,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: term.names[0],
    url: `${BASE_URL}/${locale}/resources/glossary/${term.id}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='definition']",
        "[data-speakable='summary']",
      ],
    },
    mainEntity: {
      "@type": "DefinedTerm",
      name: term.names[0],
      description: term.definition,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "EnterMedSchool Medical Glossary",
        url: `${BASE_URL}/${locale}/resources/glossary`,
      },
    },
  };
}

/**
 * Blog Article JSON-LD schema.
 * Enhanced with wordCount, articleSection, speakable, and rich Author.
 */
export function getBlogArticleJsonLd(
  article: {
    title: string;
    description: string;
    slug: string;
    author: string;
    datePublished: string;
    dateModified: string;
    tags: string[];
    category?: string;
    wordCount?: number;
    imageUrl?: string;
    /** Rich author object from data/authors.ts (optional — falls back to plain name) */
    authorJsonLd?: { "@type": "Person"; name: string; url?: string; jobTitle?: string; sameAs?: string[] };
  },
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}/${locale}/articles/${article.slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: article.authorJsonLd ?? {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "EnterMedSchool.org",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/${locale}/articles/${article.slug}`,
    },
    inLanguage: locale,
    ...(article.imageUrl && {
      image: {
        "@type": "ImageObject",
        url: article.imageUrl,
      },
    }),
    keywords: article.tags.join(", "),
    ...(article.category && { articleSection: article.category }),
    ...(article.wordCount && { wordCount: article.wordCount }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "[id='article-body'] > p:first-of-type"],
    },
    isPartOf: {
      "@type": "WebSite",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
  };
}

/* ── Practice Question schemas ───────────────────────────────── */

/**
 * JSON-LD Quiz schema for an individual MCQ question page.
 * Uses eduQuestionType "Multiple choice" for Google Education Q&A.
 */
export function getQuizQuestionJsonLd(
  question: PracticeQuestion,
  deckTitle: string,
  categoryName: string,
  locale: string,
) {
  const correctOption = question.options.find((o) => o.isCorrect);
  const wrongOptions = question.options.filter((o) => !o.isCorrect);
  const promptExcerpt = question.prompt.length > 80
    ? question.prompt.slice(0, 77) + "…"
    : question.prompt;

  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: promptExcerpt,
    about: { "@type": "Thing", name: categoryName },
    educationalLevel: question.difficulty || "intermediate",
    inLanguage: locale,
    isAccessibleForFree: true,
    learningResourceType: "Quiz",
    author: { "@type": "Organization", name: "EnterMedSchool.org", url: BASE_URL },
    publisher: { "@type": "Organization", name: "EnterMedSchool.org", url: BASE_URL },
    datePublished: question.createdAt,
    isPartOf: { "@type": "Quiz", name: deckTitle },
    hasPart: [
      {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: question.prompt,
        acceptedAnswer: correctOption
          ? {
              "@type": "Answer",
              text: `${correctOption.label}. ${correctOption.body}${question.explanation ? ". " + question.explanation : ""}`,
            }
          : undefined,
        suggestedAnswer: wrongOptions.map((o) => ({
          "@type": "Answer",
          text: `${o.label}. ${o.body}`,
        })),
      },
    ],
  };
}

/**
 * JSON-LD Quiz schema for a deck listing page (aggregate).
 */
export function getQuizDeckJsonLd(
  deckTitle: string,
  deckDescription: string | undefined,
  questionCount: number,
  categoryName: string,
  url: string,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: deckTitle,
    description: deckDescription || `${questionCount} practice questions on ${categoryName}`,
    about: { "@type": "Thing", name: categoryName },
    educationalLevel: "intermediate",
    numberOfItems: questionCount,
    inLanguage: locale,
    isAccessibleForFree: true,
    learningResourceType: "Quiz",
    url,
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
  };
}

/* ── Flashcard schemas ───────────────────────────────────────── */

/**
 * JSON-LD Quiz schema for an individual flashcard page.
 * Uses eduQuestionType "Flashcard" for Google Education Q&A carousel.
 */
export function getFlashcardJsonLd(
  card: Flashcard,
  deckTitle: string,
  categoryName: string,
  locale: string,
) {
  const frontExcerpt = card.front.length > 80
    ? card.front.slice(0, 77) + "…"
    : card.front;

  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${deckTitle} — ${frontExcerpt}`,
    about: { "@type": "Thing", name: categoryName },
    inLanguage: locale,
    isAccessibleForFree: true,
    learningResourceType: "Quiz",
    author: { "@type": "Organization", name: "EnterMedSchool.org", url: BASE_URL },
    publisher: { "@type": "Organization", name: "EnterMedSchool.org", url: BASE_URL },
    datePublished: card.createdAt,
    isPartOf: { "@type": "Quiz", name: deckTitle },
    hasPart: [
      {
        "@type": "Question",
        eduQuestionType: "Flashcard",
        text: card.front,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${card.back} | Source: entermedschool.org`,
        },
      },
    ],
  };
}

/**
 * JSON-LD Quiz schema for a flashcard deck page (aggregate).
 */
export function getFlashcardDeckJsonLd(
  deckTitle: string,
  deckDescription: string | undefined,
  cardCount: number,
  categoryName: string,
  url: string,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: deckTitle,
    description: deckDescription || `${cardCount} flashcards on ${categoryName}`,
    about: { "@type": "Thing", name: categoryName },
    numberOfItems: cardCount,
    inLanguage: locale,
    isAccessibleForFree: true,
    learningResourceType: "Quiz",
    url,
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
  };
}

/**
 * SpeakableSpecification for question/flashcard pages.
 * Helps voice assistants surface definitions in voice search results.
 */
export function getEducationSpeakableJsonLd(
  name: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='question']",
        "[data-speakable='answer']",
        "[data-speakable='explanation']",
      ],
    },
  };
}
