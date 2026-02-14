import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Users, Shirt, FolderOpen, PartyPopper, Heart, Mail, Sparkles, UtensilsCrossed, CalendarClock } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { getCollectionPageJsonLd, getEventJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/events`,
      type: "website",
    },
    keywords: ["medical education events", "entermedschool events", "student meetups", "medical community"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/events`,
      languages: { en: `${BASE_URL}/en/events`, "x-default": `${BASE_URL}/en/events` },
    },
  };
}

/* ── Offering card color configs ───────────────────────────────────── */

const OFFERING_STYLES: Record<string, { bg: string; iconBg: string; iconText: string }> = {
  purple: {
    bg: "from-showcase-purple/5 to-transparent",
    iconBg: "bg-gradient-to-br from-showcase-purple to-showcase-blue",
    iconText: "text-white",
  },
  teal: {
    bg: "from-showcase-teal/5 to-transparent",
    iconBg: "bg-gradient-to-br from-showcase-teal to-showcase-green",
    iconText: "text-white",
  },
  yellow: {
    bg: "from-showcase-yellow/5 to-transparent",
    iconBg: "bg-gradient-to-br from-showcase-yellow to-showcase-orange",
    iconText: "text-ink-dark",
  },
  green: {
    bg: "from-showcase-green/5 to-transparent",
    iconBg: "bg-gradient-to-br from-showcase-green to-showcase-teal",
    iconText: "text-white",
  },
};

export default function EventsPage() {
  const t = useTranslations("events");
  const locale = useLocale();

  const offerings = [
    { key: "orgs", icon: Users, color: "purple" },
    { key: "merch", icon: Shirt, color: "teal" },
    { key: "resources", icon: FolderOpen, color: "yellow" },
    { key: "networking", icon: PartyPopper, color: "green" },
  ];

  const pastEvents = [
    {
      key: "pavia",
      icon: UtensilsCrossed,
      iconGradient: "bg-gradient-to-br from-showcase-orange to-showcase-coral",
    },
    {
      key: "merch",
      icon: Shirt,
      iconGradient: "bg-gradient-to-br from-showcase-purple to-showcase-blue",
    },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd(t("jsonLd.collectionTitle"), t("jsonLd.collectionDescription"), `${BASE_URL}/${locale}/events`, locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getEventJsonLd({ name: t("jsonLd.paviaEvent.name"), description: t("jsonLd.paviaEvent.description"), location: t("jsonLd.paviaEvent.location"), locale })) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <PartyPopper className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Users className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Heart className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-coral/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* ── Upcoming events placeholder ── */}
        <AnimatedSection animation="fadeUp" className="mt-10">
          <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky">
            <div className="h-1.5 bg-gradient-to-r from-showcase-teal via-showcase-green to-showcase-purple" />
            <div className="pattern-dots absolute inset-0 pointer-events-none" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center sm:py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-teal to-showcase-green shadow-md">
                <CalendarClock className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-ink-dark sm:text-2xl">
                Upcoming Events
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Stay tuned! We&apos;re planning new meetups and community events. Follow us to be the first to know.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Past events ── */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h2 className="font-display text-2xl font-bold text-ink-dark mb-6">{t("pastEvents.title")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {pastEvents.map((event, i) => {
              const Icon = event.icon;
              return (
                <AnimatedSection key={event.key} delay={0.1 + i * 0.05} animation="popIn" spring>
                  <div className="group overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky">
                    {/* Gradient accent strip */}
                    <div className={`h-1 ${event.iconGradient}`} />
                    <div className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${event.iconGradient} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-ink-dark">{t(`pastEvents.${event.key}.title`)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(`pastEvents.${event.key}.description`)}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ── What we offer ── */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h2 className="font-display text-2xl font-bold text-ink-dark mb-6">{t("whatWeOffer.title")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {offerings.map((item, i) => {
              const Icon = item.icon;
              const style = OFFERING_STYLES[item.color] || OFFERING_STYLES.purple;
              return (
                <AnimatedSection key={item.key} delay={i * 0.08} animation="rotateIn">
                  <div className={`flex gap-4 rounded-2xl border-3 border-showcase-navy bg-gradient-to-br ${style.bg} bg-white p-5 shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky`}>
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${style.iconBg} shadow-md transition-transform duration-300 hover:scale-110`}>
                      <Icon className={`h-5 w-5 ${style.iconText}`} />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-ink-dark">{t(`whatWeOffer.${item.key}`)}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{t(`whatWeOffer.${item.key}Desc`)}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* ── Philosophy -- glassmorphism ── */}
        <AnimatedSection delay={0.3} animation="blurIn" className="mt-10">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-pink/30 bg-white/60 backdrop-blur-md p-8 shadow-lg transition-all hover:shadow-xl text-center">
            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative">
              <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-showcase-pink/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-pink to-showcase-coral shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-ink-dark">{t("philosophy.title")}</h2>
              <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-ink-muted">{t("philosophy.content")}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Contact CTA ── */}
        <AnimatedSection delay={0.4} animation="fadeUp" className="mt-12 text-center">
          <p className="text-ink-muted mb-4">{t("contactCta")}</p>
          <ChunkyButton href="mailto:ari@entermedschool.com" variant="primary" external>
            <Mail className="h-4 w-4" />
            {t("contactUs")}
          </ChunkyButton>
        </AnimatedSection>
      </div>
    </main>
  );
}
