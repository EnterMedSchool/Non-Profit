import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  clinicalCases,
  getCaseById,
  stripProfessorData,
} from "@/data/clinical-cases";
import { getCharacterByCaseId } from "@/data/disease-characters";
import { routing } from "@/i18n/routing";
import CasePlayer from "@/components/clinical-cases/CasePlayer";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface CasePageProps {
  params: Promise<{ locale: string; id: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return clinicalCases.map((c) => ({ id: c.id }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: CasePageProps) {
  const { locale, id } = await params;
  const caseData = getCaseById(id);
  if (!caseData) return {};

  const title = `${caseData.title} — Interactive Clinical Case`;
  const description = `Solve this ${caseData.difficulty} ${caseData.category} clinical case interactively. ${caseData.patient.briefHistory}`;
  const url = `${BASE_URL}/${locale}/case/${id}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/case/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/en/case/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: caseData.thumbnailPath
        ? [
            {
              url: `${BASE_URL}${caseData.thumbnailPath}`,
              width: 800,
              height: 600,
              alt: `${caseData.title} clinical case`,
            },
          ]
        : [],
    },
    twitter: { card: "summary_large_image" as const, title, description },
    keywords: caseData.tags,
  };
}

/* ── Loading skeleton ───────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-showcase-purple/20 border-t-showcase-purple" />
        <p className="text-sm font-medium text-white/60">
          Preparing your case...
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const caseData = getCaseById(id);
  if (!caseData) notFound();

  const character = getCharacterByCaseId(id);

  // CRITICAL: Strip all professor-only data before sending to client
  const studentCaseData = stripProfessorData(caseData);

  return (
    <div className="case-player-page min-h-screen bg-[#0a0a1a]">
      <Suspense fallback={<LoadingSkeleton />}>
        <CasePlayer
          caseData={studentCaseData}
          character={character ?? null}
        />
      </Suspense>
    </div>
  );
}
