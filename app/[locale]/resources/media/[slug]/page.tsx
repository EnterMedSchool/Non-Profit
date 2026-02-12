import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Lightbulb,
  Tag,
  Calendar,
  Scale,
  FileImage,
  ArrowRight,
} from "lucide-react";
import {
  mediaAssets,
  getMediaAssetBySlug,
  getRelatedAssets,
  mediaAssetCategories,
} from "@/data/media-assets";
import { getMediaAssetJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import MediaAssetDownload from "@/components/resources/MediaAssetDownload";
import MediaAssetCard from "@/components/resources/MediaAssetCard";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface MediaAssetDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return mediaAssets.map((a) => ({ slug: a.slug }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: MediaAssetDetailPageProps) {
  const { locale, slug } = await params;
  const asset = getMediaAssetBySlug(slug);
  if (!asset) return {};

  const url = `${BASE_URL}/${locale}/resources/media/${slug}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/${slug}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/${slug}`;

  return {
    title: asset.seoTitle,
    description: asset.seoDescription,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: asset.seoTitle,
      description: asset.seoDescription,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: [
        {
          url: `${BASE_URL}${asset.imagePath}`,
          width: asset.width,
          height: asset.height,
          alt: `${asset.name} — Free medical illustration by EnterMedSchool.org`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: asset.seoTitle,
      description: asset.seoDescription,
    },
    keywords: asset.seoKeywords,
  };
}

/* ── Badge colour map ───────────────────────────────────────────── */

const categoryBadgeColor: Record<string, "coral" | "teal" | "purple" | "pink" | "green" | "orange"> = {
  anatomy: "coral",
  cells: "teal",
  molecules: "purple",
  organs: "pink",
  equipment: "orange",
  diagrams: "green",
};

/* ── Page ────────────────────────────────────────────────────────── */

export default async function MediaAssetDetailPage({
  params,
}: MediaAssetDetailPageProps) {
  const { locale, slug } = await params;
  const asset = getMediaAssetBySlug(slug);
  if (!asset) notFound();

  const relatedAssets = getRelatedAssets(asset);
  const jsonLdSchemas = getMediaAssetJsonLd(asset, locale);

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Breadcrumb / Back link ── */}
        <AnimatedSection animation="fadeUp" delay={0}>
          <Link
            href={`/${locale}/resources/media`}
            className="inline-flex items-center gap-2 text-sm font-bold text-showcase-purple transition-all hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Media Assets
          </Link>
        </AnimatedSection>

        {/* ── Main content grid ── */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Left column: Image + Details ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image preview */}
            <AnimatedSection animation="scaleIn" delay={0.05}>
              <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-pastel-cream shadow-chunky-lg">
                <div className="relative aspect-square w-full sm:aspect-[4/3]">
                  <Image
                    src={asset.imagePath}
                    alt={`${asset.name} — Free medical illustration for education`}
                    fill
                    className="object-contain p-8 sm:p-12"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
                {/* Format badge */}
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-lg border-2 border-showcase-navy bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-muted shadow-[2px_2px_0_#1a1a2e]">
                  <FileImage className="h-3.5 w-3.5" />
                  {asset.format.toUpperCase()}
                </span>
              </div>
            </AnimatedSection>

            {/* Title + badges */}
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <div className="flex flex-wrap items-center gap-2">
                <StickerBadge
                  color={categoryBadgeColor[asset.category] ?? "purple"}
                  size="md"
                >
                  {asset.category}
                </StickerBadge>
                <StickerBadge color="teal" size="sm">
                  {asset.license}
                </StickerBadge>
                <StickerBadge color="green" size="sm">
                  Free
                </StickerBadge>
              </div>
              <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
                {asset.name}
              </h1>
            </AnimatedSection>

            {/* Description */}
            <AnimatedSection animation="fadeUp" delay={0.15}>
              <div className="prose prose-sm max-w-none text-ink-muted leading-relaxed">
                <p>{asset.description}</p>
              </div>
            </AnimatedSection>

            {/* Tags */}
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-showcase-purple" />
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-semibold text-showcase-purple"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Usage tips for professors */}
            <AnimatedSection animation="fadeUp" delay={0.25}>
              <div className="rounded-2xl border-3 border-showcase-yellow/30 bg-showcase-yellow/5 p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-showcase-yellow to-showcase-orange shadow-md">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    How to Use This Asset
                  </h2>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  Tips for professors and educators on integrating this illustration into your teaching materials:
                </p>
                <ul className="mt-4 space-y-3">
                  {asset.usageTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-ink-muted leading-relaxed"
                    >
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-showcase-yellow/30 text-[10px] font-bold text-showcase-orange">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Meta info */}
            <AnimatedSection animation="fadeUp" delay={0.3}>
              <div className="flex flex-wrap gap-4 text-xs text-ink-light">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Published: {asset.datePublished}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  License: {asset.license}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileImage className="h-3.5 w-3.5" />
                  {asset.width} &times; {asset.height}px &middot;{" "}
                  {asset.format.toUpperCase()}
                </span>
              </div>
            </AnimatedSection>
          </div>

          {/* ── Right column: Download + Related ── */}
          <div className="space-y-8">
            {/* Download panel */}
            <AnimatedSection animation="popIn" delay={0.1}>
              <div className="sticky top-24 space-y-6 rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky-lg">
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  Download Asset
                </h2>
                <MediaAssetDownload asset={asset} />
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* ── Related Assets ── */}
        {relatedAssets.length > 0 && (
          <AnimatedSection animation="fadeUp" delay={0.35}>
            <div className="mt-16">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-ink-dark">
                  Related Assets
                </h2>
                <Link
                  href={`/${locale}/resources/media`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple transition-all hover:gap-2.5"
                >
                  Browse all
                  <ArrowRight className="h-4 w-4 transition-transform" />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedAssets.map((related, i) => (
                  <AnimatedSection
                    key={related.id}
                    delay={0.4 + i * 0.08}
                    animation="popIn"
                    spring
                  >
                    <MediaAssetCard asset={related} />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
