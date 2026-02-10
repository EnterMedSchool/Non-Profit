import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Video, Play, Sparkles, Monitor } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ResourceCard from "@/components/resources/ResourceCard";
import { resources } from "@/data/resources";
import { getCollectionPageJsonLd, getVideoObjectJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources.videos" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/resources/videos`,
      type: "website",
    },
    keywords: ["medical videos", "ECG tutorial", "neuroanatomy", "pharmacology lectures", "free medical education videos"],
  };
}

export default function VideosPage() {
  const t = useTranslations("resources.videos");
  const items = resources.filter((r) => r.category === "videos");
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Educational Video Guides", "Video tutorials, lectures, and visual explanations for medical students.", `${BASE_URL}/en/resources/videos`)) }} />
      {items.map((video) => (
        <script key={video.id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getVideoObjectJsonLd(video, "en")) }} />
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Educational"
          titleHighlight="Video"
          titlePost="Guides"
          gradient="from-showcase-teal via-showcase-blue to-showcase-purple"
          annotation="learn by watching!"
          annotationColor="text-showcase-teal"
          subtitle="Video tutorials, lectures, and visual explanations to supplement your medical studies."
          floatingIcons={<>
            <Video className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Play className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-blue/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Sparkles className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Monitor className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <AnimatedSection key={r.id} delay={i * 0.06} animation="rotateIn">
              <ResourceCard resource={r} />
            </AnimatedSection>
          ))}
        </div>

        {items.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-mint">
                <Video className="h-12 w-12 text-showcase-teal/40 animate-float-gentle" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">No videos available yet.</p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">Video guides will appear here when available.</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
