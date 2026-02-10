import { getTranslations } from "next-intl/server";
import { Calculator, Wrench, Blocks, ArrowRight, Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import { getCalculatorTools } from "@/data/tools";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";

interface CalculatorsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CalculatorsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculators" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/calculators`,
      type: "website",
    },
    keywords: ["medical calculators", "BMI calculator", "clinical calculators", "free medical tools", "health calculators"],
  };
}

export default async function CalculatorsPage({ params }: CalculatorsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculators" });
  const tt = await getTranslations({ locale, namespace: "tools" });
  const calculators = getCalculatorTools();

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const calcListItems = calculators.map((tool, i) => ({
    name: tool.i18nKey ? tt(`${tool.i18nKey}.title`) : tool.id,
    url: `${BASE_URL}/${locale}/calculators/${tool.id}`,
    position: i + 1,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Medical Calculators & Algorithms", t("metaDescription"), `${BASE_URL}/${locale}/calculators`)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getItemListJsonLd(calcListItems)) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <PageHero
          titlePre="Medical"
          titleHighlight="Calculators"
          titlePost="& Algorithms"
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation="free & embeddable!"
          annotationColor="text-showcase-purple"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <Calculator className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Activity className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Sparkles className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-blue/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
          </>}
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((tool, i) => (
            <AnimatedSection key={tool.id} delay={i * 0.06} animation="popIn" spring>
              <div className="relative flex h-full flex-col rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-pastel-lavender">
                    <span className="text-xl">🧮</span>
                  </div>
                  <StickerBadge color="green" size="sm">{tt("available")}</StickerBadge>
                </div>

                <h3 className="font-display text-base font-bold text-ink-dark">
                  {tool.i18nKey ? tt(`${tool.i18nKey}.title`) : tool.id}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {tool.i18nKey ? tt(`${tool.i18nKey}.description`) : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/calculators/${tool.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-teal bg-showcase-teal/10 px-3 py-1.5 text-xs font-bold text-showcase-teal transition-colors hover:bg-showcase-teal hover:text-white"
                  >
                    <Wrench className="h-3.5 w-3.5" /> {tt("useToolBtn")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/${locale}/calculators/${tool.id}#embed`}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-green bg-showcase-green/10 px-3 py-1.5 text-xs font-bold text-showcase-green transition-colors hover:bg-showcase-green hover:text-white"
                  >
                    <Blocks className="h-3.5 w-3.5" /> {tt("embedCodeBtn")}
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
