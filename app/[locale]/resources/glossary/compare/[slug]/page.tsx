import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight, BookOpen } from "lucide-react";
import {
  getComparisonPair,
  getAllComparisonSlugs,
  glossaryTags,
  getTagDisplayName,
} from "@/data/glossary-terms";
import { renderSimpleMarkdown } from "@/lib/glossary/renderTermContent";
import { routing } from "@/i18n/routing";
import type { GlossaryTerm } from "@/types/glossary";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ── Static params for all comparison pages ──────────────────────── */
export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

/* ── Metadata ─────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const pair = getComparisonPair(slug);
  if (!pair) return {};

  const nameA = pair.termA.names[0];
  const nameB = pair.termB.names[0];
  const title = `${nameA} vs ${nameB} — Key Differences for Medical Students`;
  const description = `Compare ${nameA} and ${nameB}: definitions, symptoms, diagnosis, treatment, and mnemonics side by side. Free study guide for USMLE, IMAT, and medical exams.`;
  const path = `/${locale}/resources/glossary/compare/${slug}`;
  const url = `${BASE_URL}${path}`;

  const alternates: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternates[loc] = `${BASE_URL}/${loc}/resources/glossary/compare/${slug}`;
  }
  alternates["x-default"] = `${BASE_URL}/${routing.defaultLocale}/resources/glossary/compare/${slug}`;

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

/* ── Helpers ───────────────────────────────────────────────────────── */

function getTermSections(term: GlossaryTerm) {
  const raw = term as unknown as Record<string, unknown>;
  return {
    definition: term.definition,
    howYoullSeeIt: term.how_youll_see_it ?? [],
    treatment: term.treatment ?? [],
    tricks: term.tricks ?? [],
    examAppearance: term.exam_appearance ?? [],
    redFlags: term.red_flags ?? [],
    differentials: term.differentials ?? [],
    clinicalUsage: (raw.clinical_usage as string[] | undefined) ?? [],
    keyFacts: (raw.key_concepts as string[] | undefined) ?? [],
  };
}

type RowSpec = {
  label: string;
  getContent: (sections: ReturnType<typeof getTermSections>) => string[];
};

const ROWS: RowSpec[] = [
  {
    label: "Presentation",
    getContent: (s) => s.howYoullSeeIt,
  },
  {
    label: "Treatment",
    getContent: (s) => s.treatment,
  },
  {
    label: "Exam Tips",
    getContent: (s) => s.examAppearance,
  },
  {
    label: "Red Flags",
    getContent: (s) => s.redFlags,
  },
  {
    label: "Mnemonics",
    getContent: (s) => s.tricks,
  },
  {
    label: "Clinical Usage",
    getContent: (s) => s.clinicalUsage,
  },
  {
    label: "Key Concepts",
    getContent: (s) => s.keyFacts,
  },
];

/* ── Page ──────────────────────────────────────────────────────────── */

