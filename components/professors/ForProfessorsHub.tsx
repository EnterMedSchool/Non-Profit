"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  Presentation,
  BookOpen,
  Image,
  Play,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Palette,
  Download,
  FileText,
  Layers,
  Video,
  GraduationCap,
  Clock,
  ExternalLink,
  Shield,
  MonitorPlay,
} from "lucide-react";
import NextImage from "next/image";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import ChunkyButton from "@/components/shared/ChunkyButton";
import StickerBadge from "@/components/shared/StickerBadge";
import { professorTemplates } from "@/data/professor-templates";

/* ─────────────────────── Section Jump Targets ──────────────────────── */

const sectionNav = [
  { id: "section-templates", label: "Templates", icon: Presentation, color: "bg-showcase-purple", text: "text-white" },
  { id: "section-guides", label: "Guides", icon: BookOpen, color: "bg-showcase-teal", text: "text-ink-dark" },
  { id: "section-assets", label: "Assets", icon: Image, color: "bg-showcase-orange", text: "text-ink-dark" },
  { id: "section-videos", label: "Videos", icon: Video, color: "bg-showcase-pink", text: "text-white" },
];

/* ─────────────────────── Template Data (from shared data file) ──── */

// Templates are imported from @/data/professor-templates
// We take the first 4 for the hub preview
const hubTemplates = professorTemplates.slice(0, 4);

/* ─────────────────────── Guide Data ────────────────────────────────── */

const guides = [
  { id: "ai-slides", title: "How to Use AI to Enhance Your Slides", desc: "Step-by-step guide to using AI tools for creating better medical presentations and lecture content.", icon: Sparkles, badge: "New", badgeColor: "purple" as const },
  { id: "clinical-cases-guide", title: "Using Clinical Cases in Your Curriculum", desc: "Best practices for integrating clinical case studies into medical courses for deeper student engagement.", icon: Stethoscope },
  { id: "ems-resources", title: "Adding EnterMedSchool Resources to Your Teaching", desc: "How to embed, share, and integrate EnterMedSchool tools and resources into your LMS and lectures.", icon: BookOpen },
  { id: "mcq-maker-guide", title: "Create & Share MCQ Exams", desc: "Build multiple choice questions, generate exam PDFs with answer keys, and embed interactive quizzes directly on your website.", icon: GraduationCap, badge: "New", badgeColor: "teal" as const },
];

/* ─────────────────────── Asset Data ────────────────────────────────── */

const assets = [
  { id: "logo-pack", title: "EnterMedSchool Logo Pack", desc: "Official logos in SVG, PNG formats for use in your slides and materials.", type: "Logos", icon: Image },
  { id: "anatomy-diagrams", title: "Anatomy Diagram Set", desc: "Collection of labeled anatomy diagrams ready to embed in presentations.", type: "Diagrams", icon: Palette },
  { id: "clinical-icons", title: "Clinical Icons Collection", desc: "Medical and clinical icons for use in your educational materials and presentations.", type: "Icons", icon: Download },
];

/* ─────────────────────── Video Data ────────────────────────────────── */

