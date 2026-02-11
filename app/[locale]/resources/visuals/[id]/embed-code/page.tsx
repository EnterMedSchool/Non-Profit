import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { visualLessons, getVisualLessonById } from "@/data/visuals";
import { tools } from "@/data/tools";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import {
  getSoftwareSourceCodeJsonLd,
  getFAQPageJsonLd,
} from "@/lib/metadata";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ToolSourceCodePage from "@/components/tools/ToolSourceCodePage";
import type { CrossLink } from "@/components/tools/ToolSourceCodePage";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

/* ── Static params ─────────────────────────────────────────────────── */

export async function generateStaticParams() {
  return visualLessons.map((l) => ({ id: l.id }));
}

/* ── SEO metadata ──────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const lesson = getVisualLessonById(id);
  if (!lesson) return {};

  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const lessonTitle = `${lesson.title} Visual`;
  const pageUrl = `${BASE_URL}/${locale}/resources/visuals/${id}/embed-code`;

  // Dynamic keywords from lesson tags
  const baseKeywords = (lesson.tags ?? []).slice(0, 4);
  const derivedKeywords = baseKeywords.flatMap((kw) => [
    `${kw} embed code`,
    `${kw} HTML`,
    `free embeddable ${kw}`,
  ]);
  const keywords = [
    ...derivedKeywords,
    `${lesson.title} HTML code`,
    `${lesson.title} embed`,
    "free medical visual embed",
    "medical diagram embed code",
    "embeddable medical education",
  ];

  const title = tc("metaTitleTemplate", { toolName: lessonTitle });
  const description = tc("metaDescTemplate", { toolName: lessonTitle });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/visuals/${id}/embed-code`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/visuals/${id}/embed-code`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    keywords,
  };
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default async function VisualEmbedCodePage({ params }: Props) {
  const { locale, id } = await params;
  const lesson = getVisualLessonById(id);
  if (!lesson) notFound();

  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const t = await getTranslations({ locale, namespace: "tools" });

  const lessonTitle = `${lesson.title} Visual`;
  const pageUrl = `${BASE_URL}/${locale}/resources/visuals/${id}/embed-code`;
  const embedUrl = `${BASE_URL}/${locale}/embed/visuals/${lesson.embedId}?bg=ffffff&accent=6C5CE7&radius=12&theme=light`;
  const lessonPageUrl = `${BASE_URL}/${locale}/resources/visuals/${id}`;

  // JSON-LD
  const sourceCodeJsonLd = getSoftwareSourceCodeJsonLd({
    codePageUrl: pageUrl,
    title: lessonTitle,
    description: tc("metaDescTemplate", { toolName: lessonTitle }),
    locale,
    sourceUrl: `https://github.com/enterMedSchool/Non-Profit/tree/main/data/visuals.ts`,
    keywords: lesson.tags,
  });

  const faqItems = [
    { question: tc("faq.q1", { toolName: lessonTitle }), answer: tc("faq.a1", { toolName: lessonTitle }) },
    { question: tc("faq.q2", { toolName: lessonTitle }), answer: tc("faq.a2", { toolName: lessonTitle }) },
    { question: tc("faq.q3", { toolName: lessonTitle }), answer: tc("faq.a3", { toolName: lessonTitle }) },
    { question: tc("faq.q4", { toolName: lessonTitle }), answer: tc("faq.a4", { toolName: lessonTitle }) },
    { question: tc("faq.q5", { toolName: lessonTitle }), answer: tc("faq.a5", { toolName: lessonTitle }) },
  ];
  const faqJsonLd = getFAQPageJsonLd(faqItems, locale);

  // Build cross-links: other visuals + tools + clinical semiotics
  const crossLinks: CrossLink[] = [];
  for (const l of visualLessons) {
    if (l.id === id) continue;
    crossLinks.push({
      id: `visual-${l.id}`,
      title: `${l.title} Visual`,
      href: `/${locale}/resources/visuals/${l.id}/embed-code`,
    });
  }
  for (const tl of tools) {
    const prefix = tl.category === "calculator" ? "calculators" : "tools";
    crossLinks.push({
      id: tl.id,
      title: t(`${tl.i18nKey}.title`),
      href: `/${locale}/${prefix}/${tl.id}/embed-code`,
    });
  }
  for (const [examType, copy] of Object.entries(EXAM_COPY)) {
    crossLinks.push({
      id: `cs-${examType}`,
      title: copy.title,
      href: `/${locale}/clinical-semiotics/${examType}/embed-code`,
    });
  }

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(sourceCodeJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* Back link */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/resources/visuals/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {tc("backToVisuals")}
          </Link>
        </AnimatedSection>

        {/* Page content */}
        <AnimatedSection animation="blurIn">
          <ToolSourceCodePage
            title={lessonTitle}
            embedUrl={embedUrl}
            embedHeight={600}
            sourceUrl="https://github.com/enterMedSchool/Non-Profit/tree/main/data/visuals.ts"
            pageUrl={lessonPageUrl}
            locale={locale}
            customizeUrl={`/${locale}/resources/visuals/${id}#embed`}
            crossLinks={crossLinks}
          />
        </AnimatedSection>
      </div>
    </main>
  );
}
