import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield, Layers, ChevronRight, Clock } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import FlashcardStudy from "@/components/resources/flashcards/FlashcardStudy";
import DeckDownloadPanel from "@/components/resources/DeckDownloadPanel";
import EmbedCodePanel from "@/components/resources/EmbedCodePanel";
import {
  getAllDecks,
  getDeckBySlug,
  getDeckCategory,
  getCardsByDeck,
  getCategoryBySlug,
  getCategoryBreadcrumb,
  isCategoryAncestor,
} from "@/lib/flashcard-data";
import { ogImagePath } from "@/lib/og-path";
import { flashcardPdfUrl } from "@/lib/blob-url";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-showcase-green/15 text-showcase-green border-showcase-green/30",
  intermediate:
    "bg-showcase-orange/15 text-showcase-orange border-showcase-orange/30",
  medium: "bg-showcase-orange/15 text-showcase-orange border-showcase-orange/30",
  hard: "bg-showcase-coral/15 text-showcase-coral border-showcase-coral/30",
};

function getDifficultyKey(d: string): string {
  const lower = d?.toLowerCase() ?? "";
  return DIFFICULTY_COLORS[lower] ? lower : "intermediate";
}

export async function generateStaticParams() {
  const decks = getAllDecks();
  return decks
    .map((deck) => {
      const category = getDeckCategory(deck);
      if (!category) return null;
      return { categorySlug: category.slug, deckSlug: deck.slug };
    })
    .filter(
      (p): p is { categorySlug: string; deckSlug: string } => p !== null
    );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categorySlug: string; deckSlug: string }>;
}) {
  const { locale, categorySlug, deckSlug } = await params;
  const deck = getDeckBySlug(deckSlug);
  const category = getCategoryBySlug(categorySlug);
  if (!deck || !category) return { title: "Not Found" };

  if (deck.categoryId != null && !isCategoryAncestor(category.id, deck.categoryId))
    return { title: "Not Found" };

  const t = await getTranslations({
    locale,
    namespace: "resources.flashcards",
  });
  const title = `${deck.title} — ${deck.cardCount} ${
    deck.cardCount === 1 ? "card" : "cards"
  }`;
  const description =
    deck.description ??
    t("deck.metaDescription", {
      title: deck.title,
      count: deck.cardCount,
    });

  const pdfUrl = flashcardPdfUrl(categorySlug, deckSlug);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/resources/flashcards/${categorySlug}/${deckSlug}`,
      type: "website",
      images: [{ url: ogImagePath("resources", "flashcards", categorySlug, deckSlug), width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/flashcards/${categorySlug}/${deckSlug}`,
      types: {
        "application/pdf": pdfUrl,
      },
    },
  };
}

