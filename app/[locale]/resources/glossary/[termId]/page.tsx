import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  glossaryTerms,
  glossaryTags,
  getTermById,
  getRelatedTerms,
  getPrerequisiteTerms,
  getTermNavigation,
  getCategoryById,
  getTagDisplayName,
  buildTermNameMap,
  getAllTermSlugs,
} from "@/data/glossary-terms";
import {
  getGlossaryTermJsonLd,
  buildGlossaryTermTitle,
  buildGlossaryTermDescription,
  getGlossarySpeakableJsonLd,
} from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import GlossaryTagBadge from "@/components/glossary/GlossaryTagBadge";
import GlossarySharePanel from "@/components/glossary/GlossarySharePanel";
import GlossaryStudyMode from "@/components/glossary/GlossaryStudyMode";
import GlossaryKeyboardNav from "@/components/glossary/GlossaryKeyboardNav";
import GlossaryCrossRefGraph from "@/components/glossary/GlossaryCrossRefGraph";
import DefinitionSection from "@/components/glossary/sections/DefinitionSection";
import ListSection from "@/components/glossary/sections/ListSection";
import DifferentialsSection from "@/components/glossary/sections/DifferentialsSection";
import CasesSection from "@/components/glossary/sections/CasesSection";
import ImagesSection from "@/components/glossary/sections/ImagesSection";
import SeeAlsoSection from "@/components/glossary/sections/SeeAlsoSection";
import SourcesSection from "@/components/glossary/sections/SourcesSection";

interface Props {
  params: Promise<{ locale: string; termId: string }>;
}

/* ── Static params for all 458 terms ──────────────────────────────── */
export function generateStaticParams() {
  return getAllTermSlugs().map((termId) => ({ termId }));
}

