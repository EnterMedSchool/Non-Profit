"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Shuffle,
  ChevronDown,
  Shield,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import GlossarySearch from "@/components/glossary/GlossarySearch";
import GlossaryAlphabetBar from "@/components/glossary/GlossaryAlphabetBar";
import GlossaryCategoryGrid from "@/components/glossary/GlossaryCategoryGrid";
import type {
  GlossaryTermSummary,
  GlossaryTagMap,
  GlossaryCategory,
} from "@/types/glossary";
import { getTagDisplayName } from "@/lib/glossary/tag-names";

interface Props {
  summaries: GlossaryTermSummary[];
  tags: GlossaryTagMap;
  categories: GlossaryCategory[];
  stats: {
    totalTerms: number;
    totalCategories: number;
    premedTerms: number;
    medicalTerms: number;
  };
  faqItems: Array<{ question: string; answer: string }>;
  locale: string;
}

export default function GlossaryHubClient({
  summaries,
  tags,
  categories,
  stats,
  faqItems,
  locale,
}: Props) {
  const t = useTranslations("glossary");
  const tc = useTranslations("common");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [showAllTerms, setShowAllTerms] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Available letters
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    summaries.forEach((s) => {
      const letter = s.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(letter)) letters.add(letter);
    });
    return Array.from(letters).sort();
  }, [summaries]);

  // Filtered terms by letter
  const filteredTerms = useMemo(() => {
    if (!activeLetter) return summaries;
    return summaries.filter(
      (s) => s.name.charAt(0).toUpperCase() === activeLetter,
    );
  }, [summaries, activeLetter]);

  // All terms are always rendered in HTML for SEO (crawlers see all links).
  // The "Show all" toggle only controls visual visibility via CSS.
  const visibleTerms = filteredTerms;
  const initialLimit = 60;
  const hasMore = filteredTerms.length > initialLimit;

  // Random term
  function goToRandomTerm() {
    const random = summaries[Math.floor(Math.random() * summaries.length)];
    window.location.href = `/${locale}/resources/glossary/${random.id}`;
  }

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          gradient="from-showcase-purple via-showcase-pink to-showcase-orange"
          meshColors={["bg-showcase-purple/30", "bg-showcase-pink/25", "bg-showcase-orange/20"]}
          annotation={t("hero.annotation", { count: stats.totalTerms })}
          annotationColor="text-showcase-purple"
          subtitle={t("hero.subtitle")}
        />

        {/* Stats Bar */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("stats.totalTerms"), value: stats.totalTerms, color: "text-showcase-purple" },
              { label: t("stats.categories"), value: stats.totalCategories, color: "text-showcase-teal" },
              { label: t("stats.premedTerms"), value: stats.premedTerms, color: "text-showcase-green" },
              { label: t("stats.medicalTerms"), value: stats.medicalTerms, color: "text-showcase-orange" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border-3 border-ink-dark/10 bg-white p-4 text-center shadow-chunky-sm"
              >
                <div className={`font-display text-2xl font-extrabold sm:text-3xl ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-semibold text-ink-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Search */}
        <AnimatedSection animation="fadeUp" delay={0.15}>
          <div className="mt-8 flex gap-3">
            <div className="flex-1">
              <GlossarySearch
                terms={summaries}
                tags={tags}
                placeholder={t("search.placeholder")}
              />
            </div>
            <button
              onClick={goToRandomTerm}
              className="flex-shrink-0 rounded-2xl border-3 border-ink-dark/10 bg-white p-4 shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky hover:border-showcase-purple/30"
              title={t("randomTerm")}
            >
              <Shuffle className="h-5 w-5 text-showcase-purple" />
            </button>
          </div>
        </AnimatedSection>

        {/* Attribution */}
        <div className="mt-6 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>
            {tc("licenseNote")}{" "}
            <Link
              href={`/${locale}/license`}
              className="font-semibold text-showcase-purple hover:underline"
            >
              {tc("attributionRequiredLink")}
            </Link>
            .
          </span>
        </div>

        {/* Browse by Category */}
        <AnimatedSection animation="fadeUp" delay={0.2}>
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-ink-dark">
              {t("nav.browseByCategory")}
            </h2>
            <div className="mt-4">
              <GlossaryCategoryGrid categories={categories} locale={locale} />
            </div>
          </div>
        </AnimatedSection>

        {/* Alphabet Index + Terms */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ink-dark">
            {t("nav.alphabetIndex")}
          </h2>

          <GlossaryAlphabetBar
            activeLetter={activeLetter}
            availableLetters={availableLetters}
            onLetterClick={setActiveLetter}
          />

          {/*
            Term Grid -- all terms rendered in HTML for SEO crawlability.
            Uses max-h + overflow-hidden to visually limit the initial view
            while keeping all <a> tags in the DOM for crawlers.
          */}
          <div
            className={`mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-[max-height] duration-300${!showAllTerms && hasMore ? " max-h-[1600px] overflow-hidden" : ""}`}
          >
            {visibleTerms.map((term) => {
              const tag = tags[term.primary_tag];
              const accent = tag?.accent || "#6C5CE7";
              const icon = tag?.icon || "📚";
              const preview = term.definition
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/<[^>]+>/g, "")
                .slice(0, 100);

              return (
                <Link
                  key={term.id}
                  href={`/${locale}/resources/glossary/${term.id}`}
                  className="group flex items-start gap-3 rounded-xl border-2 border-ink-dark/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-ink-dark/15 hover:shadow-md"
                >
                  <span className="mt-0.5 text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors truncate">
                      {term.name}
                      {term.abbr[0] && (
                        <span className="ml-1.5 text-xs font-normal text-ink-muted">
                          ({term.abbr[0]})
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {preview}…
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {getTagDisplayName(term.primary_tag)}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Show More -- fade gradient + button */}
          {!showAllTerms && hasMore && (
            <div className="relative -mt-20 pt-20 bg-gradient-to-t from-white via-white/90 to-transparent text-center pb-2">
              <button
                onClick={() => setShowAllTerms(true)}
                className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark/10 bg-white px-6 py-3 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
              >
                Show all {filteredTerms.length} terms
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* For Educators CTA */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <div className="mt-16 rounded-2xl border-3 border-showcase-purple/20 bg-gradient-to-br from-showcase-purple/5 via-white to-showcase-pink/5 p-8 text-center shadow-chunky">
            <h2 className="font-display text-2xl font-bold text-ink-dark">
              {t("forEducators.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted leading-relaxed">
              {t("forEducators.description")}
            </p>
            <Link
              href={`/${locale}/for-professors`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-showcase-purple px-5 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              {t("forEducators.cta")}
            </Link>
          </div>
        </AnimatedSection>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink-dark text-center">
            {t("faq.title")}
          </h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-3">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border-2 border-ink-dark/10 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display font-bold text-ink-dark text-sm">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-ink-muted transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-ink-dark/5 px-5 py-4">
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
