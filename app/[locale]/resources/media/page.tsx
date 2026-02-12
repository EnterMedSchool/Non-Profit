"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ImageDown,
  Shield,
  ExternalLink,
  Sparkles,
  Palette,
  Download,
  SearchX,
  Tag,
  Layers,
  Package,
  HelpCircle,
  ChevronDown,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { m } from "framer-motion";
import Fuse from "fuse.js";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaAssetCard from "@/components/resources/MediaAssetCard";
import {
  mediaAssets,
  mediaAssetCategories,
  mediaAssetCollections,
  getAllTags,
  getTagSlug,
  getTagCounts,
  getCollectionAssets,
  type MediaAsset,
} from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd, getFAQPageJsonLd } from "@/lib/metadata";

/* ── Category pill colours ─────────────────────────────────────── */

const categoryPillColors: Record<string, { active: string; inactive: string }> = {
  all: {
    active: "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm -translate-y-0.5",
    inactive: "border-showcase-navy/20 bg-white text-ink-muted hover:border-showcase-navy/40 hover:bg-gray-50",
  },
  anatomy: {
    active: "border-showcase-coral bg-showcase-coral text-white shadow-chunky-coral -translate-y-0.5",
    inactive: "border-showcase-coral/25 bg-showcase-coral/5 text-showcase-coral hover:bg-showcase-coral/10",
  },
  cells: {
    active: "border-showcase-teal bg-showcase-teal text-ink-dark shadow-chunky-teal -translate-y-0.5",
    inactive: "border-showcase-teal/25 bg-showcase-teal/5 text-showcase-teal hover:bg-showcase-teal/10",
  },
  molecules: {
    active: "border-showcase-purple bg-showcase-purple text-white shadow-chunky-purple -translate-y-0.5",
    inactive: "border-showcase-purple/25 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10",
  },
  organs: {
    active: "border-showcase-pink bg-showcase-pink text-white shadow-chunky-pink -translate-y-0.5",
    inactive: "border-showcase-pink/25 bg-showcase-pink/5 text-showcase-pink hover:bg-showcase-pink/10",
  },
  equipment: {
    active: "border-showcase-blue bg-showcase-blue text-white shadow-chunky-blue -translate-y-0.5",
    inactive: "border-showcase-blue/25 bg-showcase-blue/5 text-showcase-blue hover:bg-showcase-blue/10",
  },
  diagrams: {
    active: "border-showcase-green bg-showcase-green text-white shadow-chunky-green -translate-y-0.5",
    inactive: "border-showcase-green/25 bg-showcase-green/5 text-showcase-green hover:bg-showcase-green/10",
  },
};

