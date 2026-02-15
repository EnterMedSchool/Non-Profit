import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  ArrowLeft,
} from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  getAllQuestions,
  getQuestionByStableId,
  getQuestionsByDeck,
  getDeckById,
  getDeckBySlug,
  getDeckCategory,
  getCategoryBySlug,
} from "@/lib/practice-questions";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

function truncate(s: string, len: number): string {
  if (s.length <= len) return s;
  return s.slice(0, len - 3).trim() + "...";
}

export async function generateStaticParams() {
  const questions = getAllQuestions();
  const params: { categorySlug: string; deckSlug: string; questionId: string }[] =
    [];

  for (const q of questions) {
    const deck = getDeckById(q.deckId);
    if (!deck) continue;
    const category = getDeckCategory(deck);
    if (!category) continue;
    params.push({
      categorySlug: category.slug,
      deckSlug: deck.slug,
      questionId: q.stableId,
    });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    categorySlug: string;
    deckSlug: string;
    questionId: string;
  }>;
}) {
  const { locale, categorySlug, deckSlug, questionId } = await params;
  const question = getQuestionByStableId(questionId);
  const deck = getDeckBySlug(deckSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!question || !deck || !category) return { title: "Not Found" };

  if (!deck.categoryIds.includes(category.id)) return { title: "Not Found" };

  const title = truncate(question.prompt, 60);
  const description =
    question.explanation ?? truncate(question.prompt, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/resources/questions/${categorySlug}/${deckSlug}/${questionId}`,
      type: "website",
      images: [{ url: ogImagePath("resources", "questions", categorySlug, deckSlug, questionId), width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/questions/${categorySlug}/${deckSlug}/${questionId}`,
    },
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{
    locale: string;
    categorySlug: string;
    deckSlug: string;
    questionId: string;
  }>;
}) {
  const { locale, categorySlug, deckSlug, questionId } = await params;

  const question = getQuestionByStableId(questionId);
  const deck = getDeckBySlug(deckSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!question || !deck || !category) notFound();

  if (!deck.categoryIds.includes(category.id)) notFound();

  const allDeckQuestions = getQuestionsByDeck(deck.id).sort(
    (a, b) => a.ordinal - b.ordinal
  );
  const currentIndex = allDeckQuestions.findIndex(
    (q) => q.stableId === questionId
  );
  const prevQuestion =
    currentIndex > 0 ? allDeckQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex >= 0 && currentIndex < allDeckQuestions.length - 1
      ? allDeckQuestions[currentIndex + 1]
      : null;

  const relatedQuestions = allDeckQuestions
    .filter((q) => q.stableId !== questionId)
    .slice(0, 5);

  const correctOption = question.options.find((o) => o.isCorrect);
  const wrongOptions = question.options.filter((o) => !o.isCorrect);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: truncate(question.prompt, 60),
    about: { "@type": "Thing", name: category.name },
    educationalLevel: question.difficulty ?? undefined,
    inLanguage: "en",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "EnterMedSchool.org",
      url: BASE_URL,
    },
    datePublished: question.createdAt,
    hasPart: [
      {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: question.prompt,
        acceptedAnswer: {
          "@type": "Answer",
          text: correctOption
            ? `${correctOption.label}: ${correctOption.body}${
                question.explanation ? `. ${question.explanation}` : ""
              }`
            : "",
        },
        suggestedAnswer: wrongOptions.map((o) => ({
          "@type": "Answer",
          text: `${o.label}: ${o.body}`,
        })),
      },
    ],
  };

  const t = await getTranslations("resources.questions");
  const basePath = `/${locale}/resources/questions/${categorySlug}/${deckSlug}`;

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="fadeUp">
              <div className="rounded-2xl border-3 border-ink-dark bg-white shadow-chunky overflow-hidden">
                {/* Question prompt */}
                <div className="border-b-2 border-ink-dark/10 bg-gradient-to-r from-showcase-purple/10 to-showcase-teal/10 px-5 py-4">
                  <p
                    className="font-display text-lg font-bold text-ink-dark leading-relaxed"
                    data-speakable="question"
                  >
                    {question.prompt}
                  </p>
                  {question.difficulty && (
                    <span className="mt-2 inline-block rounded-lg border border-ink-dark/20 bg-white/50 px-2.5 py-1 text-xs font-semibold text-ink-muted">
                      {question.difficulty}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="p-5">
                  <div className="flex flex-col gap-2">
                    {question.options.map((opt) => (
                      <div
                        key={opt.label}
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${
                          opt.isCorrect
                            ? "border-showcase-green bg-showcase-green/10"
                            : "border-ink-dark/20 bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            opt.isCorrect
                              ? "bg-showcase-green text-white"
                              : "bg-ink-dark/10 text-ink-muted"
                          }`}
                        >
                          {opt.isCorrect ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            opt.label
                          )}
                        </span>
                        <span className="text-sm font-medium text-ink-dark">
                          {opt.body}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div
                      className="mt-5 rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10 px-4 py-3"
                      data-speakable="explanation"
                    >
                      <p className="text-xs font-bold text-showcase-teal mb-1">
                        {t("question.explanation")}
                      </p>
                      <p className="text-sm text-ink-dark leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>

            {/* Navigation & Report */}
            <AnimatedSection delay={0.05} animation="fadeUp">
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {prevQuestion ? (
                    <Link
                      href={`${basePath}/${prevQuestion.stableId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-3 border-ink-dark bg-white px-4 py-2.5 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("question.prevQuestion")}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/20 bg-ink-dark/5 px-4 py-2.5 text-sm font-semibold text-ink-muted">
                      <ChevronLeft className="h-4 w-4" />
                      {t("question.prevQuestion")}
                    </span>
                  )}
                  {nextQuestion ? (
                    <Link
                      href={`${basePath}/${nextQuestion.stableId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-3 border-ink-dark bg-showcase-purple px-4 py-2.5 text-sm font-semibold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                    >
                      {t("question.nextQuestion")}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/20 bg-ink-dark/5 px-4 py-2.5 text-sm font-semibold text-ink-muted">
                      {t("question.nextQuestion")}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <a
                  href={`mailto:ari@entermedschool.com?subject=${encodeURIComponent(
                    t("question.reportSubject", { stableId: question.stableId })
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted transition-all hover:border-showcase-coral/30 hover:text-showcase-coral hover:shadow-chunky-sm"
                >
                  <Mail className="h-4 w-4" />
                  Report
                </a>
              </div>
            </AnimatedSection>

            {/* Back to deck */}
            <AnimatedSection delay={0.1} animation="fadeUp">
              <Link
                href={basePath}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-showcase-purple hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("question.backToDeck")} — {deck.title}
              </Link>
            </AnimatedSection>

            {/* Attribution footer */}
            <p className="mt-8 text-sm text-ink-muted">
              Source: entermedschool.org
            </p>
          </div>

          {/* Sidebar: Related questions */}
          <div className="lg:col-span-1">
            <AnimatedSection delay={0.08} animation="slideRight">
              <div className="sticky top-24 rounded-2xl border-3 border-ink-dark bg-white p-5 shadow-chunky">
                <h3 className="font-display text-base font-bold text-ink-dark">
                  {t("deck.relatedQuestions")}
                </h3>
                <ul className="mt-4 flex flex-col gap-2">
                  {relatedQuestions.map((q) => (
                    <li key={q.stableId}>
                      <Link
                        href={`${basePath}/${q.stableId}`}
                        className="block rounded-xl border-2 border-ink-dark/20 bg-white px-3 py-2.5 text-sm font-medium text-ink-dark transition-all hover:border-showcase-purple/30 hover:bg-showcase-purple/5 hover:shadow-chunky-sm"
                      >
                        {truncate(q.prompt, 80)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </main>
  );
}
