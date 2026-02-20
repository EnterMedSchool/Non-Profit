import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Code, ExternalLink, BookOpen, FlaskConical, AlertCircle, HelpCircle, Shield, FileCode } from "lucide-react";
import Link from "next/link";
import { getToolById, getCalculatorTools } from "@/data/tools";
import { calculatorRegistry } from "@/components/tools/calculators";
import CalculatorLoader from "@/components/tools/calculators/CalculatorLoader";
import FormulaCodeBlock from "@/components/tools/calculators/FormulaCodeBlock";
import { getToolJsonLd, getFAQPageJsonLd } from "@/lib/metadata";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import EmbedCodeGenerator from "@/components/tools/EmbedCodeGenerator";
import ShareLinkButton from "@/components/shared/ShareLinkButton";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

const BMI_FORMULA_CODE = `// BMI = weight (kg) / height (m)\u00B2
function calcBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// BMI Prime = BMI / 25 (ratio to upper normal limit)
function calcBMIPrime(bmi) {
  return bmi / 25;
}

// Ponderal Index = weight (kg) / height (m)\u00B3
function calcPonderalIndex(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM * heightM);
}

// Healthy weight range for BMI 18.5\u201325
function calcHealthyWeightRange(heightCm) {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * heightM * heightM,
    max: 25 * heightM * heightM,
  };
}`;

