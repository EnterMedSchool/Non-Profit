import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  Stethoscope,
  Brain,
  Download,
  QrCode,
  FileText,
  Presentation,
  Code,
  Gamepad2,
  Eye,
  Share2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import {
  clinicalCases,
  getCaseById,
  difficultyConfig,
  actConfig,
} from "@/data/clinical-cases";
import {
  getCharacterByCaseId,
  rarityConfig,
} from "@/data/disease-characters";
import { routing } from "@/i18n/routing";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import ShareLinkButton from "@/components/shared/ShareLinkButton";
import CaseDetailClient from "./CaseDetailClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface CaseDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return clinicalCases.map((c) => ({ id: c.id }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: CaseDetailPageProps) {
  const { locale, id } = await params;
  const caseData = getCaseById(id);
  if (!caseData) return {};

  const title = `${caseData.title} — Clinical Case for Educators | EnterMedSchool`;
  const description = `Download this ${caseData.difficulty} ${caseData.category} clinical case. ${caseData.patient.briefHistory} Includes PDF flashcards, PowerPoint slides, and QR codes for interactive student play.`;
  const url = `${BASE_URL}/${locale}/resources/clinical-cases/${id}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/clinical-cases/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/clinical-cases/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    keywords: caseData.tags,
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { locale, id } = await params;
  const caseData = getCaseById(id);
  if (!caseData) notFound();

  const character = getCharacterByCaseId(id);
  const diff = difficultyConfig[caseData.difficulty];
  const rarity = character ? rarityConfig[character.rarity] : null;
  const studentUrl = `${BASE_URL}/${locale}/case/${caseData.slug}`;

  // Group scenes by act for the preview
  const scenesByAct = caseData.scenes.reduce(
    (acc, scene) => {
      if (!acc[scene.act]) acc[scene.act] = [];
      acc[scene.act].push(scene);
      return acc;
    },
    {} as Record<string, typeof caseData.scenes>
  );

  return (
    <main id="main-content" className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/resources/clinical-cases`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All Clinical Cases
          </Link>
        </AnimatedSection>

        {/* Hero */}
        <PageHero
          titleHighlight={caseData.title}
          gradient="from-showcase-coral via-showcase-yellow to-showcase-purple"
          annotation={`${diff.label} · ${caseData.category} · ~${caseData.estimatedMinutes} min`}
          annotationColor={diff.color}
          subtitle={caseData.patient.briefHistory}
          floatingIcons={
            <>
              <Stethoscope
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-coral/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Sparkles
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-yellow/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
            </>
          }
        />

        {/* Meta badges */}
        <AnimatedSection delay={0.1} animation="fadeUp">
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <StickerBadge color="coral">{caseData.category}</StickerBadge>
            <span
              className={`inline-flex items-center gap-1 rounded-full ${diff.bgColor} px-3 py-1 text-xs font-semibold ${diff.color}`}
            >
              <Target className="h-3.5 w-3.5" />
              {diff.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint/60 px-3 py-1 text-xs font-semibold text-showcase-teal">
              <Clock className="h-3.5 w-3.5" />
              ~{caseData.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-lavender/60 px-3 py-1 text-xs font-semibold text-showcase-purple">
              <Brain className="h-3.5 w-3.5" />
              {caseData.scenes.length} scenes
            </span>
          </div>
        </AnimatedSection>

        {/* ── Quick-Start Steps ── */}
        <AnimatedSection delay={0.15} animation="fadeUp">
          <div className="mt-10 rounded-2xl border-3 border-showcase-navy/10 bg-white p-6 shadow-chunky-sm">
            <h2 className="font-display text-lg font-bold text-ink-dark mb-5 text-center">
              How to Use This Case
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center rounded-2xl border-2 border-showcase-purple/15 bg-pastel-lavender/20 p-5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-showcase-purple text-xs font-bold text-white">
                  1
                </span>
                <Eye className="h-7 w-7 text-showcase-purple mb-2 mt-1" />
                <h3 className="font-display text-sm font-bold text-ink-dark">
                  Preview it yourself
                </h3>
                <p className="mt-1 text-xs text-ink-muted">
                  Play through the case to see what students will experience
                </p>
                <Link
                  href={`/${locale}/case/${caseData.slug}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/10 px-4 py-2 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20"
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Preview
                </Link>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center rounded-2xl border-2 border-showcase-teal/15 bg-pastel-mint/20 p-5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-showcase-teal text-xs font-bold text-white">
                  2
                </span>
                <Share2 className="h-7 w-7 text-showcase-teal mb-2 mt-1" />
                <h3 className="font-display text-sm font-bold text-ink-dark">
                  Share with your class
                </h3>
                <p className="mt-1 text-xs text-ink-muted">
                  Copy the link, download a QR code, or embed in your LMS
                </p>
                <a
                  href="#share-section"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10 px-4 py-2 text-xs font-bold text-showcase-teal transition-all hover:bg-showcase-teal/20"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Get materials
                </a>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center rounded-2xl border-2 border-showcase-yellow/15 bg-pastel-lemon/20 p-5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-showcase-yellow text-xs font-bold text-white">
                  3
                </span>
                <MessageSquare className="h-7 w-7 text-showcase-yellow mb-2 mt-1" />
                <h3 className="font-display text-sm font-bold text-ink-dark">
                  Debrief after
                </h3>
                <p className="mt-1 text-xs text-ink-muted">
                  Use the teaching guide and answer key for class discussion
                </p>
                <a
                  href="#teaching-guide"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-yellow/30 bg-showcase-yellow/10 px-4 py-2 text-xs font-bold text-showcase-yellow transition-all hover:bg-showcase-yellow/20"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  View guide
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Share with Your Class ── */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <section id="share-section" className="mt-10 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                <Share2 className="h-5 w-5 text-showcase-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Share with Your Class
              </h2>
            </div>

            <div className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* QR Code area */}
                <div className="flex flex-col items-center gap-3 sm:w-48 shrink-0">
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-3 border-showcase-navy/10 bg-pastel-lavender/20">
                    <QrCode className="h-16 w-16 text-showcase-purple/20" />
                  </div>
                  <CaseDetailClient studentUrl={studentUrl} />
                </div>

                {/* Actions */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-ink-muted mb-1.5">Student link</p>
                    <p className="text-xs text-ink-light font-mono break-all rounded-xl bg-gray-50 border-2 border-showcase-navy/8 px-3 py-2.5">
                      {studentUrl}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ShareLinkButton url={studentUrl} label="Copy student link" />
                    <Link
                      href={`/${locale}/case/${caseData.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/5 px-4 py-2 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
                    >
                      <Gamepad2 className="h-3.5 w-3.5" />
                      Preview Student View
                    </Link>
                  </div>

                  <p className="text-[10px] text-ink-light">
                    Students never see the answers — the link takes them directly to the interactive experience.
                  </p>

                  {/* Download options */}
                  <div className="pt-2 border-t border-showcase-navy/8">
                    <p className="text-xs font-bold text-ink-muted mb-2">Download materials</p>
                    <div className="grid grid-cols-2 gap-2">
                      <DownloadCard
                        icon={FileText}
                        title="PDF Flashcard"
                        desc="Case prompt + answer key"
                        color="teal"
                        ready={false}
                      />
                      <DownloadCard
                        icon={Presentation}
                        title="PowerPoint Slide"
                        desc="QR code + case prompt"
                        color="coral"
                        ready={false}
                      />
                      <DownloadCard
                        icon={Code}
                        title="Embed Code"
                        desc="Iframe for your LMS"
                        color="blue"
                        ready={false}
                      />
                      <DownloadCard
                        icon={QrCode}
                        title="QR Code PNG"
                        desc="Print or add to slides"
                        color="purple"
                        ready={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ── About This Case ── */}
        <AnimatedSection delay={0.22} animation="fadeUp">
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                <BookOpen className="h-5 w-5 text-showcase-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                About This Case
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Learning Objectives */}
              <div className="lg:col-span-3 rounded-2xl border-3 border-showcase-navy/10 bg-white p-5">
                <h3 className="text-sm font-bold text-ink-dark mb-3">Learning Objectives</h3>
                <div className="space-y-2">
                  {caseData.learningObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-showcase-teal/10 text-[10px] font-bold text-showcase-teal shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {obj}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Overview card */}
              <div className="lg:col-span-2 rounded-2xl border-3 border-showcase-navy/10 bg-white p-5">
                <h3 className="text-sm font-bold text-ink-dark mb-3">Case Overview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider">Patient</p>
                    <p className="text-ink-muted">{caseData.patient.age}yo {caseData.patient.sex}, {caseData.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider">Chief Complaint</p>
                    <p className="text-ink-muted text-xs italic">&ldquo;{caseData.patient.chiefComplaint}&rdquo;</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-full bg-pastel-lavender/50 px-2.5 py-0.5 text-[10px] font-bold text-showcase-purple">
                      {caseData.scenes.length} scenes
                    </span>
                    <span className="rounded-full bg-pastel-mint/50 px-2.5 py-0.5 text-[10px] font-bold text-showcase-teal">
                      {caseData.startingCp} CP budget
                    </span>
                    <span className="rounded-full bg-pastel-peach/50 px-2.5 py-0.5 text-[10px] font-bold text-showcase-coral">
                      {caseData.ddxPool.length} DDx diseases
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 pt-3 border-t border-showcase-navy/8">
                  <div className="flex flex-wrap gap-1.5">
                    {caseData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-ink-light"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ── Teaching Guide (collapsible) ── */}
        <AnimatedSection delay={0.24} animation="fadeUp">
          <section id="teaching-guide" className="mt-10 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                <Brain className="h-5 w-5 text-showcase-purple" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Teaching Guide
              </h2>
            </div>

            <div className="space-y-3">
              {/* Teaching Notes -- expanded */}
              <CollapsibleSection title="Teaching Notes" defaultOpen>
                <div className="rounded-xl bg-showcase-purple/5 border-2 border-showcase-purple/10 p-4">
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {caseData.teachingNotes}
                  </p>
                </div>
              </CollapsibleSection>

              {/* Answer Key -- collapsed */}
              <CollapsibleSection title="Answer Key" badge="Spoiler">
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-showcase-green/15 bg-showcase-green/5 p-4">
                    <p className="text-xs font-bold text-showcase-green mb-1">Diagnosis</p>
                    <p className="text-sm font-semibold text-ink-dark">{caseData.answerKey.diagnosis}</p>
                  </div>
                  <div className="rounded-xl border-2 border-showcase-navy/8 bg-white p-4">
                    <p className="text-xs font-bold text-ink-muted mb-2">Key Findings</p>
                    <div className="space-y-1">
                      {caseData.answerKey.keyFindings.map((finding, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-green shrink-0" />
                          <p className="text-sm text-ink-muted">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-showcase-navy/8 bg-white p-4">
                    <p className="text-xs font-bold text-ink-muted mb-1">Optimal Clinical Points</p>
                    <p className="text-sm text-ink-dark">
                      {caseData.answerKey.optimalCpSpent} CP (budget: {caseData.startingCp} CP)
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Case Flow -- collapsed */}
              <CollapsibleSection title={`Case Flow (${caseData.scenes.length} scenes)`}>
                <div className="space-y-5">
                  {(["encounter", "investigation", "twist", "resolution"] as const).map(
                    (act) => {
                      const scenes = scenesByAct[act];
                      if (!scenes || scenes.length === 0) return null;
                      const config = actConfig[act];

                      return (
                        <div key={act}>
                          <div
                            className={`mb-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${config.gradient} px-3 py-1`}
                          >
                            <span className="text-xs font-bold text-white">
                              {config.label}: {config.subtitle}
                            </span>
                          </div>
                          <div className="space-y-1.5 ml-4 border-l-2 border-showcase-navy/10 pl-4">
                            {scenes.map((scene) => (
                              <div
                                key={scene.id}
                                className="rounded-lg border border-showcase-navy/8 bg-white px-4 py-2.5"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-ink-light uppercase">
                                    {scene.type}
                                  </span>
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-ink-light">
                                    {scene.interaction.mode}
                                  </span>
                                </div>
                                <p className="text-xs text-ink-muted line-clamp-2">
                                  {scene.narration.slice(0, 150)}
                                  {scene.narration.length > 150 ? "..." : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CollapsibleSection>
            </div>
          </section>
        </AnimatedSection>

        {/* ── Collectible Character (compact) ── */}
        {character && rarity && (
          <AnimatedSection delay={0.26} animation="fadeUp">
            <section className="mt-10">
              <div className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-pastel-lavender/30 border-2 border-showcase-navy/5 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-showcase-purple/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-showcase-yellow uppercase tracking-wider">Unlockable Character</p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <h3 className="font-display text-base font-bold text-ink-dark">
                        {character.name}
                      </h3>
                      <span
                        className={`rounded-full ${rarity.bgColor} border ${rarity.borderColor} px-2 py-0.5 text-[9px] font-bold ${rarity.color}`}
                      >
                        {rarity.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">{character.subtitle}</p>
                  </div>
                  <p className="text-[10px] text-ink-light shrink-0 hidden sm:block">
                    {character.items.length} items
                  </p>
                </div>
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* ── Share this page ── */}
        <AnimatedSection delay={0.28} animation="fadeUp">
          <div className="mt-8">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/resources/clinical-cases/${id}`}
              label="Share this case with colleagues"
            />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}

// ─── Download Card (static Tailwind classes) ─────────────────────────────────

const downloadColorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  teal: {
    border: "border-showcase-teal/15",
    bg: "bg-white",
    text: "text-showcase-teal",
    iconBg: "bg-showcase-teal/10",
  },
  coral: {
    border: "border-showcase-coral/15",
    bg: "bg-white",
    text: "text-showcase-coral",
    iconBg: "bg-showcase-coral/10",
  },
  blue: {
    border: "border-showcase-blue/15",
    bg: "bg-white",
    text: "text-showcase-blue",
    iconBg: "bg-showcase-blue/10",
  },
  purple: {
    border: "border-showcase-purple/15",
    bg: "bg-white",
    text: "text-showcase-purple",
    iconBg: "bg-showcase-purple/10",
  },
};

function DownloadCard({
  icon: Icon,
  title,
  desc,
  color,
  ready,
}: {
  icon: typeof FileText;
  title: string;
  desc: string;
  color: string;
  ready: boolean;
}) {
  const colors = downloadColorMap[color] || downloadColorMap.purple;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-3 transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-ink-dark">{title}</p>
          <p className="text-[10px] text-ink-light">{desc}</p>
          {!ready && (
            <p className="text-[9px] text-ink-light/60 mt-1 italic">Coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen || undefined}
      className="group rounded-2xl border-3 border-showcase-navy/10 bg-white overflow-hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-ink-dark select-none hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden list-none">
        <div className="flex items-center gap-2">
          {title}
          {badge && (
            <span className="rounded-full bg-showcase-coral/10 px-2 py-0.5 text-[9px] font-bold text-showcase-coral">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-ink-light transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">
        {children}
      </div>
    </details>
  );
}
