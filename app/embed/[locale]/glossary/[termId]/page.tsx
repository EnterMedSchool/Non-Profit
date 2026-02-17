import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTermById,
  glossaryTags,
  getAllTermSlugs,
} from "@/data/glossary-terms";
import { getTagDisplayName } from "@/lib/glossary/tag-names";
import { renderSimpleMarkdown } from "@/lib/glossary/renderTermContent";

interface Props {
  params: Promise<{ locale: string; termId: string }>;
}

export function generateStaticParams() {
  return getAllTermSlugs().map((termId) => ({ termId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, termId } = await params;
  const term = getTermById(termId);
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: term ? `${term.names[0]} — EnterMedSchool Glossary` : "Glossary",
    robots: { index: false, follow: false },
    alternates: {
      canonical: term
        ? `${BASE_URL}/${locale}/resources/glossary/${term.id}`
        : undefined,
    },
  };
}

export default async function EmbedGlossaryTermPage({ params }: Props) {
  const { locale, termId } = await params;
  const term = getTermById(termId);
  if (!term) notFound();

  const tag = glossaryTags[term.primary_tag];
  const accent = tag?.accent || "#6C5CE7";
  const icon = tag?.icon || "📚";
  const categoryName = getTagDisplayName(term.primary_tag);
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  const fullUrl = `${BASE_URL}/${locale}/resources/glossary/${term.id}`;

  return (
    <div
      className="mx-auto max-w-2xl p-4 font-sans"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Rainbow bar */}
      <div
        className="mb-4 h-1 w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${accent}, #6C5CE7, #00D9C0, #FFD93D, #FF85A2)`,
        }}
      />

      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            {term.names[0]}
          </h1>
          {(term.aliases?.length || term.abbr?.length) && (
            <div className="mt-0.5 text-xs text-gray-500">
              {[...(term.aliases || []), ...(term.abbr || [])].join(", ")}
            </div>
          )}
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {categoryName}
          </span>
        </div>
      </div>

      {/* Definition */}
      <div className="rounded-lg border-l-4 bg-gray-50 p-4" style={{ borderLeftColor: accent }}>
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Definition
        </h2>
        <p className="text-sm leading-relaxed text-gray-800">
          {renderSimpleMarkdown(term.definition)}
        </p>
      </div>

      {/* Key sections (compact) */}
      {term.treatment?.length ? (
        <div className="mt-3 rounded-lg border-l-4 border-green-400 bg-green-50/50 p-3">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-green-600">
            Treatment
          </h2>
          <ul className="space-y-1">
            {term.treatment.slice(0, 3).map((t, i) => (
              <li key={i} className="text-xs leading-relaxed text-gray-700">
                {renderSimpleMarkdown(t)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {term.tricks?.length ? (
        <div className="mt-3 rounded-lg border-l-4 border-pink-400 bg-pink-50/50 p-3">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-pink-600">
            Mnemonics
          </h2>
          <ul className="space-y-1">
            {term.tricks.slice(0, 2).map((t, i) => (
              <li key={i} className="text-xs leading-relaxed text-gray-700">
                {renderSimpleMarkdown(t)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-purple-600 hover:underline"
        >
          View full term →
        </a>
        <a
          href={BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400"
        >
          Powered by EnterMedSchool.org
        </a>
      </div>
    </div>
  );
}
