import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import PageHero from "@/components/shared/PageHero";
import BookCatalog from "@/components/pdf-viewer/BookCatalog";
import { pdfBooks } from "@/data/pdf-books";
import { getCollectionPageJsonLd, getBookJsonLd } from "@/lib/metadata";
import { ogImagePath } from "@/lib/og-path";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pdfViewer.catalog" });
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/resources/pdfs`,
      type: "website",
      images: [{ url: ogImagePath("resources", "pdfs"), width: 1200, height: 630 }],
    },
    keywords: [
      "free medical textbooks",
      "open source medical education",
      "biochemistry textbook",
      "medical study guides",
      "interactive PDF reader",
      "medical school notes",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/resources/pdfs`,
      languages: { en: `${BASE_URL}/en/resources/pdfs`, "x-default": `${BASE_URL}/en/resources/pdfs` },
    },
  };
}

export default function PdfsPage() {
  const t = useTranslations("pdfViewer.catalog");
  const locale = useLocale();
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd(
              t("jsonLd.title"),
              t("jsonLd.description"),
              `${BASE_URL}/${locale}/resources/pdfs`,
              locale,
            ),
          ),
        }}
      />
      {pdfBooks.map((book) => (
        <script
          key={book.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBookJsonLd(book, locale)),
          }}
        />
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHero
          titlePre={t("hero.titlePre")}
          titleHighlight={t("hero.titleHighlight")}
          titlePost={t("hero.titlePost")}
          gradient="from-showcase-purple via-showcase-teal to-showcase-green"
          meshColors={["bg-showcase-purple/30", "bg-showcase-teal/25", "bg-showcase-green/20"]}
          annotation={t("hero.annotation")}
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
        />

        {/* Book catalog */}
        <div className="mt-12">
          <BookCatalog />
        </div>
      </div>
    </main>
  );
}
