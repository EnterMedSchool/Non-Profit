import { getTranslations } from "next-intl/server";
import {
  Check,
  X,
  Shield,
  Award,
  Sparkles,
  GraduationCap,
  Users,
  Pencil,
  Presentation,
  Printer,
  DollarSign,
  Building2,
  EyeOff,
  UserX,
  FileText,
  Globe,
  Mail,
  CircleDot,
  HelpCircle,
  MapPin,
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Zap,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import ChunkyCard from "@/components/shared/ChunkyCard";
import BadgeGenerator from "@/components/license/BadgeGenerator";
import FAQAccordion from "@/components/license/FAQAccordion";
import SectionNav from "@/components/license/SectionNav";
import LicenseComparison from "@/components/license/LicenseComparison";
import LicenseStats from "@/components/license/LicenseStats";
import FullLicenseViewer from "@/components/license/FullLicenseViewer";
import { getWebPageJsonLd, getFAQPageJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "license" });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/license`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/license`])
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/license`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/license`,
      type: "website",
      images: [{ url: ogImagePath("license"), width: 1200, height: 630 }],
    },
    keywords: [
      "license",
      "attribution",
      "creative commons",
      "educational use",
      "free resources license",
    ],
  };
}

const canDoIcons = [GraduationCap, Users, Pencil, Presentation, Printer];
const cannotDoIcons = [DollarSign, Building2, EyeOff, UserX];
const whereToBadgeIcons: Record<string, typeof FileText> = {
  Presentation,
  FileText,
  Globe,
  Printer,
};

const tldrIcons = [Shield, Award, Mail, X];

