"use client";

import Link from "next/link";
import type { GlossaryTerm, GlossaryTagMap } from "@/types/glossary";

interface GlossaryCrossRefGraphProps {
  currentTerm: {
    id: string;
    name: string;
    primary_tag: string;
  };
  relatedTerms: Array<{ id: string; name: string; primary_tag: string }>;
  prerequisiteTerms: Array<{ id: string; name: string; primary_tag: string }>;
  differentialTerms: Array<{ id: string; name: string; primary_tag: string }>;
  tags: GlossaryTagMap;
  locale: string;
}

/**
 * Visual mini-graph showing connections between the current term
 * and its related, prerequisite, and differential terms.
 */
export default function GlossaryCrossRefGraph({
  currentTerm,
  relatedTerms,
  prerequisiteTerms,
  differentialTerms,
  tags,
  locale,
}: GlossaryCrossRefGraphProps) {
  const allConnected = [
    ...prerequisiteTerms.map((t) => ({ ...t, type: "prerequisite" as const })),
    ...relatedTerms.map((t) => ({ ...t, type: "related" as const })),
    ...differentialTerms.map((t) => ({ ...t, type: "differential" as const })),
  ];

  if (allConnected.length === 0) return null;

  // Limit to 8 nodes for readability
  const visible = allConnected.slice(0, 8);

  const typeColors = {
    prerequisite: "#00D9C0",
    related: "#6C5CE7",
    differential: "#FF9F43",
  };

  const typeLabels = {
    prerequisite: "Prerequisite",
    related: "Related",
    differential: "Differential",
  };

  return (
    <div className="rounded-2xl border-3 border-ink-dark/10 bg-white p-5 shadow-chunky-sm">
      <h3 className="font-display text-sm font-bold text-ink-dark mb-3">
        🔗 Knowledge Map
      </h3>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider">
        {(["prerequisite", "related", "differential"] as const).map((type) => {
          if (!visible.some((v) => v.type === type)) return null;
          return (
            <span key={type} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: typeColors[type] }}
              />
              {typeLabels[type]}
            </span>
          );
        })}
      </div>

      {/* Visual node layout */}
      <div className="relative flex flex-col items-center gap-2">
        {/* Current term (center) */}
        <div
          className="z-10 rounded-xl border-3 px-4 py-2 text-center font-display text-sm font-bold text-white shadow-md"
          style={{
            backgroundColor: tags[currentTerm.primary_tag]?.accent || "#6C5CE7",
            borderColor: tags[currentTerm.primary_tag]?.accent || "#6C5CE7",
          }}
        >
          {tags[currentTerm.primary_tag]?.icon || "📚"}{" "}
          {currentTerm.name}
        </div>

        {/* Connected terms */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {visible.map((node) => {
            const nodeTag = tags[node.primary_tag];
            return (
              <Link
                key={`${node.type}-${node.id}`}
                href={`/${locale}/resources/glossary/${node.id}`}
                className="group rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: typeColors[node.type],
                  backgroundColor: `${typeColors[node.type]}10`,
                  color: typeColors[node.type],
                }}
              >
                <span className="mr-1">{nodeTag?.icon || "📚"}</span>
                {node.name}
              </Link>
            );
          })}
        </div>

        {allConnected.length > 8 && (
          <span className="text-[10px] text-ink-muted mt-1">
            +{allConnected.length - 8} more connections
          </span>
        )}
      </div>
    </div>
  );
}
