import type { Metadata } from "next";
import { blobAsset } from "@/lib/blob-url";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import BlobBackground from "@/components/shared/BlobBackground";
import { getOrganizationJsonLd, getWebSiteJsonLd, getSiteNavigationJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";
import ExploreTopics from "@/components/home/ExploreTopics";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/* ── SEO: Homepage-specific metadata ──────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("siteName");
  const description =
    "Free, open-source medical education platform. Access 450+ medical glossary terms, interactive visual lessons, flashcard & MCQ makers, anatomy illustrations, and study tools — all free for students and educators.";

  return {
    title,
    description,
    keywords: [
      "free medical education",
      "open source medical resources",
      "medical school study materials",
      "medical glossary",
      "anatomy flashcards",
      "MCQ generator medical",
      "medical illustrations free",
      "USMLE study tools",
      "medical terminology",
      "clinical cases",
      "med school resources",
      "free medical tools",
    ],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: t("siteName"),
      locale,
      images: [{ url: ogImagePath("home"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@entermedschool",
      creator: "@arihoresh",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}`,
      },
    },
  };
}

// Lazy load below-fold sections for performance
const WhatWeOffer = dynamic(() => import("@/components/home/WhatWeOffer"), {
  loading: () => <SectionSkeleton />,
});
const ForWhom = dynamic(() => import("@/components/home/ForWhom"), {
  loading: () => <SectionSkeleton />,
});
const ProjectTimeline = dynamic(() => import("@/components/home/ProjectTimeline"), {
  loading: () => <SectionSkeleton />,
});
const MissionStatement = dynamic(() => import("@/components/home/MissionStatement"), {
  loading: () => <SectionSkeleton />,
});
const ImpactStats = dynamic(() => import("@/components/home/ImpactStats"), {
  loading: () => <SectionSkeleton />,
});
const CallToAction = dynamic(() => import("@/components/home/CallToAction"), {
  loading: () => <SectionSkeleton />,
});

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="relative overflow-x-hidden">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteJsonLd(locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getSiteNavigationJsonLd(locale)) }} />

      {/* Animated blob background -- continuous across all sections */}
      <BlobBackground />

      {/* Hero: static import for fast FCP */}
      <Hero />
      <Marquee />
      <WhatWeOffer />
      <ForWhom />
      <ExploreTopics locale={locale} />
      <ProjectTimeline />
      <MissionStatement />
      <ImpactStats />
      <CallToAction />

      {/* Footer spacer */}
      <div className="h-8" />
    </main>
  );
}

function SectionSkeleton() {
  return (
    <div
      className="mx-4 my-4 flex items-center justify-center rounded-2xl border-3 border-showcase-navy/10 bg-white/50"
      style={{ minHeight: 300 }}
    >
      <div className="animate-pulse flex flex-col items-center gap-3 opacity-30">
        <Image
          src={blobAsset("/logo.png")}
          alt=""
          width={48}
          height={48}
          className="animate-bounce"
          aria-hidden="true"
        />
        <div className="h-2 w-24 rounded-full bg-showcase-purple/20" />
      </div>
    </div>
  );
}
