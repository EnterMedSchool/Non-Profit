import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  CalendarCheck,
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
import { ogImagePath } from "@/lib/og-path";
import GlossaryTagBadge from "@/components/glossary/GlossaryTagBadge";
import GlossarySharePanel from "@/components/glossary/GlossarySharePanel";
import GlossaryStudyMode from "@/components/glossary/GlossaryStudyMode";
import GlossaryKeyboardNav from "@/components/glossary/GlossaryKeyboardNav";
import GlossaryCrossRefGraph from "@/components/glossary/GlossaryCrossRefGraph";
import GlossaryTableOfContents from "@/components/glossary/GlossaryTableOfContents";
import type { TocSection } from "@/components/glossary/GlossaryTableOfContents";
import AtAGlanceCard from "@/components/glossary/sections/AtAGlanceCard";
import DefinitionSection from "@/components/glossary/sections/DefinitionSection";
import ListSection from "@/components/glossary/sections/ListSection";
import DifferentialsSection from "@/components/glossary/sections/DifferentialsSection";
import CasesSection from "@/components/glossary/sections/CasesSection";
import ImagesSection from "@/components/glossary/sections/ImagesSection";
import SeeAlsoSection from "@/components/glossary/sections/SeeAlsoSection";
import SourcesSection from "@/components/glossary/sections/SourcesSection";
import StudyThisTopic from "@/components/glossary/sections/StudyThisTopic";
import { getCrossContentLinks, hasCrossContentLinks } from "@/lib/glossary/cross-content";

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
      modifiedTime: term.lastModified ? `${term.lastModified}T00:00:00Z` : "2025-06-01T00:00:00Z",
      authors: ["EnterMedSchool.org"],
      section: term.primary_tag,
      ...(term.tags?.length && { tags: term.tags }),
      images: [{
        url: ogImagePath("resources", "glossary", termId),
        width: 1200,
        height: 630,
        alt: `${term.names[0]} — Medical glossary definition and study guide`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${term.names[0]} — Medical Glossary`,
      description: buildGlossaryTermDescription(term),
    },
  };
}

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Count total words across all text content in a term for reading time. */
function countWords(term: typeof glossaryTerms[number]): number {
  const texts: string[] = [term.definition];
  if (term.why_it_matters) texts.push(term.why_it_matters);
  for (const arr of [
    term.how_youll_see_it, term.problem_solving, term.treatment,
    term.tricks, term.exam_appearance, term.red_flags, term.algorithm,
    term.tips, term.clinical_usage, term.pearls, term.clinical_significance,
    term.key_concepts,
  ]) {
    if (arr?.length) texts.push(...arr);
  }
  if (term.differentials?.length) {
    texts.push(...term.differentials.map((d) => `${d.name || ""} ${d.hint}`));
  }
  if (term.cases?.length) {
    texts.push(...term.cases.map((c) => `${c.stem} ${c.clues.join(" ")} ${c.answer} ${c.teaching}`));
  }
  return texts.join(" ").split(/\s+/).length;
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
  const crossLinks = getCrossContentLinks(term.id);
  const hasExamContent = !!(term.exam_appearance?.length || term.cases?.length);
  const readingMinutes = Math.max(2, Math.round(countWords(term) / 200));
  const lastReviewed = term.lastModified || "2025-06-01";

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

  // Build ToC sections from available data
  const tocSections: TocSection[] = [
    { id: "definition", label: "Definition", icon: "📖" },
    { id: "at-a-glance", label: "At a Glance", icon: "⚡" },
    ...(term.why_it_matters ? [{ id: "why-it-matters", label: "Why It Matters", icon: "⚡" }] : []),
    ...(term.how_youll_see_it?.length ? [{ id: "clinical-presentation", label: "Clinical Presentation", icon: "👁️" }] : []),
    ...(term.problem_solving?.length ? [{ id: "diagnosis", label: "Diagnosis & Workup", icon: "🔍" }] : []),
    ...(term.differentials?.length ? [{ id: "differentials", label: "Differentials", icon: "🔀" }] : []),
    ...(term.treatment?.length ? [{ id: "treatment", label: "Treatment", icon: "💊" }] : []),
    ...(term.tricks?.length ? [{ id: "mnemonics", label: "Mnemonics", icon: "💡" }] : []),
    ...(term.tips?.length ? [{ id: "study-tips", label: "Study Tips", icon: "📝" }] : []),
    ...(term.red_flags?.length ? [{ id: "red-flags", label: "Red Flags", icon: "🚨" }] : []),
    ...(term.algorithm?.length ? [{ id: "algorithm", label: "Algorithm", icon: "📐" }] : []),
    ...(term.exam_appearance?.length ? [{ id: "exam", label: "Exam Scenarios", icon: "📝" }] : []),
    ...(term.cases?.length ? [{ id: "cases", label: "Clinical Cases", icon: "🏥" }] : []),
    ...(term.images?.length ? [{ id: "images", label: "Images", icon: "🖼️" }] : []),
    ...(term.pearls?.length ? [{ id: "pearls", label: "Clinical Pearls", icon: "💎" }] : []),
    ...(term.clinical_usage?.length ? [{ id: "clinical-usage", label: "Clinical Usage", icon: "🏥" }] : []),
    ...(term.clinical_significance?.length ? [{ id: "clinical-significance", label: "Clinical Significance", icon: "⚠️" }] : []),
    ...(term.key_concepts?.length ? [{ id: "key-concepts", label: "Key Concepts", icon: "🔑" }] : []),
    ...(hasCrossContentLinks(term.id) ? [{ id: "study-this-topic", label: "Study This Topic", icon: "🎓" }] : []),
    { id: "knowledge-map", label: "Knowledge Map", icon: "🔗" },
    { id: "sources", label: "References", icon: "📚" },
  ];

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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl"
                    itemProp="name"
                  >
                    {term.names[0]}
                  </h1>
                  {/* High-Yield badge */}
                  {hasExamContent && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      High-Yield
                    </span>
                  )}
                </div>

                {/* Student subtitle */}
                <p className="mt-1 text-sm text-ink-muted">
                  Free study guide for medical students and educators
                </p>

                {/* Reading time + last reviewed */}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    ~{readingMinutes} min read
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Last reviewed {lastReviewed}
                  </span>
                </div>

                {/* Aliases */}
                {(term.aliases?.length || term.abbr?.length) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
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

          {/* Mobile ToC */}
          <GlossaryTableOfContents sections={tocSections} />

          {/* ── Two-column layout: content + sidebar ToC ──────────── */}
          <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
            {/* Main content column */}
            <div>
              {/* ── Content Sections ──────────────────────────────── */}
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
                {/* Definition -- always present */}
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

              {/* At a Glance infobox */}
              <div className="mt-6">
                <AtAGlanceCard
                  term={term}
                  categoryName={categoryName}
                  accent={accent}
                />
              </div>

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

              {/* Study This Topic — cross-content links */}
              <StudyThisTopic links={crossLinks} locale={locale} />

              {/* Sources & Credits */}
              <div className="mt-6">
                <SourcesSection
                  sources={term.sources}
                  credits={term.credits}
                />
              </div>

              {/* ── Prev/Next Navigation ──────────────────────────── */}
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

            {/* Sidebar: Desktop ToC */}
            <aside className="hidden lg:block">
              <GlossaryTableOfContents sections={tocSections} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
