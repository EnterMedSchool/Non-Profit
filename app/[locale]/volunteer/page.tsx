import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";
import {
  Megaphone,
  PenTool,
  ShieldCheck,
  Languages,
  GraduationCap,
  Globe,
  Sparkles,
  Code,
  PartyPopper,
  Heart,
  Handshake,
  Users,
  Award,
  BookOpen,
  Mail,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "volunteer" });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/volunteer`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/volunteer`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/volunteer`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/volunteer`,
      type: "website",
      images: [{ url: ogImagePath("volunteer"), width: 1200, height: 630 }],
    },
    keywords: [
      "volunteer medical education",
      "entermedschool volunteer",
      "open source medical",
      "medical student volunteer",
      "free medical resources",
    ],
  };
}

const ROLE_CARDS = [
  {
    key: "universityReps",
    icon: Megaphone,
    gradient: "bg-gradient-to-br from-showcase-coral to-showcase-orange",
  },
  {
    key: "contentCreators",
    icon: PenTool,
    gradient: "bg-gradient-to-br from-showcase-purple to-showcase-blue",
  },
  {
    key: "materialReviewers",
    icon: ShieldCheck,
    gradient: "bg-gradient-to-br from-showcase-teal to-showcase-green",
  },
  {
    key: "translationReviewers",
    icon: Languages,
    gradient: "bg-gradient-to-br from-showcase-yellow to-showcase-orange",
  },
  {
    key: "professorLiaisons",
    icon: GraduationCap,
    gradient: "bg-gradient-to-br from-showcase-pink to-showcase-coral",
  },
] as const;

const CONDUCT_ITEMS = [
  {
    key: "respect",
    icon: Heart,
    color:
      "bg-showcase-coral/10 text-showcase-coral border-showcase-coral",
  },
  {
    key: "professionalism",
    icon: Award,
    color:
      "bg-showcase-purple/10 text-showcase-purple border-showcase-purple",
  },
  {
    key: "collaboration",
    icon: Handshake,
    color: "bg-showcase-teal/10 text-showcase-teal border-showcase-teal",
  },
  {
    key: "inclusivity",
    icon: Users,
    color:
      "bg-showcase-green/10 text-showcase-green border-showcase-green",
  },
  {
    key: "integrity",
    icon: BookOpen,
    color:
      "bg-showcase-orange/10 text-showcase-orange border-showcase-orange",
  },
] as const;

const EXPECTATION_CARDS = [
  {
    key: "globalCommunity",
    icon: Globe,
    gradient: "bg-gradient-to-br from-showcase-teal to-showcase-green",
  },
  {
    key: "meaningfulImpact",
    icon: Sparkles,
    gradient: "bg-gradient-to-br from-showcase-coral to-showcase-pink",
  },
  {
    key: "openSource",
    icon: Code,
    gradient: "bg-gradient-to-br from-showcase-purple to-showcase-blue",
  },
  {
    key: "funProject",
    icon: PartyPopper,
    gradient: "bg-gradient-to-br from-showcase-yellow to-showcase-orange",
  },
] as const;

