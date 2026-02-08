import { getTranslations } from "next-intl/server";
import { Presentation, FileText, Sparkles, Layers } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import TemplateGallery from "@/components/professors/TemplateGallery";
import { getCollectionPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors.templates" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-professors/templates`,
      type: "website",
    },
    keywords: ["medical lecture templates", "slide templates", "PowerPoint medical", "Google Slides medical", "presentation templates", "medical education downloads"],
  };
}

export default function TemplatesPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd(
              "Slide Templates & Layouts",
              "Professional slide templates designed for medical lectures and presentations. Download PowerPoint and Excel files for free.",
              `${BASE_URL}/en/for-professors/templates`,
            ),
          ),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Template"
          titleHighlight="Gallery"
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation="download & customize!"
          annotationColor="text-showcase-purple"
          subtitle="Professional slide templates and spreadsheets designed for medical lectures and presentations. Browse, preview, and download for free."
          floatingIcons={
            <>
              <Presentation
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <FileText
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-blue/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
              <Sparkles
                className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-teal/15 animate-float-gentle"
                style={{ animationDelay: "2s" }}
              />
              <Layers
                className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-purple/15 animate-float-playful"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          }
        />

        {/* ── Gallery (client component) ── */}
        <TemplateGallery />
      </div>
    </main>
  );
}
