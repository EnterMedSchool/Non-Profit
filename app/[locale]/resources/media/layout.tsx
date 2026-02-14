import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mediaAssets" });

  const title = t("title");
  const description = t("metaDescription");
  const url = `${BASE_URL}/${locale}/resources/media`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media`;

  return {
    title,
    description,
    keywords: [
      "free medical illustrations",
      "anatomy diagrams download",
      "medical SVG images",
      "CC BY medical images",
      "open source medical art",
      "cell biology illustrations",
      "medical education images",
    ],
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "application/atom+xml": `${BASE_URL}/resources/media/feed.xml`,
    },
  };
}

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
