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
  const studentUrl = `${BASE_URL}/${locale}/case/${id}`;

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

        {/* Student Play Link */}
        <AnimatedSection delay={0.15} animation="fadeUp">
          <div className="mt-8 rounded-2xl border-3 border-showcase-purple/20 bg-gradient-to-r from-showcase-purple/5 to-showcase-teal/5 p-6 text-center">
            <Gamepad2 className="mx-auto h-8 w-8 text-showcase-purple/50 mb-3" />
            <h3 className="font-display text-lg font-bold text-ink-dark">
              Interactive Student Experience
            </h3>
            <p className="mt-1 text-sm text-ink-muted max-w-md mx-auto">
              Students scan a QR code or visit the link below to play this case
              interactively. They never see the answers.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${locale}/case/${id}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-purple bg-showcase-purple px-6 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
              >
                <Gamepad2 className="h-4 w-4" />
                Preview Student View
              </Link>
              <ShareLinkButton url={studentUrl} label="Copy student link" />
            </div>
            <p className="mt-3 text-[10px] text-ink-light font-mono break-all">
              {studentUrl}
            </p>
          </div>
        </AnimatedSection>

        {/* Learning Objectives */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                <BookOpen className="h-5 w-5 text-showcase-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Learning Objectives
              </h2>
            </div>
            <div className="space-y-2">
              {caseData.learningObjectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border-2 border-showcase-navy/8 bg-white p-4"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-showcase-teal/10 text-xs font-bold text-showcase-teal shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {obj}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Teaching Notes (professor only) */}
        <AnimatedSection delay={0.22} animation="fadeUp">
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                <Brain className="h-5 w-5 text-showcase-purple" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Teaching Notes
              </h2>
            </div>
            <div className="rounded-xl border-2 border-showcase-purple/10 bg-showcase-purple/5 p-5">
              <p className="text-sm text-ink-muted leading-relaxed">
                {caseData.teachingNotes}
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* Answer Key */}
        <AnimatedSection delay={0.24} animation="fadeUp">
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-green/20 bg-pastel-mint">
                <Target className="h-5 w-5 text-showcase-green" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Answer Key
              </h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-showcase-green/15 bg-white p-4">
                <p className="text-xs font-bold text-showcase-green mb-1">
                  Diagnosis
                </p>
                <p className="text-sm font-semibold text-ink-dark">
                  {caseData.answerKey.diagnosis}
                </p>
              </div>
              <div className="rounded-xl border-2 border-showcase-navy/8 bg-white p-4">
                <p className="text-xs font-bold text-ink-muted mb-2">
                  Key Findings
                </p>
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
                <p className="text-xs font-bold text-ink-muted mb-1">
                  Optimal Clinical Points
                </p>
                <p className="text-sm text-ink-dark">
                  {caseData.answerKey.optimalCpSpent} CP (budget:{" "}
                  {caseData.startingCp} CP)
                </p>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Case Flow Preview */}
        <AnimatedSection delay={0.26} animation="fadeUp">
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-coral/20 bg-pastel-peach">
                <Stethoscope className="h-5 w-5 text-showcase-coral" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Case Flow ({caseData.scenes.length} scenes)
              </h2>
            </div>
            <div className="space-y-6">
              {(["encounter", "investigation", "twist", "resolution"] as const).map(
                (act) => {
                  const scenes = scenesByAct[act];
                  if (!scenes || scenes.length === 0) return null;
                  const config = actConfig[act];

                  return (
                    <div key={act}>
                      <div
                        className={`mb-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${config.gradient} px-3 py-1`}
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
          </section>
        </AnimatedSection>

        {/* Character Preview */}
        {character && rarity && (
          <AnimatedSection delay={0.28} animation="fadeUp">
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-yellow/20 bg-pastel-lemon">
                  <Sparkles className="h-5 w-5 text-showcase-yellow" />
                </div>
                <h2 className="font-display text-2xl font-bold text-ink-dark">
                  Unlockable Character
                </h2>
              </div>
              <div
                className={`rounded-2xl border-3 ${rarity.borderColor} bg-white p-6`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {/* Character thumbnail */}
                  <div className="h-32 w-32 shrink-0 rounded-xl bg-pastel-lavender/30 border-2 border-showcase-navy/5 flex items-center justify-center mx-auto sm:mx-0">
                    <Sparkles className="h-10 w-10 text-showcase-purple/20" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl font-bold text-ink-dark">
                        {character.name}
                      </h3>
                      <span
                        className={`rounded-full ${rarity.bgColor} border ${rarity.borderColor} px-2.5 py-0.5 text-[10px] font-bold ${rarity.color}`}
                      >
                        {rarity.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted">
                      {character.subtitle}
                    </p>
                    <p className="mt-2 text-xs text-ink-light italic">
                      &ldquo;{character.flavorText}&rdquo;
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-ink-muted">
                        Character Items ({character.items.length})
                      </p>
                      {character.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 rounded-lg bg-pastel-lavender/30 px-3 py-2"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-showcase-yellow shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-ink-dark">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {item.medicalFact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* Download Panel */}
        <AnimatedSection delay={0.3} animation="fadeUp">
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-blue/20 bg-pastel-sky">
                <Download className="h-5 w-5 text-showcase-blue" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Download for Your Classroom
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: QrCode,
                  title: "QR Code",
                  desc: "PNG image with the QR code linking to the interactive case. Add to slides or print.",
                  color: "showcase-purple",
                  action: "Download QR",
                  ready: false,
                },
                {
                  icon: FileText,
                  title: "PDF Flashcard",
                  desc: "Beautiful flashcard with case prompt on front, answer key on back. Print-ready.",
                  color: "showcase-teal",
                  action: "Download PDF",
                  ready: false,
                },
                {
                  icon: Presentation,
                  title: "PowerPoint Slide",
                  desc: "Single slide with case prompt, character thumbnail, and QR code. Ready to insert.",
                  color: "showcase-coral",
                  action: "Download PPTX",
                  ready: false,
                },
                {
                  icon: Code,
                  title: "Embed Code",
                  desc: "Iframe snippet to embed the interactive case on your LMS or website.",
                  color: "showcase-blue",
                  action: "Copy Code",
                  ready: false,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`rounded-2xl border-3 border-${item.color}/15 bg-white p-5 transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}/10 shrink-0`}
                      >
                        <Icon className={`h-5 w-5 text-${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-display text-sm font-bold text-ink-dark">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                          {item.desc}
                        </p>
                        <button
                          disabled={!item.ready}
                          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-${item.color}/30 bg-${item.color}/5 px-3 py-1.5 text-xs font-bold text-${item.color} transition-all hover:bg-${item.color}/10 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <Download className="h-3 w-3" />
                          {item.ready ? item.action : "Coming soon"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* Tags */}
        <AnimatedSection delay={0.32} animation="fadeUp">
          <div className="mt-10 flex flex-wrap gap-2">
            {caseData.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border-2 border-showcase-navy/10 bg-white px-3 py-1 text-xs font-semibold text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </AnimatedSection>

        {/* Share */}
        <AnimatedSection delay={0.34} animation="fadeUp">
          <div className="mt-8">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/resources/clinical-cases/${id}`}
              label="Share this case"
            />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
