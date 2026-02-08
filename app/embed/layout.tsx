import type { Metadata } from "next";
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
  robots: { index: false, follow: false },
};

/**
 * Minimal layout for embed pages.
 *
 * - No Navbar, Footer, Breadcrumbs, search dialog, consent manager
 * - noindex / nofollow so all SEO goes to canonical tool pages
 * - Lightweight: only essential fonts + global CSS
 * - lang attribute is set dynamically via useEffect in EmbedAttribution
 * - Custom Google Fonts (when a non-default font is selected via the
 *   theme customizer) are injected dynamically by EmbedThemeProvider
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="min-h-screen font-body bg-white text-ink-dark">
        {children}
      </body>
    </html>
  );
}
