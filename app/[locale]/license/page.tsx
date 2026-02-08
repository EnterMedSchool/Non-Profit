import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Check, X, Video, Shield, Award, Sparkles } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import BadgeGenerator from "@/components/license/BadgeGenerator";
import { getWebPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "license" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/license`,
      type: "website",
    },
    keywords: ["license", "attribution", "creative commons", "educational use", "free resources license"],
  };
}

export default function LicensePage() {
  const t = useTranslations("license");

  const canDo = t.raw("info.canDo.items") as string[];
  const cannotDo = t.raw("info.cannotDo.items") as string[];

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd("License & Attribution", "License terms and attribution requirements for EnterMedSchool educational resources.", `${BASE_URL}/en/license`)) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="License &"
          titleHighlight="Attribution"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="free for educators!"
          annotationColor="text-showcase-teal"
          subtitle="Understand how to properly attribute EnterMedSchool materials and generate your badge."
          floatingIcons={<>
            <Shield className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Award className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Check className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* License Info */}
        <section className="mt-12">
          <AnimatedSection animation="blurIn">
            <div className="rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink-dark">{t("info.title")}</h2>
              <p className="mt-3 text-ink-muted">{t("info.description")}</p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Can do */}
                <AnimatedSection delay={0.1} animation="slideLeft">
                  <div className="rounded-xl border-2 border-showcase-green/30 bg-showcase-green/5 p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-showcase-green">
                      <Check className="h-5 w-5" />
                      {t("info.canDo.title")}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {canDo.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                          <Check className="h-4 w-4 flex-shrink-0 text-showcase-green mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>

                {/* Cannot do */}
                <AnimatedSection delay={0.15} animation="slideRight">
                  <div className="rounded-xl border-2 border-red-300/30 bg-red-50 p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-red-500">
                      <X className="h-5 w-5" />
                      {t("info.cannotDo.title")}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {cannotDo.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                          <X className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              </div>

              <p className="mt-6 text-sm text-ink-muted">
                {t("info.contact")}{" "}
                <a href="mailto:ari@entermedschool.com" className="font-bold text-showcase-purple hover:underline">
                  ari@entermedschool.com
                </a>
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* Badge Generator */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h2 className="font-display text-2xl font-extrabold text-ink-dark">{t("generator.title")}</h2>
            <p className="mt-2 text-ink-muted">{t("generator.description")}</p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} animation="rotateIn" className="mt-8">
            <div className="rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky sm:p-8">
              <BadgeGenerator />
            </div>
          </AnimatedSection>
        </section>

        {/* Embed instructions */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h2 className="font-display text-2xl font-extrabold text-ink-dark">{t("generator.embedTitle")}</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.08} animation="fadeUp" className="mt-4">
            <div className="flex items-start gap-3 rounded-xl border-2 border-showcase-navy/10 bg-white p-4">
              <Video className="h-5 w-5 flex-shrink-0 text-showcase-purple mt-0.5" />
              <p className="text-sm text-ink-muted">{t("generator.embedComingSoon")}</p>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </main>
  );
}
