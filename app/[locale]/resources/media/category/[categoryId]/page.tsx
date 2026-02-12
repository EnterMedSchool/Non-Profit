import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  mediaAssetCategories,
  getMediaAssetsByCategory,
  getCategoryById,
} from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaAssetCard from "@/components/resources/MediaAssetCard";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; categoryId: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return mediaAssetCategories.map((c) => ({ categoryId: c.id }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) return {};

  const url = `${BASE_URL}/${locale}/resources/media/category/${categoryId}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/category/${categoryId}`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/category/${categoryId}`;

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: url, languages },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: category.seoTitle,
      description: category.seoDescription,
    },
    keywords: category.seoKeywords,
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function MediaCategoryPage({ params }: Props) {
  const { locale, categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const assets = getMediaAssetsByCategory(categoryId);
  const otherCategories = mediaAssetCategories.filter((c) => c.id !== categoryId);

  const collectionJsonLd = getCollectionPageJsonLd(
    category.seoTitle,
    category.seoDescription,
    `${BASE_URL}/${locale}/resources/media/category/${categoryId}`,
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
              Category
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl lg:text-5xl">
              {category.name}{" "}
              <span className="bg-gradient-to-r from-showcase-yellow via-showcase-orange to-showcase-coral bg-clip-text text-transparent">
                Illustrations
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted leading-relaxed sm:text-lg">
              {category.seoDescription}
            </p>
          </div>
        </AnimatedSection>

        {/* ── Asset count ── */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <p className="mt-8 text-center text-sm text-ink-muted">
            <span className="font-bold text-showcase-purple">{assets.length}</span>{" "}
            {assets.length === 1 ? "illustration" : "illustrations"} in this category
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
                No illustrations in this category yet
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                We&apos;re working on adding more assets. Check back soon or browse other categories.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* ── Browse other categories ── */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="mt-16 border-t-2 border-ink-light/10 pt-10">
            <h2 className="font-display text-xl font-bold text-ink-dark">
              Browse Other Categories
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/resources/media/category/${cat.id}`}
                  className="rounded-full border-2 border-showcase-navy/15 bg-white px-4 py-1.5 text-sm font-bold text-ink-muted transition-all hover:border-showcase-purple/30 hover:bg-showcase-purple/5 hover:text-showcase-purple"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/resources/media`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple transition-all hover:gap-2.5"
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
