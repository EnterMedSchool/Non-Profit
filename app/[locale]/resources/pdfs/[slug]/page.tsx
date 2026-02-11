import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import BookHero from "@/components/pdf-viewer/BookHero";
import EducatorCTA from "@/components/pdf-viewer/EducatorCTA";
import AttributionGuide from "@/components/pdf-viewer/AttributionGuide";
import { pdfBooks, getBookBySlug } from "@/data/pdf-books";
import { getBookJsonLd } from "@/lib/metadata";

export async function generateStaticParams() {
  return pdfBooks.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return {
    title: `${book.title} — Free Medical Textbook`,
    description: book.description,
    openGraph: {
      title: `${book.title} — Free Medical Textbook`,
      description: book.description,
      url: `${BASE_URL}/${locale}/resources/pdfs/${slug}`,
      type: "website",
      images: [
        {
          url: `${BASE_URL}${book.coverImage}`,
          width: 400,
          height: 520,
          alt: book.title,
        },
      ],
    },
    keywords: book.tags,
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/pdfs/${slug}`,
      languages: { en: `${BASE_URL}/en/resources/pdfs/${slug}`, "x-default": `${BASE_URL}/en/resources/pdfs/${slug}` },
    },
  };
}

export default async function BookOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBookJsonLd(book, locale)),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Book hero */}
        <BookHero book={book} />

        {/* Chapters list */}
        <AnimatedSection animation="fadeUp" delay={0.2}>
          <section className="mt-16">
            <h2 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
              Chapters
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Click any chapter to start reading online with interactive tools.
            </p>

            <div className="mt-6 space-y-3">
              {book.chapters.map((chapter, i) => (
                <AnimatedSection
                  key={chapter.id}
                  delay={0.1 + i * 0.05}
                  animation="fadeUp"
                >
                  <Link
                    href={`/${locale}/resources/pdfs/${book.slug}/${chapter.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border-3 border-showcase-navy/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-chunky-sm"
                  >
                    {/* Chapter number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-showcase-purple/10 font-display text-sm font-bold text-showcase-purple transition-colors group-hover:bg-showcase-purple group-hover:text-white">
                      {chapter.number}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base font-bold text-ink-dark group-hover:text-showcase-purple">
                        {chapter.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                        {chapter.description}
                      </p>

                      {/* Key topics */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {chapter.keyTopics.slice(0, 4).map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-ink-muted"
                          >
                            {topic}
                          </span>
                        ))}
                        {chapter.keyTopics.length > 4 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-ink-light">
                            +{chapter.keyTopics.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-light">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {chapter.estimatedReadTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {chapter.sections.length} sections
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-ink-light transition-colors group-hover:text-showcase-purple" />
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Educator CTA */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="mt-16">
            <EducatorCTA book={book} locale={locale} />
          </div>
        </AnimatedSection>

        {/* Attribution Guide */}
        <AnimatedSection animation="fadeUp" delay={0.4}>
          <div className="mt-8">
            <AttributionGuide book={book} />
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
