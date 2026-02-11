import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = "Medical Visuals & Assets — Free for Educators";
  const description =
    "Download layered visual diagrams, audio narrations, and teaching assets for medical education. Achalasia, IBD, vancomycin, anemia, and more. Free and open-source.";
  const url = `${BASE_URL}/${locale}/resources/visuals`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en/resources/visuals`,
        "x-default": `${BASE_URL}/en/resources/visuals`,
      },
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
    keywords: [
      "medical visuals",
      "anatomy diagrams",
      "clinical illustrations",
      "medical education assets",
      "free teaching resources",
      "achalasia",
      "IBD",
      "vancomycin",
      "anemia",
    ],
  };
}

export default function VisualsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