export default function MediaAssetsPage() {
  const t = useTranslations("mediaAssets");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    "all",
    ...Array.from(new Set(mediaAssets.map((a) => a.category))),
  ];

  const fuse = useRef(
    new Fuse(mediaAssets, {
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 1.5 },
        { name: "category", weight: 1 },
        { name: "tags", weight: 1.5 },
        { name: "seoKeywords", weight: 1.2 },
      ],
      threshold: 0.35,
      includeScore: true,
    }),
  );

  const filteredAssets = useMemo(() => {
    let results: MediaAsset[] = mediaAssets;
    if (debouncedSearchQuery.trim()) {
      results = fuse.current.search(debouncedSearchQuery).map((r) => r.item);
    }
    if (activeCategory !== "all") {
      results = results.filter((a) => a.category === activeCategory);
    }
    return results;
  }, [debouncedSearchQuery, activeCategory]);

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd(
              t("jsonLd.title"),
              t("jsonLd.description"),
              `${BASE_URL}/${locale}/resources/media`,
              locale,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getItemListJsonLd(
              mediaAssets.map((asset, i) => ({
                name: asset.name,
                url: `${BASE_URL}/${locale}/resources/media/${asset.slug}`,
                position: i + 1,
              })),
            ),
          ),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero Section ── */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-yellow via-showcase-orange to-showcase-coral"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-orange"
          subtitle={t("hero.subtitle")}
          floatingIcons={
            <>
              <ImageDown
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-yellow/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Palette
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-orange/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
              <Sparkles
                className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-coral/15 animate-float-gentle"
                style={{ animationDelay: "2s" }}
              />
              <Download
                className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-yellow/15 animate-float-playful"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          }
        />

        {/* ── Attribution Banner ── */}
        <AnimatedSection delay={0.15} animation="blurIn">
          <div className="group relative mt-10 overflow-hidden rounded-2xl border-2 border-showcase-teal/30 bg-white/60 backdrop-blur-md p-5 sm:p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="relative flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-teal/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-teal to-showcase-green shadow-md">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold text-ink-dark sm:text-lg">
                  {t("attributionBanner.title")}
                </h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  {t("attributionBanner.description")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/license`}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-teal/30 bg-showcase-teal/10 px-3 py-1 text-xs font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20 hover:shadow-sm"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("attributionBanner.viewLicense")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Search + Category Filter ── */}
        <AnimatedSection delay={0.2} animation="slideLeft">
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-lg">
              <Search
                className={`absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${
                  searchFocused
                    ? "text-showcase-purple scale-110"
                    : "text-ink-light"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label={t("searchAriaLabel")}
                placeholder={t("searchPlaceholder")}
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
                const pillColors =
                  categoryPillColors[cat] || categoryPillColors.all;
                return (
                  <AnimatedSection
                    key={cat}
                    delay={0.25 + i * 0.05}
                    animation="popIn"
                  >
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold capitalize transition-all duration-200 ${
                        activeCategory === cat
                          ? pillColors.active
                          : pillColors.inactive
                      }`}
                    >
                      {cat === "all" ? t("allCategories") : cat}
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Match count ── */}
        {(debouncedSearchQuery.trim() || activeCategory !== "all") && (
          <m.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-ink-muted"
          >
            <span className="font-bold text-showcase-purple">
              {filteredAssets.length}
            </span>{" "}
            {filteredAssets.length === 1 ? t("result") : t("results")}
            {debouncedSearchQuery.trim() && (
              <span>
                {" "}
                {t("for")} &ldquo;
                <span className="font-semibold">{debouncedSearchQuery}</span>
                &rdquo;
              </span>
            )}
            {activeCategory !== "all" && (
              <span>
                {" "}
                {t("in")}{" "}
                <span className="font-semibold capitalize">
                  {activeCategory}
                </span>
              </span>
            )}
          </m.p>
        )}

        {/* ── Asset Grid ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset, i) => (
            <AnimatedSection
              key={asset.id}
              delay={i * 0.08}
              animation="popIn"
              spring
            >
              <MediaAssetCard asset={asset} />
            </AnimatedSection>
          ))}
        </div>

        {/* ── Empty State ── */}
        {filteredAssets.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-lavender">
                  <SearchX className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-showcase-coral/20 animate-pulse" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                {t("emptyState.title")}
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                {t("emptyState.hint")}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 rounded-full border-2 border-showcase-purple/30 bg-showcase-purple/5 px-5 py-2 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
              >
                {t("emptyState.resetFilters")}
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* ── Browse by Category (crawler-visible internal links) ── */}
        <AnimatedSection delay={0.3} animation="fadeUp">
          <div className="mt-20 border-t-2 border-ink-light/10 pt-10">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-showcase-orange" />
              <h2 className="font-display text-xl font-bold text-ink-dark">
                {t("browseByCategory")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {mediaAssetCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/resources/media/category/${cat.id}`}
                  className="group rounded-xl border-2 border-showcase-navy/10 bg-white p-3 text-center transition-all hover:border-showcase-purple/20 hover:bg-pastel-lavender/30 hover:shadow-sm"
                >
                  <span className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Popular Tags (crawler-visible internal links) ── */}
        <AnimatedSection delay={0.35} animation="fadeUp">
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-showcase-purple" />
              <h2 className="font-display text-xl font-bold text-ink-dark">
                {t("popularTags")}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAllTags().map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/resources/media/tag/${getTagSlug(tag)}`}
                  className="rounded-full border border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-semibold text-showcase-purple transition-all hover:bg-showcase-purple/10 hover:shadow-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Curated Collections ── */}
        {mediaAssetCollections.length > 0 && (
          <AnimatedSection delay={0.4} animation="fadeUp">
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-showcase-coral" />
                  <h2 className="font-display text-xl font-bold text-ink-dark">
                    {t("curatedCollections")}
                  </h2>
                </div>
                <Link
                  href={`/${locale}/resources/media/collections`}
                  className="inline-flex items-center gap-1 text-sm font-bold text-showcase-purple transition-all hover:gap-2"
                >
                  {t("viewAll")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mediaAssetCollections.map((col) => {
                  const colAssets = getCollectionAssets(col);
                  return (
                    <Link
                      key={col.slug}
                      href={`/${locale}/resources/media/collections/${col.slug}`}
                      className="group rounded-xl border-2 border-showcase-navy/10 bg-white p-4 transition-all hover:border-showcase-orange/20 hover:bg-showcase-orange/5 hover:shadow-sm"
                    >
                      <span className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-orange transition-colors">
                        {col.name}
                      </span>
                      <p className="mt-1 text-xs text-ink-muted line-clamp-2">
                        {col.seoDescription}
                      </p>
                      <span className="mt-2 inline-block text-[10px] font-bold text-ink-light">
                        {colAssets.length} {colAssets.length === 1 ? "illustration" : "illustrations"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ── How to Cite + Embed links ── */}
        <AnimatedSection delay={0.45} animation="fadeUp">
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/resources/media/how-to-cite`}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-4 py-1.5 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t("howToCiteLink")}
            </Link>
          </div>
        </AnimatedSection>

        {/* ── FAQ Section ── */}
        <AnimatedSection delay={0.5} animation="fadeUp">
          <MediaAssetsFAQ locale={locale} />
        </AnimatedSection>
      </div>
    </main>
  );
}

