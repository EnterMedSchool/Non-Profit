import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getUniversityBySlug, getAllUniversities } from "@/data/universities";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "universities" });
  const university = getUniversityBySlug(slug);
  const name = university?.name ?? slug;
  const url = `${BASE_URL}/${locale}/universities/${slug}`;

  const title = `${name} — ${t("title")}`;
  const description = `${t("metaDescription")} — ${name}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${BASE_URL}/${l}/universities/${slug}`,
          ]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/universities/${slug}`,
      },
    },
    openGraph: { title, description, url, type: "website", siteName: "EnterMedSchool.org" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function generateStaticParams() {
  return getAllUniversities()
    .filter((u) => u.status === "active")
    .map((u) => ({ slug: u.slug }));
}

export default function UniversityDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
