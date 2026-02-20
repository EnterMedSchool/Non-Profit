import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Mail,
} from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  getCardByStableId,
  getCardsByDeck,
  getDeckBySlug,
  getDeckCategory,
  getCategoryBySlug,
  getAllCards,
  getAllDecks,
  isCategoryAncestor,
} from "@/lib/flashcard-data";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

function truncate(s: string, len: number): string {
  if (s.length <= len) return s;
  return s.slice(0, len - 3).trim() + "...";
}

export async function generateStaticParams() {
  const cards = getAllCards();
  const decks = getAllDecks();
  const deckById = new Map(decks.map((d) => [d.id, d]));
  const params: {
    categorySlug: string;
    deckSlug: string;
    cardId: string;
  }[] = [];

  for (const card of cards) {
    const deck = deckById.get(card.deckId);
    if (!deck) continue;
    const category = getDeckCategory(deck);
    if (!category) continue;
    params.push({
      categorySlug: category.slug,
      deckSlug: deck.slug,
      cardId: card.stableId,
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
    cardId: string;
  }>;
}) {
  const { locale, categorySlug, deckSlug, cardId } = await params;
  const card = getCardByStableId(cardId);
  const deck = getDeckBySlug(deckSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!card || !deck || !category) return { title: "Not Found" };

  if (deck.categoryId != null && !isCategoryAncestor(category.id, deck.categoryId))
    return { title: "Not Found" };

  const title = truncate(card.front, 60);
  const description = truncate(card.back, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/resources/flashcards/${categorySlug}/${deckSlug}/${cardId}`,
      type: "website",
      images: [{ url: ogImagePath("resources", "flashcards", categorySlug, deckSlug, cardId), width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/flashcards/${categorySlug}/${deckSlug}/${cardId}`,
    },
  };
}

export default async function CardFlashcardPage({
  params,
}: {
  params: Promise<{
    locale: string;
    categorySlug: string;
    deckSlug: string;
    cardId: string;
  }>;
}) {
  const { locale, categorySlug, deckSlug, cardId } = await params;

  const card = getCardByStableId(cardId);
  const deck = getDeckBySlug(deckSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!card || !deck || !category) notFound();

  if (deck.categoryId != null && !isCategoryAncestor(category.id, deck.categoryId)) notFound();

  const allDeckCards = getCardsByDeck(deck.id).sort(
    (a, b) => a.ordinal - b.ordinal
  );
  const currentIndex = allDeckCards.findIndex((c) => c.stableId === cardId);
  const prevCard =
    currentIndex > 0 ? allDeckCards[currentIndex - 1] : null;
  const nextCard =
    currentIndex >= 0 && currentIndex < allDeckCards.length - 1
      ? allDeckCards[currentIndex + 1]
      : null;

  const relatedCards = allDeckCards
    .filter((c) => c.stableId !== cardId)
    .slice(0, 5);

  const acceptedAnswerText = `${card.back} | Source: entermedschool.org`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: truncate(card.front, 60),
    about: { "@type": "Thing", name: category.name },
    educationalLevel: undefined,
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
    datePublished: card.createdAt,
    hasPart: [
      {
        "@type": "Question",
        eduQuestionType: "Flashcard",
        text: card.front,
        acceptedAnswer: {
          "@type": "Answer",
          text: acceptedAnswerText,
        },
      },
    ],
  };

  const t = await getTranslations({ locale, namespace: "resources.flashcards" });
  const basePath = `/${locale}/resources/flashcards/${categorySlug}/${deckSlug}`;

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
                {/* Card front */}
                <div className="border-b-2 border-ink-dark/10 bg-showcase-purple/[0.04] px-5 py-4">
                  <p
                    className="font-display text-lg font-bold text-ink-dark leading-relaxed"
                    data-speakable="question"
                  >
                    {card.front}
                  </p>
                </div>

                {/* Card back */}
                <div className="p-5">
                  <div
                    className="rounded-xl border-2 border-showcase-green/30 bg-showcase-green/10 px-4 py-3"
                    data-speakable="answer"
                  >
                    <p className="text-sm font-bold text-showcase-green mb-1">
                      {t("card.back")}
                    </p>
                    <p className="text-ink-dark leading-relaxed">
                      {card.back}
                    </p>
                    <p className="mt-2 text-xs text-ink-muted">
                      {t("card.source")}
                    </p>
                  </div>

                  {/* Hint */}
                  {card.hint && (
                    <div className="mt-5 rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10 px-4 py-3">
                      <p className="text-xs font-bold text-showcase-teal mb-1">
                        {t("card.hint")}
                      </p>
                      <p className="text-sm text-ink-dark leading-relaxed">
                        {card.hint}
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
                  {prevCard ? (
                    <Link
                      href={`${basePath}/${prevCard.stableId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-3 border-ink-dark bg-white px-4 py-2.5 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("card.prevCard")}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/20 bg-ink-dark/5 px-4 py-2.5 text-sm font-semibold text-ink-muted">
                      <ChevronLeft className="h-4 w-4" />
                      {t("card.prevCard")}
                    </span>
                  )}
                  {nextCard ? (
                    <Link
                      href={`${basePath}/${nextCard.stableId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-3 border-ink-dark bg-showcase-purple px-4 py-2.5 text-sm font-semibold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                    >
                      {t("card.nextCard")}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/20 bg-ink-dark/5 px-4 py-2.5 text-sm font-semibold text-ink-muted">
                      {t("card.nextCard")}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <a
                  href={`mailto:ari@entermedschool.com?subject=${encodeURIComponent(
                    t("card.reportSubject", { stableId: card.stableId })
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted transition-all hover:border-showcase-coral/30 hover:text-showcase-coral hover:shadow-chunky-sm"
                >
                  <Mail className="h-4 w-4" />
                  {t("card.reportIssue")}
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
                {t("card.backToDeck")} — {deck.title}
              </Link>
            </AnimatedSection>
          </div>

          {/* Sidebar: Related cards */}
          <div className="lg:col-span-1">
            <AnimatedSection delay={0.08} animation="slideRight">
              <div className="sticky top-24 rounded-2xl border-3 border-ink-dark bg-white p-5 shadow-chunky">
                <h3 className="font-display text-base font-bold text-ink-dark">
                  {t("deck.relatedResources")}
                </h3>
                <ul className="mt-4 flex flex-col gap-2">
                  {relatedCards.map((c) => (
                    <li key={c.stableId}>
                      <Link
                        href={`${basePath}/${c.stableId}`}
                        className="block rounded-xl border-2 border-ink-dark/20 bg-white px-3 py-2.5 text-sm font-medium text-ink-dark transition-all hover:border-showcase-purple/30 hover:bg-showcase-purple/5 hover:shadow-chunky-sm"
                      >
                        {truncate(c.front, 80)}
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
