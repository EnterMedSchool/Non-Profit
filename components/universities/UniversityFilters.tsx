"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import CountryPicker from "./CountryPicker";
import type { University } from "@/data/universities";

interface UniversityFiltersProps {
  universities: University[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCountry: string | null;
  onCountryChange: (code: string) => void;
}

export default function UniversityFilters({
  universities,
  searchQuery,
  onSearchChange,
  activeCountry,
  onCountryChange,
}: UniversityFiltersProps) {
  const t = useTranslations("universities.filters");

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

      <div className="block sm:hidden">
        <CountryPicker
          universities={universities}
          onSelect={onCountryChange}
          activeCountry={activeCountry}
        />
      </div>

      <div className="hidden sm:block">
        <CountryPicker
          universities={universities}
          onSelect={onCountryChange}
          activeCountry={activeCountry}
        />
      </div>
    </div>
  );
}
