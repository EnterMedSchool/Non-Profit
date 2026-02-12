import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, Download } from "lucide-react";
import {
  mediaAssetCollections,
  getCollectionBySlug,
  getCollectionAssets,
} from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaAssetCard from "@/components/resources/MediaAssetCard";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; collectionSlug: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return mediaAssetCollections.map((c) => ({ collectionSlug: c.slug }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, collectionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) return {};

  const url = `${BASE_URL}/${locale}/resources/media/collections/${collectionSlug}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/collections/${collectionSlug}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/collections/${collectionSlug}`;

  return {
    title: collection.seoTitle,
    description: collection.seoDescription,
    alternates: { canonical: url, languages },
    openGraph: {
      title: collection.seoTitle,
      description: collection.seoDescription,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: collection.seoTitle,
      description: collection.seoDescription,
    },
    keywords: collection.seoKeywords,
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CollectionDetailPage({ params }: Props) {
  const { locale, collectionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) notFound();

  const assets = getCollectionAssets(collection);
  const otherCollections = mediaAssetCollections.filter(
    (c) => c.slug !== collectionSlug,
  );

  const collectionJsonLd = getCollectionPageJsonLd(
    collection.seoTitle,
    collection.seoDescription,
    `${BASE_URL}/${locale}/resources/media/collections/${collectionSlug}`,
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
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-orange/20 bg-showcase-orange/5 px-3 py-1 text-xs font-bold text-showcase-orange">
              <Package className="h-3 w-3" />
              Collection
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl lg:text-5xl">
              {collection.name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted leading-relaxed sm:text-lg">
              {collection.seoDescription}
            </p>
          </div>
        </AnimatedSection>

        {/* ── Editorial description ── */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border-2 border-showcase-orange/20 bg-showcase-orange/5 p-6">
            <div className="prose prose-sm max-w-none text-ink-muted leading-relaxed">
              <p>{collection.description}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Asset count ── */}
        <AnimatedSection animation="fadeUp" delay={0.15}>
          <p className="mt-8 text-center text-sm text-ink-muted">
            <span className="font-bold text-showcase-purple">{assets.length}</span>{" "}
            {assets.length === 1 ? "illustration" : "illustrations"} in this collection
          </p>
        </AnimatedSection>

        {/* ── Asset Grid ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, i) => (
            <AnimatedSection key={asset.id} delay={0.2 + i * 0.08} animation="popIn" spring>
              <MediaAssetCard asset={asset} />
            </AnimatedSection>
          ))}
        </div>

        {/* ── Other collections ── */}
        {otherCollections.length > 0 && (
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <div className="mt-16 border-t-2 border-ink-light/10 pt-10">
              <h2 className="font-display text-xl font-bold text-ink-dark">
                Other Collections
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherCollections.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${locale}/resources/media/collections/${c.slug}`}
                    className="flex items-center justify-between rounded-xl border-2 border-transparent px-4 py-3 transition-all hover:border-showcase-orange/15 hover:bg-showcase-orange/5"
                  >
                    <div>
                      <span className="font-display text-sm font-bold text-ink-dark">
                        {c.name}
                      </span>
                      <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">
                        {c.seoDescription}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-light" />
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ── Back to all ── */}
        <AnimatedSection animation="fadeUp" delay={0.35}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/resources/media/collections`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-orange transition-all hover:gap-2.5"
            >
              All collections
              <ArrowRight className="h-4 w-4" />
            </Link>
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
