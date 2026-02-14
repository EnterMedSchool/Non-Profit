import "@/styles/clinical-semiotics.css";
import { Suspense } from "react";
import ClinicalSemioticsClient from "./ClinicalSemioticsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: "Clinical Semiotics Studio — Interactive Physical Exam Training",
    description:
      "Master clinical examination skills with interactive video walkthroughs, real-time quizzes, and medical terminology. Free physical exam training for med students.",
    keywords: [
      "clinical semiotics",
      "physical examination training",
      "clinical skills practice",
      "medical exam techniques",
      "cardiac examination",
      "thoracic examination",
      "blood pressure measurement",
      "free clinical training",
    ],
    openGraph: {
      title: "Clinical Semiotics Studio — Interactive Physical Exam Training",
      description:
        "Master clinical examination skills with interactive video walkthroughs, real-time quizzes, and medical terminology. Free physical exam training for med students.",
      url: `${BASE_URL}/${locale}/clinical-semiotics`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Clinical Semiotics Studio — Free Physical Exam Training",
      description: "Interactive video walkthroughs for clinical examination skills. Free for medical students.",
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
