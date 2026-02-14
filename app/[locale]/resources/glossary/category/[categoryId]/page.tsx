import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  glossaryTags,
  getCategoryById,
  getTermsByCategory,
  getAllCategorySlugs,
  glossaryCategories,
} from "@/data/glossary-terms";
import { getGlossaryCategoryJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import GlossaryTermCard from "@/components/glossary/GlossaryTermCard";

interface Props {
  params: Promise<{ locale: string; categoryId: string }>;
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((categoryId) => ({ categoryId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) return {};

  const terms = getTermsByCategory(categoryId);
  const topTerms = terms.slice(0, 4).map((t) => t.names[0]);
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return {
    title: `${category.name} Terms — ${category.count} Medical Definitions | EnterMedSchool Glossary`,
    description: `Explore ${category.count} ${category.name.toLowerCase()} terms including ${topTerms.join(", ")} & more. Free definitions, mnemonics & clinical cases for medical students.`,
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/glossary/category/${categoryId}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/resources/glossary/category/${categoryId}`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/resources/glossary/category/${categoryId}`,
      },
    },
    openGraph: {
      title: `${category.name} Medical Terms — ${category.count} Definitions`,
      description: `${category.count} ${category.name.toLowerCase()} terms with definitions, clinical cases & study guides.`,
      url: `${BASE_URL}/${locale}/resources/glossary/category/${categoryId}`,
      siteName: "EnterMedSchool.org",
    },
  };
}

export default async function GlossaryCategoryPage({ params }: Props) {
  const { locale, categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const terms = getTermsByCategory(categoryId);
  const schemas = getGlossaryCategoryJsonLd(
    category,
    terms.map((t) => ({ id: t.id, name: t.names[0] })),
    locale,
  );

  // Related categories (those that share terms via tags)
  const relatedCategoryIds = new Set<string>();
  for (const term of terms) {
    for (const tag of term.tags) {
      if (tag !== categoryId) relatedCategoryIds.add(tag);
    }
  }
  const relatedCategories = glossaryCategories.filter((c) =>
    relatedCategoryIds.has(c.id),
  ).slice(0, 6);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="relative z-10 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-showcase-purple transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/${locale}/resources`} className="hover:text-showcase-purple transition-colors">Resources</Link>
            <span>/</span>
            <Link href={`/${locale}/resources/glossary`} className="hover:text-showcase-purple transition-colors">Glossary</Link>
            <span>/</span>
            <span className="font-semibold text-ink-dark">{category.name}</span>
          </nav>

          <Link
            href={`/${locale}/resources/glossary`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Glossary
          </Link>

          {/* Hero */}
          <header className="mb-10">
            <div
              className="mb-4 h-1.5 w-full rounded-full"
              style={{ backgroundColor: category.accent }}
            />
            <div className="flex items-center gap-4">
              <span className="text-5xl">{category.icon}</span>
              <div>
                <h1 className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
                  {category.name} Medical Terms
                </h1>
                <p className="mt-1 text-lg text-ink-muted">
                  <span className="font-bold" style={{ color: category.accent }}>
                    {category.count}
                  </span>{" "}
                  terms in {category.name.toLowerCase()}
                </p>
              </div>
            </div>
          </header>

          {/* Term Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map((term) => (
              <GlossaryTermCard
                key={term.id}
                term={term}
                tags={glossaryTags}
                locale={locale}
              />
            ))}
          </div>

          {/* Related Categories */}
          {relatedCategories.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-ink-dark">
                Related Categories
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {relatedCategories.map((rc) => (
                  <Link
                    key={rc.id}
                    href={`/${locale}/resources/glossary/category/${rc.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-2 text-sm font-semibold shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                    style={{ borderColor: `${rc.accent}30`, color: rc.accent }}
                  >
                    <span>{rc.icon}</span>
                    {rc.name}
                    <span className="text-xs text-ink-muted">({rc.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
