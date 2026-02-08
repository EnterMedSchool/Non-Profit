"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  // Future locales:
  // { code: "it", label: "Italiano", flag: "🇮🇹" },
  // { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render if only one locale
  if (locales.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-ink-muted">
        <Globe className="h-3.5 w-3.5" />
        <span>EN</span>
      </div>
    );
  }

  const currentLocale = pathname.split("/")[1] || "en";

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => switchLocale(e.target.value)}
      className="rounded-lg border-2 border-showcase-navy/20 bg-white px-2 py-1 text-sm font-semibold text-ink-dark transition-colors hover:border-showcase-purple focus:border-showcase-purple focus:outline-none"
      aria-label="Select language"
    >
      {locales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.flag} {locale.label}
        </option>
      ))}
    </select>
  );
}
