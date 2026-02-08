"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";

// Map URL segments to translation keys
const segmentKeyMap: Record<string, string> = {
  resources: "resources",
  questions: "questions",
  videos: "videos",
  pdfs: "pdfs",
  visuals: "visuals",
  tools: "tools",
  "for-professors": "forProfessors",
  templates: "templates",
  guides: "guides",
  assets: "assets",
  "for-students": "forStudents",
  events: "events",
  about: "about",
  license: "license",
  privacy: "privacy",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumbs");

  // Remove locale prefix and split
  const segments = pathname
    .replace(/^\/[a-z]{2}(\/|$)/, "/")
    .split("/")
    .filter(Boolean);

  // Don't show breadcrumbs on the homepage
  if (segments.length === 0) return null;

  // Build breadcrumb items
  const items = segments.map((segment, index) => {
    const href = `/en/${segments.slice(0, index + 1).join("/")}`;
    const key = segmentKeyMap[segment];
    const fallback = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const label = key ? t(key) : fallback;
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
        item: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/en`,
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
        aria-label="Breadcrumbs"
        className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
      >
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link
              href="/en"
              className="flex items-center gap-1 text-ink-muted transition-colors hover:text-showcase-purple"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">{t("home")}</span>
            </Link>
          </li>
          {items.map((item) => (
            <li key={item.href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-ink-light" />
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