/* ── FAQ Sub-Component ────────────────────────────────────────────── */

const faqData = [
  {
    question: "Are these medical illustrations free to use?",
    answer:
      "Yes! All media assets on EnterMedSchool.org are completely free to download and use. They are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0), which means you can use them for any purpose — including commercial use — as long as you provide attribution.",
  },
  {
    question: "What license do the media assets use?",
    answer:
      "All illustrations are licensed under CC BY 4.0. This is one of the most permissive Creative Commons licenses. You are free to share (copy and redistribute) and adapt (remix, transform, and build upon) the material for any purpose, even commercially, as long as you give appropriate credit.",
  },
  {
    question: "Can I use these illustrations in my presentations?",
    answer:
      "Absolutely! These illustrations are designed specifically for medical education. Use them in your lecture slides, PowerPoint presentations, Google Slides, or any other presentation tool. Just add a small attribution line (e.g., 'Image: EnterMedSchool.org — CC BY 4.0') on the slide or in your slide notes.",
  },
  {
    question: "How do I attribute EnterMedSchool media assets?",
    answer:
      "Include the creator name (EnterMedSchool.org), a link to the original illustration page, and mention the CC BY 4.0 license. For detailed examples in APA, MLA, Harvard, and slide formats, visit our 'How to Cite' guide.",
  },
  {
    question: "What formats are available?",
    answer:
      "Illustrations are available in SVG (Scalable Vector Graphics) and PNG formats. SVG files are ideal for presentations and web use because they scale to any size without losing quality. PNG files are ready for direct use in documents and slides.",
  },
  {
    question: "Can I modify or adapt these illustrations?",
    answer:
      "Yes! The CC BY 4.0 license explicitly allows you to adapt, remix, and build upon these illustrations. You can add labels, change colors, combine multiple images, or modify them in any way. If you share modified versions, note the changes you made and keep the attribution.",
  },
];

function MediaAssetsFAQ({ locale }: { locale: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations("mediaAssets");

  const faqJsonLd = getFAQPageJsonLd(faqData, locale);

  return (
    <div className="mt-16 border-t-2 border-ink-light/10 pt-10">
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-5 w-5 text-showcase-teal" />
        <h2 className="font-display text-xl font-bold text-ink-dark">
          {t("faqTitle")}
        </h2>
      </div>

      <div className="space-y-3">
        {faqData.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-ink-light/10 bg-white overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-start"
              aria-expanded={openIndex === i}
            >
              <span className="font-display text-sm font-bold text-ink-dark pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-ink-light transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-ink-muted leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
