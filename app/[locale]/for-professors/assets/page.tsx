import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import StickerBadge from "@/components/shared/StickerBadge";
import { getCollectionPageJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors.assets" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-professors/assets`,
      type: "website",
      images: [{ url: ogImagePath("for-professors", "assets"), width: 1200, height: 630 }],
    },
    keywords: ["medical visual assets", "anatomy diagrams", "clinical icons", "medical logos", "educational media"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/for-professors/assets`,
      languages: { en: `${BASE_URL}/en/for-professors/assets`, "x-default": `${BASE_URL}/en/for-professors/assets` },
    },
  };
}

const assets = [
  { title: "EnterMedSchool Logo Pack", desc: "Official logos in SVG, PNG formats for use in your slides and materials.", type: "Logo" },
  { title: "Anatomy Diagram Set", desc: "Collection of labeled anatomy diagrams ready to embed in presentations.", type: "Diagrams" },
  { title: "Clinical Icons Collection", desc: "Medical and clinical icons for use in your educational materials.", type: "Icons" },
];

export default function AssetsPage() {
  const t = useTranslations("professors.assets");
  const locale = useLocale();
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Visual Assets & Media", "Logos, diagrams, and icons for medical education materials.", `${BASE_URL}/${locale}/for-professors/assets`, locale)) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Visual"
          titleHighlight="Assets"
          titlePost="& Media"
          gradient="from-showcase-yellow via-showcase-orange to-showcase-coral"
          meshColors={["bg-showcase-yellow/30", "bg-showcase-orange/25", "bg-showcase-coral/20"]}
          annotation="ready for your slides!"
          annotationColor="text-showcase-orange"
          subtitle={t("description")}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, i) => (
            <AnimatedSection key={asset.title} delay={i * 0.08} animation="popIn" spring>
              <ChunkyCard className="p-5">
                <StickerBadge color="purple" size="sm">{asset.type}</StickerBadge>
                <h3 className="mt-3 font-display text-base font-bold text-ink-dark">{asset.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{asset.desc}</p>
              </ChunkyCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
}