const DUKE_FORMULA_CODE = `// 2023 Duke-ISCVID Criteria Classification
// Fowler et al., Clin Infect Dis 2023
function classifyIE(majorCount, minorCount) {
  // Definite IE (clinical)
  if (majorCount >= 2) return "definite";
  if (majorCount >= 1 && minorCount >= 3) return "definite";
  if (minorCount >= 5) return "definite";

  // Possible IE
  if (majorCount >= 1 && minorCount >= 1) return "possible";
  if (minorCount >= 3) return "possible";

  // Does not meet criteria
  return "rejected";
}`;

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
  const toolUrl = `${BASE_URL}/${locale}/calculators/${id}`;

  // JSON-LD structured data (pass correct calculator URL)
  const jsonLdItems = getToolJsonLd(tool, title, description, locale, toolUrl);

  // Build FAQ structured data for tools that have FAQ content
  const isBmi = id === "bmi-calc";
  const isDuke = id === "duke-criteria";
  const hasFaq = isBmi || isDuke;
  const faqItems = isBmi
    ? [
        { question: t("bmi.faq.q1"), answer: t("bmi.faq.a1") },
        { question: t("bmi.faq.q2"), answer: t("bmi.faq.a2") },
        { question: t("bmi.faq.q3"), answer: t("bmi.faq.a3") },
        { question: t("bmi.faq.q4"), answer: t("bmi.faq.a4") },
        { question: t("bmi.faq.q5"), answer: t("bmi.faq.a5") },
      ]
    : isDuke
      ? [
          { question: t("duke.faq.q1"), answer: t("duke.faq.a1") },
          { question: t("duke.faq.q2"), answer: t("duke.faq.a2") },
          { question: t("duke.faq.q3"), answer: t("duke.faq.a3") },
          { question: t("duke.faq.q4"), answer: t("duke.faq.a4") },
          { question: t("duke.faq.q5"), answer: t("duke.faq.a5") },
        ]
      : [];
  const faqJsonLd = hasFaq ? getFAQPageJsonLd(faqItems, locale) : null;

  const hasEducationalContent = isBmi || isDuke;

  // HowTo schema for featured snippets
  const howToJsonLd = isBmi
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Calculate BMI",
        description:
          "Calculate your Body Mass Index using this free online BMI calculator with WHO classification and clinical interpretation.",
        url: toolUrl,
        totalTime: "PT2M",
        tool: { "@type": "HowToTool", name: "Web browser" },
        supply: [],
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your height",
            text: "Enter your height in centimeters (metric) or feet and inches (imperial).",
            url: `${toolUrl}#step-1`,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Enter your weight",
            text: "Enter your weight in kilograms (metric) or pounds (imperial).",
            url: `${toolUrl}#step-2`,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Read your BMI value and WHO category",
            text: "Your BMI value and WHO classification appear automatically. The color-coded scale shows where you fall among the standard categories.",
            url: `${toolUrl}#step-3`,
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Check your healthy weight range",
            text: "Review your healthy weight range (BMI 18.5\u201325) for your height and how far your current weight is from the range.",
            url: `${toolUrl}#step-4`,
          },
        ],
        provider: {
          "@type": "Organization",
          name: "EnterMedSchool.org",
          url: BASE_URL,
        },
      }
    : isDuke
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to Use the Duke Criteria for Infective Endocarditis",
          description:
            "Apply the 2023 Duke-ISCVID criteria to classify suspected infective endocarditis as Definite, Possible, or Rejected.",
          url: toolUrl,
          totalTime: "PT5M",
          tool: { "@type": "HowToTool", name: "Web browser" },
          supply: [],
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Review major criteria",
              text: "Evaluate the patient's findings against the three major criterion domains: microbiologic (blood cultures, serology, molecular), imaging (echo, cardiac CT, PET/CT), and surgical (intraoperative inspection).",
              url: `${toolUrl}#step-1`,
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Review minor criteria",
              text: "Check for minor criteria: predisposing conditions, fever, vascular phenomena, immunologic phenomena, supportive microbiologic evidence, minor imaging findings, and new regurgitation on auscultation.",
              url: `${toolUrl}#step-2`,
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Count criteria met",
              text: "Count the number of major criterion domains and minor criteria that are present. Each major domain counts once regardless of how many sub-criteria are positive.",
              url: `${toolUrl}#step-3`,
            },
            {
              "@type": "HowToStep",
              position: 4,
              name: "Read the classification",
              text: "The calculator classifies the case as Definite IE (\u22652 major, or 1 major + \u22653 minor, or \u22655 minor), Possible IE (1 major + 1 minor, or \u22653 minor), or Rejected (does not meet criteria).",
              url: `${toolUrl}#step-4`,
            },
          ],
          provider: {
            "@type": "Organization",
            name: "EnterMedSchool.org",
            url: BASE_URL,
          },
        }
      : null;

  // SoftwareSourceCode schema for the open source formula section
  const sourceCodeJsonLd = (isBmi || isDuke)
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: `${title} \u2014 Open Source ${isDuke ? "Algorithm" : "Formula"}`,
        description: isDuke
          ? "The 2023 Duke-ISCVID criteria classification algorithm used in this calculator, available as open source JavaScript code."
          : "The complete BMI calculation formulas used in this calculator, available as open source JavaScript code.",
        url: toolUrl,
        codeRepository:
          tool.sourceUrl ||
          "https://github.com/enterMedSchool/Non-Profit",
        programmingLanguage: "JavaScript",
        runtimePlatform: "Web Browser",
        license: `${BASE_URL}/${locale}/license`,
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          name: "EnterMedSchool.org",
          url: BASE_URL,
        },
        ...(tool.seoKeywords && {
          keywords: tool.seoKeywords.join(", "),
        }),
      }
    : null;

  // BreadcrumbList schema (all calculators)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Calculators",
        item: `${BASE_URL}/${locale}/calculators`,
      },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

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
        {howToJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        )}
        {sourceCodeJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(sourceCodeJsonLd).replace(
                /</g,
                "\\u003c",
              ),
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />

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
          meshColors={[
            "bg-showcase-purple/30",
            "bg-showcase-blue/25",
            "bg-showcase-teal/20",
          ]}
          subtitle={description}
        />

        {/* Embed section — top priority */}
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
              {ct("attributionReminder")}{" "}
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

        {/* Source code + Get the Code links */}
        <AnimatedSection delay={0.14} animation="fadeUp">
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

        {/* Open Source Formula / Algorithm */}
        {isBmi && (
          <AnimatedSection delay={0.16} animation="fadeUp">
            <div className="mt-8">
              <FormulaCodeBlock code={BMI_FORMULA_CODE} sourceUrl={tool.sourceUrl} />
            </div>
          </AnimatedSection>
        )}
        {isDuke && (
          <AnimatedSection delay={0.16} animation="fadeUp">
            <div className="mt-8">
              <FormulaCodeBlock
                code={DUKE_FORMULA_CODE}
                i18nNamespace="tools.duke.openSource"
                sourceUrl={tool.sourceUrl}
              />
            </div>
          </AnimatedSection>
        )}

        {/* Calculator */}
        <AnimatedSection delay={0.18} animation="blurIn">
          <div className="mt-8">
            <CalculatorLoader id={id} />
          </div>
        </AnimatedSection>

        {/* Educational content section */}
        {hasEducationalContent && (
          <AnimatedSection delay={0.2} animation="fadeUp">
            <div className="mt-10 space-y-6">
              {/* About section */}
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender">
                    <BookOpen className="h-5 w-5 text-showcase-purple" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {isBmi ? t("bmi.education.aboutTitle") : t("duke.education.aboutTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {isBmi ? t("bmi.education.aboutBody") : t("duke.education.aboutBody")}
                </p>
              </div>

              {/* Formula / Criteria explanation */}
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
                    <FlaskConical className="h-5 w-5 text-showcase-teal" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {isBmi ? t("bmi.education.formulaTitle") : t("duke.education.criteriaTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {isBmi ? t("bmi.education.formulaBody") : t("duke.education.criteriaBody")}
                </p>
                {isBmi && (
                  <>
                    <div className="mt-4 rounded-xl bg-gray-50 border-2 border-showcase-navy/10 p-4">
                      <p className="font-mono text-sm text-ink-dark text-center">
                        BMI = weight (kg) / height (m)²
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {t("bmi.education.formulaExample")}
                    </p>
                  </>
                )}
              </div>

              {/* Limitations */}
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-yellow/30 bg-showcase-yellow/10">
                    <AlertCircle className="h-5 w-5 text-showcase-yellow" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {isBmi ? t("bmi.education.limitationsTitle") : t("duke.education.limitationsTitle")}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {isBmi ? t("bmi.education.limitationsBody") : t("duke.education.limitationsBody")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  {(isBmi
                    ? ["limitation1", "limitation2", "limitation3", "limitation4"]
                    : ["limitation1", "limitation2", "limitation3", "limitation4"]
                  ).map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 shrink-0" />
                      {isBmi ? t(`bmi.education.${key}`) : t(`duke.education.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-green/20 bg-showcase-green/10">
                    <HelpCircle className="h-5 w-5 text-showcase-green" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-dark">
                    {isBmi ? t("bmi.education.faqTitle") : t("duke.education.faqTitle")}
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
            </div>
          </AnimatedSection>
        )}

        {/* Share with Students */}
        <AnimatedSection delay={0.22} animation="fadeUp">
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShareLinkButton
              url={`${BASE_URL}/${locale}/calculators/${id}`}
              label={t("shareWithStudents")}
            />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
