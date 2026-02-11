"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  BookOpen,
  Image,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Palette,
  Download,
  GraduationCap,
  ExternalLink,
  Shield,
} from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import ChunkyButton from "@/components/shared/ChunkyButton";
import StickerBadge from "@/components/shared/StickerBadge";

/* ─────────────────────── Section Jump Targets ──────────────────────── */

const sectionNav = [
  { id: "section-guides", label: "Guides", icon: BookOpen, color: "bg-showcase-teal", text: "text-ink-dark" },
  { id: "section-assets", label: "Assets", icon: Image, color: "bg-showcase-orange", text: "text-ink-dark" },
];

/* ─────────────────────── Guide Data ────────────────────────────────── */

const guides = [
  { id: "ai-slides", title: "How to Use AI to Enhance Your Slides", desc: "Step-by-step guide to using AI tools for creating better medical presentations and lecture content.", icon: Sparkles, badge: "New", badgeColor: "purple" as const },
  { id: "clinical-cases-guide", title: "Using Clinical Cases in Your Curriculum", desc: "Best practices for integrating clinical case studies into medical courses for deeper learner engagement.", icon: Stethoscope },
  { id: "ems-resources", title: "Adding EnterMedSchool Resources to Your Teaching", desc: "How to embed, share, and integrate EnterMedSchool tools and resources into your LMS and lectures.", icon: BookOpen },
  { id: "mcq-maker-guide", title: "Create & Share MCQ Exams", desc: "Build multiple choice questions, generate exam PDFs with answer keys, and embed interactive quizzes directly on your website.", icon: GraduationCap, badge: "New", badgeColor: "teal" as const },
];

/* ─────────────────────── Asset Data ────────────────────────────────── */

const assets = [
  { id: "logo-pack", title: "EnterMedSchool Logo Pack", desc: "Official logos in SVG, PNG formats for use in your slides and materials.", type: "Logos", icon: Image },
  { id: "anatomy-diagrams", title: "Anatomy Diagram Set", desc: "Collection of labeled anatomy diagrams ready to embed in presentations.", type: "Diagrams", icon: Palette },
  { id: "clinical-icons", title: "Clinical Icons Collection", desc: "Medical and clinical icons for use in your educational materials and presentations.", type: "Icons", icon: Download },
];

