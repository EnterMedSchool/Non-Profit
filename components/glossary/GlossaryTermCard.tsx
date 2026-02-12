import Link from "next/link";
import type { GlossaryTerm, GlossaryTagMap } from "@/types/glossary";
import { getTagDisplayName } from "@/lib/glossary/tag-names";

interface GlossaryTermCardProps {
  term: GlossaryTerm;
  tags: GlossaryTagMap;
  locale: string;
}

/** Strip markdown for preview text */
function stripMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<u>(.*?)<\/u>/g, "$1")
    .replace(/<[^>]+>/g, "");
}

export default function GlossaryTermCard({
  term,
  tags,
  locale,
}: GlossaryTermCardProps) {
  const tag = tags[term.primary_tag];
  const accent = tag?.accent || "#6C5CE7";
  const icon = tag?.icon || "📚";
  const categoryName = getTagDisplayName(term.primary_tag);
  const preview = stripMd(term.definition).slice(0, 140);
  const alias = term.abbr?.[0] || term.aliases?.[0];

  return (
    <Link
      href={`/${locale}/resources/glossary/${term.id}`}
      className="group relative flex flex-col rounded-2xl border-3 border-ink-dark/10 bg-white p-5 shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky"
      style={{ borderLeftColor: accent, borderLeftWidth: "5px" }}
    >
      {/* Category badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `${accent}15`,
            color: accent,
          }}
        >
          <span>{icon}</span>
          {categoryName}
        </span>
        {term.level === "premed" && (
          <span className="rounded-full bg-showcase-teal/10 px-2 py-0.5 text-xs font-semibold text-showcase-teal">
            Pre-Med
          </span>
        )}
        {term.level === "formula" && (
          <span className="rounded-full bg-showcase-orange/10 px-2 py-0.5 text-xs font-semibold text-showcase-orange">
            Formula
          </span>
        )}
        {term.level === "lab-value" && (
          <span className="rounded-full bg-showcase-blue/10 px-2 py-0.5 text-xs font-semibold text-showcase-blue">
            Lab Value
          </span>
        )}
      </div>

      {/* Term name */}
      <h3 className="font-display text-lg font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
        {term.names[0]}
        {alias && (
          <span className="ml-2 text-sm font-normal text-ink-muted">
            ({alias})
          </span>
        )}
      </h3>

      {/* Definition preview */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-3">
        {preview}
        {preview.length >= 140 && "…"}
      </p>

      {/* Bottom metadata */}
      <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
        {term.cases?.length ? (
          <span className="flex items-center gap-1">
            📋 {term.cases.length} case{term.cases.length > 1 ? "s" : ""}
          </span>
        ) : null}
        {term.see_also?.length ? (
          <span className="flex items-center gap-1">
            🔗 {term.see_also.length} related
          </span>
        ) : null}
        {term.tricks?.length ? (
          <span className="flex items-center gap-1">💡 Mnemonics</span>
        ) : null}
      </div>
    </Link>
  );
}
