import { notFound } from "next/navigation";
import { getItalianLesson, getItalianLessonSlugs } from "@/lib/italian-data";
import { LessonReader } from "@/components/italian/LessonReader";
import EmbedAttribution from "@/components/embed/EmbedAttribution";

export async function generateStaticParams() {
  return getItalianLessonSlugs().map((lessonSlug) => ({ lessonSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  return {
    title: `Medical Italian Lesson — EnterMedSchool`,
    robots: { index: false, follow: false },
    other: { "X-Frame-Options": "" },
    description: `Embeddable Medical Italian lesson: ${lessonSlug}`,
  };
}

export default async function EmbedItalianLessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = await getItalianLesson(lessonSlug);
  if (!lesson) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1">
        <LessonReader lesson={lesson} embed />
      </div>
      <EmbedAttribution
        lessonTitle={`Medical Italian: ${lesson.title}`}
        lessonUrl={`https://entermedschool.org/en/resources/italian/${lessonSlug}`}
        theme="light"
        accentColor="10B981"
      />
    </div>
  );
}
