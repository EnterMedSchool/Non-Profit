import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/latex-editor.css";

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
  title: "LaTeX Editor — Free Overleaf Alternative for Medical Students | EnterMedSchool",
  description:
    "Learn and write LaTeX for free. Drag-and-drop code snippets, use medical templates, and see a live preview. Perfect for thesis writing, research papers, and scientific documents. Open-source Overleaf alternative.",
  keywords: [
    "latex editor online",
    "free latex editor",
    "overleaf alternative",
    "latex for medical students",
    "thesis editor",
    "scientific paper editor",
    "latex learning tool",
    "open source latex editor",
  ],
  openGraph: {
    title: "LaTeX Editor — Free Overleaf Alternative for Medical Students",
    description:
      "Learn and write LaTeX for free. Templates, drag-and-drop snippets, and live preview. Open-source.",
    type: "website",
    siteName: "EnterMedSchool.org",
  },
};

/**
 * Minimal layout for the full-screen LaTeX editor.
 * No navbar, breadcrumbs, footer, or any chrome — just the tool.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="h-screen w-screen overflow-hidden font-body text-ink-dark bg-white">
        {children}
      </body>
    </html>
  );
}