export default async function ComparisonPage({ params }: Props) {
  const { locale, slug } = await params;
  const pair = getComparisonPair(slug);
  if (!pair) notFound();

  const { termA, termB } = pair;
  const nameA = termA.names[0];
  const nameB = termB.names[0];
  const sectionsA = getTermSections(termA);
  const sectionsB = getTermSections(termB);

  const tagA = glossaryTags[termA.primary_tag];
  const tagB = glossaryTags[termB.primary_tag];
  const accentA = tagA?.accent || "#6C5CE7";
  const accentB = tagB?.accent || "#6C5CE7";

  /* JSON-LD: MedicalWebPage + FAQPage */
  const faqQuestions = [
    {
      q: `What is the difference between ${nameA} and ${nameB}?`,
      a: `${nameA} is defined as: ${termA.definition.slice(0, 150).replace(/\*\*/g, "")}. ${nameB} is defined as: ${termB.definition.slice(0, 150).replace(/\*\*/g, "")}.`,
    },
    {
      q: `How do you distinguish ${nameA} from ${nameB} on exams?`,
      a: `Key distinguishing features include differences in presentation, pathophysiology, and management. See the side-by-side comparison table above for detailed differences.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: `${nameA} vs ${nameB}`,
      description: `Side-by-side comparison of ${nameA} and ${nameB} for medical students.`,
      url: `${BASE_URL}/${locale}/resources/glossary/compare/${slug}`,
      inLanguage: locale,
      audience: {
        "@type": "MedicalAudience",
        audienceType: "Medical Student",
      },
      about: [
        { "@type": "MedicalCondition", name: nameA },
        { "@type": "MedicalCondition", name: nameB },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqQuestions.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

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
          <div className="inline-flex items-center gap-2 rounded-full bg-showcase-purple/10 px-4 py-1.5 text-xs font-bold text-showcase-purple mb-4">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Comparison
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
            <span style={{ color: accentA }}>{nameA}</span>
            <span className="mx-3 text-ink-muted font-normal">vs</span>
            <span style={{ color: accentB }}>{nameB}</span>
          </h1>
          <p className="mt-3 text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Side-by-side comparison of key features, presentation, treatment,
            and exam tips for medical students.
          </p>
        </div>

        {/* Definition cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <DefinitionCard
            name={nameA}
            accent={accentA}
            definition={sectionsA.definition}
            tag={getTagDisplayName(termA.primary_tag)}
            href={`/${locale}/resources/glossary/${termA.id}`}
          />
          <DefinitionCard
            name={nameB}
            accent={accentB}
            definition={sectionsB.definition}
            tag={getTagDisplayName(termB.primary_tag)}
            href={`/${locale}/resources/glossary/${termB.id}`}
          />
        </div>

        {/* Comparison table */}
        <div className="mt-10 overflow-x-auto rounded-2xl border-2 border-ink-dark/8 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink-dark/8">
                <th className="px-4 py-3 text-left font-display font-bold text-ink-muted text-xs uppercase tracking-wider w-[140px]">
                  Feature
                </th>
                <th className="px-4 py-3 text-left font-display font-bold" style={{ color: accentA }}>
                  {nameA}
                </th>
                <th className="px-4 py-3 text-left font-display font-bold" style={{ color: accentB }}>
                  {nameB}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const contentA = row.getContent(sectionsA);
                const contentB = row.getContent(sectionsB);
                if (contentA.length === 0 && contentB.length === 0) return null;
                return (
                  <tr key={row.label} className="border-b border-ink-dark/5 last:border-0">
                    <td className="px-4 py-3 font-display font-bold text-xs text-ink-muted uppercase tracking-wider align-top">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CellContent items={contentA} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CellContent items={contentB} />
                    </td>
                  </tr>
                );
              })}

              {/* Differentials row */}
              {(sectionsA.differentials.length > 0 || sectionsB.differentials.length > 0) && (
                <tr className="border-b border-ink-dark/5 last:border-0">
                  <td className="px-4 py-3 font-display font-bold text-xs text-ink-muted uppercase tracking-wider align-top">
                    Differentials
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ul className="space-y-1">
                      {sectionsA.differentials.map((d, i) => (
                        <li key={i} className="text-xs text-ink-dark leading-relaxed">
                          <span className="font-semibold">{d.name || d.id}</span>
                          {d.hint && <span className="text-ink-muted"> — {d.hint}</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ul className="space-y-1">
                      {sectionsB.differentials.map((d, i) => (
                        <li key={i} className="text-xs text-ink-dark leading-relaxed">
                          <span className="font-semibold">{d.name || d.id}</span>
                          {d.hint && <span className="text-ink-muted"> — {d.hint}</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FAQ section */}
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink-dark">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-4">
            {faqQuestions.map((faq, i) => (
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

        {/* Links to full pages */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href={`/${locale}/resources/glossary/${termA.id}`}
            className="flex items-center gap-3 rounded-xl border-2 border-ink-dark/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md group"
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" style={{ color: accentA }} />
            <div>
              <div className="font-display font-bold text-sm text-ink-dark group-hover:text-showcase-purple transition-colors">
                Study {nameA} in detail
              </div>
              <p className="text-xs text-ink-muted">
                Full definition, cases, mnemonics &amp; more
              </p>
            </div>
          </Link>
          <Link
            href={`/${locale}/resources/glossary/${termB.id}`}
            className="flex items-center gap-3 rounded-xl border-2 border-ink-dark/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md group"
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" style={{ color: accentB }} />
            <div>
              <div className="font-display font-bold text-sm text-ink-dark group-hover:text-showcase-purple transition-colors">
                Study {nameB} in detail
              </div>
              <p className="text-xs text-ink-muted">
                Full definition, cases, mnemonics &amp; more
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ────────────────────────────────────────────────── */

function DefinitionCard({
  name,
  accent,
  definition,
  tag,
  href,
}: {
  name: string;
  accent: string;
  definition: string;
  tag: string;
  href: string;
}) {
  return (
    <div className="rounded-xl border-2 border-ink-dark/8 bg-white p-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-display text-lg font-extrabold" style={{ color: accent }}>
          {name}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {tag}
        </span>
      </div>
      <p className="text-sm text-ink-dark leading-relaxed">
        {renderSimpleMarkdown(definition)}
      </p>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-semibold hover:underline"
        style={{ color: accent }}
      >
        View full term →
      </Link>
    </div>
  );
}

function CellContent({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-xs text-ink-muted/50 italic">—</span>;
  }
  return (
    <ul className="space-y-1">
      {items.slice(0, 5).map((item, i) => (
        <li key={i} className="text-xs text-ink-dark leading-relaxed">
          {renderSimpleMarkdown(item)}
        </li>
      ))}
      {items.length > 5 && (
        <li className="text-xs text-ink-muted italic">
          +{items.length - 5} more
        </li>
      )}
    </ul>
  );
}
