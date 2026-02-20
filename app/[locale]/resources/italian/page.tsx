import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  FileText,
  ChevronRight,
  Languages,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { getAllItalianLessonMeta } from "@/lib/italian-data";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/resources/italian`;

  return {
    title: "Medical Italian for International Students — Free Lessons",
    description:
      "Free interactive Medical Italian lessons for international medical students in Italy. Dialogues, vocabulary, quizzes, printable flashcards, and clinical scenarios.",
    openGraph: {
      title: "Medical Italian — Free Lessons for Med Students",
      description:
        "Interactive Italian language lessons for medical students: ward dialogues, clinical vocabulary, comprehension quizzes, and printable flashcards.",
      url,
      type: "website" as const,
      images: [{ url: ogImagePath("resources", "italian"), width: 1200, height: 630 }],
    },
    keywords: [
      "medical Italian",
      "Italian for medical students",
      "healthcare Italian vocabulary",
      "clinical Italian course",
      "Italian medical language",
      "international medical students Italy",
      "ward Italian phrases",
      "medical Italian flashcards",
    ],
    alternates: {
      canonical: url,
    },
  };
}

const STEP_TYPE_ICONS: Record<string, { icon: typeof BookOpen; color: string }> =
  {
    glossary: { icon: BookOpen, color: "text-showcase-green" },
    dialogue: { icon: MessageSquare, color: "text-showcase-blue" },
    multi_choice: { icon: HelpCircle, color: "text-showcase-purple" },
    read_respond: { icon: FileText, color: "text-showcase-coral" },
  };

export default async function ItalianResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });
  const lessons = getAllItalianLessonMeta();

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titlePre="Medical"
          titleHighlight="Italian"
          titlePost="for Students"
          gradient="from-showcase-green via-showcase-teal to-showcase-blue"
          annotation="Open Source"
          annotationColor="text-showcase-green"
          subtitle="Interactive lessons for international medical students in Italy. Dialogues, vocabulary, quizzes, and printable flashcards — all free and open source."
          meshColors={[
            "bg-showcase-green/30",
            "bg-showcase-teal/25",
            "bg-showcase-blue/20",
          ]}
        />

        {/* Lesson cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {lessons.map((lesson, i) => (
            <AnimatedSection
              key={lesson.slug}
              delay={i * 0.1}
              animation="popIn"
              spring
            >
              <Link
                href={`/${locale}/resources/italian/${lesson.slug}`}
                className="group relative flex h-full flex-col rounded-2xl border-3 border-showcase-green/20 bg-white p-6 shadow-chunky transition-all hover:-translate-y-1 hover:border-showcase-green/40 hover:shadow-[0_6px_24px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-showcase-green transition-transform duration-300 group-hover:scale-110">
                    <Languages className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-showcase-green">
                      Lesson {lesson.position + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-dark">
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                {lesson.summary && (
                  <p className="mt-3 text-sm italic leading-relaxed text-ink-muted">
                    &ldquo;{lesson.summary}&rdquo;
                  </p>
                )}

                {/* Step type badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {lesson.stepTypes.map((type) => {
                    const info = STEP_TYPE_ICONS[type];
                    if (!info) return null;
                    const Icon = info.icon;
                    return (
                      <span
                        key={type}
                        className={`inline-flex items-center gap-1 rounded-md border border-ink-dark/5 bg-ink-dark/[0.02] px-2 py-0.5 text-[10px] font-semibold ${info.color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {type === "multi_choice"
                          ? "Quizzes"
                          : type === "read_respond"
                            ? "Cases"
                            : type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-green transition-all group-hover:gap-2.5">
                    Start lesson ({lesson.stepCount} steps)
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "Medical Italian for International Students",
              description:
                "Free interactive Italian language lessons for international medical students studying in Italy.",
              provider: {
                "@type": "Organization",
                name: "EnterMedSchool",
                url: "https://entermedschool.org",
              },
              educationalLevel: "Medical Student",
              inLanguage: ["it", "en"],
              isAccessibleForFree: true,
              hasCourseInstance: lessons.map((l) => ({
                "@type": "CourseInstance",
                name: `Lesson ${l.position + 1}: ${l.title}`,
                url: `${BASE_URL}/${locale}/resources/italian/${l.slug}`,
              })),
            }),
          }}
        />
      </div>
    </main>
  );
}
