import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Code, ExternalLink, BookOpen, FlaskConical, AlertCircle, HelpCircle, Shield, FileCode } from "lucide-react";
import Link from "next/link";
import { getToolById, getCalculatorTools } from "@/data/tools";
import { calculatorRegistry } from "@/components/tools/calculators";
import CalculatorLoader from "@/components/tools/calculators/CalculatorLoader";
import { getToolJsonLd, getFAQPageJsonLd } from "@/lib/metadata";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import EmbedCodeGenerator from "@/components/tools/EmbedCodeGenerator";
import ShareLinkButton from "@/components/shared/ShareLinkButton";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface CalculatorPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Generate static params for calculator tools only
export async function generateStaticParams() {
  const calcs = getCalculatorTools();
  return calcs.map((t) => ({ id: t.id }));
}

// SEO metadata
export async function generateMetadata({ params }: CalculatorPageProps) {
  const { locale, id } = await params;
  const tool = getToolById(id);
  if (!tool || tool.category !== "calculator") return {};

  const t = await getTranslations({ locale, namespace: "tools" });
  const title = t(`${tool.i18nKey}.metaTitle`);
  const description = t(`${tool.i18nKey}.metaDescription`);
  const toolUrl = `${BASE_URL}/${locale}/calculators/${id}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/calculators/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/en/calculators/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: toolUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: toolUrl,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: [{ url: ogImagePath("calculators", id), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    keywords: tool.seoKeywords,
  };
}

// Page
export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const ct = await getTranslations({ locale, namespace: "calculators" });
  const tc = await getTranslations({ locale, namespace: "toolCode" });
  const tool = getToolById(id);

  if (!tool || tool.category !== "calculator") {
    notFound();
  }

  if (!calculatorRegistry[id]) {
    notFound();
  }

  const title = t(`${tool.i18nKey}.title`);
  const description = t(`${tool.i18nKey}.description`);

  // JSON-LD structured data
  const jsonLdItems = getToolJsonLd(tool, title, description, locale);

  // Build FAQ structured data for tools that have FAQ content
  const hasFaq = id === "bmi-calc";
  const faqItems = hasFaq
    ? [
        { question: t("bmi.faq.q1"), answer: t("bmi.faq.a1") },
        { question: t("bmi.faq.q2"), answer: t("bmi.faq.a2") },
        { question: t("bmi.faq.q3"), answer: t("bmi.faq.a3") },
        { question: t("bmi.faq.q4"), answer: t("bmi.faq.a4") },
        { question: t("bmi.faq.q5"), answer: t("bmi.faq.a5") },
      ]
    : [];
  const faqJsonLd = hasFaq ? getFAQPageJsonLd(faqItems, locale) : null;

  const hasEducationalContent = id === "bmi-calc";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* JSON-LD */}
        {jsonLdItems.map((item, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(item).replace(/</g, "\\u003c"),
            }}
          />
        ))}
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        )}

        {/* Back link */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/calculators`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {ct("backToCalculators")}
          </Link>
        </AnimatedSection>

        {/* Title */}
        <PageHero
          titleHighlight={title}
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          meshColors={["bg-showcase-purple/30", "bg-showcase-blue/25", "bg-showcase-teal/20"]}
          subtitle={description}
        />

        {/* Calculator */}
        <AnimatedSection delay={0.1} animation="blurIn">
          <div className="mt-8">
            <CalculatorLoader id={id} />
          </div>
        </AnimatedSection>

        {/* Source code + Get the Code links */}
        <AnimatedSection delay={0.15} animation="fadeUp">
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/calculators/${id}/embed-code`}
              className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none"
            >
              <FileCode className="h-4 w-4" />
              {tc("getCodeBtn")}
            </Link>
            {tool.sourceUrl && (
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
            )}
          </div>
        </AnimatedSection>

        {/* Educational content section (BMI-specific) */}
        {hasEducationalContent && (
          <AnimatedSection delay={0.15} animation="fadeUp">
            <div className="mt-10 space-y-6">
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                    <BookOpen className="h-5 w-5 text-showcase-purple" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {t("bmi.education.aboutTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t("bmi.education.aboutBody")}
                </p>
              </div>

              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                    <FlaskConical className="h-5 w-5 text-showcase-teal" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {t("bmi.education.formulaTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t("bmi.education.formulaBody")}
                </p>
                <div className="mt-4 rounded-xl bg-gray-50 border-2 border-showcase-navy/10 p-4">
                  <p className="font-mono text-sm text-ink-dark text-center">
                    BMI = weight (kg) / height (m)²
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {t("bmi.education.formulaExample")}
                </p>
              </div>

              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-yellow/30 bg-showcase-yellow/10">
                    <AlertCircle className="h-5 w-5 text-showcase-yellow" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {t("bmi.education.limitationsTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t("bmi.education.limitationsBody")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                    {t("bmi.education.limitation1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                    {t("bmi.education.limitation2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                    {t("bmi.education.limitation3")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                    {t("bmi.education.limitation4")}
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-green/20 bg-showcase-green/10">
                    <HelpCircle className="h-5 w-5 text-showcase-green" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {t("bmi.education.faqTitle")}
                  </h2>
                </div>
                <div className="space-y-5">
                  {faqItems.map((faq, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-bold text-ink-dark">{faq.question}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Share with Students + Attribution */}
        <AnimatedSection delay={0.18} animation="fadeUp">
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/calculators/${id}`}
              label={t("shareWithStudents")}
            />
          </div>
          <div className="mt-4 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
            <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
            <span>{ct("attributionReminder")} <Link href={`/${locale}/license`} className="font-semibold text-showcase-purple hover:underline">Learn more</Link>.</span>
          </div>
        </AnimatedSection>

        {/* Embed section */}
        <AnimatedSection delay={0.2} animation="rotateIn">
          <div id="embed" className="mt-10">
            <EmbedCodeGenerator
              toolId={id}
              toolTitle={title}
              locale={locale}
              embedHeight={tool.embedHeight}
            />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
