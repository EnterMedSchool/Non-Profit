import Link from "next/link";
import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import type { GlossaryTerm } from "@/types/glossary";

interface SeeAlsoSectionProps {
  relatedTerms: GlossaryTerm[];
  locale: string;
  accent?: string;
  /** Tag data for showing icons */
  tags: Record<string, { accent: string; icon: string }>;
}

export default function SeeAlsoSection({
  relatedTerms,
  locale,
  tags,
}: SeeAlsoSectionProps) {
  if (!relatedTerms.length) return null;

  return (
    <GlossarySectionCard
      id="see-also"
      title="Related Conditions"
      icon="🔗"
      accent="#6C5CE7"
    >
      <div className="flex flex-wrap gap-2">
        {relatedTerms.map((term) => {
          const tag = tags[term.primary_tag];
          return (
            <Link
              key={term.id}
              href={`/${locale}/resources/glossary/${term.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1.5 text-sm font-semibold text-showcase-purple transition-all hover:-translate-y-0.5 hover:border-showcase-purple/40 hover:shadow-md"
            >
              <span className="text-sm">{tag?.icon || "📚"}</span>
              {term.names[0]}
            </Link>
          );
        })}
      </div>
    </GlossarySectionCard>
  );
}
