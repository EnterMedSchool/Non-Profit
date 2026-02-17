import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Video, Shield } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ResourceCard from "@/components/resources/ResourceCard";
import { resources } from "@/data/resources";
import { getCollectionPageJsonLd, getVideoObjectJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources.videos" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/resources/videos`,
      type: "website",
      images: [{ url: ogImagePath("resources", "videos"), width: 1200, height: 630 }],
    },
    keywords: ["medical videos", "ECG tutorial", "neuroanatomy", "pharmacology lectures", "free medical education videos"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/videos`,
      languages: { en: `${BASE_URL}/en/resources/videos`, "x-default": `${BASE_URL}/en/resources/videos` },
    },
  };
}

export default function VideosPage() {
  const t = useTranslations("resources.videos");
  const tc = useTranslations("common");
  const locale = useLocale();
  const items = resources.filter((r) => r.category === "videos");
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd(t("jsonLd.title"), t("jsonLd.description"), `${BASE_URL}/${locale}/resources/videos`, locale)) }} />
      {items.map((video) => (
        <script key={video.id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getVideoObjectJsonLd(video, locale)) }} />
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-teal via-showcase-blue to-showcase-purple"
          meshColors={["bg-showcase-teal/30", "bg-showcase-blue/25", "bg-showcase-purple/20"]}
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("hero.subtitle")}
        />

        {/* ── Attribution Reminder ── */}
        <div className="mt-8 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>{tc("licenseNote")} <Link href={`/${locale}/license`} className="font-semibold text-showcase-purple hover:underline">{tc("attributionRequiredLink")}</Link>.</span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <AnimatedSection key={r.id} delay={i * 0.06} animation="rotateIn">
              <ResourceCard resource={r} />
            </AnimatedSection>
          ))}
        </div>

        {items.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-mint">
                <Video className="h-12 w-12 text-showcase-teal/40 animate-float-gentle" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">{t("emptyState.title")}</p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">{t("emptyState.hint")}</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
