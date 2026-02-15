import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import {
  HelpCircle,
  Brain,
  Sparkles,
  BookOpen,
  Shield,
  ChevronRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  getAllCategories,
  getDecksByCategory,
  getTotalQuestionCount,
  getTotalDeckCount,
  getRootCategories,
  getChildCategories,
} from "@/lib/practice-questions";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources.questions" });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const count = getTotalQuestionCount();
  const deckCount = getTotalDeckCount();
  return {
    title: t("title"),
    description: t("metaDescription", { count, deckCount }),
    openGraph: {
      title: t("title"),
      description: t("metaDescription", { count, deckCount }),
      url: `${BASE_URL}/${locale}/resources/questions`,
      type: "website",
      images: [{ url: ogImagePath("resources", "questions"), width: 1200, height: 630 }],
    },
    keywords: [
      "medical practice questions",
      "MCQ",
      "multiple choice",
      "medical exam preparation",
      "pre-med questions",
      "biology MCQ",
      "chemistry MCQ",
      "anatomy quiz",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/questions`,
      languages: {
        en: `${BASE_URL}/en/resources/questions`,
        "x-default": `${BASE_URL}/en/resources/questions`,
      },
    },
  };
}

/* ── Color palette for categories ───────────────────────────────── */
const CATEGORY_COLORS = [
  { bg: "bg-showcase-purple/10", text: "text-showcase-purple", border: "border-showcase-purple/20", shadow: "shadow-chunky-purple" },
  { bg: "bg-showcase-teal/10", text: "text-showcase-teal", border: "border-showcase-teal/20", shadow: "shadow-chunky-teal" },
  { bg: "bg-showcase-green/10", text: "text-showcase-green", border: "border-showcase-green/20", shadow: "shadow-chunky-green" },
  { bg: "bg-showcase-blue/10", text: "text-showcase-blue", border: "border-showcase-blue/20", shadow: "shadow-chunky-blue" },
  { bg: "bg-showcase-orange/10", text: "text-showcase-orange", border: "border-showcase-orange/20", shadow: "shadow-chunky-orange" },
  { bg: "bg-showcase-pink/10", text: "text-showcase-pink", border: "border-showcase-pink/20", shadow: "shadow-chunky-pink" },
  { bg: "bg-showcase-coral/10", text: "text-showcase-coral", border: "border-showcase-coral/20", shadow: "shadow-chunky-purple" },
  { bg: "bg-showcase-yellow/10", text: "text-showcase-yellow", border: "border-showcase-yellow/20", shadow: "shadow-chunky-yellow" },
];

const CATEGORY_ICONS: Record<string, string> = {
  biology: "🧬",
  chemistry: "⚗️",
  physics: "⚡",
  math: "📐",
  logic: "🧩",
  anatomy: "🦴",
  physiology: "❤️",
  biochemistry: "🔬",
  pharmacology: "💊",
  pathology: "🔍",
  microbiology: "🦠",
  immunology: "🛡️",
  genetics: "🧬",
  histology: "🔬",
  neuroscience: "🧠",
  default: "📚",
};

function getCategoryIcon(slug: string): string {
  // Try direct match, then try matching a keyword in the slug
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (slug.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

export default function QuestionsPage() {
  const t = useTranslations("resources.questions");
  const tc = useTranslations("common");
  const locale = useLocale();
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  const totalQuestions = getTotalQuestionCount();
  const totalDecks = getTotalDeckCount();
  const rootCategories = getRootCategories();

  // Build category data with counts
  const categoryData = rootCategories.map((cat) => {
    const directDecks = getDecksByCategory(cat.id);
    const children = getChildCategories(cat.id);
    let totalDeckCount = directDecks.length;
    let totalQuestionCount = directDecks.reduce((sum, d) => sum + d.questionCount, 0);

    for (const child of children) {
      const childDecks = getDecksByCategory(child.id);
      totalDeckCount += childDecks.length;
      totalQuestionCount += childDecks.reduce((sum, d) => sum + d.questionCount, 0);
    }

    return {
      ...cat,
      totalDeckCount,
      totalQuestionCount,
      childCount: children.length,
    };
  }).filter((c) => c.totalQuestionCount > 0)
    .sort((a, b) => b.totalQuestionCount - a.totalQuestionCount);

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
            url: `${BASE_URL}/${locale}/resources/questions`,
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
                url: `${BASE_URL}/${locale}/resources/questions/${cat.slug}`,
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
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-purple"
          subtitle={t("hero.subtitle", {
            count: totalQuestions,
            categoryCount: categoryData.length,
          })}
          floatingIcons={
            <>
              <HelpCircle
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Brain
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-blue/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
              <Sparkles
                className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-teal/15 animate-float-gentle"
                style={{ animationDelay: "2s" }}
              />
              <BookOpen
                className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-purple/15 animate-float-playful"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          }
        />

        {/* Stats bar */}
        <AnimatedSection delay={0.1} animation="scaleIn">
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-purple/20 bg-showcase-purple/5 px-4 py-2">
              <HelpCircle className="h-5 w-5 text-showcase-purple" />
              <span className="font-display font-bold text-ink-dark">
                {totalQuestions.toLocaleString()}
              </span>
              <span className="text-sm text-ink-muted">Questions</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-4 py-2">
              <Layers className="h-5 w-5 text-showcase-teal" />
              <span className="font-display font-bold text-ink-dark">
                {totalDecks}
              </span>
              <span className="text-sm text-ink-muted">Decks</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-showcase-green/20 bg-showcase-green/5 px-4 py-2">
              <BookOpen className="h-5 w-5 text-showcase-green" />
              <span className="font-display font-bold text-ink-dark">
                {categoryData.length}
              </span>
              <span className="text-sm text-ink-muted">Subjects</span>
            </div>
          </div>
        </AnimatedSection>

        {/* Attribution Reminder */}
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
                  href={`/${locale}/resources/questions/${cat.slug}`}
                  className={`group flex flex-col rounded-2xl border-3 border-ink-dark bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-chunky`}
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
                        <h2 className="font-display text-lg font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="mt-0.5 text-xs text-ink-light line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-ink-light group-hover:text-showcase-purple transition-colors mt-1" />
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg ${colors.bg} ${colors.text} px-2.5 py-1 text-xs font-semibold`}
                    >
                      <HelpCircle className="h-3 w-3" />
                      {cat.totalQuestionCount} questions
                    </span>
                    <span className="text-xs text-ink-light">
                      {cat.totalDeckCount} {cat.totalDeckCount === 1 ? "deck" : "decks"}
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
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pastel-lavender">
                <HelpCircle className="h-12 w-12 text-showcase-purple/40 animate-float-gentle" />
              </div>
              <p className="mt-6 font-handwritten text-2xl text-ink-muted">
                {t("emptyState.title")}
              </p>
              <p className="mt-2 text-sm text-ink-light max-w-sm">
                {t("emptyState.hint")}
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
