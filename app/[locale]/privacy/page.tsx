import { getTranslations } from "next-intl/server";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { getWebPageJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE_URL}/${l}/privacy`])),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/privacy`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/privacy`,
      type: "website",
      images: [{ url: ogImagePath("privacy"), width: 1200, height: 630 }],
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd(t("jsonLd.name"), t("jsonLd.description"), `${BASE_URL}/${locale}/privacy`, locale)) }} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          meshColors={["bg-showcase-teal/30", "bg-showcase-green/25", "bg-showcase-purple/20"]}
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("hero.subtitle")}
        />

        {/* Content -- glassmorphism card */}
        <AnimatedSection delay={0.15} animation="blurIn">
          <div className="group relative mt-10 overflow-hidden rounded-2xl border-2 border-showcase-teal/20 bg-white/60 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-xl sm:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink-dark prose-p:text-ink-muted prose-a:text-showcase-purple prose-strong:text-ink-dark">
            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative">
              <p><strong>{t("lastUpdated")}</strong> {t("lastUpdatedDate")}</p>

              <h2>{t("overview.title")}</h2>
              <p>{t("overview.content")}</p>

              <h2>{t("informationWeCollect.title")}</h2>
              <p>{t("informationWeCollect.intro")}</p>
              <p><strong>{t("informationWeCollect.weDoNotCollect")}</strong></p>
              <ul>
                <li>{t("informationWeCollect.items.personalInfo")}</li>
                <li>{t("informationWeCollect.items.email")}</li>
                <li>{t("informationWeCollect.items.payment")}</li>
                <li>{t("informationWeCollect.items.userContent")}</li>
              </ul>

              <h2>{t("cookies.title")}</h2>
              <p>{t("cookies.intro")}</p>
              <ul>
                <li><strong>{t("cookies.items.essential.label")}</strong> {t("cookies.items.essential.description")}</li>
                <li><strong>{t("cookies.items.analytics.label")}</strong> {t("cookies.items.analytics.description")}</li>
              </ul>
              <p>{t("cookies.managePreferences")}</p>

              <h2>{t("analytics.title")}</h2>
              <p>{t("analytics.content")}</p>

              <h2>{t("thirdPartyLinks.title")}</h2>
              <p>{t("thirdPartyLinks.content")}</p>

              <h2>{t("childrensPrivacy.title")}</h2>
              <p>{t("childrensPrivacy.content")}</p>

              <h2>{t("changes.title")}</h2>
              <p>{t("changes.content")}</p>

              <h2>{t("contact.title")}</h2>
              <p>{t("contact.contentBefore")}<a href={`mailto:${t("contact.email")}`}>{t("contact.email")}</a>{t("contact.contentAfter")}</p>

              <h2>{t("dataController.title")}</h2>
              <p>{t("dataController.contentBefore")}<a href={t("dataController.linkUrl")} target="_blank" rel="noopener noreferrer">{t("dataController.linkText")}</a>{t("dataController.contentAfter")}</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
