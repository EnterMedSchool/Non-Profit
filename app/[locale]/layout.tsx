import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Bricolage_Grotesque, DM_Sans, Caveat } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageTransition from "@/components/layout/PageTransition";
import SearchDialog from "@/components/layout/SearchDialog";
import DeferredConsent from "@/components/consent/DeferredConsent";
import ServiceWorkerRegistration from "@/components/shared/ServiceWorkerRegistration";
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

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

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
          url: `${BASE_URL}/opengraph-image`,
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
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        "x-default": "/en",
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

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body
        className="min-h-screen text-ink-dark font-body"
        style={{
          backgroundColor: "#EDF2FF",
          backgroundImage: [
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(108, 92, 231, 0.08) 0%, transparent 70%)",
            "radial-gradient(ellipse 70% 50% at 85% 30%, rgba(0, 217, 192, 0.07) 0%, transparent 65%)",
            "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(84, 160, 255, 0.07) 0%, transparent 70%)",
            "linear-gradient(170deg, #EDF2FF 0%, #E5ECFF 25%, #E8FAF7 50%, #EBE6FF 75%, #EDF2FF 100%)",
          ].join(", "),
          backgroundAttachment: "fixed",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <Breadcrumbs />
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
          <SearchDialog />
          <DeferredConsent />
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
