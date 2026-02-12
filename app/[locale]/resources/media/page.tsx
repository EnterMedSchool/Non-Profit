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
} from "lucide-react";
import { m } from "framer-motion";
import Fuse from "fuse.js";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaAssetCard from "@/components/resources/MediaAssetCard";
import { mediaAssets, mediaAssetCategories, type MediaAsset } from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";

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
      </div>
    </main>
  );
}
