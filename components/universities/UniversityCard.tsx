"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, BookOpen, FileText, Users } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import type { University } from "@/data/universities";
import { getUniversityStats } from "@/data/universities";

interface UniversityCardProps {
  university: University;
  index: number;
}

export default function UniversityCard({
  university,
  index,
}: UniversityCardProps) {
  const locale = useLocale();
  const t = useTranslations("universities");
  const stats = getUniversityStats(university);
  const isActive = university.status === "active";

  return (
    <AnimatedSection animation="rotateIn" delay={index * 0.08}>
      {isActive ? (
        <Link
          href={`/${locale}/universities/${university.slug}`}
          className="group block h-full"
        >
          <CardContent
            university={university}
            stats={stats}
            isActive={isActive}
            t={t}
          />
        </Link>
      ) : (
        <div className="h-full">
          <CardContent
            university={university}
            stats={stats}
            isActive={isActive}
            t={t}
          />
        </div>
      )}
    </AnimatedSection>
  );
}

function CardContent({
  university,
  stats,
  isActive,
  t,
}: {
  university: University;
  stats: { courses: number; lectures: number; materials: number };
  isActive: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      className={`relative h-full rounded-2xl border-3 p-5 transition-all ${
        isActive
          ? "border-ink-dark/10 bg-white shadow-chunky-sm group-hover:-translate-y-1 group-hover:shadow-chunky"
          : "border-ink-dark/5 bg-pastel-cream/60 opacity-75"
      }`}
    >
      {!isActive && (
        <span className="absolute right-3 top-3 rounded-full bg-ink-muted/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {t("card.comingSoon")}
        </span>
      )}

      <div className="mb-3 flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isActive
              ? "bg-showcase-purple/10 text-showcase-purple"
              : "bg-ink-muted/10 text-ink-muted"
          }`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink-dark leading-tight">
            {university.shortName ?? university.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" />
            {university.city}, {university.country}
          </p>
        </div>
      </div>

      {isActive && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-showcase-purple/10 px-2 py-0.5 text-xs font-semibold text-showcase-purple">
              <BookOpen className="h-3 w-3" />
              {stats.courses} {stats.courses === 1 ? t("card.course") : t("card.courses")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-showcase-teal/10 px-2 py-0.5 text-xs font-semibold text-showcase-teal">
              <FileText className="h-3 w-3" />
              {stats.materials} {t("card.materials")}
            </span>
          </div>

          {university.contributors && university.contributors.length > 0 && (
            <p className="flex items-center gap-1 text-xs text-ink-muted">
              <Users className="h-3 w-3" />
              {t("card.contributedBy", {
                count: university.contributors.length,
              })}
            </p>
          )}
        </>
      )}

      {!isActive && (
        <p className="mt-2 text-xs text-ink-muted">
          {t("card.comingSoonDesc")}
        </p>
      )}
    </div>
  );
}