export default function VolunteerPage() {
  const t = useTranslations("volunteer");

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          gradient="from-showcase-coral via-showcase-orange to-showcase-yellow"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-coral"
          subtitle={t("subtitle")}
        />

        {/* ── Mission Introduction ── */}
        <AnimatedSection animation="blurIn" className="mt-10">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-orange/30 bg-white/60 p-8 shadow-lg backdrop-blur-md transition-all hover:shadow-xl sm:p-12">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />
            <div className="relative">
              <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                {t("mission.title")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                {t("mission.content")}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── How You Can Help (roles) ── */}
        <section className="mt-16">
          <AnimatedSection animation="slideLeft">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-ink-dark">
                {t("roles.title").split(" ").slice(0, -1).join(" ")}{" "}
              </span>
              <span className="bg-gradient-to-r from-showcase-coral via-showcase-orange to-showcase-yellow bg-clip-text text-transparent">
                {t("roles.title").split(" ").slice(-1)}
              </span>
            </h2>
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_CARDS.map((role, i) => {
              const Icon = role.icon;
              return (
                <AnimatedSection
                  key={role.key}
                  delay={i * 0.08}
                  animation="popIn"
                  spring
                >
                  <div className="group overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky">
                    <div className={`h-1 ${role.gradient}`} />
                    <div className="p-6">
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${role.gradient} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-ink-dark">
                        {t(`roles.${role.key}`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {t(`roles.${role.key}Desc`)}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ── Two Paths ── */}
        <section className="mt-16">
          <AnimatedSection animation="slideLeft">
            <h2 className="mb-8 font-display text-3xl font-extrabold tracking-tight text-ink-dark sm:text-4xl">
              {t("paths.title")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AnimatedSection delay={0.1} animation="fadeUp">
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky-lg sm:p-8">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-showcase-teal to-showcase-green shadow-md">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-dark">
                  {t("paths.pathOneTitle")}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {t("paths.pathOneDesc")}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} animation="fadeUp">
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky-lg sm:p-8">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-showcase-purple to-showcase-blue shadow-md">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-dark">
                  {t("paths.pathTwoTitle")}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {t("paths.pathTwoDesc")}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Code of Conduct ── */}
        <section className="mt-16">
          <AnimatedSection animation="blurIn">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-purple/30 bg-white/60 p-8 shadow-lg backdrop-blur-md transition-all hover:shadow-xl sm:p-12">
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />
              <div className="relative">
                <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                  {t("conduct.title")}
                </h2>
                <p className="mt-3 text-base text-ink-muted">
                  {t("conduct.intro")}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {CONDUCT_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <AnimatedSection
                        key={item.key}
                        delay={i * 0.08}
                        animation="rotateIn"
                      >
                        <div className="rounded-xl border-3 border-showcase-navy bg-white p-5 shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky">
                          <div
                            className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 ${item.color}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-display text-sm font-bold text-ink-dark">
                            {t(`conduct.${item.key}`)}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                            {t(`conduct.${item.key}Desc`)}
                          </p>
                        </div>
                      </AnimatedSection>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ── What to Expect ── */}
        <section className="mt-16">
          <AnimatedSection animation="slideLeft">
            <h2 className="mb-8 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-ink-dark">
                {t("expectations.title").split(" ").slice(0, -1).join(" ")}{" "}
              </span>
              <span className="bg-gradient-to-r from-showcase-teal via-showcase-green to-showcase-purple bg-clip-text text-transparent">
                {t("expectations.title").split(" ").slice(-1)}
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {EXPECTATION_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <AnimatedSection
                  key={card.key}
                  delay={i * 0.08}
                  animation="popIn"
                  spring
                >
                  <div className="group flex gap-4 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white p-5 shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${card.gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-ink-dark">
                        {t(`expectations.${card.key}`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {t(`expectations.${card.key}Desc`)}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ── Who We're Looking For ── */}
        <AnimatedSection animation="blurIn" className="mt-16">
          <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-gradient-to-br from-showcase-coral/5 via-white to-showcase-orange/5 p-8 shadow-chunky sm:p-10">
            <div className="pattern-dots pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-coral to-showcase-orange shadow-md">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink-dark sm:text-3xl">
                {t("whoWeWant.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
                {t("whoWeWant.content")}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Founder Note ── */}
        <AnimatedSection delay={0.2} animation="blurIn" className="mt-10">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-green/30 bg-white/60 p-8 text-center shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-green/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-green to-showcase-teal shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-ink-dark">
                {t("founder.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                {t("founder.content")}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Contact CTA ── */}
        <AnimatedSection delay={0.3} animation="fadeUp" className="mt-12 text-center">
          <p className="mb-6 text-lg text-ink-muted">{t("contact.cta")}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ChunkyButton
              href="mailto:ari@entermedschool.com"
              variant="primary"
              external
            >
              <Mail className="h-4 w-4" />
              {t("contact.email")}
            </ChunkyButton>
            <ChunkyButton
              href="https://wa.me/393756123111"
              variant="green"
              external
            >
              <MessageCircle className="h-4 w-4" />
              {t("contact.whatsapp")}
            </ChunkyButton>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
