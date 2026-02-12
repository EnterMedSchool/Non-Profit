"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";
import { visualLessons } from "@/data/visuals";
import { tools } from "@/data/tools";
import { pdfBooks } from "@/data/pdf-books";
import {
  mediaAssets,
  mediaAssetCategories,
  mediaAssetCollections,
  getAllTags,
  getTagSlug,
  getTagFromSlug,
} from "@/data/media-assets";

// Map URL segments to translation keys
const segmentKeyMap: Record<string, string> = {
  resources: "resources",
  questions: "questions",
  videos: "videos",
  pdfs: "pdfs",
  visuals: "visuals",
  media: "media",
  category: "category",
  tag: "tag",
  collections: "collections",
  "how-to-cite": "howToCite",
  "embed-code": "embedCode",
  tools: "tools",
  "for-professors": "guides",
  templates: "templates",
  guides: "teachingGuides",
  assets: "assets",
  events: "events",
  about: "about",
  license: "license",
  privacy: "privacy",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumbs");
  const locale = useLocale();
  const tTools = useTranslations("tools");

  // Build a slug → human-readable label map from data files
  const slugLabels = useMemo(() => {
    const map = new Map<string, string>();

    // Visual lessons: id → title
    for (const lesson of visualLessons) {
      map.set(lesson.id, lesson.title);
    }

    // Tools: id → translated title (e.g. "bmi-calc" → "BMI Calculator")
    for (const tool of tools) {
      map.set(tool.id, tTools(`${tool.i18nKey}.title`));
    }

    // PDF books & chapters: slug → title
    for (const book of pdfBooks) {
      map.set(book.slug, book.title);
      for (const chapter of book.chapters) {
        map.set(chapter.slug, chapter.title);
      }
    }

    // Media assets: slug → name
    for (const asset of mediaAssets) {
      map.set(asset.slug, asset.name);
    }

    // Media categories: id → name
    for (const cat of mediaAssetCategories) {
      map.set(cat.id, cat.name);
    }

    // Media collections: slug → name
    for (const col of mediaAssetCollections) {
      map.set(col.slug, col.name);
    }

    // Media tag slugs: tag-slug → Tag Label
    for (const tag of getAllTags()) {
      const slug = getTagSlug(tag);
      const label = tag.replace(/\b\w/g, (c) => c.toUpperCase());
      map.set(slug, label);
    }

    return map;
  }, [tTools]);

  // Remove locale prefix and split
  const segments = pathname
    .replace(/^\/[a-z]{2}(\/|$)/, "/")
    .split("/")
    .filter(Boolean);

  // Don't show breadcrumbs on the homepage
  if (segments.length === 0) return null;

  // Build breadcrumb items
  const items = segments.map((segment, index) => {
    const href = `/${locale}/${segments.slice(0, index + 1).join("/")}`;
    const key = segmentKeyMap[segment];
    const fallback = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const label = key ? t(key) : (slugLabels.get(segment) ?? fallback);
    return { href, label, isLast: index === segments.length - 1 };
  });

  // JSON-LD structured data for breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}`,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.isLast
          ? {}
          : { item: `${process.env.NEXT_PUBLIC_SITE_URL || ""}${item.href}` }),
      })),
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual breadcrumbs */}
      <nav
        aria-label={t("ariaLabel")}
        className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
      >
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1 text-ink-muted transition-colors hover:text-showcase-purple"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">{t("home")}</span>
            </Link>
          </li>
          {items.map((item) => (
            <li key={item.href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-ink-light rtl:-scale-x-100" />
              {item.isLast ? (
                <span className="font-medium text-ink-dark">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-ink-muted transition-colors hover:text-showcase-purple"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