/* ── Metadata ─────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, termId } = await params;
  const term = getTermById(termId);
  if (!term) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const url = `${BASE_URL}/${locale}/resources/glossary/${term.id}`;

  return {
    title: buildGlossaryTermTitle(term),
    description: buildGlossaryTermDescription(term),
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/resources/glossary/${term.id}`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/resources/glossary/${term.id}`,
      },
    },
    keywords: [
      term.names[0],
      ...(term.aliases || []),
      ...(term.abbr || []),
      ...(term.tags || []),
      "medical glossary",
      "definition",
    ],
    openGraph: {
      title: `${term.names[0]}${term.abbr?.[0] ? ` (${term.abbr[0]})` : ""} — Medical Glossary`,
      description: buildGlossaryTermDescription(term),
      url,
      siteName: "EnterMedSchool.org",
      type: "article",
      publishedTime: "2025-06-01T00:00:00Z",
      modifiedTime: "2025-06-01T00:00:00Z",
      authors: ["EnterMedSchool.org"],
      section: term.primary_tag,
      ...(term.tags?.length && { tags: term.tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${term.names[0]} — Medical Glossary`,
      description: buildGlossaryTermDescription(term),
    },
  };
}

/* ── Page Component ───────────────────────────────────────────────── */
export default async function GlossaryTermPage({ params }: Props) {
  const { locale, termId } = await params;
  const term = getTermById(termId);
  if (!term) notFound();

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const termUrl = `${BASE_URL}/${locale}/resources/glossary/${term.id}`;

  const category = getCategoryById(term.primary_tag);
  const categoryName = category?.name || getTagDisplayName(term.primary_tag);
  const tag = glossaryTags[term.primary_tag];
  const accent = tag?.accent || "#6C5CE7";
  const icon = tag?.icon || "📚";

  const relatedTerms = getRelatedTerms(term);
  const prerequisiteTerms = getPrerequisiteTerms(term);
  const { prev, next } = getTermNavigation(term);
  const termNameMap = buildTermNameMap();
  const alias = term.abbr?.[0] || term.aliases?.[0];

    // JSON-LD
    const schemas = [
      ...getGlossaryTermJsonLd(term, locale, categoryName),
      getGlossarySpeakableJsonLd(term, locale),
    ];

  // Section rendering options
  const renderOpts = {
    termNameMap,
    currentTermId: term.id,
    locale,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article
        className="relative z-10 py-8 sm:py-12"
        itemScope
        itemType="https://schema.org/DefinedTerm"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted"
            aria-label="Breadcrumb"
          >
            <Link href={`/${locale}`} className="hover:text-showcase-purple transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${locale}/resources`} className="hover:text-showcase-purple transition-colors">
              Resources
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/resources/glossary`}
              className="hover:text-showcase-purple transition-colors"
            >
              Glossary
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/resources/glossary/category/${term.primary_tag}`}
              className="hover:text-showcase-purple transition-colors"
            >
              {categoryName}
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink-dark">{term.names[0]}</span>
          </nav>

          {/* Back link */}
          <Link
            href={`/${locale}/resources/glossary`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Glossary
          </Link>

          {/* Header */}
          <header className="mb-8">
            {/* Rainbow accent bar */}
            <div
              className="mb-4 h-1.5 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}, #6C5CE7, #00D9C0, #FFD93D, #FF85A2, ${accent})`,
              }}
            />

            <div className="flex items-start gap-4">
              <span className="text-4xl">{icon}</span>
              <div className="flex-1">
                <h1
                  className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl"
                  itemProp="name"
                >
                  {term.names[0]}
                </h1>

                {/* Aliases */}
                {(term.aliases?.length || term.abbr?.length) && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                    <span className="font-semibold">Also known as:</span>
                    {[...(term.aliases || []), ...(term.abbr || [])].map(
                      (a, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-ink-dark/5 px-2 py-0.5 text-xs font-medium"
                        >
                          {a}
                        </span>
                      ),
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <GlossaryTagBadge
                    tagId={term.primary_tag}
                    name={categoryName}
                    icon={icon}
                    accent={accent}
                    locale={locale}
                  />
                  {term.tags
                    .filter((t) => t !== term.primary_tag)
                    .slice(0, 4)
                    .map((tagId) => {
                      const t = glossaryTags[tagId];
                      return (
                        <GlossaryTagBadge
                          key={tagId}
                          tagId={tagId}
                          name={getTagDisplayName(tagId)}
                          icon={t?.icon || "📚"}
                          accent={t?.accent || "#6C5CE7"}
                          locale={locale}
                          size="sm"
                        />
                      );
                    })}

                  {/* Level badge */}
                  {term.level === "premed" && (
                    <span className="rounded-full bg-showcase-teal/10 px-3 py-1 text-xs font-bold text-showcase-teal">
                      Pre-Med
                    </span>
                  )}
                  {term.level === "formula" && (
                    <span className="rounded-full bg-showcase-orange/10 px-3 py-1 text-xs font-bold text-showcase-orange">
                      Formula
                    </span>
                  )}
                  {term.level === "lab-value" && (
                    <span className="rounded-full bg-showcase-blue/10 px-3 py-1 text-xs font-bold text-showcase-blue">
                      Lab Value
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Share Panel */}
            <div className="mt-4">
              <GlossarySharePanel
                termName={term.names[0]}
                termUrl={termUrl}
                definition={term.definition}
              />
            </div>
          </header>

          {/* Keyboard navigation */}
          <GlossaryKeyboardNav
            prevHref={prev ? `/${locale}/resources/glossary/${prev.id}` : null}
            nextHref={next ? `/${locale}/resources/glossary/${next.id}` : null}
            glossaryHref={`/${locale}/resources/glossary`}
          />

          {/* ── Content Sections ──────────────────────────────────── */}
          <GlossaryStudyMode
            sectionIds={[
              "definition",
              ...(term.why_it_matters ? ["why-it-matters"] : []),
              ...(term.how_youll_see_it?.length ? ["clinical-presentation"] : []),
              ...(term.problem_solving?.length ? ["diagnosis"] : []),
              ...(term.differentials?.length ? ["differentials"] : []),
              ...(term.treatment?.length ? ["treatment"] : []),
              ...(term.tricks?.length ? ["mnemonics"] : []),
              ...(term.tips?.length ? ["study-tips"] : []),
              ...(term.red_flags?.length ? ["red-flags"] : []),
              ...(term.algorithm?.length ? ["algorithm"] : []),
              ...(term.exam_appearance?.length ? ["exam"] : []),
              ...(term.cases?.length ? ["cases"] : []),
            ]}
          >
            {/* Definition — always present */}
            <DefinitionSection
              definition={term.definition}
              termName={term.names[0]}
              {...renderOpts}
            />

            {/* Why It Matters */}
            {term.why_it_matters && (
              <ListSection
                id="why-it-matters"
                title="Why It Matters"
                icon="⚡"
                accent="#FFD93D"
                items={[term.why_it_matters]}
                seoHeading={`Why ${term.names[0]} Matters`}
                {...renderOpts}
              />
            )}

            {/* Clinical Presentation */}
            {term.how_youll_see_it?.length ? (
              <ListSection
                id="clinical-presentation"
                title="Clinical Presentation"
                icon="👁️"
                accent="#54A0FF"
                items={term.how_youll_see_it}
                seoHeading="Clinical Presentation"
                {...renderOpts}
              />
            ) : null}

            {/* Diagnosis & Workup */}
            {term.problem_solving?.length ? (
              <ListSection
                id="diagnosis"
                title="Diagnosis & Workup"
                icon="🔍"
                accent="#00D9C0"
                items={term.problem_solving}
                seoHeading={`Diagnosis & Workup for ${term.names[0]}`}
                ordered
                {...renderOpts}
              />
            ) : null}

            {/* Differentials */}
            {term.differentials?.length ? (
              <DifferentialsSection
                differentials={term.differentials}
                termName={term.names[0]}
                {...renderOpts}
              />
            ) : null}

            {/* Treatment */}
            {term.treatment?.length ? (
              <ListSection
                id="treatment"
                title="Treatment"
                icon="💊"
                accent="#2ECC71"
                items={term.treatment}
                seoHeading={`Treatment for ${term.names[0]}`}
                ordered
                {...renderOpts}
              />
            ) : null}

            {/* Mnemonics & Study Tips */}
            {term.tricks?.length ? (
              <ListSection
                id="mnemonics"
                title="Mnemonics & Study Tips"
                icon="💡"
                accent="#FF85A2"
                items={term.tricks}
                seoHeading="Mnemonics & Study Tips"
                {...renderOpts}
              />
            ) : null}

            {/* Study Tips (premed) */}
            {term.tips?.length ? (
              <ListSection
                id="study-tips"
                title="Study Tips"
                icon="📝"
                accent="#FF85A2"
                items={term.tips}
                seoHeading="Study Tips"
                {...renderOpts}
              />
            ) : null}

            {/* Red Flags */}
            {term.red_flags?.length ? (
              <ListSection
                id="red-flags"
                title="Red Flags & Emergencies"
                icon="🚨"
                accent="#EF4444"
                items={term.red_flags}
                seoHeading={`Red Flags for ${term.names[0]}`}
                {...renderOpts}
              />
            ) : null}

            {/* Algorithm */}
            {term.algorithm?.length ? (
              <ListSection
                id="algorithm"
                title="Clinical Algorithm"
                icon="📐"
                accent="#54A0FF"
                items={term.algorithm}
                seoHeading={`Clinical Algorithm for ${term.names[0]}`}
                ordered
                {...renderOpts}
              />
            ) : null}

            {/* Exam Scenarios */}
            {term.exam_appearance?.length ? (
              <ListSection
                id="exam"
                title="Exam Scenarios"
                icon="📝"
                accent="#7E22CE"
                items={term.exam_appearance}
                seoHeading="Exam Scenarios"
                {...renderOpts}
              />
            ) : null}

            {/* Clinical Cases */}
            {term.cases?.length ? (
              <CasesSection cases={term.cases} termName={term.names[0]} />
            ) : null}

            {/* Images */}
            {term.images?.length ? (
              <ImagesSection images={term.images} termName={term.names[0]} />
            ) : null}

            {/* Clinical Pearls (formula terms) */}
            {term.pearls?.length ? (
              <ListSection
                id="pearls"
                title="Clinical Pearls"
                icon="💎"
                accent="#FF9F43"
                items={term.pearls}
                seoHeading="Clinical Pearls"
                {...renderOpts}
              />
            ) : null}

            {/* Clinical Usage (formula terms) */}
            {term.clinical_usage?.length ? (
              <ListSection
                id="clinical-usage"
                title="Clinical Usage"
                icon="🏥"
                accent="#00D9C0"
                items={term.clinical_usage}
                seoHeading="Clinical Usage"
                {...renderOpts}
              />
            ) : null}

            {/* Clinical Significance (lab-value terms) */}
            {term.clinical_significance?.length ? (
              <ListSection
                id="clinical-significance"
                title="Clinical Significance"
                icon="⚠️"
                accent="#EF4444"
                items={term.clinical_significance}
                seoHeading="Clinical Significance"
                {...renderOpts}
              />
            ) : null}

            {/* Key Concepts (lab-value terms) */}
            {term.key_concepts?.length ? (
              <ListSection
                id="key-concepts"
                title="Key Concepts"
                icon="🔑"
                accent="#6C5CE7"
                items={term.key_concepts}
                seoHeading="Key Concepts"
                {...renderOpts}
              />
            ) : null}
          </GlossaryStudyMode>

          {/* Cross-reference graph */}
          <div className="mt-6">
            <GlossaryCrossRefGraph
              currentTerm={{
                id: term.id,
                name: term.names[0],
                primary_tag: term.primary_tag,
              }}
              relatedTerms={relatedTerms.map((t) => ({
                id: t.id,
                name: t.names[0],
                primary_tag: t.primary_tag,
              }))}
              prerequisiteTerms={prerequisiteTerms.map((t) => ({
                id: t.id,
                name: t.names[0],
                primary_tag: t.primary_tag,
              }))}
              differentialTerms={(term.differentials || [])
                .filter((d) => d.id)
                .map((d) => ({
                  id: d.id!,
                  name: d.name || d.id!,
                  primary_tag: term.primary_tag,
                }))}
              tags={glossaryTags}
              locale={locale}
            />
          </div>

          {/* Prerequisites */}
          {prerequisiteTerms.length > 0 && (
            <div className="mt-6">
              <SeeAlsoSection
                relatedTerms={prerequisiteTerms}
                locale={locale}
                tags={glossaryTags}
              />
            </div>
          )}

          {/* See Also / Related Conditions */}
          {relatedTerms.length > 0 && (
            <div className="mt-6">
              <SeeAlsoSection
                relatedTerms={relatedTerms}
                locale={locale}
                tags={glossaryTags}
              />
            </div>
          )}

          {/* Sources & Credits */}
          <div className="mt-6">
            <SourcesSection
              sources={term.sources}
              credits={term.credits}
            />
          </div>

          {/* ── Prev/Next Navigation ──────────────────────────────── */}
          <nav className="mt-12 flex items-center justify-between gap-4" aria-label="Term navigation">
            {prev ? (
              <Link
                href={`/${locale}/resources/glossary/${prev.id}`}
                className="group flex items-center gap-2 rounded-xl border-2 border-ink-dark/10 bg-white px-4 py-3 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
              >
                <ChevronLeft className="h-4 w-4 text-ink-muted transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline text-ink-muted">Previous:</span>
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {prev.names[0]}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/${locale}/resources/glossary/${next.id}`}
                className="group flex items-center gap-2 rounded-xl border-2 border-ink-dark/10 bg-white px-4 py-3 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
              >
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {next.names[0]}
                </span>
                <span className="hidden sm:inline text-ink-muted">:Next</span>
                <ChevronRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </article>
    </>
  );
}
