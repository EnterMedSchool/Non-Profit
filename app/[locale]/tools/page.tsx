import { getTranslations } from "next-intl/server";
import { Code, Wrench, Clock, Lightbulb, Blocks, ArrowRight, Calculator, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import { tools } from "@/data/tools";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";

interface ToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ToolsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/tools`,
      type: "website",
    },
    keywords: ["medical tools", "BMI calculator", "medical calculators", "free medical apps", "open source health tools"],
  };
}

const categoryIcons: Record<string, string> = {
  calculator: "🧮",
  simulator: "🫀",
  viewer: "👁️",
  creator: "🎨",
};

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const toolListItems = tools.map((tool, i) => ({
    name: tool.i18nKey ? t(`${tool.i18nKey}.title`) : tool.id,
    url: `${BASE_URL}/${locale}/tools/${tool.id}`,
    position: i + 1,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Interactive Medical Tools", t("metaDescription"), `${BASE_URL}/${locale}/tools`)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getItemListJsonLd(toolListItems)) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Interactive"
          titleHighlight="Tools"
          titlePost="for Learning"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="open-source & embeddable!"
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <Wrench className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Calculator className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-purple/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Palette className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-green/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <AnimatedSection key={tool.id} delay={i * 0.06} animation="popIn" spring>
              <div className="relative flex h-full flex-col rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
                {/* Status badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-pastel-mint">
                    <span className="text-xl">{categoryIcons[tool.category] || "🔧"}</span>
                  </div>
                  {tool.status === "coming-soon" ? (
                    <StickerBadge color="yellow" size="sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("comingSoon")}
                    </StickerBadge>
                  ) : (
                    <StickerBadge color="green" size="sm">{t("available")}</StickerBadge>
                  )}
                </div>

                <h3 className="font-display text-base font-bold text-ink-dark">
                  {tool.i18nKey ? t(`${tool.i18nKey}.title`) : tool.id}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {tool.i18nKey ? t(`${tool.i18nKey}.description`) : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.status === "available" ? (
                    <>
                      <Link
                        href={tool.id === "illustration-maker" ? "/create" : tool.id === "flashcard-maker" ? "/flashcards" : tool.id === "mcq-maker" ? "/mcq" : `/${locale}/tools/${tool.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-teal bg-showcase-teal/10 px-3 py-1.5 text-xs font-bold text-showcase-teal transition-colors hover:bg-showcase-teal hover:text-white"
                      >
                        <Wrench className="h-3.5 w-3.5" /> {t("useToolBtn")}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      {tool.id !== "illustration-maker" && tool.id !== "flashcard-maker" && tool.id !== "mcq-maker" && (
                      <Link
                        href={`/${locale}/tools/${tool.id}#embed`}
                        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-green bg-showcase-green/10 px-3 py-1.5 text-xs font-bold text-showcase-green transition-colors hover:bg-showcase-green hover:text-white"
                      >
                        <Blocks className="h-3.5 w-3.5" /> {t("embedCodeBtn")}
                      </Link>
                      )}
                      {tool.sourceUrl && (
                        <a href={tool.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-purple bg-showcase-purple/10 px-3 py-1.5 text-xs font-bold text-showcase-purple transition-colors hover:bg-showcase-purple hover:text-white">
                          <Code className="h-3.5 w-3.5" /> {t("viewSourceBtn")}
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="w-full rounded-lg border-2 border-dashed border-ink-light/30 bg-pastel-cream/50 px-3 py-2.5 text-center">
                      <p className="text-xs text-ink-muted">
                        Open-source & embeddable — coming soon
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Vision section -- glassmorphism */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="group relative mt-10 overflow-hidden rounded-2xl border-2 border-showcase-purple/30 bg-white/60 backdrop-blur-md p-8 sm:p-10 text-center shadow-lg transition-all hover:shadow-xl">
            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative">
              <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-purple/20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-purple to-showcase-teal shadow-md">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-ink-dark sm:text-2xl">
                {t("visionTitle")}
              </h3>
              <p className="mt-3 max-w-2xl mx-auto text-base leading-relaxed text-ink-muted">
                {t("vision")}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