export default async function LicensePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "license" });

  const canDo = t.raw("info.canDo.items") as string[];
  const cannotDo = t.raw("info.cannotDo.items") as string[];
  const tldrItems = t.raw("tldr.items") as string[];
  const quickStartSteps = t.raw("quickStart.steps") as {
    number: string;
    title: string;
    description: string;
  }[];
  const whereToBadgeItems = t.raw("whereToBadge.items") as {
    title: string;
    description: string;
    icon: string;
  }[];
  const faqItems = t.raw("faq.items") as {
    question: string;
    answer: string;
  }[];

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  const stepColors = [
    {
      bg: "bg-showcase-purple/10",
      icon: "text-showcase-purple",
      num: "bg-showcase-purple",
    },
    {
      bg: "bg-showcase-teal/10",
      icon: "text-showcase-teal",
      num: "bg-showcase-teal",
    },
    {
      bg: "bg-showcase-green/10",
      icon: "text-showcase-green",
      num: "bg-showcase-green",
    },
  ];

  const stepIcons = [Pencil, Award, MapPin];

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getWebPageJsonLd(
              t("jsonLd.title"),
              t("jsonLd.description"),
              `${BASE_URL}/${locale}/license`,
              locale
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFAQPageJsonLd(faqItems, locale)),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ────────────────────────────────────────────────────────────────
            1. Hero
            ──────────────────────────────────────────────────────────── */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("hero.subtitle")}
          floatingIcons={
            <>
              <Shield
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-teal/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Award
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-green/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
              <Check
                className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-purple/15 animate-float-gentle"
                style={{ animationDelay: "2s" }}
              />
              <Sparkles
                className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-teal/15 animate-float-playful"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          }
        />

        {/* Last updated */}
        <AnimatedSection animation="fadeIn">
          <p className="mt-4 text-center text-xs text-ink-light">
            {t("lastUpdated")}
          </p>
        </AnimatedSection>

        {/* ────────────────────────────────────────────────────────────────
            2. TL;DR "At a Glance" Card
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-10">
          <AnimatedSection animation="blurIn">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-teal/20 bg-white/60 p-6 shadow-lg backdrop-blur-md transition-all hover:shadow-xl sm:p-8">
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />

              <div className="relative">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-3 border-showcase-purple/20 bg-showcase-purple/10">
                      <Shield className="h-6 w-6 text-showcase-purple" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <StickerBadge color="teal" size="sm">
                          {t("tldr.badge")}
                        </StickerBadge>
                      </div>
                      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-dark sm:text-2xl">
                        {t("tldr.title")}
                      </h2>
                    </div>
                  </div>

                  <a
                    href="#generator"
                    className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                  >
                    <Zap className="h-4 w-4" />
                    {t("tldr.cta")}
                    <ArrowDown className="h-3.5 w-3.5" />
                  </a>
                </div>

                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tldrItems.map((item, i) => {
                    const Icon = tldrIcons[i] || Check;
                    const colors = [
                      "bg-showcase-green/10 text-showcase-green",
                      "bg-showcase-purple/10 text-showcase-purple",
                      "bg-showcase-teal/10 text-showcase-teal",
                      "bg-red-100 text-red-400",
                    ];
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border-2 border-showcase-navy/5 bg-white/80 px-4 py-3 text-sm text-ink-muted"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${colors[i]}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            3. Section Nav Pills
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-8">
          <AnimatedSection delay={0.1} animation="fadeUp">
            <SectionNav />
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            4. Can / Cannot Do
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-12" id="section-allowed">
          <AnimatedSection animation="blurIn">
            <div className="rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink-dark">
                {t("info.title")}
              </h2>
              <p className="mt-3 text-ink-muted">{t("info.description")}</p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Can do */}
                <AnimatedSection delay={0.1} animation="slideLeft">
                  <div className="rounded-xl border-2 border-showcase-green/30 bg-gradient-to-br from-showcase-green/5 to-showcase-teal/5 p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-showcase-green">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-showcase-green/15">
                        <Check className="h-4 w-4" />
                      </div>
                      {t("info.canDo.title")}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {canDo.map((item: string, i: number) => {
                        const Icon = canDoIcons[i] || Check;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-ink-muted"
                          >
                            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-showcase-green/10">
                              <Icon className="h-3.5 w-3.5 text-showcase-green" />
                            </span>
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </AnimatedSection>

                {/* Cannot do */}
                <AnimatedSection delay={0.15} animation="slideRight">
                  <div className="rounded-xl border-2 border-red-300/30 bg-gradient-to-br from-red-50 to-red-50/50 p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-red-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                        <X className="h-4 w-4" />
                      </div>
                      {t("info.cannotDo.title")}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {cannotDo.map((item: string, i: number) => {
                        const Icon = cannotDoIcons[i] || X;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-ink-muted"
                          >
                            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-red-100/80">
                              <Icon className="h-3.5 w-3.5 text-red-400" />
                            </span>
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </AnimatedSection>
              </div>

              <p className="mt-6 text-sm text-ink-muted">
                {t("info.contact")}{" "}
                <a
                  href="mailto:ari@entermedschool.com"
                  className="font-bold text-showcase-purple hover:underline"
                >
                  ari@entermedschool.com
                </a>
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            5. License Comparison
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14" id="section-comparison">
          <AnimatedSection animation="fadeUp">
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-ink-dark">
                {t("comparison.title")}
              </h2>
              <p className="mt-2 text-ink-muted">
                {t("comparison.subtitle")}
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-8">
            <LicenseComparison />
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            6. Quick Start Guide (upgraded with ChunkyCard)
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14" id="section-quickstart">
          <AnimatedSection animation="fadeUp">
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-ink-dark">
                {t("quickStart.title")}
              </h2>
              <p className="mt-2 text-ink-muted">
                {t("quickStart.subtitle")}
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {quickStartSteps.map((step, i) => {
              const colors = stepColors[i];
              const StepIcon = stepIcons[i];
              return (
                <AnimatedSection
                  key={i}
                  delay={0.1 + i * 0.08}
                  animation="fadeUp"
                >
                  <ChunkyCard color="white" hoverEffect>
                    <div className={`relative p-5`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.num} text-sm font-extrabold text-white shadow-sm`}
                        >
                          {step.number}
                        </div>
                        <StepIcon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <h3 className="mt-3 font-display text-base font-bold text-ink-dark">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                        {step.description}
                      </p>
                      {i < quickStartSteps.length - 1 && (
                        <ArrowRight className="absolute -end-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-light/30 sm:block" />
                      )}
                    </div>
                  </ChunkyCard>
                </AnimatedSection>
              );
            })}
          </div>
        </section>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          7. Trust Stats (full-bleed dark section)
          ──────────────────────────────────────────────────────────── */}
      <div className="mt-14">
        <LicenseStats />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ────────────────────────────────────────────────────────────────
            8. Badge Generator
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14" id="generator">
          <AnimatedSection animation="slideLeft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-purple/10">
                <CircleDot className="h-5 w-5 text-showcase-purple" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-extrabold text-ink-dark">
                    {t("generator.title")}
                  </h2>
                  <StickerBadge color="purple" size="sm">
                    Interactive
                  </StickerBadge>
                </div>
                <p className="text-sm text-ink-muted">
                  {t("generator.description")}
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} animation="fadeUp" className="mt-6">
            <div className="rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky sm:p-8">
              <BadgeGenerator />
            </div>
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            9. Where to Add Your Badge
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14">
          <AnimatedSection animation="fadeUp">
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-ink-dark">
                {t("whereToBadge.title")}
              </h2>
              <p className="mt-2 text-ink-muted">
                {t("whereToBadge.subtitle")}
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whereToBadgeItems.map((item, i) => {
              const Icon = whereToBadgeIcons[item.icon] || FileText;
              const borderColors = [
                "border-s-showcase-purple",
                "border-s-showcase-teal",
                "border-s-showcase-green",
                "border-s-showcase-coral",
              ];
              const iconBgColors = [
                "bg-showcase-purple/10 text-showcase-purple",
                "bg-showcase-teal/10 text-showcase-teal",
                "bg-showcase-green/10 text-showcase-green",
                "bg-showcase-coral/10 text-showcase-coral",
              ];
              return (
                <AnimatedSection
                  key={i}
                  delay={0.05 + i * 0.06}
                  animation="fadeUp"
                >
                  <div
                    className={`rounded-xl border-3 border-showcase-navy/10 border-s-4 ${borderColors[i % borderColors.length]} bg-white p-5 transition-all hover:shadow-chunky-sm`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBgColors[i % iconBgColors.length]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-ink-dark">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            10. Full License Text Viewer
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14" id="section-full-license">
          <AnimatedSection animation="fadeUp">
            <FullLicenseViewer />
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            11. FAQ Section
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14" id="section-faq">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-teal/10">
                <HelpCircle className="h-5 w-5 text-showcase-teal" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-ink-dark">
                {t("faq.title")}
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} animation="fadeUp" className="mt-6">
            <FAQAccordion items={faqItems} />
          </AnimatedSection>
        </section>

        {/* ────────────────────────────────────────────────────────────────
            12. Contact CTA (with GitHub button)
            ──────────────────────────────────────────────────────────── */}
        <section className="mt-14 mb-8">
          <AnimatedSection animation="fadeUp">
            <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-gradient-to-br from-showcase-purple via-showcase-purple to-showcase-teal p-8 text-center shadow-chunky sm:p-10">
              {/* Decorative elements */}
              <div className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />

              <div className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-white">
                  {t("contactCta.title")}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/80">
                  {t("contactCta.description")}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={`mailto:${t("contactCta.email")}`}
                    className="inline-flex items-center gap-2 rounded-xl border-3 border-white bg-white px-6 py-3 font-display text-sm font-bold text-showcase-purple shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                  >
                    <Mail className="h-4 w-4" />
                    {t("contactCta.buttonText")}
                  </a>
                  <a
                    href="https://github.com/enterMedSchool/Non-Profit/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border-3 border-white/30 bg-white/10 px-6 py-3 font-display text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("contactCta.githubBtn")}
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </main>
  );
}
