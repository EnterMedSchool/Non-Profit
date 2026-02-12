import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import { renderTermContent } from "@/lib/glossary/renderTermContent";

interface ListSectionProps {
  id: string;
  title: string;
  icon: string;
  accent: string;
  items: string[];
  seoHeading?: string;
  termNameMap: Map<string, string>;
  currentTermId: string;
  locale: string;
  ordered?: boolean;
}

export default function ListSection({
  id,
  title,
  icon,
  accent,
  items,
  seoHeading,
  termNameMap,
  currentTermId,
  locale,
  ordered = false,
}: ListSectionProps) {
  if (!items.length) return null;

  const Tag = ordered ? "ol" : "ul";

  return (
    <GlossarySectionCard
      id={id}
      title={title}
      icon={icon}
      accent={accent}
      seoHeading={seoHeading}
    >
      <Tag className={ordered ? "list-decimal space-y-3 pl-5" : "space-y-3"}>
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-ink-dark">
            {renderTermContent(item, { termNameMap, currentTermId, locale })}
          </li>
        ))}
      </Tag>
    </GlossarySectionCard>
  );
}
