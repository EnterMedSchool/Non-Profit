import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Presentation, BookOpen, Image, Users } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ForProfessorsHub from "@/components/professors/ForProfessorsHub";
import { getWebPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-professors`,
      type: "website",
    },
    keywords: ["medical education professors", "teaching resources", "slide templates", "lecture materials", "free educator tools", "video tutorials", "teaching guides"],
  };
}

export default function ForProfessorsPage() {
  const t = useTranslations("professors");

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20 overflow-hidden">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd("For Professors & Educators", "Free slide templates, teaching guides, video tutorials, and visual assets for medical education professors.", `${BASE_URL}/en/for-professors`)) }} />

      {/* ── Hero Section (constrained) ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titlePre="For"
          titleHighlight="Professors"
          titlePost="& Educators"
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation="built for your classroom!"
          annotationColor="text-showcase-purple"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <Presentation className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <BookOpen className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Image className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-yellow/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Users className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />
      </div>

      {/* ── Interactive Hub (manages its own widths for full-bleed sections) ── */}
      <ForProfessorsHub />
    </main>
  );
}
