import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Stethoscope, BookOpen } from "lucide-react";
import {
  getSymptomPageData,
  getAllSymptomSlugs,
  glossaryTags,
  getTagDisplayName,
} from "@/data/glossary-terms";
import { routing } from "@/i18n/routing";
import type { GlossaryTerm } from "@/types/glossary";

interface Props {
  params: Promise<{ locale: string; symptomSlug: string }>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ── Static params ────────────────────────────────────────────────── */
export function generateStaticParams() {
  return getAllSymptomSlugs().map((symptomSlug) => ({ symptomSlug }));
}

/* ── Metadata ─────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, symptomSlug } = await params;
  const data = getSymptomPageData(symptomSlug);
  if (!data) return {};

  const { symptom, matchingTerms } = data;
  const title = `Conditions That Cause ${symptom.name} — Medical Student Guide`;
  const description = `${symptom.description} Explore ${matchingTerms.length} medical conditions associated with ${symptom.name.toLowerCase()}, with definitions, exam tips, and differential diagnosis.`;
  const path = `/${locale}/resources/glossary/symptom/${symptomSlug}`;
  const url = `${BASE_URL}${path}`;

  const alternates: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternates[loc] = `${BASE_URL}/${loc}/resources/glossary/symptom/${symptomSlug}`;
  }
  alternates["x-default"] = `${BASE_URL}/${routing.defaultLocale}/resources/glossary/symptom/${symptomSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "EnterMedSchool",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default async function SymptomLandingPage({ params }: Props) {
  const { locale, symptomSlug } = await params;
  const data = getSymptomPageData(symptomSlug);
  if (!data) notFound();

  const { symptom, matchingTerms } = data;

  /* Build FAQ */
  const topTermNames = matchingTerms.slice(0, 5).map((t) => t.names[0]);
  const faqItems = [
    {
      q: `What medical conditions cause ${symptom.name.toLowerCase()}?`,
      a: `Common conditions that present with ${symptom.name.toLowerCase()} include ${topTermNames.join(", ")}${matchingTerms.length > 5 ? `, and ${matchingTerms.length - 5} more` : ""}. Each has distinct clinical features that aid in differential diagnosis.`,
    },
    {
      q: `How many conditions present with ${symptom.name.toLowerCase()}?`,
      a: `In the EnterMedSchool glossary, ${matchingTerms.length} medical conditions are associated with ${symptom.name.toLowerCase()}. These span multiple organ systems and specialties.`,
    },
    {
      q: `How do you approach ${symptom.name.toLowerCase()} on medical exams?`,
      a: `When evaluating ${symptom.name.toLowerCase()} on exams, focus on the patient's age, onset (acute vs chronic), associated symptoms, and relevant lab/imaging findings to narrow the differential diagnosis.`,
    },
  ];

  /* JSON-LD */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Conditions That Cause ${symptom.name}`,
      description: symptom.description,
      url: `${BASE_URL}/${locale}/resources/glossary/symptom/${symptomSlug}`,
      inLanguage: locale,
      numberOfItems: matchingTerms.length,
      audience: {
        "@type": "MedicalAudience",
        audienceType: "Medical Student",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: matchingTerms.slice(0, 20).map((term, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: term.names[0],
        url: `${BASE_URL}/${locale}/resources/glossary/${term.id}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

  /* Group terms by category for better organization */
  const byCategory = new Map<string, GlossaryTerm[]>();
  for (const term of matchingTerms) {
    const tag = term.primary_tag;
    if (!byCategory.has(tag)) byCategory.set(tag, []);
    byCategory.get(tag)!.push(term);
  }
  const sortedCategories = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/${locale}/resources/glossary`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-showcase-purple transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Glossary
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 mb-4">
            <Stethoscope className="h-3.5 w-3.5" />
            Symptom Guide
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
            Conditions That Cause{" "}
            <span className="text-showcase-purple">{symptom.name}</span>
          </h1>
          <p className="mt-3 text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
            {symptom.description}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-showcase-purple/10 px-3 py-1 text-xs font-bold text-showcase-purple">
            {matchingTerms.length} conditions
          </div>
        </div>

        {/* Grouped term cards */}
        <div className="mt-10 space-y-8">
          {sortedCategories.map(([tagId, terms]) => {
            const tag = glossaryTags[tagId];
            const accent = tag?.accent || "#6C5CE7";
            const icon = tag?.icon || "📚";
            const categoryName = getTagDisplayName(tagId);

            return (
              <section key={tagId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{icon}</span>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {categoryName}
                  </h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${accent}20`, color: accent }}
                  >
                    {terms.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {terms.map((term) => (
                    <TermCard
                      key={term.id}
                      term={term}
                      locale={locale}
                      accent={accent}
                      symptomKeywords={symptom.keywords}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold text-ink-dark">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-4">
            {faqItems.map((faq, i) => (
              <div key={i} className="rounded-xl border-2 border-ink-dark/8 bg-white p-5">
                <h3 className="font-display font-bold text-sm text-ink-dark">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Term card with symptom context ───────────────────────────────── */

function TermCard({
  term,
  locale,
  accent,
  symptomKeywords,
}: {
  term: GlossaryTerm;
  locale: string;
  accent: string;
  symptomKeywords: string[];
}) {
  const matchingPresentation = term.how_youll_see_it?.find((s) =>
    symptomKeywords.some((kw) => s.toLowerCase().includes(kw)),
  );

  const preview = term.definition
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .slice(0, 120);

  return (
    <Link
      href={`/${locale}/resources/glossary/${term.id}`}
      className="group flex flex-col gap-2 rounded-xl border-2 border-ink-dark/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-ink-dark/15 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
        <span className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors truncate">
          {term.names[0]}
        </span>
      </div>
      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
        {preview}…
      </p>
      {matchingPresentation && (
        <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Presents with: </span>
          {matchingPresentation
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .slice(0, 100)}
          {matchingPresentation.length > 100 ? "…" : ""}
        </div>
      )}
    </Link>
  );
}
