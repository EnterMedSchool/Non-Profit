import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ProjectTimeline from "@/components/home/ProjectTimeline";
import { Heart, BookOpen, Globe, Users } from "lucide-react";
import { getAboutPageJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE_URL}/${l}/about`])),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/about`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/about`,
      type: "website",
      images: [{ url: ogImagePath("about"), width: 1200, height: 630 }],
    },
    keywords: ["about entermedschool", "medical education", "open source", "online education", "free resources"],
  };
}

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();

  const values = [
    { key: "openSource", icon: Heart, color: "bg-showcase-green/10 text-showcase-green border-showcase-green" },
    { key: "teaching", icon: BookOpen, color: "bg-showcase-purple/10 text-showcase-purple border-showcase-purple" },
    { key: "worldwide", icon: Globe, color: "bg-showcase-teal/10 text-showcase-teal border-showcase-teal" },
    { key: "collaboration", icon: Users, color: "bg-showcase-orange/10 text-showcase-orange border-showcase-orange" },
  ];

  return (
    <main className="relative z-10">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getAboutPageJsonLd(locale)) }} />

      {/* Story */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <PageHero
            titlePre={t("hero.titlePre")}
            titleHighlight={t("hero.titleHighlight")}
            gradient="from-showcase-purple via-showcase-teal to-showcase-green"
            meshColors={["bg-showcase-purple/30", "bg-showcase-teal/25", "bg-showcase-green/20"]}
            annotation={t("hero.annotation")}
            annotationColor="text-showcase-purple"
            subtitle={t("story.content")}
          />
        </div>
      </section>

      {/* Why .org -- glassmorphism */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="blurIn">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-purple/30 bg-white/60 backdrop-blur-md p-8 shadow-lg transition-all hover:shadow-xl sm:p-12">
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative">
                <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">{t("orgMission.title")}</h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-muted">{t("orgMission.content")}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Timeline */}
      <ProjectTimeline />

      {/* Values */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="blurIn">
            <div className="text-center">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                <span className="text-ink-dark">What We </span>
                <span className="bg-gradient-to-r from-showcase-teal via-showcase-green to-showcase-purple bg-clip-text text-transparent">Believe</span>
              </h2>
            </div>
          </AnimatedSection>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <AnimatedSection key={v.key} delay={i * 0.1} animation="rotateIn">
                  <div className="rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky-lg">
                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 ${v.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-dark">{t(`values.${v.key}`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(`values.${v.key}Desc`)}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
