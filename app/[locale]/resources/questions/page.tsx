import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { HelpCircle, Brain, Sparkles, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ResourceCard from "@/components/resources/ResourceCard";
import { resources } from "@/data/resources";
import { getCollectionPageJsonLd, getLearningResourceJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources.questions" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/resources/questions`,
      type: "website",
    },
    keywords: ["medical practice questions", "clinical cases", "pharmacology MCQs", "anatomy quiz", "medical exam preparation"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/questions`,
      languages: { en: `${BASE_URL}/en/resources/questions`, "x-default": `${BASE_URL}/en/resources/questions` },
    },
  };
}

export default function QuestionsPage() {
  const t = useTranslations("resources.questions");
  const items = resources.filter((r) => r.category === "questions");
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd("Practice Questions & Exams", "Exam-style questions and practice materials for medical school assessments.", `${BASE_URL}/en/resources/questions`)) }} />
      {items.map((item) => (
        <script key={item.id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getLearningResourceJsonLd(item, "en")) }} />
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Practice"
          titleHighlight="Questions"
          titlePost="& Exams"
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation="test your knowledge!"
          annotationColor="text-showcase-purple"
          subtitle="Exam-style questions and practice materials to help you prepare for medical school assessments."
          floatingIcons={<>
            <HelpCircle className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Brain className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-blue/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Sparkles className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <BookOpen className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-purple/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* ── Attribution Reminder ── */}
        <div className="mt-8 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>All resources are free for non-commercial educational use. <Link href="/en/license" className="font-semibold text-showcase-purple hover:underline">Attribution required</Link>.</span>
        </div>

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
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-lavender">
                <HelpCircle className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">No questions available yet.</p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">Practice questions will appear here when available.</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
