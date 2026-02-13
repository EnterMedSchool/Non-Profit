import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getCollectionPageJsonLd } from "@/lib/metadata";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/resources/clinical-cases`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/clinical-cases`;
  }
  languages["x-default"] = `${BASE_URL}/${routing.defaultLocale}/resources/clinical-cases`;

  return {
    title: "Interactive Clinical Cases — Free Medical Case Studies for Educators",
    description:
      "Browse interactive clinical cases with branching narratives, game mechanics, and collectible characters. Download slides, flashcards, and QR codes for your classroom. 100% free.",
    openGraph: {
      title: "Interactive Clinical Cases — Free Medical Case Studies",
      description:
        "Immersive clinical scenarios with branching narratives, game mechanics, and collectible disease characters for medical educators.",
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    keywords: [
      "clinical cases",
      "medical case studies",
      "interactive clinical scenarios",
      "medical education",
      "clinical reasoning",
      "free medical cases",
    ],
    alternates: {
      canonical: url,
      languages,
    },
  };
}

export default async function ClinicalCasesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/resources/clinical-cases`;

  const jsonLd = getCollectionPageJsonLd(
    "Interactive Clinical Cases — Free Medical Case Studies for Educators",
    "Browse interactive clinical cases with branching narratives, game mechanics, and collectible characters. Download slides, flashcards, and QR codes for your classroom.",
    url,
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
