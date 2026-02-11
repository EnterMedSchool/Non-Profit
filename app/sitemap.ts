import type { MetadataRoute } from "next";
import { tools, getCalculatorTools } from "@/data/tools";
import { visualLessons } from "@/data/visuals";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import { pdfBooks } from "@/data/pdf-books";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

const locales = routing.locales;
const defaultLocale = routing.defaultLocale;

const staticPages = [
  "",
  "/about",
  "/resources",
  "/resources/questions",
  "/resources/videos",
  "/resources/pdfs",
  "/resources/visuals",
  "/tools",
  "/calculators",
  "/for-professors",
  "/for-professors/guides",
  "/for-professors/assets",
  "/events",
  "/license",
  "/privacy",
  "/clinical-semiotics",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ───────────────────────────────────────────────────
  for (const page of staticPages) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${BASE_URL}/${locale}${page}`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1 : page.includes("/") && page.split("/").length > 2 ? 0.6 : 0.8,
      alternates: {
        languages,
      },
    });
  }

  // ── Tool detail pages ───────────────────────────────────────────────
  for (const tool of tools) {
    // Calculator tools live under /calculators/[id], creator tools under /tools/[id]
    const prefix = tool.category === "calculator" ? "/calculators" : "/tools";
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${BASE_URL}/${locale}${prefix}/${tool.id}`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${prefix}/${tool.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages,
      },
    });
  }

  // ── Tool embed-code pages (/calculators/[id]/embed-code, /tools/[id]/embed-code)
  for (const tool of tools) {
    const prefix = tool.category === "calculator" ? "/calculators" : "/tools";
    const codeLangs: Record<string, string> = {};
    for (const locale of locales) {
      codeLangs[locale] = `${BASE_URL}/${locale}${prefix}/${tool.id}/embed-code`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}${prefix}/${tool.id}/embed-code`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: codeLangs,
      },
    });
  }

  // ── Standalone tool routes (no locale prefix) ─────────────────
  const standaloneTools = [
    { path: "/create", priority: 0.9 },
    { path: "/mcq", priority: 0.9 },
    { path: "/flashcards", priority: 0.9 },
    { path: "/editor", priority: 0.9 },
  ];
  for (const tool of standaloneTools) {
    entries.push({
      url: `${BASE_URL}${tool.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: tool.priority,
    });
  }

  // ── Visual lesson detail pages ───────────────────────────────────
  for (const lesson of visualLessons) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${BASE_URL}/${locale}/resources/visuals/${lesson.id}`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}/resources/visuals/${lesson.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    });
  }

  // ── Visual lesson embed-code pages (/resources/visuals/[id]/embed-code)
  for (const lesson of visualLessons) {
    const codeLangs: Record<string, string> = {};
    for (const locale of locales) {
      codeLangs[locale] = `${BASE_URL}/${locale}/resources/visuals/${lesson.id}/embed-code`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}/resources/visuals/${lesson.id}/embed-code`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: codeLangs },
    });
  }

  // ── Clinical semiotics embed-code pages (/clinical-semiotics/[examType]/embed-code)
  for (const examType of Object.keys(EXAM_COPY)) {
    const codeLangs: Record<string, string> = {};
    for (const locale of locales) {
      codeLangs[locale] = `${BASE_URL}/${locale}/clinical-semiotics/${examType}/embed-code`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}/clinical-semiotics/${examType}/embed-code`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: codeLangs },
    });
  }

  // ── PDF book overview pages ────────────────────────────────────
  for (const book of pdfBooks) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${BASE_URL}/${locale}/resources/pdfs/${book.slug}`;
    }

    entries.push({
      url: `${BASE_URL}/${defaultLocale}/resources/pdfs/${book.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages },
    });

    // ── PDF chapter pages ──────────────────────────────────────
    for (const chapter of book.chapters) {
      const chLangs: Record<string, string> = {};
      for (const locale of locales) {
        chLangs[locale] = `${BASE_URL}/${locale}/resources/pdfs/${book.slug}/${chapter.slug}`;
      }

      entries.push({
        url: `${BASE_URL}/${defaultLocale}/resources/pdfs/${book.slug}/${chapter.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: chLangs },
      });
    }
  }

  // Note: /embed/* routes are intentionally excluded (noindex pages)

  return entries;
}
