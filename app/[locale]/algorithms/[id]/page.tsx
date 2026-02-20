import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Code,
  ExternalLink,
  BookOpen,
  FlaskConical,
  AlertCircle,
  HelpCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { getToolById, getAlgorithmTools } from "@/data/tools";
import { algorithmRegistry } from "@/components/tools/algorithms";
import AlgorithmFullLoader from "@/components/tools/algorithms/AlgorithmFullLoader";
import {
  getAlgorithmJsonLd,
  getAlgorithmHowToJsonLd,
  getAlgorithmFAQJsonLd,
} from "@/lib/metadata";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import EmbedCodeGenerator from "@/components/tools/EmbedCodeGenerator";
import ShareLinkButton from "@/components/shared/ShareLinkButton";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface AlgorithmPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const algos = getAlgorithmTools();
  return algos.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: AlgorithmPageProps) {
  const { locale, id } = await params;
  const tool = getToolById(id);
  if (!tool || tool.category !== "algorithm") return {};

  const t = await getTranslations({ locale, namespace: "tools" });
  const title = t(`${tool.i18nKey}.metaTitle`);
  const description = t(`${tool.i18nKey}.metaDescription`);
  const algoUrl = `${BASE_URL}/${locale}/algorithms/${id}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/algorithms/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/en/algorithms/${id}`;

  return {
    title,
    description,
    alternates: { canonical: algoUrl, languages },
    openGraph: {
      title,
      description,
      url: algoUrl,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: { card: "summary_large_image" as const, title, description },
    keywords: tool.seoKeywords,
  };
}

export default async function AlgorithmPage({ params }: AlgorithmPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const at = await getTranslations({ locale, namespace: "algorithms" });
  const tool = getToolById(id);

  if (!tool || tool.category !== "algorithm") notFound();
  if (!algorithmRegistry[id]) notFound();

  const title = t(`${tool.i18nKey}.title`);
  const description = t(`${tool.i18nKey}.description`);
  const algoUrl = `${BASE_URL}/${locale}/algorithms/${id}`;

  const algorithmData = (await algorithmRegistry[id]()).default;

  const jsonLdItems = getAlgorithmJsonLd(
    tool,
    algorithmData,
    title,
    description,
    locale,
    algoUrl,
  );
  const howToJsonLd = getAlgorithmHowToJsonLd(
    algorithmData,
    title,
    algoUrl,
    locale,
  );
  const faqJsonLd = getAlgorithmFAQJsonLd(algorithmData, locale);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: at("metaTitle"),
        item: `${BASE_URL}/${locale}/algorithms`,
      },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  const sourceCodeJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${title} — Open Source Algorithm`,
    description: `The ${algorithmData.guideline} algorithm used in this interactive tool, available as open source code.`,
    url: algoUrl,
    codeRepository:
      tool.sourceUrl || "https://github.com/enterMedSchool/Non-Profit",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Web Browser",
    license: `${BASE_URL}/${locale}/license`,
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    ...(tool.seoKeywords && { keywords: tool.seoKeywords.join(", ") }),
  };

  const faqItems = algorithmData.faq ?? [];

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* JSON-LD */}
        {jsonLdItems.map((item, i) => (
          <script
            key={`jld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(item).replace(/</g, "\\u003c"),
            }}
          />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(sourceCodeJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* Back link */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/algorithms`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {at("backToAlgorithms")}
          </Link>
        </AnimatedSection>

        {/* Title */}
        <PageHero
          titleHighlight={title}
          gradient="from-showcase-teal via-showcase-blue to-showcase-purple"
          meshColors={[
            "bg-showcase-teal/30",
            "bg-showcase-blue/25",
            "bg-showcase-purple/20",
          ]}
          subtitle={description}
        />

        {/* Embed section */}
        <AnimatedSection delay={0.1} animation="rotateIn">
          <div id="embed" className="mt-8">
            <EmbedCodeGenerator
              toolId={id}
              toolTitle={title}
              locale={locale}
              embedHeight={tool.embedHeight}
            />
          </div>
        </AnimatedSection>

        {/* Attribution reminder */}
        <AnimatedSection delay={0.12} animation="fadeUp">
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-showcase-teal/20 bg-white px-5 py-3.5 text-sm text-ink-muted">
            <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
            <span>
              {at("attributionReminder")}{" "}
              <Link
                href={`/${locale}/license`}
                className="font-semibold text-showcase-purple hover:underline"
              >
                Learn more
              </Link>
              .
            </span>
          </div>
        </AnimatedSection>

        {/* Source code link */}
        {tool.sourceUrl && (
          <AnimatedSection delay={0.14} animation="fadeUp">
            <div className="mt-6 flex items-center justify-center">
              <a
                href={tool.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-showcase-purple hover:underline"
              >
                <Code className="h-4 w-4" />
                {t("viewSourceBtn")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </AnimatedSection>
        )}

        {/* Algorithm viewer */}
        <AnimatedSection delay={0.18} animation="blurIn">
          <div className="mt-8">
            <AlgorithmFullLoader id={id} />
          </div>
        </AnimatedSection>

        {/* Educational content */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <div className="mt-10 space-y-6">
            {/* About section */}
            <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                  <BookOpen className="h-5 w-5 text-showcase-purple" />
                </div>
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  {t(`${tool.i18nKey}.education.aboutTitle`)}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                {t(`${tool.i18nKey}.education.aboutBody`)}
              </p>
            </div>

            {/* Clinical context */}
            <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                  <FlaskConical className="h-5 w-5 text-showcase-teal" />
                </div>
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  {t(`${tool.i18nKey}.education.guidelineTitle`)}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                {t(`${tool.i18nKey}.education.guidelineBody`)}
              </p>
            </div>

            {/* Limitations */}
            <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-yellow/30 bg-showcase-yellow/10">
                  <AlertCircle className="h-5 w-5 text-showcase-yellow" />
                </div>
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  {t(`${tool.i18nKey}.education.limitationsTitle`)}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                {t(`${tool.i18nKey}.education.limitationsBody`)}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                {["limitation1", "limitation2", "limitation3", "limitation4"].map(
                  (key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                      {t(`${tool.i18nKey}.education.${key}`)}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* FAQ */}
            {faqItems.length > 0 && (
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-green/20 bg-showcase-green/10">
                    <HelpCircle className="h-5 w-5 text-showcase-green" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {t(`${tool.i18nKey}.education.faqTitle`)}
                  </h2>
                </div>
                <div className="space-y-5">
                  {faqItems.map((faq, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-bold text-ink-dark">
                        {faq.question}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Share */}
        <AnimatedSection delay={0.22} animation="fadeUp">
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/algorithms/${id}`}
              label={t("shareWithStudents")}
            />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
