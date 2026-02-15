import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Layers,
  Clock,
  Eye,
  Download,
  Code,
  FileCode,
  Shield,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Volume2,
} from "lucide-react";
import {
  visualLessons,
  getVisualLessonById,
  categoryColors,
  factCategoryConfig,
  type FactCategory,
} from "@/data/visuals";
import { getVisualLessonJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ShareLinkButton from "@/components/shared/ShareLinkButton";
import StickerBadge from "@/components/shared/StickerBadge";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface VisualDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return visualLessons.map((l) => ({ id: l.id }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: VisualDetailPageProps) {
  const { locale, id } = await params;
  const lesson = getVisualLessonById(id);
  if (!lesson) return {};

  const title = `${lesson.title} — Visual Medical Lesson`;
  const description = `Learn ${lesson.title.toLowerCase()} with ${lesson.layers.length} layered visual diagrams, audio narrations, and ${lesson.keyFacts.length} key medical facts. Free for educators and students.`;
  const url = `${BASE_URL}/${locale}/resources/visuals/${id}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/visuals/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/visuals/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "EnterMedSchool.org",
      publishedTime: "2025-06-01T00:00:00Z",
      modifiedTime: "2025-06-01T00:00:00Z",
      authors: [lesson.creator?.name || "EnterMedSchool.org"],
      section: lesson.category,
      tags: lesson.tags,
      images: [{ url: ogImagePath("resources", "visuals", id), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    keywords: lesson.tags,
  };
}

/* ── Fact border colours ────────────────────────────────────────── */

const factBorderColors: Record<string, string> = {
  pathology: "border-s-red-400",
  drug: "border-s-purple-400",
  anatomy: "border-s-rose-400",
  symptom: "border-s-amber-400",
  diagnostic: "border-s-blue-400",
  treatment: "border-s-green-400",
  mnemonic: "border-s-yellow-400",
};

/* ── Accent map per category ────────────────────────────────────── */

const gradientMap: Record<string, { from: string; to: string }> = {
  GI: { from: "from-showcase-green", to: "to-showcase-teal" },
  Pharmacology: { from: "from-showcase-purple", to: "to-showcase-blue" },
  Hematology: { from: "from-showcase-coral", to: "to-showcase-pink" },
};

/* ── Page ────────────────────────────────────────────────────────── */

export default async function VisualLessonDetailPage({ params }: VisualDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("resources.visuals.detail");
  const lesson = getVisualLessonById(id);
  if (!lesson) notFound();

  const colors = categoryColors[lesson.category] || categoryColors.GI;
  const grad = gradientMap[lesson.category] || gradientMap.GI;

  const jsonLdItems = getVisualLessonJsonLd(lesson, locale);

  // Group facts by category for organised display
  const factsByCategory = lesson.keyFacts.reduce(
    (acc, fact) => {
      if (!acc[fact.category]) acc[fact.category] = [];
      acc[fact.category].push(fact);
      return acc;
    },
    {} as Record<FactCategory, typeof lesson.keyFacts>,
  );

  // Related lessons (same category, exclude current)
  const relatedLessons = visualLessons.filter(
    (l) => l.category === lesson.category && l.id !== lesson.id,
  );

  return (
    <main id="main-content" className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      {jsonLdItems.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/resources/visuals`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToAll")}
          </Link>
        </AnimatedSection>

        {/* Hero */}
        <PageHero
          titleHighlight={lesson.title}
          gradient={`${grad.from} via-showcase-teal ${grad.to}`}
          annotation={`${lesson.layers.length} layers · ${lesson.duration}`}
          annotationColor={colors.text}
          subtitle={lesson.description}
          floatingIcons={
            <>
              <BookOpen
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Sparkles
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
            </>
          }
        />

        {/* Category + meta badges */}
        <AnimatedSection delay={0.1} animation="fadeUp">
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <StickerBadge
              color={
                lesson.category === "GI"
                  ? "green"
                  : lesson.category === "Pharmacology"
                    ? "purple"
                    : "coral"
              }
            >
              {lesson.category}
            </StickerBadge>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-lavender/60 px-3 py-1 text-xs font-semibold text-showcase-purple">
              <Layers className="h-3.5 w-3.5" /> {t("layersCount", { count: lesson.layers.length })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint/60 px-3 py-1 text-xs font-semibold text-showcase-teal">
              <Clock className="h-3.5 w-3.5" /> {lesson.duration}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-peach/60 px-3 py-1 text-xs font-semibold text-showcase-coral">
              <Eye className="h-3.5 w-3.5" /> {t("keyFactsCount", { count: lesson.keyFacts.length })}
            </span>
          </div>
        </AnimatedSection>

        {/* Thumbnail / preview */}
        <AnimatedSection delay={0.15} animation="blurIn">
          <div className="mt-10 overflow-hidden rounded-2xl border-3 border-showcase-navy shadow-chunky-lg">
            <div className="relative aspect-video w-full bg-pastel-cream">
              <Image
                src={lesson.thumbnailPath}
                alt={`${lesson.title} visual lesson preview`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>
          </div>
        </AnimatedSection>

        {/* ── Key Facts Section ─────────────────────────────────── */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                <Sparkles className="h-5 w-5 text-showcase-purple" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Key Medical Facts
              </h2>
            </div>

            <div className="space-y-8">
              {Object.entries(factsByCategory).map(([category, facts]) => {
                const cfg = factCategoryConfig[category as FactCategory];
                const borderColor =
                  factBorderColors[category] || "border-l-gray-300";
                return (
                  <div key={category}>
                    <h3 className="mb-3 font-display text-base font-bold text-ink-dark">
                      {cfg.emoji} {cfg.label}
                    </h3>
                    <div className="space-y-2">
                      {facts.map((fact, i) => (
                        <div
                          key={`${fact.term}-${i}`}
                          className={`rounded-xl border-2 border-showcase-navy/8 bg-white p-4 border-s-4 ${borderColor}`}
                        >
                          <p className="text-sm font-semibold text-ink-dark">
                            {fact.term}
                          </p>
                          <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                            {fact.description}
                          </p>
                          {fact.visualCue && (
                            <p className="mt-2 inline-flex items-start gap-1 rounded-lg bg-showcase-purple/8 px-2.5 py-1 text-xs text-showcase-purple">
                              <Eye className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {fact.visualCue}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* ── Layer Assets ──────────────────────────────────────── */}
        <AnimatedSection delay={0.25} animation="fadeUp">
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                <Download className="h-5 w-5 text-showcase-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                {t("downloadableAssets")}
              </h2>
            </div>

            <div className="space-y-2">
              {lesson.layers.map((layer) => (
                <div
                  key={layer.index}
                  className="flex items-center justify-between gap-3 rounded-xl border-3 border-showcase-navy/10 bg-white p-3 transition-all hover:border-showcase-navy/20 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${grad.from} ${grad.to} text-xs font-bold text-white shadow-sm`}
                    >
                      {layer.index}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-dark truncate">
                        {layer.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={layer.imagePath}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border-2 border-showcase-green/20 bg-showcase-green/5 px-2.5 py-1.5 text-xs font-bold text-showcase-green hover:bg-showcase-green hover:text-white transition-all"
                      title={t("downloadPng")}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">PNG</span>
                    </a>
                    <a
                      href={layer.audioPath}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border-2 border-showcase-purple/20 bg-showcase-purple/5 px-2.5 py-1.5 text-xs font-bold text-showcase-purple hover:bg-showcase-purple hover:text-white transition-all"
                      title={t("downloadMp3")}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">MP3</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ── Tags (SEO) ───────────────────────────────────────── */}
        <AnimatedSection delay={0.28} animation="fadeUp">
          <div className="mt-12 flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border-2 border-showcase-navy/10 bg-white px-3 py-1 text-xs font-semibold text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Share + Attribution ───────────────────────────────── */}
        <AnimatedSection delay={0.3} animation="fadeUp">
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/resources/visuals/${id}`}
              label={t("shareThisLesson")}
            />
          </div>
          <div className="mt-4 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
            <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
            <span>
              {t("assetsFreeNotice")}{" "}
              <Link
                href={`/${locale}/license`}
                className="font-semibold text-showcase-purple hover:underline"
              >
                {t("attributionRequired")}
              </Link>
              .
            </span>
          </div>
        </AnimatedSection>

        {/* ── Embed section ─────────────────────────────────────── */}
        <AnimatedSection delay={0.32} animation="fadeUp">
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-blue/20 bg-pastel-sky">
                <Code className="h-5 w-5 text-showcase-blue" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark">
                Embed on Your Website
              </h2>
            </div>
            <p className="text-sm text-ink-muted mb-4">
              Add this interactive lesson to your website, LMS, or blog with a
              simple iframe.
            </p>
            <div className="rounded-xl border-3 border-showcase-navy/10 bg-gray-50 p-4 font-mono text-xs text-ink-muted overflow-x-auto">
              {`<iframe src="${BASE_URL}/embed/visuals/${lesson.embedId}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`}
            </div>
            <div className="mt-4">
              <Link
                href={`/${locale}/resources/visuals/${lesson.id}/embed-code`}
                className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none"
              >
                <FileCode className="h-4 w-4" />
                Get the Code
              </Link>
            </div>
          </section>
        </AnimatedSection>

        {/* ── Related lessons ──────────────────────────────────── */}
        {relatedLessons.length > 0 && (
          <AnimatedSection delay={0.35} animation="fadeUp">
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold text-ink-dark mb-6">
                {t("moreLessons", { category: lesson.category })}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {relatedLessons.map((related) => (
                  <Link
                    key={related.id}
                    href={`/${locale}/resources/visuals/${related.id}`}
                    className="group flex gap-4 rounded-2xl border-3 border-showcase-navy/10 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-chunky cursor-pointer"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-pastel-cream">
                      <Image
                        src={related.thumbnailPath}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-ink-dark group-hover:text-showcase-purple">
                        {related.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                        {related.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-ink-light">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {t("layersCount", { count: related.layers.length })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {related.duration}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