export default async function DeckFlashcardsPage({
  params,
}: {
  params: Promise<{
    locale: string;
    categorySlug: string;
    deckSlug: string;
  }>;
}) {
  const { locale, categorySlug, deckSlug } = await params;

  const category = getCategoryBySlug(categorySlug);
  const deck = getDeckBySlug(deckSlug);

  if (!category || !deck) notFound();

  if (deck.categoryId != null && !isCategoryAncestor(category.id, deck.categoryId)) notFound();

  const cards = getCardsByDeck(deck.id).sort((a, b) => a.ordinal - b.ordinal);
  const breadcrumb = getCategoryBreadcrumb(category.id);

  const t = await getTranslations({ locale, namespace: "resources.flashcards" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const difficultyKey = deck.difficultyLevel
    ? getDifficultyKey(deck.difficultyLevel)
    : null;

  const fcPdfUrl = flashcardPdfUrl(categorySlug, deck.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: deck.title,
    description: deck.description ?? `Flashcard deck: ${deck.title}`,
    url: `${BASE_URL}/${locale}/resources/flashcards/${categorySlug}/${deckSlug}`,
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
    educationalLevel: deck.difficultyLevel ?? undefined,
    about: { "@type": "Thing", name: category.name },
    numberOfItems: cards.length,
    associatedMedia: [
      {
        "@type": "MediaObject",
        name: `${deck.title} — Printable Flashcards PDF`,
        description: `Print-and-cut flashcards with ${cards.length} cards on ${category.name}. Double-sided layout for easy studying. Free PDF from EnterMedSchool.org.`,
        contentUrl: fcPdfUrl,
        encodingFormat: "application/pdf",
      },
    ],
    hasPart: cards.map((c) => ({
      "@type": "Question",
      eduQuestionType: "Flashcard",
      text: c.front,
    })),
  };

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <AnimatedSection delay={0} animation="fadeIn">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <li>
                <Link
                  href={`/${locale}/resources/flashcards`}
                  className="transition-colors hover:text-showcase-purple hover:underline"
                >
                  {t("category.backToAll")}
                </Link>
              </li>
              {breadcrumb.map((cat) => (
                <li key={cat.id} className="flex items-center gap-x-2">
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-light" />
                  <Link
                    href={`/${locale}/resources/flashcards/${cat.slug}`}
                    className="transition-colors hover:text-showcase-purple hover:underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-light" />
                <span className="font-semibold text-ink-dark">{deck.title}</span>
              </li>
            </ol>
          </nav>
        </AnimatedSection>

        {/* Attribution reminder — top of page */}
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-showcase-teal/20 bg-white px-5 py-3.5">
          <Shield className="h-5 w-5 flex-shrink-0 text-showcase-teal" />
          <span className="text-sm text-ink-muted">
            {tc("licenseNote")}{" "}
            <Link
              href={`/${locale}/license`}
              className="font-semibold text-showcase-purple hover:underline"
            >
              {tc("attributionRequiredLink")}
            </Link>
            .
          </span>
        </div>

        {/* Hero with stats */}
        <PageHero
          titleHighlight={deck.title}
          gradient="from-showcase-purple via-showcase-teal to-showcase-green"
          subtitle={deck.description ?? undefined}
          annotation={`${deck.cardCount} ${
            deck.cardCount === 1 ? "card" : "cards"
          }`}
          annotationColor="text-showcase-teal"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-purple/10 px-4 py-2 shadow-chunky-sm">
              <Layers className="h-5 w-5 text-showcase-purple" />
              <span className="font-display font-bold text-ink-dark">
                {deck.cardCount}
              </span>
              <span className="text-sm text-ink-muted">
                {deck.cardCount === 1 ? "card" : "cards"}
              </span>
            </div>
            {difficultyKey && (
              <span
                className={`inline-flex items-center rounded-xl border-3 border-ink-dark px-4 py-2 text-sm font-semibold shadow-chunky-sm ${DIFFICULTY_COLORS[difficultyKey]}`}
              >
                {t(`deck.${difficultyKey}`)}
              </span>
            )}
            {deck.estimatedMinutes != null && (
              <div className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-showcase-teal/10 px-4 py-2 shadow-chunky-sm">
                <Clock className="h-5 w-5 text-showcase-teal" />
                <span className="text-sm text-ink-muted">
                  {t("deck.estimatedTime", { minutes: deck.estimatedMinutes })}
                </span>
              </div>
            )}
          </div>
        </PageHero>

        {/* Flashcard study */}
        <AnimatedSection delay={0.1} animation="fadeUp">
          <div className="mt-8">
            <FlashcardStudy
              cards={cards}
              deckTitle={deck.title}
              locale={locale}
            />
          </div>
        </AnimatedSection>

        {/* Download & Embed panels */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <AnimatedSection delay={0.15} animation="fadeUp">
            <DeckDownloadPanel
              type="flashcards"
              deckTitle={deck.title}
              deckSlug={deck.slug}
              items={cards.map((c) => ({
                front: c.front,
                back: c.back,
                explanation: c.explanation,
                stableId: c.stableId,
                ordinal: c.ordinal,
              }))}
              pdfFlashcardsUrl={flashcardPdfUrl(categorySlug, deck.slug)}
            />
          </AnimatedSection>
          <AnimatedSection delay={0.2} animation="fadeUp">
            <EmbedCodePanel
              type="flashcards"
              title={deck.title}
              embedData={{
                title: deck.title,
                cards: cards.slice(0, 30).map((c) => ({
                  front: c.front,
                  back: c.back,
                })),
              }}
            />
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}
