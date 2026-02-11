import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });

  const title = t("hub.pageTitle");
  const description = t("hub.metaDescription");
  const url = `${BASE_URL}/${locale}/resources`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: `${BASE_URL}/en/resources`, "x-default": `${BASE_URL}/en/resources` },
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
  };
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
