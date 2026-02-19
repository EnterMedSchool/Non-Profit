import { getTranslations } from "next-intl/server";
import {
  HelpCircle,
  ChevronRight,
  BookOpen,
  Shield,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  getCategoryBySlug,
  getDecksByCategory,
  getChildCategories,
  getCategoryBreadcrumb,
  getAllCategories,
  getDeckDominantDifficulty,
  getDeckCategory,
} from "@/lib/practice-questions";
import type { PracticeQuestionDeck } from "@/types/practice-questions";
import { ogImagePath } from "@/lib/og-path";

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ categorySlug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
}) {
  const { locale, categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Not Found" };

  const t = await getTranslations({ locale, namespace: "resources.questions" });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const decks = getDecksByCategory(category.id);
  const questionCount = decks.reduce((sum, d) => sum + d.questionCount, 0);

  const title = `${category.name} | ${t("category.decksTitle")}`;
  const description = t("category.metaDescription", {
    name: category.name,
    count: questionCount,
    deckCount: decks.length,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/resources/questions/${categorySlug}`,
      type: "website",
      images: [{ url: ogImagePath("resources", "questions", categorySlug), width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/questions/${categorySlug}`,
    },
  };
}

/* ── Color palette for decks ───────────────────────────────────────── */
const DECK_COLORS = [
  { bg: "bg-showcase-purple/10", text: "text-showcase-purple", border: "border-showcase-purple/20", shadow: "shadow-chunky-purple" },
  { bg: "bg-showcase-teal/10", text: "text-showcase-teal", border: "border-showcase-teal/20", shadow: "shadow-chunky-teal" },
  { bg: "bg-showcase-green/10", text: "text-showcase-green", border: "border-showcase-green/20", shadow: "shadow-chunky-green" },
  { bg: "bg-showcase-blue/10", text: "text-showcase-blue", border: "border-showcase-blue/20", shadow: "shadow-chunky-blue" },
  { bg: "bg-showcase-orange/10", text: "text-showcase-orange", border: "border-showcase-orange/20", shadow: "shadow-chunky-orange" },
  { bg: "bg-showcase-pink/10", text: "text-showcase-pink", border: "border-showcase-pink/20", shadow: "shadow-chunky-pink" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-showcase-green/15 text-showcase-green border-showcase-green/30",
  medium: "bg-showcase-orange/15 text-showcase-orange border-showcase-orange/30",
  hard: "bg-showcase-coral/15 text-showcase-coral border-showcase-coral/30",
};

function getDifficultyKey(d: string): string {
  const lower = d.toLowerCase();
  return DIFFICULTY_COLORS[lower] ? lower : "medium";
}

export default async function CategoryQuestionsPage({
  params,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
}) {
  const { locale, categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) notFound();

  const decks = getDecksByCategory(category.id);
  const childCategories = getChildCategories(category.id);
  const breadcrumb = getCategoryBreadcrumb(category.id);
  const questionCount = decks.reduce((sum, d) => sum + d.questionCount, 0);
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  const t = await getTranslations({ locale, namespace: "resources.questions" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD CollectionPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.name} - Practice Questions`,
            description: category.description ?? `Practice questions for ${category.name}`,
            url: `${BASE_URL}/${locale}/resources/questions/${categorySlug}`,
            inLanguage: locale,
            isAccessibleForFree: true,
            provider: {
              "@type": "Organization",
              name: "EnterMedSchool.org",
              url: BASE_URL,
            },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: decks.length,
              itemListElement: decks.map((deck, i) => {
                const deckCatSlug = getDeckCategory(deck)?.slug ?? categorySlug;
                return {
                  "@type": "ListItem",
                  position: i + 1,
                  name: deck.title,
                  url: `${BASE_URL}/${locale}/resources/questions/${deckCatSlug}/${deck.slug}`,
                };
              }),
            },
          }),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <AnimatedSection delay={0} animation="fadeIn">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <li>
                <Link
                  href={`/${locale}/resources/questions`}
                  className="hover:text-showcase-purple hover:underline transition-colors"
                >
                  {t("category.backToAll")}
                </Link>
              </li>
              {breadcrumb.map((cat) => (
                <li key={cat.id} className="flex items-center gap-x-2">
                  <ChevronRight className="h-4 w-4 text-ink-light flex-shrink-0" />
                  {cat.id === category.id ? (
                    <span className="font-semibold text-ink-dark">{cat.name}</span>
                  ) : (
                    <Link
                      href={`/${locale}/resources/questions/${cat.slug}`}
                      className="hover:text-showcase-purple hover:underline transition-colors"
                    >
                      {cat.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </AnimatedSection>

        {/* Hero */}
        <PageHero
          titleHighlight={category.name}
          gradient="from-showcase-purple via-showcase-teal to-showcase-green"
          subtitle={category.description ?? undefined}
          annotation={`${t("category.questionsCount", { count: questionCount })} · ${t("category.decksCount", { count: decks.length })}`}
        />

        {/* Subcategories (child categories) */}
        {childCategories.length > 0 && (
          <AnimatedSection delay={0.05} animation="scaleIn">
            <div className="mt-8">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-dark">
                {t("category.subCategoriesTitle")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {childCategories.map((child) => (
                  <Link
                    key={child.id}
                    href={`/${locale}/resources/questions/${child.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-dark bg-white px-4 py-2.5 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-purple"
                  >
                    {child.icon && (
                      <span className="text-lg" aria-hidden>
                        {child.icon}
                      </span>
                    )}
                    <span className="font-display font-semibold text-ink-dark">
                      {child.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-light" />
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Attribution */}
        <div className="mt-8 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>
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

        {/* Decks grid */}
        <div className="mt-10">
          <h2 className="mb-5 font-display text-xl font-bold text-ink-dark">
            {t("category.decksTitle")}
          </h2>

          {decks.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck, i) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  categorySlug={categorySlug}
                  locale={locale}
                  colorIndex={i % DECK_COLORS.length}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <AnimatedSection animation="scaleIn">
              <div className="flex flex-col items-center rounded-2xl border-3 border-ink-dark border-dashed bg-white/50 py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-lavender">
                  <BookOpen className="h-10 w-10 text-showcase-purple/40" />
                </div>
                <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                  {t("category.emptyDecks")}
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Deck card component ──────────────────────────────────────────── */
function DeckCard({
  deck,
  categorySlug,
  locale,
  colorIndex,
  t,
}: {
  deck: PracticeQuestionDeck;
  categorySlug: string;
  locale: string;
  colorIndex: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const colors = DECK_COLORS[colorIndex];
  const difficulty = getDeckDominantDifficulty(deck.id);
  const difficultyKey = difficulty ? getDifficultyKey(difficulty) : null;
  const displayTags = deck.tags.filter((tag) => !tag.startsWith("difficulty:"));
  const deckCategorySlug = getDeckCategory(deck)?.slug ?? categorySlug;

  return (
    <AnimatedSection delay={colorIndex * 0.04} animation="rotateIn">
      <Link
        href={`/${locale}/resources/questions/${deckCategorySlug}/${deck.slug}`}
        className={`group flex flex-col rounded-2xl border-3 border-ink-dark bg-white p-5 shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-ink-dark group-hover:text-showcase-purple transition-colors line-clamp-2">
              {deck.title}
            </h3>
            {deck.description && (
              <p className="mt-1.5 text-sm text-ink-muted line-clamp-2">
                {deck.description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink-light group-hover:text-showcase-purple transition-colors mt-1" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg ${colors.bg} ${colors.text} px-2.5 py-1 text-xs font-semibold border border-current/20`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {t("category.questionsCount", { count: deck.questionCount })}
          </span>
          {difficultyKey && (
            <span
              className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_COLORS[difficultyKey]}`}
            >
              {t(`deck.${difficultyKey}`)}
            </span>
          )}
        </div>

        {displayTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {displayTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg border border-ink-dark/20 bg-ink-dark/5 px-2 py-0.5 text-xs text-ink-muted"
              >
                <Tag className="h-3 w-3" />
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        )}
      </Link>
    </AnimatedSection>
  );
}
