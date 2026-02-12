import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import { renderTermContent } from "@/lib/glossary/renderTermContent";

interface DefinitionSectionProps {
  definition: string;
  termName: string;
  termNameMap: Map<string, string>;
  currentTermId: string;
  locale: string;
}

export default function DefinitionSection({
  definition,
  termName,
  termNameMap,
  currentTermId,
  locale,
}: DefinitionSectionProps) {
  return (
    <GlossarySectionCard
      id="definition"
      title="Definition"
      icon="📖"
      accent="#6C5CE7"
      seoHeading={`What is ${termName}?`}
    >
      <p className="text-base leading-relaxed text-ink-dark" itemProp="description">
        {renderTermContent(definition, { termNameMap, currentTermId, locale })}
      </p>
    </GlossarySectionCard>
  );
}
