import Link from "next/link";
import type { GlossaryCategory } from "@/types/glossary";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface GlossaryCategoryGridProps {
  categories: GlossaryCategory[];
  locale: string;
}

export default function GlossaryCategoryGrid({
  categories,
  locale,
}: GlossaryCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category, i) => (
        <AnimatedSection key={category.id} delay={i * 0.03} animation="popIn" spring>
          <Link
            href={`/${locale}/resources/glossary/category/${category.id}`}
            className="group flex flex-col items-center rounded-2xl border-3 bg-white p-4 text-center shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky"
            style={{
              borderColor: `${category.accent}30`,
            }}
          >
            <span className="text-3xl transition-transform group-hover:scale-110">
              {category.icon}
            </span>
            <span className="mt-2 text-sm font-bold text-ink-dark leading-tight">
              {category.name}
            </span>
            <span
              className="mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: category.accent }}
            >
              {category.count}
            </span>
          </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}
