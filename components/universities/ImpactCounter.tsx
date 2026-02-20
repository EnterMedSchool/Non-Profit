"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { getTotalStats } from "@/data/universities";

export default function ImpactCounter() {
  const t = useTranslations("universities.impact");
  const stats = getTotalStats();

  const items = [
    { value: stats.universities, label: t("universities") },
    { value: stats.courses, label: t("courses") },
    { value: stats.materials, label: t("materials") },
  ];

  return (
    <AnimatedSection animation="fadeUp" delay={0.2}>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-center">
            {i > 0 && (
              <span className="hidden text-ink-muted/30 sm:inline">|</span>
            )}
            <span className="font-display text-xl font-bold text-showcase-purple sm:text-2xl">
              {item.value}
            </span>
            <span className="text-xs font-medium text-ink-muted sm:text-sm">
              {item.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="hidden text-ink-muted/30 sm:inline">|</span>
          <span className="rounded-full bg-showcase-green/10 px-3 py-0.5 text-xs font-bold text-showcase-green sm:text-sm">
            {t("free")}
          </span>
        </div>
      </div>
    </AnimatedSection>
  );
}
