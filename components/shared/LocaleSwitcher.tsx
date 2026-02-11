"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";

/* ── Locale metadata ──────────────────────────────────────────────────────── */

const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

/* ── Shared switch helper ─────────────────────────────────────────────────── */

function useLocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const switchLocale = useCallback(
    (newLocale: string) => {
      if (newLocale === currentLocale) return;
      const segments = pathname.split("/");
      segments[1] = newLocale;
      router.push(segments.join("/"));
    },
    [pathname, router, currentLocale],
  );

  return { currentLocale, switchLocale };
}

/* ── Desktop variant (popover dropdown) ───────────────────────────────────── */

export function LocaleSwitcherDesktop() {
  const t = useTranslations("common");
  const { currentLocale, switchLocale } = useLocaleSwitcher();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === currentLocale) ?? locales[0];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Don't render if only one locale
  if (locales.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-ink-muted">
        <Globe className="h-3.5 w-3.5" />
        <span>{current.code.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-pastel-lavender hover:text-ink-dark hover:scale-105"
        aria-label={t("switchLanguage")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-sm">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            role="listbox"
            aria-label={t("switchLanguage")}
            className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border-2 border-showcase-purple/10 bg-white/95 shadow-lg backdrop-blur-xl"
          >
            {locales.map((locale) => {
              const isActive = locale.code === currentLocale;
              return (
                <button
                  key={locale.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    switchLocale(locale.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-start text-sm transition-colors ${
                    isActive
                      ? "bg-pastel-lavender/60 font-bold text-showcase-purple"
                      : "text-ink-dark hover:bg-pastel-lavender/40"
                  }`}
                >
                  <span className="text-base">{locale.flag}</span>
                  <span className="flex-1 font-semibold">{locale.label}</span>
                  <span className="text-xs text-ink-light">
                    {locale.code.toUpperCase()}
                  </span>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-showcase-purple" />
                  )}
                </button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile variant (inline pill buttons) ─────────────────────────────────── */

export function LocaleSwitcherMobile({ onSwitch }: { onSwitch?: () => void }) {
  const t = useTranslations("common");
  const { currentLocale, switchLocale } = useLocaleSwitcher();

  // Don't render if only one locale
  if (locales.length <= 1) return null;

  return (
    <div
      className="flex gap-2"
      role="radiogroup"
      aria-label={t("switchLanguage")}
    >
      {locales.map((locale) => {
        const isActive = locale.code === currentLocale;
        return (
          <button
            key={locale.code}
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              switchLocale(locale.code);
              onSwitch?.();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              isActive
                ? "border-2 border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                : "border-2 border-showcase-purple/15 bg-white/60 text-ink-muted hover:bg-white hover:border-showcase-purple/30"
            }`}
          >
            <span>{locale.flag}</span>
            <span>{locale.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Legacy default export for backwards compat ───────────────────────────── */
export default LocaleSwitcherDesktop;
