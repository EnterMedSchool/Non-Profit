import Link from "next/link";
import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import { renderTermContent } from "@/lib/glossary/renderTermContent";
import type { Differential } from "@/types/glossary";

interface DifferentialsSectionProps {
  differentials: Differential[];
  termName: string;
  termNameMap: Map<string, string>;
  currentTermId: string;
  locale: string;
}

export default function DifferentialsSection({
  differentials,
  termName,
  termNameMap,
  currentTermId,
  locale,
}: DifferentialsSectionProps) {
  if (!differentials.length) return null;

  return (
    <GlossarySectionCard
      id="differentials"
      title="Differential Diagnosis"
      icon="🔀"
      accent="#FF9F43"
      seoHeading={`Differential Diagnosis for ${termName}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink-dark/10">
              <th className="pb-2 pr-4 text-left font-display font-bold text-ink-dark">
                Condition
              </th>
              <th className="pb-2 text-left font-display font-bold text-ink-dark">
                Distinguishing Feature
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-dark/5">
            {differentials.map((diff, i) => {
              const name = diff.name || diff.id || "Unknown";
              return (
                <tr key={i}>
                  <td className="py-3 pr-4 font-semibold text-ink-dark whitespace-nowrap">
                    {diff.id ? (
                      <Link
                        href={`/${locale}/resources/glossary/${diff.id}`}
                        className="text-showcase-purple underline decoration-showcase-purple/30 underline-offset-2 hover:decoration-showcase-purple/60 transition-colors"
                      >
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </td>
                  <td className="py-3 text-ink-muted">
                    {renderTermContent(diff.hint, {
                      termNameMap,
                      currentTermId,
                      locale,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlossarySectionCard>
  );
}
