import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getToolById, tools } from "@/data/tools";
import { visualLessons } from "@/data/visuals";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import { calculatorRegistry } from "@/components/tools/calculators";
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

/* ── Static params (non-calculator tools with a registered component) */

export async function generateStaticParams() {
  return Object.keys(calculatorRegistry)
    .filter((id) => {
      const tool = getToolById(id);
      return tool && tool.category !== "calculator";
    })
    .map((id) => ({ id }));
}

/* ── SEO metadata ──────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const tool = getToolById(id);
  if (!tool || tool.category === "calculator") return {};

  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const toolTitle = t(`${tool.i18nKey}.title`);
  const pageUrl = `${BASE_URL}/${locale}/tools/${id}/embed-code`;

  // Dynamic keywords derived from existing seoKeywords
  const baseKeywords = (tool.seoKeywords ?? []).slice(0, 3);
  const derivedKeywords = baseKeywords.flatMap((kw) => [
    `${kw} HTML code`,
    `${kw} embed code`,
    `free embeddable ${kw}`,
  ]);
  const keywords = [
    ...derivedKeywords,
    `${toolTitle} HTML code`,
    `${toolTitle} embed`,
    "free medical tool embed",
    "embeddable medical tools",
  ];

  const title = tc("metaTitleTemplate", { toolName: toolTitle });
  const description = tc("metaDescTemplate", { toolName: toolTitle });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/tools/${id}/embed-code`;
  }
  languages["x-default"] = `${BASE_URL}/en/tools/${id}/embed-code`;

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

export default async function ToolEmbedCodePage({ params }: Props) {
  const { locale, id } = await params;
  const tool = getToolById(id);
  if (!tool || tool.category === "calculator") notFound();

  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "toolCode" });

  const toolTitle = t(`${tool.i18nKey}.title`);
  const pageUrl = `${BASE_URL}/${locale}/tools/${id}/embed-code`;
  const embedUrl = `${BASE_URL}/embed/${locale}/${tool.id}`;
  const toolPageUrl = `${BASE_URL}/${locale}/tools/${id}`;
  const embedHeight = tool.embedHeight ?? 520;

  // JSON-LD
  const sourceCodeJsonLd = getSoftwareSourceCodeJsonLd({
    codePageUrl: pageUrl,
    title: toolTitle,
    description: tc("metaDescTemplate", { toolName: toolTitle }),
    locale,
    sourceUrl: tool.sourceUrl,
    keywords: tool.seoKeywords,
  });

  const faqItems = [
    { question: tc("faq.q1", { toolName: toolTitle }), answer: tc("faq.a1", { toolName: toolTitle }) },
    { question: tc("faq.q2", { toolName: toolTitle }), answer: tc("faq.a2", { toolName: toolTitle }) },
    { question: tc("faq.q3", { toolName: toolTitle }), answer: tc("faq.a3", { toolName: toolTitle }) },
    { question: tc("faq.q4", { toolName: toolTitle }), answer: tc("faq.a4", { toolName: toolTitle }) },
    { question: tc("faq.q5", { toolName: toolTitle }), answer: tc("faq.a5", { toolName: toolTitle }) },
  ];
  const faqJsonLd = getFAQPageJsonLd(faqItems, locale);

  // Build cross-links: other tools + visuals + clinical semiotics
  const crossLinks: CrossLink[] = [];
  for (const tl of tools) {
    if (tl.id === id) continue;
    const prefix = tl.category === "calculator" ? "calculators" : "tools";
    crossLinks.push({
      id: tl.id,
      title: t(`${tl.i18nKey}.title`),
      href: `/${locale}/${prefix}/${tl.id}/embed-code`,
    });
  }
  for (const lesson of visualLessons) {
    crossLinks.push({
      id: `visual-${lesson.id}`,
      title: `${lesson.title} Visual`,
      href: `/${locale}/resources/visuals/${lesson.id}/embed-code`,
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
            href={`/${locale}/tools/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToTools")}
          </Link>
        </AnimatedSection>

        {/* Page content */}
        <AnimatedSection animation="blurIn">
          <ToolSourceCodePage
            title={toolTitle}
            embedUrl={embedUrl}
            embedHeight={embedHeight}
            sourceUrl={tool.sourceUrl}
            pageUrl={toolPageUrl}
            locale={locale}
            customizeUrl={`/${locale}/tools/${id}#embed`}
            crossLinks={crossLinks}
          />
        </AnimatedSection>
      </div>
    </main>
  );
}
