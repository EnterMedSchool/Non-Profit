import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Bricolage_Grotesque, DM_Sans, Caveat, Heebo } from "next/font/google";
import { isRTLLocale } from "@/lib/i18n";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageTransition from "@/components/layout/PageTransition";
import SearchDialog from "@/components/layout/SearchDialog";
import DeferredConsent from "@/components/consent/DeferredConsent";
import ServiceWorkerRegistration from "@/components/shared/ServiceWorkerRegistration";
import ToastProvider from "@/components/shared/ToastProvider";
import { routing } from "@/i18n/routing";
import { ogImagePath } from "@/lib/og-path";
import "@/styles/globals.css";

/* Font weights reduced from 12 → 6 files for faster loading */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return {
    title: {
      default: t("siteName"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("siteDescription"),
    authors: [{ name: "Ari Horesh" }, { name: "EnterMedSchool.org", url: BASE_URL }],
    publisher: "EnterMedSchool.org",
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale,
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: ogImagePath("home"),
          width: 1200,
          height: 630,
          alt: "EnterMedSchool.org — Open-Source Medical Education",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@entermedschool",
      creator: "@arihoresh",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE_URL}/${l}`])),
        "x-default": `${BASE_URL}/${routing.defaultLocale}`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      dir={isRTLLocale(locale) ? "rtl" : "ltr"}
      className={`${bricolage.variable} ${dmSans.variable} ${caveat.variable} ${heebo.variable}`}
    >
      <body
        className="min-h-screen text-ink-dark font-body bg-fixed-desktop"
        style={{
          backgroundColor: "#F8FAFF",
          backgroundImage:
            "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 40%, #EEF7F6 70%, #F8FAFF 100%)",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:start-4 focus:rounded-xl focus:border-3 focus:border-showcase-navy focus:bg-white focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-showcase-purple focus:shadow-chunky"
            >
              {t("skipToContent")}
            </a>
            <Navbar />
            <Breadcrumbs />
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
            <SearchDialog />
            <DeferredConsent />
            <ServiceWorkerRegistration />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
