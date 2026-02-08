import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Sparkles, Stethoscope, BookOpen, Lightbulb } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
import StickerBadge from "@/components/shared/StickerBadge";
import { getCollectionPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors.guides" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-professors/guides`,
      type: "website",
    },
    keywords: ["teaching guides", "medical lecture best practices", "AI slides", "clinical case teaching", "educator resources"],
  };
}

export default function GuidesPage() {
  const t = useTranslations("professors.guides");

  const guides = [
    { key: "aiSlides", icon: Sparkles, color: "purple" as const },
    { key: "clinicalCases", icon: Stethoscope, color: "teal" as const },
    { key: "emsResources", icon: BookOpen, color: "orange" as const },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Teaching Guides & Best Practices", "Teaching guides and best practices for medical education professors.", `${BASE_URL}/en/for-professors/guides`)) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Teaching"
          titleHighlight="Guides"
          titlePost="& Best Practices"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="level up your lectures!"
          annotationColor="text-showcase-teal"
          subtitle={t("description")}
          floatingIcons={<>
            <Sparkles className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Stethoscope className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <BookOpen className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-orange/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Lightbulb className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {guides.map((guide, i) => {
            const Icon = guide.icon;
            return (
              <AnimatedSection key={guide.key} delay={i * 0.1} animation="popIn" spring>
                <ChunkyCard className="p-6 h-full">
                  <Icon className={`h-8 w-8 text-showcase-${guide.color} mb-3`} />
                  <StickerBadge color="green" size="sm" className="mb-3">Coming Soon</StickerBadge>
                  <h3 className="font-display text-base font-bold text-ink-dark">{t(guide.key)}</h3>
                </ChunkyCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
