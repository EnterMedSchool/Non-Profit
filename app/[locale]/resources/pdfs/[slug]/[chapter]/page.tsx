import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  pdfBooks,
  getBookBySlug,
  getChapterBySlug,
  getAdjacentChapters,
} from "@/data/pdf-books";
import { getChapterJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";
import BookReader from "@/components/pdf-viewer/BookReader";

export async function generateStaticParams() {
  const params: { slug: string; chapter: string }[] = [];
  for (const book of pdfBooks) {
    for (const chapter of book.chapters) {
      params.push({ slug: book.slug, chapter: chapter.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; chapter: string }>;
}) {
  const { locale, slug, chapter: chapterSlug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return {};
  const chapter = getChapterBySlug(book, chapterSlug);
  if (!chapter) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const chapterUrl = `${BASE_URL}/${locale}/resources/pdfs/${slug}/${chapterSlug}`;
  const { prev, next } = getAdjacentChapters(book, chapterSlug);

  return {
    title: `${chapter.title} — ${book.title}`,
    description: chapter.description,
    openGraph: {
      title: `${chapter.title} — ${book.title}`,
      description: chapter.description,
      url: chapterUrl,
      type: "article",
      images: [{ url: ogImagePath("resources", "pdfs", slug, chapterSlug), width: 1200, height: 630 }],
    },
    keywords: chapter.keyTopics,
    alternates: {
      canonical: chapterUrl,
      languages: { en: `${BASE_URL}/en/resources/pdfs/${slug}/${chapterSlug}`, "x-default": `${BASE_URL}/en/resources/pdfs/${slug}/${chapterSlug}` },
      ...(prev ? { prev: `${BASE_URL}/${locale}/resources/pdfs/${slug}/${prev.slug}` } : {}),
      ...(next ? { next: `${BASE_URL}/${locale}/resources/pdfs/${slug}/${next.slug}` } : {}),
    },
  };
}

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; chapter: string }>;
}) {
  const { locale, slug, chapter: chapterSlug } = await params;
  const t = await getTranslations("pdfViewer.reader");
  const book = getBookBySlug(slug);
  if (!book) notFound();
  const chapter = getChapterBySlug(book, chapterSlug);
  if (!chapter) notFound();

  return (
    <>
      {/* JSON-LD structured data — server rendered for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getChapterJsonLd(book, chapter, locale)),
        }}
      />

      {/* SEO-friendly server-rendered content (hidden visually, available to crawlers) */}
      <noscript>
        <article className="mx-auto max-w-3xl px-4 py-12">
          <h1>
            {t("chapter")} {chapter.number}: {chapter.title} — {book.title}
          </h1>
          <p>{chapter.description}</p>
          {chapter.sections.map((section) => (
            <section key={section.id}>
              <h2>
                {section.number} {section.title}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </section>
          ))}
        </article>
      </noscript>

      {/* Interactive reader */}
      <BookReader book={book} chapter={chapter} />
    </>
  );
}
