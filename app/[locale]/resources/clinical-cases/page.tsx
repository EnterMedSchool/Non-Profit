"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Search,
  Stethoscope,
  Clock,
  BarChart3,
  Sparkles,
  BookOpen,
  SearchX,
  Gamepad2,
  CheckCircle2,
  Award,
} from "lucide-react";
import { m } from "framer-motion";
import Fuse from "fuse.js";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  clinicalCases,
  difficultyConfig,
  type ClinicalCase,
} from "@/data/clinical-cases";
import { getCharacterByCaseId } from "@/data/disease-characters";
import { rarityConfig } from "@/data/disease-characters";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";

// ─── Category pill colors ───────────────────────────────────────────────────

const categoryPillColors: Record<string, { active: string; inactive: string }> = {
  all: {
    active:
      "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm -translate-y-0.5",
    inactive:
      "border-showcase-navy/20 bg-white text-ink-muted hover:border-showcase-navy/40 hover:bg-gray-50",
  },
  Hematology: {
    active:
      "border-showcase-coral bg-showcase-coral text-white shadow-chunky-coral -translate-y-0.5",
    inactive:
      "border-showcase-coral/25 bg-showcase-coral/5 text-showcase-coral hover:bg-showcase-coral/10",
  },
  GI: {
    active:
      "border-showcase-green bg-showcase-green text-white shadow-chunky-green -translate-y-0.5",
    inactive:
      "border-showcase-green/25 bg-showcase-green/5 text-showcase-green hover:bg-showcase-green/10",
  },
  Cardiology: {
    active:
      "border-showcase-purple bg-showcase-purple text-white shadow-chunky-purple -translate-y-0.5",
    inactive:
      "border-showcase-purple/25 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10",
  },
};

// ─── Difficulty filter colors ───────────────────────────────────────────────

const difficultyPillColors: Record<string, { active: string; inactive: string }> = {
  all: categoryPillColors.all,
  beginner: {
    active:
      "border-showcase-green bg-showcase-green text-white shadow-chunky-green -translate-y-0.5",
    inactive:
      "border-showcase-green/25 bg-showcase-green/5 text-showcase-green hover:bg-showcase-green/10",
  },
  intermediate: {
    active:
      "border-showcase-yellow bg-showcase-yellow text-white shadow-chunky-sm -translate-y-0.5",
    inactive:
      "border-showcase-yellow/25 bg-showcase-yellow/5 text-showcase-yellow hover:bg-showcase-yellow/10",
  },
  advanced: {
    active:
      "border-showcase-coral bg-showcase-coral text-white shadow-chunky-coral -translate-y-0.5",
    inactive:
      "border-showcase-coral/25 bg-showcase-coral/5 text-showcase-coral hover:bg-showcase-coral/10",
  },
};

// ─── Score Tier ──────────────────────────────────────────────────────────────

function getScoreTierLabel(score: number): { label: string; badgeBg: string; badgeText: string } {
  if (score >= 90) return { label: "Platinum", badgeBg: "bg-showcase-purple/10 border-showcase-purple/20", badgeText: "text-showcase-purple" };
  if (score >= 75) return { label: "Gold", badgeBg: "bg-showcase-yellow/10 border-showcase-yellow/20", badgeText: "text-amber-600" };
  if (score >= 55) return { label: "Silver", badgeBg: "bg-gray-100 border-gray-200", badgeText: "text-gray-600" };
  return { label: "Bronze", badgeBg: "bg-orange-50 border-orange-200", badgeText: "text-orange-600" };
}

// ─── Case Card ──────────────────────────────────────────────────────────────

