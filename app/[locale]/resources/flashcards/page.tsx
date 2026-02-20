import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import {
  BookOpen,
  Layers,
  Brain,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  getRootCategories,
  getDecksByCategory,
  getTotalCardCount,
  getTotalDeckCount,
  getChildCategories,
} from "@/lib/flashcard-data";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "resources.flashcards",
  });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const count = getTotalCardCount();
  const deckCount = getTotalDeckCount();
  return {
    title: t("title"),
    description: t("metaDescription", { count, deckCount }),
    openGraph: {
      title: t("title"),
      description: t("metaDescription", { count, deckCount }),
      url: `${BASE_URL}/${locale}/resources/flashcards`,
      type: "website",
      images: [{ url: ogImagePath("resources", "flashcards"), width: 1200, height: 630 }],
    },
    keywords: [
      "medical flashcards",
      "Anki flashcards",
      "medical exam prep",
      "pre-med flashcards",
      "biology flashcards",
      "chemistry flashcards",
      "free medical study cards",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/flashcards`,
      languages: {
        en: `${BASE_URL}/en/resources/flashcards`,
        "x-default": `${BASE_URL}/en/resources/flashcards`,
      },
    },
  };
}

/* ── Color palette for flashcard categories ──────────────────────────── */
const CATEGORY_COLORS = [
  { bg: "bg-showcase-teal/10", text: "text-showcase-teal" },
  { bg: "bg-showcase-green/10", text: "text-showcase-green" },
  { bg: "bg-showcase-purple/10", text: "text-showcase-purple" },
  { bg: "bg-showcase-blue/10", text: "text-showcase-blue" },
  { bg: "bg-showcase-orange/10", text: "text-showcase-orange" },
  { bg: "bg-showcase-pink/10", text: "text-showcase-pink" },
];

const CATEGORY_ICONS: Record<string, string> = {
  biology: "🧬",
  chemistry: "⚗️",
  physics: "⚡",
  math: "📐",
  logic: "🧩",
  default: "📚",
};

function getCategoryIcon(slug: string): string {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key !== "default" && slug.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

export default function FlashcardsPage() {
  const t = useTranslations("resources.flashcards");
  const tc = useTranslations("common");
  const locale = useLocale();
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  const totalCards = getTotalCardCount();
  const totalDecks = getTotalDeckCount();
  const rootCategories = getRootCategories();

  // Build category data with counts (getDecksByCategory walks the full subtree)
  const categoryData = rootCategories
    .map((cat) => {
      const allDecks = getDecksByCategory(cat.id);
      const children = getChildCategories(cat.id);

      return {
        ...cat,
        totalDeckCount: allDecks.length,
        totalCardCount: allDecks.reduce((sum, d) => sum + d.cardCount, 0),
        childCount: children.length,
      };
    })
    .filter((c) => c.totalCardCount > 0)
    .sort((a, b) => b.totalCardCount - a.totalCardCount);

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("jsonLd.title"),
            description: t("jsonLd.description"),
            url: `${BASE_URL}/${locale}/resources/flashcards`,
            inLanguage: locale,
            isAccessibleForFree: true,
            provider: {
              "@type": "Organization",
              name: "EnterMedSchool.org",
              url: BASE_URL,
            },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: categoryData.length,
              itemListElement: categoryData.map((cat, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: cat.name,
                url: `${BASE_URL}/${locale}/resources/flashcards/${cat.slug}`,
              })),
            },
          }),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("hero.subtitle", {
            count: totalCards,
            categoryCount: categoryData.length,
          })}
          meshColors={[
            "bg-showcase-teal/30",
            "bg-showcase-green/25",
            "bg-showcase-purple/20",
          ]}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-teal/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-showcase-teal" />
              <span className="font-display font-bold text-ink-dark">
                {totalCards.toLocaleString()}
              </span>
              <span className="text-sm text-ink-muted">Cards</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-green/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
              <Layers className="h-5 w-5 text-showcase-green" />
              <span className="font-display font-bold text-ink-dark">
                {totalDecks}
              </span>
              <span className="text-sm text-ink-muted">Decks</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-purple/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
              <Brain className="h-5 w-5 text-showcase-purple" />
              <span className="font-display font-bold text-ink-dark">
                {categoryData.length}
              </span>
              <span className="text-sm text-ink-muted">Categories</span>
            </div>
          </div>
        </PageHero>

        {/* Attribution Reminder */}
        <div className="mt-8 flex items-center gap-2 rounded-2xl border border-showcase-teal/20 bg-white px-5 py-3.5 text-sm text-ink-muted">
          <Shield className="h-4 w-4 flex-shrink-0 text-showcase-teal" />
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

        {/* Category grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryData.map((cat, i) => {
            const colorIdx = i % CATEGORY_COLORS.length;
            const colors = CATEGORY_COLORS[colorIdx];
            const icon = getCategoryIcon(cat.slug);

            return (
              <AnimatedSection
                key={cat.id}
                delay={i * 0.04}
                animation="rotateIn"
              >
                <Link
                  href={`/${locale}/resources/flashcards/${cat.slug}`}
                  className="group flex flex-col rounded-2xl border-3 border-ink-dark bg-white p-5 shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky"
                >
                  {/* Category header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} text-2xl`}
                      >
                        {icon}
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-ink-dark transition-colors group-hover:text-showcase-purple">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-ink-light">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 text-ink-light transition-colors group-hover:text-showcase-purple" />
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg ${colors.bg} ${colors.text} px-2.5 py-1 text-xs font-semibold`}
                    >
                      <BookOpen className="h-3 w-3" />
                      {cat.totalCardCount} cards
                    </span>
                    <span className="text-xs text-ink-light">
                      {cat.totalDeckCount}{" "}
                      {cat.totalDeckCount === 1 ? "deck" : "decks"}
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        {categoryData.length === 0 && (
          <AnimatedSection animation="scaleIn">
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-showcase-purple/[0.06]">
                <BookOpen className="h-12 w-12 animate-float-gentle text-showcase-purple/40" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                {t("emptyState.title")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-ink-light">
                {t("emptyState.hint")}
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
