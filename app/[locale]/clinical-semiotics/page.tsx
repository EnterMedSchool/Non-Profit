import "@/styles/clinical-semiotics.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import ClinicalSemioticsClient from "./ClinicalSemioticsClient";

export const metadata: Metadata = {
  title: "Clinical Semiotics Studio | EnterMedSchool.org",
  description:
    "Master clinical examination skills with interactive video walkthroughs, real-time quizzes, and Italian medical terminology — powered by EnterMedSchool.",
};

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
