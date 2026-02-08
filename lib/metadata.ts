import type { Tool } from "@/data/tools";
import type { Resource } from "@/data/resources";
import type { PDFBook, PDFChapter } from "@/data/pdf-books";

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
      "Free, open-source medical education resources, tools, and guides for students and professors worldwide.",
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
      "https://github.com/entermedschool",
    ],
  };
}

/**
 * JSON-LD WebSite schema with SearchAction
 */
export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EnterMedSchool.org",
    url: BASE_URL,
    description:
      "Free, open-source medical education resources for students and professors worldwide.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/en/resources?q={search_term_string}`,
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
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
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
        "Free, open-source medical education resources, tools, and guides for students and professors worldwide.",
      sameAs: [
        "https://entermedschool.com",
        "https://github.com/entermedschool",
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
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
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
 * FAQPage schema (ready for future use)
 */
export function getFAQPageJsonLd(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
