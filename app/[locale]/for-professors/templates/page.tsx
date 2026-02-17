import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import PageHero from "@/components/shared/PageHero";
import TemplateGallery from "@/components/professors/TemplateGallery";
import { getCollectionPageJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";

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
      images: [{ url: ogImagePath("for-professors", "templates"), width: 1200, height: 630 }],
    },
    keywords: ["medical lecture templates", "slide templates", "PowerPoint medical", "Google Slides medical", "presentation templates", "medical education downloads"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/for-professors/templates`,
      languages: { en: `${BASE_URL}/en/for-professors/templates`, "x-default": `${BASE_URL}/en/for-professors/templates` },
    },
  };
}

export default function TemplatesPage() {
  const t = useTranslations("professors.templates");
  const locale = useLocale();
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
              `${BASE_URL}/${locale}/for-professors/templates`,
              locale,
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
          meshColors={["bg-showcase-purple/30", "bg-showcase-blue/25", "bg-showcase-teal/20"]}
          annotation="download & customize!"
          annotationColor="text-showcase-purple"
          subtitle={t("description")}
        />

        {/* ── Gallery (client component) ── */}
        <TemplateGallery />
      </div>
    </main>
  );
}
