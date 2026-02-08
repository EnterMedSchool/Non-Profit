"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  SearchX,
} from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ResourceCard from "@/components/resources/ResourceCard";
import { resources } from "@/data/resources";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";

const categories = ["all", "questions", "videos", "pdfs", "visuals"] as const;

const categoryPillColors: Record<string, { active: string; inactive: string }> = {
  all: {
    active: "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm -translate-y-0.5",
    inactive: "border-showcase-navy/20 bg-white text-ink-muted hover:border-showcase-navy/40 hover:bg-gray-50",
  },
  questions: {
    active: "border-showcase-purple bg-showcase-purple text-white shadow-chunky-purple -translate-y-0.5",
    inactive: "border-showcase-purple/25 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10",
  },
  videos: {
    active: "border-showcase-teal bg-showcase-teal text-white shadow-chunky-sm -translate-y-0.5",
    inactive: "border-showcase-teal/25 bg-showcase-teal/5 text-showcase-teal hover:bg-showcase-teal/10",
  },
  pdfs: {
    active: "border-showcase-yellow bg-showcase-yellow text-ink-dark shadow-chunky-sm -translate-y-0.5",
    inactive: "border-showcase-yellow/25 bg-showcase-yellow/5 text-showcase-orange hover:bg-showcase-yellow/10",
  },
  visuals: {
    active: "border-showcase-green bg-showcase-green text-white shadow-chunky-green -translate-y-0.5",
    inactive: "border-showcase-green/25 bg-showcase-green/5 text-showcase-green hover:bg-showcase-green/10",
  },
};

export default function ResourcesPage() {
  const t = useTranslations("resources");
  const [active, setActive] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = resources.filter((r) => {
    const matchesCategory = active === "all" || r.category === active;
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const resourceListItems = resources.map((r, i) => ({
    name: r.title,
    url: `${BASE_URL}/en/resources/${r.category}`,
    position: i + 1,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Free Medical Education Resources", "Download study materials, watch video guides, explore visual lessons, and practice with exam questions.", `${BASE_URL}/en/resources`)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getItemListJsonLd(resourceListItems)) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Free"
          titleHighlight="Resources"
          titlePost="for Everyone"
          gradient="from-showcase-green via-showcase-teal to-showcase-purple"
          annotation="everything you need!"
          annotationColor="text-showcase-green"
          subtitle="Download study materials, watch video guides, explore visual lessons, and practice with exam questions."
          floatingIcons={<>
            <BookOpen className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <FileText className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-yellow/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Video className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <ImageIcon className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* ── Search + Category Filter ── */}
        <AnimatedSection delay={0.2} animation="slideLeft">
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input with glow */}
            <div className="relative flex-1 max-w-lg">
              <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${searchFocused ? "text-showcase-purple scale-110" : "text-ink-light"}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={t("searchPlaceholder")}
                className={`w-full rounded-2xl border-3 bg-white py-3 pl-12 pr-4 text-sm shadow-md outline-none transition-all duration-300 ${
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
                      onClick={() => setActive(cat)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                        active === cat ? pillColors.active : pillColors.inactive
                      }`}
                    >
                      {t(`categories.${cat}`)}
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Match count */}
        {(search.trim() || active !== "all") && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-ink-muted"
          >
            <span className="font-bold text-showcase-purple">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "result" : "results"} found
            {search.trim() && (
              <span> for &ldquo;<span className="font-semibold">{search}</span>&rdquo;</span>
            )}
            {active !== "all" && (
              <span> in <span className="font-semibold">{t(`categories.${active}`)}</span></span>
            )}
          </motion.p>
        )}

        {/* ── Resource Cards ── */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, i) => (
            <AnimatedSection key={resource.id} delay={i * 0.06} animation="rotateIn">
              <ResourceCard resource={resource} />
            </AnimatedSection>
          ))}
        </div>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-lavender">
                  <SearchX className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-showcase-coral/20 animate-pulse" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                No resources found...
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                Try adjusting your search or clearing the category filter.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActive("all");
                }}
                className="mt-4 rounded-full border-2 border-showcase-purple/30 bg-showcase-purple/5 px-5 py-2 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
              >
                Reset Filters
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
