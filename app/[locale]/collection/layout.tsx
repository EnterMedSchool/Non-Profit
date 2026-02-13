import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/collection`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/collection`;
  }
  languages["x-default"] = `${BASE_URL}/${routing.defaultLocale}/collection`;

  return {
    title: "Your Disease Character Collection — EnterMedSchool",
    description:
      "Solve clinical cases to unlock collectible disease characters. Each character is a mnemonic device — every accessory teaches a medical fact. Track your progress and level up.",
    openGraph: {
      title: "Disease Character Collection — EnterMedSchool",
      description:
        "Collect disease characters by solving clinical cases. Each character teaches medical facts through mnemonics and gamification.",
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    keywords: [
      "disease characters",
      "medical mnemonics",
      "clinical cases gamification",
      "medical education game",
      "collectible characters",
    ],
    alternates: {
      canonical: url,
      languages,
    },
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
