"use client";

import Link from "next/link";
import type { GlossaryTagMap } from "@/types/glossary";

interface TermNode {
  id: string;
  name: string;
  primary_tag: string;
}

interface GlossaryCrossRefGraphProps {
  currentTerm: TermNode;
  relatedTerms: TermNode[];
  prerequisiteTerms: TermNode[];
  differentialTerms: TermNode[];
  tags: GlossaryTagMap;
  locale: string;
}

function TermGroup({
  title,
  icon,
  accent,
  terms,
  tags,
  locale,
}: {
  title: string;
  icon: string;
  accent: string;
  terms: TermNode[];
  tags: GlossaryTagMap;
  locale: string;
}) {
  if (terms.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        {icon} {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => {
          const tagData = tags[term.primary_tag];
          return (
            <Link
              key={term.id}
              href={`/${locale}/resources/glossary/${term.id}`}
              className="group inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: `${accent}30`,
                color: accent,
              }}
            >
              <span className="text-xs">{tagData?.icon || "📚"}</span>
              {term.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function GlossaryCrossRefGraph({
  currentTerm,
  relatedTerms,
  prerequisiteTerms,
  differentialTerms,
  tags,
  locale,
}: GlossaryCrossRefGraphProps) {
  const hasAny = prerequisiteTerms.length + relatedTerms.length + differentialTerms.length > 0;
  if (!hasAny) return null;

  return (
    <section id="knowledge-map" className="scroll-mt-20">
      <div className="rounded-2xl border-2 border-ink-dark/10 bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-yellow" />
        <div className="px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-dark mb-4 flex items-center gap-2">
            <span className="text-lg">🔗</span>
            Knowledge Map
          </h3>

          <div className="space-y-4">
            <TermGroup
              title="Prerequisites"
              icon=""
              accent="#00D9C0"
              terms={prerequisiteTerms}
              tags={tags}
              locale={locale}
            />
            <TermGroup
              title="Related Conditions"
              icon=""
              accent="#6C5CE7"
              terms={relatedTerms}
              tags={tags}
              locale={locale}
            />
            <TermGroup
              title="Differential Diagnoses"
              icon=""
              accent="#FF9F43"
              terms={differentialTerms}
              tags={tags}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
