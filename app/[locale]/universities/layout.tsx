import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "universities" });
  const url = `${BASE_URL}/${locale}/universities`;

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/universities`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/universities`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("metaDescription"),
    },
    keywords: [
      "university study materials",
      "medical school flashcards",
      "lecture summaries",
      "free medical education",
      "Anki medical",
      "question bank",
    ],
  };
}

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