const videoTutorials = [
  { id: "getting-started", title: "Getting Started with EnterMedSchool Resources", desc: "A quick overview of all available resources and how to use them in your classroom.", duration: "5 min", category: "Getting Started" },
  { id: "ai-slides-tutorial", title: "Creating Medical Slides with AI", desc: "Step-by-step tutorial on using AI to generate professional medical lecture slides.", duration: "12 min", category: "AI Tools" },
  { id: "embed-tools", title: "Embedding Calculators in Your LMS", desc: "How to embed interactive medical tools in Moodle, Canvas, Blackboard, and more.", duration: "8 min", category: "Integration" },
  { id: "attribution-badge", title: "How to Add Attribution Badges", desc: "Generate and add attribution badges to your slides, PDFs, and teaching materials.", duration: "4 min", category: "Getting Started" },
  { id: "clinical-cases", title: "Building Clinical Cases for Your Course", desc: "Best practices for creating engaging clinical case studies that promote deep learning.", duration: "15 min", category: "Teaching" },
  { id: "customize-templates", title: "Customizing Slide Templates", desc: "Take our templates and make them yours: colors, fonts, layouts, and branding.", duration: "10 min", category: "Templates" },
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

  const filteredTemplates = hubTemplates.filter((t) => matchesSearch(t.title, t.description, t.formatLabel));
  const filteredGuides = guides.filter((g) => matchesSearch(g.title, g.desc));
  const filteredAssets = assets.filter((a) => matchesSearch(a.title, a.desc, a.type));
  const filteredVideos = videoTutorials.filter((v) => matchesSearch(v.title, v.desc, v.category));
  const totalResults = filteredTemplates.length + filteredGuides.length + filteredAssets.length + filteredVideos.length;
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
                placeholder="Search templates, guides, assets, tutorials..."
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
          SECTION 1 — Templates  (Lavender / Purple band)
          ════════════════════════════════════════════════════════════════ */}
      <div
        id="section-templates"
        className="scroll-mt-20 mt-12 -mx-[50vw] relative left-1/2 right-1/2 w-screen"
      >
        <div className="bg-gradient-to-br from-pastel-lavender via-white to-pastel-sky py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-purple">
                  <Presentation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                    {t("templates.title")}
                  </h2>
                  <p className="text-sm text-ink-muted">{t("templates.description")}</p>
                </div>
              </div>
            </AnimatedSection>

            {filteredTemplates.length === 0 && isSearching ? (
              <p className="py-8 text-center text-sm text-ink-muted">No templates match your search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredTemplates.map((tmpl, i) => (
                  <AnimatedSection key={tmpl.id} delay={i * 0.06} animation="popIn" spring>
                    <ChunkyCard className="overflow-hidden h-full flex flex-col" href="/en/for-professors/templates">
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-pastel-lavender via-pastel-sky to-pastel-mint">
                        {tmpl.comingSoon ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <Presentation className="h-10 w-10 text-showcase-purple/30" />
                          </div>
                        ) : (
                          <NextImage
                            src={tmpl.thumbnailPath}
                            alt={tmpl.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <StickerBadge color={tmpl.format === "pptx" ? "purple" : "teal"} size="sm">{tmpl.formatLabel}</StickerBadge>
                          {tmpl.featured && <StickerBadge color="coral" size="sm">Featured</StickerBadge>}
                          {tmpl.comingSoon && <StickerBadge color="green" size="sm">Coming Soon</StickerBadge>}
                        </div>
                        <h3 className="font-display text-base font-bold text-ink-dark">{tmpl.title}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-2">{tmpl.description}</p>
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-showcase-purple">
                            Browse Templates <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </ChunkyCard>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — Teaching Guides  (Mint / Teal band)
          ════════════════════════════════════════════════════════════════ */}
      <div
        id="section-guides"
        className="scroll-mt-20 -mx-[50vw] relative left-1/2 right-1/2 w-screen"
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
                          <StickerBadge color="green" size="sm">Coming Soon</StickerBadge>
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
          SECTION 3 — Visual Assets  (Peach / Orange band)
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
                          <StickerBadge color="green" size="sm">Coming Soon</StickerBadge>
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
          SECTION 4 — Video Tutorials  (Vibrant pink / coral band)
          ════════════════════════════════════════════════════════════════ */}
      <div
        id="section-videos"
        className="scroll-mt-20 -mx-[50vw] relative left-1/2 right-1/2 w-screen"
      >
        <div className="relative bg-gradient-to-br from-[#FFE0EC] via-[#FFF0F5] to-[#F0EEFF] py-14 sm:py-16 overflow-hidden">
          {/* Subtle pattern */}
          <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />

          {/* Floating decorative elements */}
          <Sparkles className="pointer-events-none absolute left-[8%] top-[12%] h-8 w-8 text-showcase-pink/25 animate-float-gentle" />
          <GraduationCap className="pointer-events-none absolute right-[10%] top-[18%] h-7 w-7 text-showcase-purple/20 animate-float-playful" style={{ animationDelay: "1s" }} />
          <Play className="pointer-events-none absolute left-[15%] bottom-[10%] h-6 w-6 text-showcase-coral/20 animate-float-gentle" style={{ animationDelay: "2s" }} />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-pink">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                    Video Tutorials
                  </h2>
                  <p className="text-sm text-ink-muted">Step-by-step video guides for every resource</p>
                </div>
              </div>
              <div className="mb-8">
                <StickerBadge color="coral" size="sm">How-To</StickerBadge>
              </div>
            </AnimatedSection>

            {filteredVideos.length === 0 && isSearching ? (
              <p className="py-8 text-center text-sm text-ink-muted">No video tutorials match your search.</p>
            ) : (
              <>
                {/* Featured video — first tutorial */}
                <AnimatedSection delay={0.1} animation="blurIn">
                  <div className="group relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg mb-6">
                    <div className="flex flex-col md:flex-row">
                      {/* Play area */}
                      <div className="relative flex-1 min-h-[200px] md:min-h-[260px] flex items-center justify-center bg-gradient-to-br from-[#FFD6E8] via-[#F0EEFF] to-[#E0F4FF]">
                        <div className="absolute inset-0 pattern-grid opacity-20" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-3 border-showcase-navy/20 bg-white shadow-chunky transition-all group-hover:scale-110 group-hover:shadow-chunky-lg">
                          <Play className="h-8 w-8 text-showcase-purple ml-1" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <StickerBadge color="pink" size="sm">Featured</StickerBadge>
                          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                            <Clock className="h-3 w-3" />
                            {videoTutorials[0].duration}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-extrabold text-ink-dark sm:text-2xl leading-tight">
                          {videoTutorials[0].title}
                        </h3>
                        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                          {videoTutorials[0].desc}
                        </p>
                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-showcase-navy/20 bg-showcase-purple/10 px-4 py-2 text-sm font-display font-bold text-showcase-purple transition-all hover:bg-showcase-purple hover:text-white cursor-pointer">
                            <Play className="h-4 w-4" />
                            Watch Tutorial
                          </span>
                          <StickerBadge color="green" size="sm">Coming Soon</StickerBadge>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Tutorial grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVideos.slice(1).map((video, i) => (
                    <AnimatedSection key={video.id} delay={i * 0.06} animation="popIn" spring>
                      <div className="group relative h-full overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky transition-all hover:-translate-y-1.5 hover:shadow-chunky-lg">
                        {/* Thumbnail */}
                        <div className="relative h-32 bg-gradient-to-br from-[#FFD6E8] via-[#F0EEFF] to-[#E0F4FF] flex items-center justify-center">
                          <div className="absolute inset-0 pattern-dots opacity-20" />
                          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-showcase-navy/15 bg-white shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg">
                            <Play className="h-5 w-5 text-showcase-pink ml-0.5" />
                          </div>
                          {/* Duration */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 border border-showcase-navy/10 px-2 py-0.5 text-[10px] font-bold text-ink-dark shadow-sm">
                            <Clock className="h-2.5 w-2.5 text-showcase-pink" />
                            {video.duration}
                          </div>
                          {/* Category */}
                          <div className="absolute top-2 left-2">
                            <span className="rounded-lg bg-white/90 border border-showcase-navy/10 px-2 py-0.5 text-[10px] font-bold text-showcase-purple uppercase tracking-wider shadow-sm">
                              {video.category}
                            </span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-display text-sm font-bold text-ink-dark leading-snug line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-ink-muted leading-relaxed line-clamp-2">
                            {video.desc}
                          </p>
                          <div className="mt-3">
                            <StickerBadge color="green" size="sm">Coming Soon</StickerBadge>
                          </div>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </>
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
