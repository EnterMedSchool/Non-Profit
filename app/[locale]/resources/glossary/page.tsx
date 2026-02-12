import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  glossaryTerms,
  glossaryTags,
  glossaryCategories,
  glossaryStats,
  getTermSummaries,
} from "@/data/glossary-terms";
import { getGlossaryHubJsonLd, getFAQPageJsonLd } from "@/lib/metadata";
import GlossaryHubClient from "./GlossaryHubClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return {
    title: t("metaTitle", { count: glossaryStats.totalTerms }),
    description: t("metaDescription", {
      count: glossaryStats.totalTerms,
      categoryCount: glossaryStats.totalCategories,
    }),
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/glossary`,
    },
    openGraph: {
      title: `Medical Glossary — ${glossaryStats.totalTerms} Free Medical Terms | EnterMedSchool`,
      description: `Browse ${glossaryStats.totalTerms} free medical terms with definitions, mnemonics, clinical cases & treatment guides.`,
      url: `${BASE_URL}/${locale}/resources/glossary`,
      siteName: "EnterMedSchool.org",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Medical Glossary — ${glossaryStats.totalTerms} Free Medical Terms`,
      description: `Browse ${glossaryStats.totalTerms} free medical terms with definitions, mnemonics & clinical cases.`,
    },
  };
}

export default async function GlossaryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });

  const summaries = getTermSummaries();

  // FAQ items for JSON-LD
  const faqItems = [
    { question: t("faq.q1"), answer: t("faq.a1", { count: glossaryStats.totalTerms }) },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
  ];

  const hubSchemas = getGlossaryHubJsonLd(glossaryStats.totalTerms, locale);
  const faqSchema = getFAQPageJsonLd(faqItems, locale);

  return (
    <>
      {/* JSON-LD Structured Data */}
      {[...hubSchemas, faqSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <GlossaryHubClient
        summaries={summaries}
        tags={glossaryTags}
        categories={glossaryCategories}
        stats={glossaryStats}
        faqItems={faqItems}
        locale={locale}
      />
    </>
  );
}
