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
  title: "Scientific Illustration Maker — Free BioRender Alternative | EnterMedSchool",
  description:
    "Create professional scientific illustrations for free. Drag-and-drop cells, organs, molecules, and lab equipment onto a canvas. Export to PNG or JPEG. Open-source BioRender alternative.",
  keywords: [
    "scientific illustration maker",
    "biorender alternative",
    "free scientific figures",
    "biology diagram creator",
    "medical illustration tool",
    "open source biorender",
  ],
  openGraph: {
    title: "Scientific Illustration Maker — Free BioRender Alternative",
    description:
      "Create professional scientific illustrations for free. Drag-and-drop cells, organs, molecules, and lab equipment. Open-source.",
    type: "website",
    siteName: "EnterMedSchool.org",
  },
};

/**
 * Minimal layout for the full-screen illustration maker.
 * No navbar, breadcrumbs, footer, or any chrome — just the tool.
 */
export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="h-screen w-screen overflow-hidden font-body text-ink-dark bg-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
