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
  title: "MCQ Maker — EnterMedSchool",
  description:
    "Create, import, and export multiple choice questions & exams. Free, open-source, and runs entirely in your browser.",
  keywords: [
    "MCQ maker",
    "multiple choice questions",
    "exam generator",
    "quiz maker",
    "medical education",
    "free",
    "open source",
  ],
};

/**
 * Minimal layout for the full-screen MCQ maker.
 * No navbar, breadcrumbs, footer, or any chrome — just the tool.
 */
export default async function MCQLayout({ children }: { children: React.ReactNode }) {
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
