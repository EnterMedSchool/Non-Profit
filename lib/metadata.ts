import type { Tool } from "@/data/tools";
import type { Resource } from "@/data/resources";
import type { PDFBook, PDFChapter } from "@/data/pdf-books";
import type { VisualLesson } from "@/data/visuals";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ── Shared provider reference ────────────────────────────────────── */
const ORGANIZATION_REF = {
  "@type": "Organization",
  name: "EnterMedSchool.org",
  url: BASE_URL,
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
    nonprofitStatus: "NonprofitType",
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
) {
  const toolUrl = `${BASE_URL}/${locale}/tools/${tool.id}`;

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
    lastReviewed: new Date().toISOString().split("T")[0],
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
      nonprofitStatus: "NonprofitType",
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
    lastReviewed: new Date().toISOString().split("T")[0],
    keywords: lesson.tags.join(", "),
    thumbnailUrl: `${BASE_URL}${lesson.thumbnailPath}`,
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
    image: `${BASE_URL}${lesson.thumbnailPath}`,
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
    thumbnailUrl: `${BASE_URL}${lesson.thumbnailPath}`,
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
