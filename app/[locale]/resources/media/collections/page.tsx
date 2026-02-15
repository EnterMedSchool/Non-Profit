import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, Package } from "lucide-react";
import {
  mediaAssetCollections,
  getCollectionAssets,
} from "@/data/media-assets";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string }>;
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const title = "Curated Illustration Collections — Free Medical Image Packs";
  const description =
    "Browse curated collections of free medical illustrations organized by topic. Download complete image packs for cardiovascular, cell biology, neuroscience, and more — all CC BY 4.0.";
  const url = `${BASE_URL}/${locale}/resources/media/collections`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/collections`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/collections`;

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
      images: [{ url: ogImagePath("resources", "media", "collections"), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CollectionsIndexPage({ params }: Props) {
  const { locale } = await params;

  const collectionJsonLd = getCollectionPageJsonLd(
    "Curated Medical Illustration Collections",
    "Browse curated collections of free medical illustrations.",
    `${BASE_URL}/${locale}/resources/media/collections`,
    locale,
  );

  const itemListJsonLd = getItemListJsonLd(
    mediaAssetCollections.map((c, i) => ({
      name: c.name,
      url: `${BASE_URL}/${locale}/resources/media/collections/${c.slug}`,
      position: i + 1,
    })),
  );

  return (
    <main className="relative z-10 py-12 sm:py-20">
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
              Collections
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl lg:text-5xl">
              Curated{" "}
              <span className="bg-gradient-to-r from-showcase-orange via-showcase-coral to-showcase-pink bg-clip-text text-transparent">
                Illustration Packs
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted leading-relaxed sm:text-lg">
              Ready-to-use collections of medical illustrations organized by topic.
              Download complete image packs for your lectures, slides, and teaching materials.
            </p>
          </div>
        </AnimatedSection>

        {/* ── Collection cards ── */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mediaAssetCollections.map((collection, i) => {
            const assets = getCollectionAssets(collection);
            const previewAsset = assets[0];

            return (
              <AnimatedSection key={collection.slug} delay={0.1 + i * 0.08} animation="popIn" spring>
                <Link
                  href={`/${locale}/resources/media/collections/${collection.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-chunky-xl"
                >
                  {/* Preview images stack */}
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-pastel-cream">
                    {previewAsset && (
                      <Image
                        src={previewAsset.imagePath}
                        alt={collection.name}
                        fill
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border-2 border-showcase-navy bg-white px-2 py-0.5 text-[10px] font-bold text-ink-muted shadow-[1px_1px_0_#1a1a2e]">
                      <Layers className="h-3 w-3" />
                      {assets.length} {assets.length === 1 ? "asset" : "assets"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="font-display text-base font-bold text-ink-dark line-clamp-2 group-hover:text-showcase-purple transition-colors">
                      {collection.name}
                    </h2>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-2">
                      {collection.seoDescription}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-showcase-purple opacity-0 transition-opacity group-hover:opacity-100">
                      View Collection
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        {/* ── Back to all ── */}
        <AnimatedSection animation="fadeUp" delay={0.35}>
          <div className="mt-12 text-center">
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
