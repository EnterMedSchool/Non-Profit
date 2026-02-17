import { getTranslations } from "next-intl/server";
import PageHero from "@/components/shared/PageHero";
import ForProfessorsHub from "@/components/professors/ForProfessorsHub";
import { getWebPageJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/for-professors`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE_URL}/${l}/for-professors`])),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/for-professors`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/for-professors`,
      type: "website",
      images: [{ url: ogImagePath("for-professors"), width: 1200, height: 630 }],
    },
    keywords: ["medical education professors", "teaching resources", "slide templates", "lecture materials", "free educator tools", "video tutorials", "teaching guides"],
  };
}

export default async function ForProfessorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professors" });

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20 overflow-hidden">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd(t("jsonLd.title"), t("jsonLd.description"), `${BASE_URL}/${locale}/for-professors`, locale)) }} />

      {/* ── Hero Section (constrained) ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          meshColors={["bg-showcase-purple/30", "bg-showcase-blue/25", "bg-showcase-teal/20"]}
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-purple"
          subtitle={t("subtitle")}
        />
      </div>

      {/* ── Interactive Hub (manages its own widths for full-bleed sections) ── */}
      <ForProfessorsHub />
    </main>
  );
}
