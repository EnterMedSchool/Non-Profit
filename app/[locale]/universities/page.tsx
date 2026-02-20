"use client";

import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import Fuse from "fuse.js";
import { m } from "framer-motion";

import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HowItWorks from "@/components/universities/HowItWorks";
import UniversityFilters from "@/components/universities/UniversityFilters";
import UniversityCard from "@/components/universities/UniversityCard";
import JoinUsCTA from "@/components/universities/JoinUsCTA";
import ImpactCounter from "@/components/universities/ImpactCounter";
import { getAllUniversities, type University } from "@/data/universities";

const UniversityMap = lazy(
  () => import("@/components/universities/UniversityMap"),
);

export default function UniversitiesPage() {
  const t = useTranslations("universities");
  const locale = useLocale();
  const router = useRouter();

  const allUniversities = useMemo(() => getAllUniversities(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const fuse = useRef(
    new Fuse(allUniversities, {
      keys: [
        { name: "name", weight: 2 },
        { name: "shortName", weight: 1.5 },
        { name: "city", weight: 1 },
        { name: "country", weight: 1 },
        { name: "courses.name", weight: 1.5 },
        { name: "courses.professor", weight: 1 },
        { name: "courses.subject", weight: 1 },
      ],
      threshold: 0.35,
      includeScore: true,
    }),
  );

  const filteredUniversities = useMemo(() => {
    let results = allUniversities;

    if (debouncedSearch.trim()) {
      results = fuse.current.search(debouncedSearch).map((r) => r.item);
    }

    if (activeCountry) {
      results = results.filter((u) => u.countryCode === activeCountry);
    }

    return results;
  }, [allUniversities, debouncedSearch, activeCountry]);

  const handleCountryClick = (code: string) => {
    setActiveCountry(code || null);
    const grid = document.getElementById("university-grid");
    grid?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUniversityClick = (slug: string) => {
    router.push(`/${locale}/universities/${slug}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <PageHero
        titlePre={t("hero.titlePre")}
        titleHighlight={t("hero.titleHighlight")}
        gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
        annotation={t("hero.annotation")}
        annotationColor="text-showcase-green"
        subtitle={t("hero.subtitle")}
      />

      {/* How It Works */}
      <HowItWorks />

      {/* Interactive Map */}
      <AnimatedSection animation="fadeUp" delay={0.2}>
        <Suspense
          fallback={
            <div className="flex h-[400px] items-center justify-center rounded-2xl border-3 border-ink-dark/10 bg-pastel-cream">
              <p className="text-sm text-ink-muted">Loading map...</p>
            </div>
          }
        >
          <UniversityMap
            universities={allUniversities}
            onCountryClick={handleCountryClick}
            onUniversityClick={handleUniversityClick}
          />
        </Suspense>
      </AnimatedSection>

      {/* Impact Counter */}
      <ImpactCounter />

      {/* Filters + Grid */}
      <div id="university-grid" className="scroll-mt-24 space-y-6">
        <UniversityFilters
          universities={allUniversities}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCountry={activeCountry}
          onCountryChange={(code) => setActiveCountry(code || null)}
        />

        {/* Results count */}
        <AnimatedSection animation="fadeIn">
          <m.p
            key={`${debouncedSearch}-${activeCountry}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-ink-muted"
          >
            {t("filters.resultsCount", {
              count: filteredUniversities.length,
            })}
          </m.p>
        </AnimatedSection>

        {/* University Cards */}
        {filteredUniversities.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((uni, i) => (
              <UniversityCard key={uni.id} university={uni} index={i} />
            ))}
          </div>
        ) : (
          <AnimatedSection animation="scaleIn">
            <div className="flex flex-col items-center py-16 text-center">
              <SearchX className="mb-4 h-12 w-12 text-ink-muted/40" />
              <p className="mb-2 font-display text-lg font-bold text-ink-dark">
                {t("filters.noResults")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCountry(null);
                }}
                className="text-sm font-semibold text-showcase-purple hover:underline"
              >
                {t("filters.all")}
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>

      {/* Join Us CTA */}
      <JoinUsCTA variant="full" />
    </div>
  );
}
