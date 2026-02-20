import { getTranslations } from "next-intl/server";
import { Activity, Blocks, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import { getAlgorithmTools } from "@/data/tools";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface AlgorithmsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AlgorithmsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "algorithms" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/algorithms`,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    keywords: [
      "medical algorithms",
      "clinical decision tools",
      "interactive medical algorithms",
      "treatment algorithms",
      "clinical pathways",
      "medical education tools",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/algorithms`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/algorithms`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/algorithms`,
      },
    },
  };
}

export default async function AlgorithmsPage({ params }: AlgorithmsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "algorithms" });
  const tt = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const algorithms = getAlgorithmTools();

  const listItems = algorithms.map((tool, i) => ({
    name: tt(`${tool.i18nKey}.title`),
    url: `${BASE_URL}/${locale}/algorithms/${tool.id}`,
    position: i + 1,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd(
              t("metaTitle"),
              t("metaDescription"),
              `${BASE_URL}/${locale}/algorithms`,
              locale,
            ),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getItemListJsonLd(listItems)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-teal via-showcase-blue to-showcase-purple"
          meshColors={[
            "bg-showcase-teal/30",
            "bg-showcase-blue/25",
            "bg-showcase-purple/20",
          ]}
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
        />

        <div className="mt-8 flex items-center gap-2 rounded-2xl border border-showcase-teal/20 bg-white px-5 py-3.5 text-sm text-ink-muted">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>
            {tc("licenseNote")}{" "}
            <Link
              href={`/${locale}/license`}
              className="font-semibold text-showcase-purple hover:underline"
            >
              {tc("attributionRequiredLink")}
            </Link>
            .
          </span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((tool, i) => (
            <AnimatedSection
              key={tool.id}
              delay={i * 0.06}
              animation="popIn"
              spring
            >
              <div className="relative flex h-full flex-col rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-pastel-mint">
                    <Activity className="h-5 w-5 text-showcase-teal" />
                  </div>
                  <StickerBadge color="green" size="sm">
                    {tt("available")}
                  </StickerBadge>
                </div>

                <h3 className="font-display text-base font-bold text-ink-dark">
                  {tt(`${tool.i18nKey}.title`)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {tt(`${tool.i18nKey}.description`)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/algorithms/${tool.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-teal bg-showcase-teal/10 px-3 py-1.5 text-xs font-bold text-showcase-teal transition-colors hover:bg-showcase-teal hover:text-white"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    {t("startAlgorithm")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/${locale}/algorithms/${tool.id}#embed`}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-green bg-showcase-green/10 px-3 py-1.5 text-xs font-bold text-showcase-green transition-colors hover:bg-showcase-green hover:text-white"
                  >
                    <Blocks className="h-3.5 w-3.5" />
                    {tt("embedCodeBtn")}
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
}
