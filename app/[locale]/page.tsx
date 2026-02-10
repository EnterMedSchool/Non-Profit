import dynamic from "next/dynamic";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import BlobBackground from "@/components/shared/BlobBackground";
import { getOrganizationJsonLd, getWebSiteJsonLd } from "@/lib/metadata";

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

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteJsonLd()) }} />

      {/* Animated blob background -- continuous across all sections */}
      <BlobBackground />

      {/* Hero: static import for fast FCP */}
      <Hero />
      <Marquee />
      <WhatWeOffer />
      <ForWhom />
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
          src="/logo.png"
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
