import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, FileText } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import BookCatalog from "@/components/pdf-viewer/BookCatalog";
import { pdfBooks } from "@/data/pdf-books";
import { getCollectionPageJsonLd, getBookJsonLd } from "@/lib/metadata";

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
              "Interactive Textbooks & Study Guides",
              "Free, open-source medical textbooks with interactive reading tools, highlighting, and chapter downloads.",
              `${BASE_URL}/en/resources/pdfs`,
            ),
          ),
        }}
      />
      {pdfBooks.map((book) => (
        <script
          key={book.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBookJsonLd(book, "en")),
          }}
        />
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHero
          titlePre="Interactive"
          titleHighlight="Textbooks"
          titlePost="& Study Guides"
          gradient="from-showcase-purple via-showcase-teal to-showcase-green"
          annotation="read online or download!"
          annotationColor="text-showcase-teal"
          subtitle={t("subtitle")}
          floatingIcons={
            <>
              <BookOpen
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <FileText
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-teal/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
              <Sparkles
                className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-green/15 animate-float-gentle"
                style={{ animationDelay: "2s" }}
              />
              <BookOpen
                className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-purple/15 animate-float-playful"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          }
        />

        {/* Book catalog */}
        <div className="mt-12">
          <BookCatalog />
        </div>
      </div>
    </main>
  );
}
