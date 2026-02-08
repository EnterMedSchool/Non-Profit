import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Users, Shirt, FolderOpen, PartyPopper, Heart, Mail, Sparkles } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyCard from "@/components/shared/ChunkyCard";
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
  };
}

export default function EventsPage() {
  const t = useTranslations("events");

  const offerings = [
    { key: "orgs", icon: Users, color: "purple" },
    { key: "merch", icon: Shirt, color: "teal" },
    { key: "resources", icon: FolderOpen, color: "yellow" },
    { key: "networking", icon: PartyPopper, color: "green" },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Community Events", "EnterMedSchool community events and meetups.", `${BASE_URL}/en/events`)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getEventJsonLd({ name: "Pavia BBQ Meetup", description: "Community BBQ meetup in Pavia for medical students.", location: "Pavia, Italy" })) }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Our"
          titleHighlight="Community"
          titlePost="Events"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="join us!"
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
          floatingIcons={<>
            <PartyPopper className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Users className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Heart className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-coral/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* Past events */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h3 className="font-display text-2xl font-bold text-ink-dark mb-6">{t("pastEvents.title")}</h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AnimatedSection delay={0.1} animation="popIn" spring>
              <ChunkyCard className="p-6">
                <span className="text-3xl mb-3 block">🍖</span>
                <h4 className="font-display text-lg font-bold text-ink-dark">{t("pastEvents.pavia.title")}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("pastEvents.pavia.description")}</p>
              </ChunkyCard>
            </AnimatedSection>
            <AnimatedSection delay={0.15} animation="popIn" spring>
              <ChunkyCard className="p-6">
                <span className="text-3xl mb-3 block">👕</span>
                <h4 className="font-display text-lg font-bold text-ink-dark">{t("pastEvents.merch.title")}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("pastEvents.merch.description")}</p>
              </ChunkyCard>
            </AnimatedSection>
          </div>
        </section>

        {/* What we offer */}
        <section className="mt-10">
          <AnimatedSection animation="slideLeft">
            <h3 className="font-display text-2xl font-bold text-ink-dark mb-6">{t("whatWeOffer.title")}</h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {offerings.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.key} delay={i * 0.08} animation="rotateIn">
                  <div className="flex gap-4 rounded-2xl border-3 border-showcase-navy bg-white p-5 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-pastel-lavender">
                      <Icon className="h-5 w-5 text-showcase-purple" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-ink-dark">{t(`whatWeOffer.${item.key}`)}</h4>
                      <p className="mt-1 text-sm text-ink-muted">{t(`whatWeOffer.${item.key}Desc`)}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* Philosophy -- glassmorphism */}
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
              <h3 className="font-display text-xl font-bold text-ink-dark">{t("philosophy.title")}</h3>
              <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-ink-muted">{t("philosophy.content")}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact CTA */}
        <AnimatedSection delay={0.4} animation="fadeUp" className="mt-12 text-center">
          <p className="text-ink-muted mb-4">{t("contactCta")}</p>
          <ChunkyButton href="mailto:ari@entermedschool.com" variant="primary" external>
            <Mail className="h-4 w-4" />
            Contact Us
          </ChunkyButton>
        </AnimatedSection>
      </div>
    </main>
  );
}
