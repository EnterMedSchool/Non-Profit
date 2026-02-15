import { notFound } from "next/navigation";
import { ogImagePath } from "@/lib/og-path";
import { Suspense } from "react";
import {
  clinicalCases,
  getCaseById,
  getCaseBySlug,
  stripProfessorData,
  extractScoringKey,
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
  return clinicalCases.map((c) => ({ id: c.slug }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: CasePageProps) {
  const { locale, id } = await params;
  // Resolve by slug first, then fall back to ID for backwards compat
  const caseData = getCaseBySlug(id) ?? getCaseById(id);
  if (!caseData) return {};

  const title = `${caseData.title} — Interactive Clinical Case`;
  const description = `Solve this ${caseData.difficulty} ${caseData.category} clinical case interactively. ${caseData.patient.briefHistory}`;
  const url = `${BASE_URL}/${locale}/case/${caseData.slug}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/case/${caseData.slug}`;
  }
  languages["x-default"] = `${BASE_URL}/en/case/${caseData.slug}`;

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
      images: [{ url: ogImagePath("resources", "clinical-cases", caseData.id || caseData.slug), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title, description },
    keywords: caseData.tags,
  };
}

/* ── Loading skeleton ───────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-pastel-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-showcase-purple/20 border-t-showcase-purple" />
        <p className="text-sm font-medium text-ink-muted">
          Preparing your case...
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  // Resolve by slug first, then fall back to ID for backwards compat
  const caseData = getCaseBySlug(id) ?? getCaseById(id);
  if (!caseData) notFound();

  const character = getCharacterByCaseId(caseData.id);

  // Strip professor-visible data before sending to client
  const studentCaseData = stripProfessorData(caseData);
  // Extract scoring-only data (answer key, optimality flags, teaching content)
  const scoringKey = extractScoringKey(caseData);

  return (
    <div className="case-player-page min-h-dvh bg-pastel-cream">
      <Suspense fallback={<LoadingSkeleton />}>
        <CasePlayer
          caseData={studentCaseData}
          scoringKey={scoringKey}
          character={character ?? null}
        />
      </Suspense>
    </div>
  );
}
