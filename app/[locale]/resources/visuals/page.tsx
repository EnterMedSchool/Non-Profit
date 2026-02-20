"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  Search,
  Shield,
  ExternalLink,
  Image as ImageIcon,
  Volume2,
  Package,
  Code,
  SearchX,
} from "lucide-react";
import { m } from "framer-motion";
import Fuse from "fuse.js";
import SectionHeading from "@/components/shared/SectionHeading";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import LessonCard from "@/components/resources/LessonCard";
import EmbedConfigurator from "@/components/resources/EmbedConfigurator";
import { visualLessons, type VisualLesson } from "@/data/visuals";
import { getCollectionPageJsonLd, getCourseJsonLd } from "@/lib/metadata";

const categoryPillColors: Record<string, { active: string; inactive: string }> = {
  all: {
    active: "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm -translate-y-0.5",
    inactive: "border-showcase-navy/20 bg-white text-ink-muted hover:border-showcase-navy/40 hover:bg-gray-50",
  },
  GI: {
    active: "border-showcase-green bg-showcase-green text-white shadow-chunky-green -translate-y-0.5",
    inactive: "border-showcase-green/25 bg-showcase-green/5 text-showcase-green hover:bg-showcase-green/10",
  },
  Pharmacology: {
    active: "border-showcase-purple bg-showcase-purple text-white shadow-chunky-purple -translate-y-0.5",
    inactive: "border-showcase-purple/25 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10",
  },
  Hematology: {
    active: "border-showcase-coral bg-showcase-coral text-white shadow-chunky-coral -translate-y-0.5",
    inactive: "border-showcase-coral/25 bg-showcase-coral/5 text-showcase-coral hover:bg-showcase-coral/10",
  },
};

const STEPS = [
  { icon: ImageIcon, key: "0", color: "showcase-green" },
  { icon: Volume2, key: "1", color: "showcase-purple" },
  { icon: Package, key: "2", color: "showcase-teal" },
  { icon: Code, key: "3", color: "showcase-blue" },
  { icon: Shield, key: "4", color: "showcase-coral", emphasis: true },
];