function CaseCard({ caseData }: { caseData: ClinicalCase }) {
  const locale = useLocale();
  const character = getCharacterByCaseId(caseData.id);
  const diff = difficultyConfig[caseData.difficulty];
  const rarity = character ? rarityConfig[character.rarity] : null;
  const profile = usePlayerProfile();
  const completion = profile.getCaseResult(caseData.id);
  const isCompleted = !!completion;

  return (
    <Link
      href={`/${locale}/resources/clinical-cases/${caseData.id}`}
      className={`group relative flex flex-col sm:flex-row gap-5 rounded-2xl border-3 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-chunky cursor-pointer ${
        isCompleted ? "border-showcase-green/25" : "border-showcase-navy/10"
      }`}
    >
      {/* Completion badge */}
      {isCompleted && (
        <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 rounded-full bg-showcase-green px-2.5 py-1 shadow-chunky-sm z-10">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          <span className="text-[10px] font-bold text-white">Completed</span>
        </div>
      )}

      {/* Character thumbnail placeholder */}
      <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-pastel-lavender/30 border-2 border-showcase-navy/5 flex items-center justify-center mx-auto sm:mx-0">
        <Stethoscope className="h-10 w-10 text-showcase-purple/20" />
        {rarity && (
          <span
            className={`absolute top-2 right-2 rounded-full ${rarity.bgColor} border ${rarity.borderColor} px-2 py-0.5 text-[9px] font-bold ${rarity.color}`}
          >
            {rarity.label}
          </span>
        )}
        {/* Best score tier badge */}
        {completion && (() => {
          const tier = getScoreTierLabel(completion.score.totalScore);
          return (
            <div className={`absolute bottom-2 left-2 flex items-center gap-1 rounded-lg border px-2 py-1 shadow-sm ${tier.badgeBg}`}>
              <Award className={`h-3 w-3 ${tier.badgeText}`} />
              <span className={`text-[10px] font-bold tabular-nums ${tier.badgeText}`}>
                {tier.label} ({completion.score.totalScore})
              </span>
            </div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`rounded-full ${diff.bgColor} border ${diff.borderColor} px-2.5 py-0.5 text-[10px] font-bold ${diff.color}`}
          >
            {diff.label}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-ink-muted">
            {caseData.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-ink-light">
            <Clock className="h-3 w-3" />
            ~{caseData.estimatedMinutes} min
          </span>
        </div>

        <h3 className="font-display text-lg font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
          {caseData.title}
        </h3>

        <p className="mt-1 text-sm text-ink-muted line-clamp-2">
          {caseData.patient.briefHistory}
        </p>

        {/* Learning objectives preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {caseData.learningObjectives.slice(0, 2).map((obj, i) => (
            <span
              key={i}
              className="rounded-full bg-pastel-lavender/40 px-2.5 py-0.5 text-[10px] text-showcase-purple font-medium line-clamp-1"
            >
              {obj}
            </span>
          ))}
          {caseData.learningObjectives.length > 2 && (
            <span className="text-[10px] text-ink-light">
              +{caseData.learningObjectives.length - 2} more
            </span>
          )}
        </div>

        {/* Character name */}
        {character && (
          <div className="mt-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-showcase-yellow" />
            <span className="text-[10px] font-bold text-ink-muted">
              Unlocks: {character.name} — {character.subtitle}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ClinicalCasesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    "all",
    ...Array.from(new Set(clinicalCases.map((c) => c.category))),
  ];

  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const fuse = useRef(
    new Fuse(clinicalCases, {
      keys: [
        { name: "title", weight: 2 },
        { name: "patient.briefHistory", weight: 1.5 },
        { name: "category", weight: 1 },
        { name: "tags", weight: 1.5 },
        { name: "learningObjectives", weight: 1.2 },
      ],
      threshold: 0.35,
      includeScore: true,
    })
  );

  const filteredCases = useMemo(() => {
    let results = clinicalCases;

    if (debouncedSearchQuery.trim()) {
      results = fuse.current
        .search(debouncedSearchQuery)
        .map((r) => r.item);
    }
    if (activeCategory !== "all") {
      results = results.filter((c) => c.category === activeCategory);
    }
    if (activeDifficulty !== "all") {
      results = results.filter((c) => c.difficulty === activeDifficulty);
    }

    return results;
  }, [debouncedSearchQuery, activeCategory, activeDifficulty]);

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHero
          titlePre="Interactive "
          titleHighlight="Clinical Cases"
          titlePost=""
          gradient="from-showcase-coral via-showcase-yellow to-showcase-purple"
          meshColors={["bg-showcase-coral/30", "bg-showcase-yellow/25", "bg-showcase-purple/20"]}
          annotation="Solve cases, collect characters"
          annotationColor="text-showcase-yellow"
          subtitle="Immersive clinical scenarios with branching narratives, game mechanics, and collectible disease characters. Download ready-made slides and flashcards for your classroom."
        />

        {/* Search + Filters */}
        <AnimatedSection delay={0.2} animation="slideLeft">
          <div className="mt-10 flex flex-col gap-4">
            {/* Search */}
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
                aria-label="Search clinical cases"
                placeholder="Search by disease, symptom, or keyword..."
                className={`w-full rounded-2xl border-3 bg-white py-3 ps-12 pe-4 text-sm shadow-md outline-none transition-all duration-300 ${
                  searchFocused
                    ? "border-showcase-purple shadow-[0_0_20px_rgba(108,92,231,0.2)]"
                    : "border-showcase-navy/15 hover:border-showcase-navy/30"
                }`}
              />
            </div>

            {/* Category + Difficulty filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => {
                  const pillColors =
                    categoryPillColors[cat] || categoryPillColors.all;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                        activeCategory === cat
                          ? pillColors.active
                          : pillColors.inactive
                      }`}
                    >
                      {cat === "all" ? "All Categories" : cat}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => {
                  const pillColors =
                    difficultyPillColors[diff] || difficultyPillColors.all;
                  return (
                    <button
                      key={diff}
                      onClick={() => setActiveDifficulty(diff)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                        activeDifficulty === diff
                          ? pillColors.active
                          : pillColors.inactive
                      }`}
                    >
                      {diff === "all"
                        ? "All Levels"
                        : diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Match count */}
        {(debouncedSearchQuery.trim() ||
          activeCategory !== "all" ||
          activeDifficulty !== "all") && (
          <m.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-ink-muted"
          >
            <span className="font-bold text-showcase-purple">
              {filteredCases.length}
            </span>{" "}
            {filteredCases.length === 1 ? "case" : "cases"} found
          </m.p>
        )}

        {/* Case Cards */}
        <div className="mt-10 space-y-5">
          {filteredCases.map((caseData, i) => (
            <AnimatedSection key={caseData.id} delay={i * 0.1} animation="rotateIn">
              <CaseCard caseData={caseData} />
            </AnimatedSection>
          ))}
        </div>

        {/* Empty state */}
        {filteredCases.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-lavender">
                  <SearchX className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
                </div>
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                No cases match your filters
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                Try adjusting your search or removing some filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveDifficulty("all");
                }}
                className="mt-4 rounded-full border-2 border-showcase-purple/30 bg-showcase-purple/5 px-5 py-2 text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
              >
                Reset filters
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* How It Works */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="mt-20">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-ink-dark sm:text-3xl">
                How Clinical Cases Work
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                For professors and educators
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Search,
                  title: "Browse & Select",
                  desc: "Find cases by specialty, difficulty, or learning objective. Preview the full case with answers.",
                  color: "from-showcase-purple to-showcase-blue",
                },
                {
                  icon: Stethoscope,
                  title: "Download Materials",
                  desc: "Get PDF flashcards, PowerPoint slides, and printable handouts with QR codes — all ready to use.",
                  color: "from-showcase-teal to-showcase-green",
                },
                {
                  icon: Gamepad2,
                  title: "Students Scan & Play",
                  desc: "Students scan the QR code and solve the case interactively on their phones — complete with game mechanics.",
                  color: "from-showcase-yellow to-showcase-orange",
                },
                {
                  icon: BarChart3,
                  title: "Learn & Collect",
                  desc: "Students get a full debrief of their clinical reasoning and unlock a collectible disease character.",
                  color: "from-showcase-coral to-showcase-pink",
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <AnimatedSection
                    key={step.title}
                    delay={0.35 + i * 0.08}
                    animation="popIn"
                    spring
                    className="h-full"
                  >
                    <div className="relative h-full flex flex-col items-center rounded-2xl border-3 border-showcase-navy/15 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:shadow-chunky-sm">
                      <span className="absolute top-2 end-3 font-display text-3xl font-extrabold text-showcase-navy/5">
                        {i + 1}
                      </span>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-md`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mt-3 font-display text-sm font-bold text-ink-dark">
                        {step.title}
                      </h4>
                      <p className="mt-1 flex-1 text-xs text-ink-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
