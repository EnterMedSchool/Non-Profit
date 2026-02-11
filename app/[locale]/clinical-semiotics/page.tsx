import "@/styles/clinical-semiotics.css";
import { Suspense } from "react";
import ClinicalSemioticsClient from "./ClinicalSemioticsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: "Clinical Semiotics Studio | EnterMedSchool.org",
    description:
      "Master clinical examination skills with interactive video walkthroughs, real-time quizzes, and Italian medical terminology — powered by EnterMedSchool.",
    openGraph: {
      title: "Clinical Semiotics Studio | EnterMedSchool.org",
      description:
        "Master clinical examination skills with interactive video walkthroughs, real-time quizzes, and Italian medical terminology — powered by EnterMedSchool.",
      url: `${BASE_URL}/${locale}/clinical-semiotics`,
      type: "website",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/clinical-semiotics`,
      languages: { en: `${BASE_URL}/en/clinical-semiotics`, "x-default": `${BASE_URL}/en/clinical-semiotics` },
    },
  };
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F0EEFF] border-t-[#6C5CE7]" />
        <p className="text-sm font-medium text-[#4a4a6a]">
          Loading Clinical Semiotics Studio…
        </p>
      </div>
    </div>
  );
}

export default function ClinicalSemioticsPage() {
  return (
    <div className="semiotics-page">
      <Suspense fallback={<LoadingSkeleton />}>
        <ClinicalSemioticsClient />
      </Suspense>
    </div>
  );
}
