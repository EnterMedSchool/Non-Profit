import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { BookOpen, Eye, HelpCircle, Wrench, ArrowRight, Lightbulb, GraduationCap, Brain, Sparkles } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import { getWebPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "students" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-students`,
      type: "website",
    },
    keywords: ["medical student resources", "study materials", "exam preparation", "free medical education", "visual lessons"],
  };
}

export default function ForStudentsPage() {
  const t = useTranslations("students");

  const sections = [
    { key: "exams", icon: BookOpen, href: "/en/resources/questions", color: "purple" as const },
    { key: "visuals", icon: Eye, href: "/en/resources/visuals", color: "teal" as const },
    { key: "practice", icon: HelpCircle, href: "/en/resources/questions", color: "yellow" as const },
    { key: "tools", icon: Wrench, href: "/en/tools", color: "green" as const },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd("For Students", "Free medical education resources, practice questions, visual lessons, and interactive tools for medical students.", `${BASE_URL}/en/for-students`)) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titleHighlight="Start"
          titlePost="Your Journey Here"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="your journey begins here!"
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <GraduationCap className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <BookOpen className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Lightbulb className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-yellow/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Brain className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <AnimatedSection key={section.key} delay={i * 0.1} animation="popIn" spring>
                <ChunkyCard href={section.href} className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-pastel-${section.color === "purple" ? "lavender" : section.color === "teal" ? "mint" : section.color === "yellow" ? "lemon" : "mint"}`}>
                      <Icon className={`h-5 w-5 text-showcase-${section.color}`} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-dark">{t(`sections.${section.key}.title`)}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">{t(`sections.${section.key}.description`)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-showcase-purple">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </ChunkyCard>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Tip -- glassmorphism banner */}
        <AnimatedSection delay={0.4} animation="fadeUp" className="mt-12">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-yellow/30 bg-white/60 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-xl">
            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-yellow/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-yellow to-showcase-orange shadow-md">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-ink-dark">Pro Tip</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("tip")}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
