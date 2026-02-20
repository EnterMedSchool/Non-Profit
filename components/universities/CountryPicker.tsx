"use client";

import { MapPin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import type { University } from "@/data/universities";

interface CountryPickerProps {
  universities: University[];
  onSelect: (countryCode: string) => void;
  activeCountry: string | null;
}

export default function CountryPicker({
  universities,
  onSelect,
  activeCountry,
}: CountryPickerProps) {
  const t = useTranslations("universities");

  const countriesMap = new Map<
    string,
    { name: string; code: string; count: number; hasActive: boolean }
  >();
  for (const u of universities) {
    const existing = countriesMap.get(u.countryCode);
    if (existing) {
      existing.count++;
      if (u.status === "active") existing.hasActive = true;
    } else {
      countriesMap.set(u.countryCode, {
        name: u.country,
        code: u.countryCode,
        count: 1,
        hasActive: u.status === "active",
      });
    }
  }

  const countries = [...countriesMap.values()].sort(
    (a, b) => (b.hasActive ? 1 : 0) - (a.hasActive ? 1 : 0) || a.name.localeCompare(b.name),
  );

  return (
    <div className="relative">
      {/* Fade indicators for mobile scroll */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white to-transparent sm:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-white to-transparent sm:hidden" />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
            !activeCountry
              ? "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm"
              : "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
          }`}
        >
          {t("filters.all")}
        </button>
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => onSelect(country.code)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
              activeCountry === country.code
                ? "border-showcase-purple bg-showcase-purple text-white shadow-chunky-sm"
                : country.hasActive
                  ? "border-ink-dark/10 bg-white text-ink-dark hover:bg-pastel-lavender"
                  : "border-ink-dark/5 bg-pastel-cream/60 text-ink-muted"
            }`}
          >
            <MapPin className="h-3 w-3" />
            {country.name}
            <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
              {country.count}
            </span>
          </button>
        ))}
        <a
          href="mailto:ari@entermedschool.com?subject=Add%20my%20university"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-dashed border-showcase-green/40 bg-showcase-green/5 px-3 py-1.5 text-xs font-bold text-showcase-green transition-all hover:border-showcase-green hover:bg-showcase-green/10"
        >
          <Mail className="h-3 w-3" />
          {t("map.legendRequest")}
        </a>
      </div>
    </div>
  );
}
