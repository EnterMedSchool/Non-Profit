import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Image, Palette, Sparkles, Download } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import StickerBadge from "@/components/shared/StickerBadge";
import { getCollectionPageJsonLd } from "@/lib/metadata";

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
    },
    keywords: ["medical visual assets", "anatomy diagrams", "clinical icons", "medical logos", "educational media"],
  };
}

const assets = [
  { title: "EnterMedSchool Logo Pack", desc: "Official logos in SVG, PNG formats for use in your slides and materials.", type: "Logo" },
  { title: "Anatomy Diagram Set", desc: "Collection of labeled anatomy diagrams ready to embed in presentations.", type: "Diagrams" },
  { title: "Clinical Icons Collection", desc: "Medical and clinical icons for use in your educational materials.", type: "Icons" },
];

export default function AssetsPage() {
  const t = useTranslations("professors.assets");
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Visual Assets & Media", "Logos, diagrams, and icons for medical education materials.", `${BASE_URL}/en/for-professors/assets`)) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Visual"
          titleHighlight="Assets"
          titlePost="& Media"
          gradient="from-showcase-yellow via-showcase-orange to-showcase-coral"
          annotation="ready for your slides!"
          annotationColor="text-showcase-orange"
          subtitle={t("description")}
          floatingIcons={<>
            <Image className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-yellow/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Palette className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-orange/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Sparkles className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-coral/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Download className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-yellow/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset, i) => (
            <AnimatedSection key={asset.title} delay={i * 0.08} animation="popIn" spring>
              <ChunkyCard className="p-5">
                <StickerBadge color="purple" size="sm">{asset.type}</StickerBadge>
                <h3 className="mt-3 font-display text-base font-bold text-ink-dark">{asset.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{asset.desc}</p>
                <StickerBadge color="green" size="sm" className="mt-3">Coming Soon</StickerBadge>
              </ChunkyCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
}