export default function VisualsPage() {
  const t = useTranslations("resources");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [embedLesson, setEmbedLesson] = useState<VisualLesson | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    "all",
    ...Array.from(new Set(visualLessons.map((l) => l.category))),
  ];

  const fuse = useRef(
    new Fuse(visualLessons, {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1.5 },
        { name: "category", weight: 1 },
        { name: "subcategory", weight: 1 },
        { name: "tags", weight: 1.5 },
        { name: "keyFacts.term", weight: 1.2 },
        { name: "keyFacts.description", weight: 0.8 },
        { name: "layers.name", weight: 0.6 },
        { name: "creator.name", weight: 0.5 },
      ],
      threshold: 0.35,
      includeScore: true,
    })
  );

  const filteredLessons = useMemo(() => {
    let results = visualLessons;
    if (debouncedSearchQuery.trim()) {
      results = fuse.current.search(debouncedSearchQuery).map((r) => r.item);
    }
    if (activeCategory !== "all") {
      results = results.filter((l) => l.category === activeCategory);
    }
    return results;
  }, [searchQuery, activeCategory]);

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <>
      <main className="relative z-10 py-12 sm:py-20">
        {/* JSON-LD structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd(t("visuals.jsonLd.title"), t("visuals.jsonLd.description"), `${BASE_URL}/${locale}/resources/visuals`, locale)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCourseJsonLd(t("visuals.jsonLd.courseTitle"), t("visuals.jsonLd.courseDescription"), `${BASE_URL}/${locale}/resources/visuals`, locale)) }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Hero Section ── */}
          <PageHero
            titlePre={t("visuals.hero.titlePre")}
            titleHighlight={t("visuals.hero.titleHighlight")}
            titlePost={t("visuals.hero.titlePost")}
            gradient="from-showcase-purple via-showcase-teal to-showcase-green"
            meshColors={["bg-showcase-purple/30", "bg-showcase-teal/25", "bg-showcase-green/20"]}
            annotation={t("visuals.hero.annotation")}
            annotationColor="text-showcase-teal"
            subtitle={t("visuals.hero.subtitle")}
          />

          {/* ── Attribution Banner -- Glassmorphism ── */}
          <AnimatedSection delay={0.15} animation="blurIn">
            <div className="group relative mt-10 overflow-hidden rounded-2xl border-2 border-showcase-teal/30 bg-white/60 backdrop-blur-md p-5 sm:p-6 shadow-lg transition-all hover:shadow-xl">
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative flex items-start gap-4">
                {/* Shield with glow ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-teal/20" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-teal to-showcase-green shadow-md">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold text-ink-dark sm:text-lg">
                    {t("visuals.attributionBanner.title")}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                    {t("visuals.attributionBanner.description")}{" "}
                    <a href="mailto:ari@entermedschool.com" className="font-semibold text-showcase-teal hover:underline">
                      ari@entermedschool.com
                    </a>{" "}
                    for approval.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`/${locale}/license`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-teal/30 bg-showcase-teal/10 px-3 py-1 text-xs font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:shadow-sm">
                      <ExternalLink className="h-3 w-3" />
                      {t("visuals.attributionBanner.getBadge")}
                    </a>
                    <a href="https://entermedschool.com" rel="dofollow" className="inline-flex items-center gap-1 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/15">
                      entermedschool.com
                    </a>
                    <a href="https://entermedschool.org" rel="dofollow" className="inline-flex items-center gap-1 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/15">
                      entermedschool.org
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Search + Category Filter ── */}
          <AnimatedSection delay={0.2} animation="slideLeft">
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search input with glow */}
              <div className="relative flex-1 max-w-lg">
                <Search className={`absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${searchFocused ? "text-showcase-purple scale-110" : "text-ink-light"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  aria-label="Search visuals"
                  placeholder={t("visuals.searchPlaceholder")}
                  className={`w-full rounded-2xl border-3 bg-white py-3 ps-12 pe-4 text-sm shadow-md outline-none transition-all duration-300 ${
                    searchFocused
                      ? "border-showcase-purple shadow-[0_0_20px_rgba(108,92,231,0.2)]"
                      : "border-showcase-navy/15 hover:border-showcase-navy/30"
                  }`}
                />
              </div>
              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => {
                  const pillColors = categoryPillColors[cat] || categoryPillColors.all;
                  return (
                    <AnimatedSection key={cat} delay={0.25 + i * 0.05} animation="popIn">
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                          activeCategory === cat ? pillColors.active : pillColors.inactive
                        }`}
                      >
                        {cat === "all" ? t("visuals.allCategories") : cat}
                      </button>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* Match count */}
          {(debouncedSearchQuery.trim() || activeCategory !== "all") && (
            <m.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-ink-muted"
            >
              <span className="font-bold text-showcase-purple">{filteredLessons.length}</span>{" "}
              {filteredLessons.length === 1 ? t("visuals.resultsFound") : t("visuals.resultsFoundPlural")} {t("visuals.found")}
              {debouncedSearchQuery.trim() && (
                <span> for &ldquo;<span className="font-semibold">{debouncedSearchQuery}</span>&rdquo;</span>
              )}
              {activeCategory !== "all" && (
                <span> in <span className="font-semibold">{activeCategory}</span></span>
              )}
            </m.p>
          )}

          {/* ── Lesson Cards ── */}
          <div className="mt-10 space-y-8">
            {filteredLessons.map((lesson, i) => (
              <AnimatedSection key={lesson.id} delay={i * 0.1} animation="rotateIn">
                <LessonCard lesson={lesson} onOpenEmbed={setEmbedLesson} />
              </AnimatedSection>
            ))}
          </div>

          {/* ── Empty State ── */}
          {filteredLessons.length === 0 && (
            <AnimatedSection animation="scaleIn">
              <div className="mt-20 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-showcase-purple/[0.06]">
                    <SearchX className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-showcase-coral/20 animate-pulse" />
                </div>
                <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                  {t("visuals.emptyState.title")}
                </p>
                <p className="mt-2 text-sm text-ink-light max-w-sm">
                  {t("visuals.emptyState.hint")}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 rounded-full border-2 border-showcase-purple/30 bg-showcase-purple/5 px-5 py-2 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
                >
                  {t("visuals.emptyState.resetFilters")}
                </button>
              </div>
            </AnimatedSection>
          )}

          {/* ── How to Use -- Step Cards ── */}
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-ink-dark sm:text-3xl">
                  {t("visuals.howToUse.title")}
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{t("visuals.howToUse.subtitle")}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <AnimatedSection key={step.key} delay={0.35 + i * 0.08} animation="popIn" spring className="h-full">
                      <div className={`relative h-full flex flex-col items-center rounded-2xl border-3 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-chunky ${
                        step.emphasis
                          ? "border-showcase-coral bg-showcase-coral/5 hover:shadow-chunky-coral"
                          : "border-showcase-navy/15 bg-white hover:shadow-chunky-sm hover:border-showcase-navy/30"
                      }`}>
                        {/* Step number */}
                        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${
                          step.color === "showcase-green" ? "from-showcase-green to-showcase-teal" :
                          step.color === "showcase-purple" ? "from-showcase-purple to-showcase-blue" :
                          step.color === "showcase-teal" ? "from-showcase-teal to-showcase-green" :
                          step.color === "showcase-blue" ? "from-showcase-blue to-showcase-purple" :
                          "from-showcase-coral to-showcase-pink"
                        } shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="absolute top-2 end-3 font-display text-3xl font-extrabold text-showcase-navy/5">
                          {i + 1}
                        </span>
                        <h4 className="mt-3 font-display text-sm font-bold text-ink-dark">
                          {t(`visuals.howToUse.steps.${step.key}.title`)}
                        </h4>
                        <p className="mt-1 flex-1 text-xs text-ink-muted leading-relaxed">
                          {t(`visuals.howToUse.steps.${step.key}.desc`)}
                        </p>
                        {step.emphasis && (
                          <div className="mt-3 flex justify-center gap-2">
                            <a href={`/${locale}/license`} className="text-[10px] font-bold text-showcase-coral underline hover:no-underline">
                              {t("visuals.attributionBanner.getBadge")}
                            </a>
                            <a href="mailto:ari@entermedschool.com" className="text-[10px] font-bold text-showcase-coral hover:underline">
                              {t("visuals.attributionBanner.contactUs")}
                            </a>
                          </div>
                        )}
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <EmbedConfigurator lesson={embedLesson} onClose={() => setEmbedLesson(null)} />
    </>
  );
}
