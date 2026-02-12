import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import {
  getAllTags,
  getTagSlug,
  getTagFromSlug,
  getMediaAssetsByTag,
  getTagCounts,
} from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaAssetCard from "@/components/resources/MediaAssetCard";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; tag: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: getTagSlug(tag) }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, tag: tagSlug } = await params;
  const tagLabel = getTagFromSlug(tagSlug);
  if (!tagLabel) return {};

  const titleCased = tagLabel.replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${titleCased} Medical Illustrations — Free Downloads for Educators`;
  const description = `Browse and download free ${tagLabel} illustrations for medical education. High-quality SVGs and PNGs for lectures, slides, and study materials — all CC BY 4.0 licensed.`;
  const url = `${BASE_URL}/${locale}/resources/media/tag/${tagSlug}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/tag/${tagSlug}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/tag/${tagSlug}`;

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
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    keywords: [
      `${tagLabel} diagrams`,
      `free ${tagLabel} illustrations`,
      `${tagLabel} medical images`,
      `${tagLabel} teaching materials`,
    ],
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function MediaTagPage({ params }: Props) {
  const { locale, tag: tagSlug } = await params;
  const tagLabel = getTagFromSlug(tagSlug);
  if (!tagLabel) notFound();

  const assets = getMediaAssetsByTag(tagLabel);
  const titleCased = tagLabel.replace(/\b\w/g, (c) => c.toUpperCase());

  // Related tags: tags from the same assets, excluding the current one
  const relatedTagSet = new Set<string>();
  for (const asset of assets) {
    for (const t of asset.tags) {
      if (t !== tagLabel) relatedTagSet.add(t);
    }
  }
  const relatedTags = Array.from(relatedTagSet).sort();

  // Tag counts for "popular tags" section
  const tagCounts = getTagCounts();

  const collectionJsonLd = getCollectionPageJsonLd(
    `${titleCased} Medical Illustrations`,
    `Free ${tagLabel} illustrations for medical education.`,
    `${BASE_URL}/${locale}/resources/media/tag/${tagSlug}`,
    locale,
  );

  const itemListJsonLd = getItemListJsonLd(
    assets.map((asset, i) => ({
      name: asset.name,
      url: `${BASE_URL}/${locale}/resources/media/${asset.slug}`,
      position: i + 1,
    })),
  );

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <AnimatedSection animation="fadeUp" delay={0}>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple">
              <Tag className="h-3 w-3" />
              Tag
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl lg:text-5xl">
              {titleCased}{" "}
              <span className="bg-gradient-to-r from-showcase-purple via-showcase-blue to-showcase-teal bg-clip-text text-transparent">
                Illustrations
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted leading-relaxed sm:text-lg">
              Browse and download free {tagLabel} illustrations for medical education.
              High-quality SVGs and PNGs for lectures, slides, and study materials.
            </p>
          </div>
        </AnimatedSection>

        {/* ── Asset count ── */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <p className="mt-8 text-center text-sm text-ink-muted">
            <span className="font-bold text-showcase-purple">{assets.length}</span>{" "}
            {assets.length === 1 ? "illustration" : "illustrations"} tagged &ldquo;{tagLabel}&rdquo;
          </p>
        </AnimatedSection>

        {/* ── Asset Grid ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, i) => (
            <AnimatedSection key={asset.id} delay={0.15 + i * 0.08} animation="popIn" spring>
              <MediaAssetCard asset={asset} />
            </AnimatedSection>
          ))}
        </div>

        {/* ── Empty state ── */}
        {assets.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <p className="font-handwritten text-2xl text-ink-muted">
                No illustrations with this tag yet
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                We&apos;re working on adding more assets. Check back soon or browse other tags.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* ── Related tags ── */}
        {relatedTags.length > 0 && (
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <div className="mt-16 border-t-2 border-ink-light/10 pt-10">
              <h2 className="font-display text-xl font-bold text-ink-dark">
                Related Tags
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedTags.map((rt) => (
                  <Link
                    key={rt}
                    href={`/${locale}/resources/media/tag/${getTagSlug(rt)}`}
                    className="rounded-full border border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-semibold text-showcase-purple transition-all hover:bg-showcase-purple/10 hover:shadow-sm"
                  >
                    {rt}
                    {tagCounts.get(rt) && (
                      <span className="ml-1 text-showcase-purple/50">
                        ({tagCounts.get(rt)})
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ── Back to all ── */}
        <AnimatedSection animation="fadeUp" delay={0.35}>
          <div className="mt-8">
            <Link
              href={`/${locale}/resources/media`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple transition-all hover:gap-2.5"
            >
              Browse all media assets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
