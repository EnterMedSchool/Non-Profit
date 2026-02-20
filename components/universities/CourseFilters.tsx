"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface CourseFiltersProps {
  subjects: string[];
  professors: string[];
  activeSubject: string;
  activeProfessor: string;
  searchQuery: string;
  onSubjectChange: (s: string) => void;
  onProfessorChange: (p: string) => void;
  onSearchChange: (q: string) => void;
}

export default function CourseFilters({
  subjects,
  professors,
  activeSubject,
  activeProfessor,
  searchQuery,
  onSubjectChange,
  onProfessorChange,
  onSearchChange,
}: CourseFiltersProps) {
  const t = useTranslations("universities.detail");

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-2xl border-2 border-ink-dark/10 bg-white py-3 pl-11 pr-10 text-sm text-ink-dark placeholder:text-ink-muted/60 transition-all focus:border-showcase-purple/40 focus:outline-none focus:shadow-[0_0_20px_rgba(108,92,231,0.15)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-muted hover:bg-pastel-lavender hover:text-ink-dark"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSubjectChange("")}
          className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
            !activeSubject
              ? "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm"
              : "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
          }`}
        >
          {t("allSubjects")}
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSubjectChange(s)}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubject === s
                ? "border-showcase-purple bg-showcase-purple text-white shadow-chunky-sm"
                : "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {professors.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onProfessorChange("")}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
              !activeProfessor
                ? "border-showcase-teal bg-showcase-teal text-white shadow-chunky-sm"
                : "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
            }`}
          >
            {t("allProfessors")}
          </button>
          {professors.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onProfessorChange(p)}
              className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                activeProfessor === p
                  ? "border-showcase-teal bg-showcase-teal text-white shadow-chunky-sm"
                  : "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
