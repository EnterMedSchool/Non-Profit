import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "@/styles/globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flashcard Maker — Free Anki Alternative | EnterMedSchool",
  description:
    "Create, customize, and export study flashcards for free. Import from CSV, style your cards, and download as PDF or images. Open-source Anki alternative for medical students.",
  keywords: [
    "flashcard maker",
    "free flashcard tool",
    "anki alternative",
    "medical flashcards",
    "study cards",
    "open source flashcard maker",
  ],
  openGraph: {
    title: "Flashcard Maker — Free Anki Alternative",
    description:
      "Create and export study flashcards for free. Import, customize, and download. Open-source.",
    type: "website",
    siteName: "EnterMedSchool.org",
  },
};

/**
 * Minimal layout for the full-screen flashcard maker.
 * No navbar, breadcrumbs, footer, or any chrome — just the tool.
 */
export default async function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="min-h-screen font-body text-ink-dark bg-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