/* ═══════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function ForProfessorsHub() {
  const t = useTranslations("professors");

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── Scroll to section ── */
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  /* ── Search filter helper ── */
  const matchesSearch = useCallback(
    (title: string, desc: string, ...extras: string[]) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        extras.some((e) => e.toLowerCase().includes(q))
      );
    },
    [searchQuery]
  );

  const filteredGuides = guides.filter((g) => matchesSearch(g.title, g.desc));
  const filteredAssets = assets.filter((a) => matchesSearch(a.title, a.desc, a.type));
  const totalResults = filteredGuides.length + filteredAssets.length;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          Search Bar + Section Jump Pills  (single compact toolbar)
          ════════════════════════════════════════════════════════════════ */}
      <AnimatedSection delay={0.1} animation="fadeUp">
        <div className="mt-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative mx-auto max-w-2xl">
            <div className="relative flex items-center overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky transition-all focus-within:shadow-chunky-lg focus-within:-translate-y-0.5">
              <Search className="ml-4 h-5 w-5 flex-shrink-0 text-ink-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides and assets..."
                className="w-full bg-transparent px-3 py-3.5 text-base font-body text-ink-dark outline-none placeholder:text-ink-light"
                aria-label="Search professor resources"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-pastel-lavender text-ink-muted transition-colors hover:bg-showcase-purple hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {isSearching && (
              <p className="mt-2 text-center text-xs text-ink-muted">
                {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>

          {/* Section jump pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {sectionNav.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`inline-flex items-center gap-2 rounded-xl ${s.color} ${s.text} border-2 border-showcase-navy/20 px-4 py-2 text-sm font-display font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — Teaching Guides  (Mint / Teal band)
          ════════════════════════════════════════════════════════════════ */}
      <div
        id="section-guides"
        className="scroll-mt-20 mt-12 -mx-[50vw] relative left-1/2 right-1/2 w-screen"
      >
        <div className="bg-gradient-to-br from-pastel-mint via-white to-pastel-cream py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-teal">
                  <BookOpen className="h-5 w-5 text-ink-dark" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                    {t("guides.title")}
                  </h2>
                  <p className="text-sm text-ink-muted">{t("guides.description")}</p>
                </div>
              </div>
            </AnimatedSection>

            {filteredGuides.length === 0 && isSearching ? (
              <p className="py-8 text-center text-sm text-ink-muted">No guides match your search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {filteredGuides.map((guide, i) => {
                  const Icon = guide.icon;
                  return (
                    <AnimatedSection key={guide.id} delay={i * 0.08} animation="popIn" spring>
                      <ChunkyCard className="p-5 h-full flex flex-col" href="/en/for-professors/guides">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {guide.badge && <StickerBadge color={guide.badgeColor || "purple"} size="sm">{guide.badge}</StickerBadge>}
                        </div>
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-navy/10 bg-pastel-mint">
                          <Icon className="h-5 w-5 text-showcase-teal" />
                        </div>
                        <h3 className="font-display text-base font-bold text-ink-dark">{guide.title}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{guide.desc}</p>
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-showcase-teal">
                            Read Guide <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </ChunkyCard>
                    </AnimatedSection>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — Visual Assets  (Peach / Orange band)
          ════════════════════════════════════════════════════════════════ */}
      <div
        id="section-assets"
        className="scroll-mt-20 -mx-[50vw] relative left-1/2 right-1/2 w-screen"
      >
        <div className="bg-gradient-to-br from-pastel-peach via-pastel-lemon to-white py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-orange">
                  <Image className="h-5 w-5 text-ink-dark" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                    {t("assets.title")}
                  </h2>
                  <p className="text-sm text-ink-muted">{t("assets.description")}</p>
                </div>
              </div>
            </AnimatedSection>

            {filteredAssets.length === 0 && isSearching ? (
              <p className="py-8 text-center text-sm text-ink-muted">No assets match your search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset, i) => {
                  const Icon = asset.icon;
                  return (
                    <AnimatedSection key={asset.id} delay={i * 0.08} animation="popIn" spring>
                      <ChunkyCard className="p-5 h-full flex flex-col" href="/en/for-professors/assets">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <StickerBadge color="orange" size="sm">{asset.type}</StickerBadge>
                        </div>
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-navy/10 bg-pastel-lemon">
                          <Icon className="h-5 w-5 text-showcase-orange" />
                        </div>
                        <h3 className="font-display text-base font-bold text-ink-dark">{asset.title}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{asset.desc}</p>
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-showcase-orange">
                            Download <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </ChunkyCard>
                    </AnimatedSection>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          License + CTA
          ════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* License note */}
        <AnimatedSection delay={0.1} animation="blurIn">
          <div className="group relative mt-12 overflow-hidden rounded-2xl border-2 border-showcase-green/30 bg-white/60 backdrop-blur-md p-5 sm:p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="relative flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-green/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-green to-showcase-teal shadow-md">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-ink-dark sm:text-lg">Free for Educators</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">{t("licenseNote")}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <div className="mt-10 mb-4 text-center">
            <div className="inline-flex flex-col items-center gap-3 sm:flex-row">
              <ChunkyButton href="/en/license" variant="green">
                Get Your Attribution Badge
                <ArrowRight className="h-4 w-4" />
              </ChunkyButton>
              <ChunkyButton href="/en/tools" variant="ghost">
                Explore Tools
                <ExternalLink className="h-4 w-4" />
              </ChunkyButton>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}
