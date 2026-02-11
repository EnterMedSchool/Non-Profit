import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EXAM_COPY } from "@/components/clinical-semiotics/examChains";
import { tools } from "@/data/tools";
import { visualLessons } from "@/data/visuals";
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
  params: Promise<{ locale: string; examType: string }>;
}

/* ── Static params ─────────────────────────────────────────────────── */

export async function generateStaticParams() {
  return Object.keys(EXAM_COPY).map((examType) => ({ examType }));
}

/* ── SEO metadata ──────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, examType } = await params;
  const copy = EXAM_COPY[examType];
  if (!copy) return {};

  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const examTitle = copy.title;
  const pageUrl = `${BASE_URL}/${locale}/clinical-semiotics/${examType}/embed-code`;

  // Dynamic keywords
  const categoryKw = copy.category.replace("-", " ");
  const keywords = [
    `${examTitle} HTML code`,
    `${examTitle} embed code`,
    `free embeddable ${examTitle}`,
    `${categoryKw} examination embed`,
    `clinical examination embed`,
    `${examTitle} video embed`,
    "free medical examination embed",
    "clinical semiotics embed code",
    "embeddable medical education",
  ];

  const title = tc("metaTitleTemplate", { toolName: examTitle });
  const description = tc("metaDescTemplate", { toolName: examTitle });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/clinical-semiotics/${examType}/embed-code`;
  }
  languages["x-default"] = `${BASE_URL}/en/clinical-semiotics/${examType}/embed-code`;

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

export default async function ClinicalSemioticsEmbedCodePage({
  params,
}: Props) {
  const { locale, examType } = await params;
  const copy = EXAM_COPY[examType];
  if (!copy) notFound();

  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const t = await getTranslations({ locale, namespace: "tools" });

  const examTitle = copy.title;
  const pageUrl = `${BASE_URL}/${locale}/clinical-semiotics/${examType}/embed-code`;
  const embedUrl = `${BASE_URL}/${locale}/embed/clinical-semiotics/${examType}?bg=ffffff&accent=6C5CE7&radius=12&theme=light`;
  const examPageUrl = `${BASE_URL}/${locale}/clinical-semiotics`;

  // JSON-LD
  const sourceCodeJsonLd = getSoftwareSourceCodeJsonLd({
    codePageUrl: pageUrl,
    title: examTitle,
    description: tc("metaDescTemplate", { toolName: examTitle }),
    locale,
    sourceUrl: `https://github.com/enterMedSchool/Non-Profit/tree/main/components/clinical-semiotics`,
    keywords: [
      "clinical semiotics",
      copy.category.replace("-", " "),
      examTitle,
    ],
  });

  const faqItems = [
    { question: tc("faq.q1", { toolName: examTitle }), answer: tc("faq.a1", { toolName: examTitle }) },
    { question: tc("faq.q2", { toolName: examTitle }), answer: tc("faq.a2", { toolName: examTitle }) },
    { question: tc("faq.q3", { toolName: examTitle }), answer: tc("faq.a3", { toolName: examTitle }) },
    { question: tc("faq.q4", { toolName: examTitle }), answer: tc("faq.a4", { toolName: examTitle }) },
    { question: tc("faq.q5", { toolName: examTitle }), answer: tc("faq.a5", { toolName: examTitle }) },
  ];
  const faqJsonLd = getFAQPageJsonLd(faqItems, locale);

  // Build cross-links: other exams + tools + visuals
  const crossLinks: CrossLink[] = [];
  for (const [et, cp] of Object.entries(EXAM_COPY)) {
    if (et === examType) continue;
    crossLinks.push({
      id: `cs-${et}`,
      title: cp.title,
      href: `/${locale}/clinical-semiotics/${et}/embed-code`,
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
  for (const lesson of visualLessons) {
    crossLinks.push({
      id: `visual-${lesson.id}`,
      title: `${lesson.title} Visual`,
      href: `/${locale}/resources/visuals/${lesson.id}/embed-code`,
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
            href={`/${locale}/clinical-semiotics`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {tc("backToClinicalSemiotics")}
          </Link>
        </AnimatedSection>

        {/* Page content */}
        <AnimatedSection animation="blurIn">
          <ToolSourceCodePage
            title={examTitle}
            embedUrl={embedUrl}
            embedHeight={700}
            sourceUrl="https://github.com/enterMedSchool/Non-Profit/tree/main/components/clinical-semiotics"
            pageUrl={examPageUrl}
            locale={locale}
            customizeUrl={`/${locale}/clinical-semiotics#embed`}
            crossLinks={crossLinks}
          />
        </AnimatedSection>
      </div>
    </main>
  );
}
