import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getItalianLessonSlugs,
  getItalianLessonMeta,
  getItalianLesson,
} from "@/lib/italian-data";
import { LessonReader } from "@/components/italian/LessonReader";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateStaticParams() {
  return getItalianLessonSlugs().map((lessonSlug) => ({ lessonSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; lessonSlug: string }>;
}) {
  const { locale, lessonSlug } = await params;
  const meta = getItalianLessonMeta(lessonSlug);
  if (!meta) return { title: "Not Found" };

  const title = `${meta.title} — Medical Italian Lesson ${meta.position + 1}`;
  const description = meta.summary
    ? `Medical Italian lesson: ${meta.title}. "${meta.summary}" — ${meta.stepCount} interactive steps with dialogues, vocabulary, and quizzes.`
    : `Medical Italian Lesson ${meta.position + 1}: ${meta.title}. ${meta.stepCount} interactive steps for international medical students.`;
  const url = `${BASE_URL}/${locale}/resources/italian/${lessonSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article" as const,
      images: [
        {
          url: ogImagePath("resources", "italian", lessonSlug),
          width: 1200,
          height: 630,
        },
      ],
    },
    keywords: [
      "medical Italian",
      meta.title,
      "Italian medical vocabulary",
      "clinical Italian dialogue",
      "medical Italian lesson",
    ],
    alternates: {
      canonical: url,
    },
  };
}

export default async function ItalianLessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonSlug: string }>;
}) {
  const { locale, lessonSlug } = await params;
  const lesson = await getItalianLesson(lessonSlug);
  if (!lesson) notFound();

  return (
    <main className="relative z-10">
      {/* Breadcrumbs */}
      <div className="border-b-3 border-ink-dark/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-4 py-3 text-xs text-ink-muted">
          <Link
            href={`/${locale}/resources`}
            className="font-medium hover:text-showcase-purple"
          >
            Resources
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/${locale}/resources/italian`}
            className="font-medium hover:text-showcase-purple"
          >
            Medical Italian
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-ink-dark">{lesson.title}</span>
        </div>
      </div>

      <LessonReader lesson={lesson} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: `Medical Italian - Lesson ${lesson.position + 1}: ${lesson.title}`,
            description:
              lesson.summary ??
              `Interactive Medical Italian lesson with dialogues, vocabulary, and quizzes.`,
            provider: {
              "@type": "Organization",
              name: "EnterMedSchool",
              url: "https://entermedschool.org",
            },
            educationalLevel: "Medical Student",
            inLanguage: ["it", "en"],
            isAccessibleForFree: true,
            learningResourceType: [
              "lesson",
              "dialogue",
              "vocabulary",
              "quiz",
            ],
            url: `${BASE_URL}/${locale}/resources/italian/${lessonSlug}`,
          }),
        }}
      />
    </main>
  );
}
