"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  ArrowRight,
  FileText,
  BookOpen,
  Wrench,
  GraduationCap,
  Eye,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  SearchX,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import Fuse from "fuse.js";
import { getSearchItems, type SearchItem } from "@/lib/search/searchIndex";

/* ─── Category config ──────────────────────────────────────────────────── */

const categoryConfig: Record<
  SearchItem["category"],
  {
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
    badge: string;
  }
> = {
  page: {
    icon: FileText,
    bg: "bg-pastel-lavender",
    text: "text-showcase-purple",
    border: "border-showcase-purple/20",
    badge: "bg-pastel-lavender text-showcase-purple",
  },
  resource: {
    icon: BookOpen,
    bg: "bg-pastel-mint",
    text: "text-showcase-teal",
    border: "border-showcase-teal/20",
    badge: "bg-pastel-mint text-showcase-teal",
  },
  tool: {
    icon: Wrench,
    bg: "bg-pastel-lemon",
    text: "text-showcase-orange",
    border: "border-showcase-orange/20",
    badge: "bg-pastel-lemon text-showcase-orange",
  },
  guide: {
    icon: GraduationCap,
    bg: "bg-pastel-sky",
    text: "text-showcase-blue",
    border: "border-showcase-blue/20",
    badge: "bg-pastel-sky text-showcase-blue",
  },
  visual: {
    icon: Eye,
    bg: "bg-pastel-peach",
    text: "text-showcase-pink",
    border: "border-showcase-pink/20",
    badge: "bg-pastel-peach text-showcase-pink",
  },
};

const categoryOrder: SearchItem["category"][] = [
  "page",
  "resource",
  "tool",
  "guide",
  "visual",
];

/* ─── Quick Links ──────────────────────────────────────────────────────── */

const quickLinks = [
  {
    title: "Resources",
    description: "Browse all resources",
    href: "/en/resources",
    icon: BookOpen,
    color: "text-showcase-teal",
    bg: "bg-pastel-mint",
  },
  {
    title: "Practice Questions",
    description: "Clinical cases & MCQs",
    href: "/en/resources/questions",
    icon: FileText,
    color: "text-showcase-purple",
    bg: "bg-pastel-lavender",
  },
  {
    title: "Video Lessons",
    description: "Visual explanations",
    href: "/en/resources/videos",
    icon: Eye,
    color: "text-showcase-pink",
    bg: "bg-pastel-peach",
  },
  {
    title: "Medical Visuals",
    description: "Diagrams & illustrations",
    href: "/en/resources/visuals",
    icon: Sparkles,
    color: "text-showcase-blue",
    bg: "bg-pastel-sky",
  },
  {
    title: "For Professors",
    description: "Teaching resources",
    href: "/en/for-professors",
    icon: GraduationCap,
    color: "text-showcase-orange",
    bg: "bg-pastel-lemon",
  },
  {
    title: "Tools",
    description: "Calculators & more",
    href: "/en/tools",
    icon: Wrench,
    color: "text-showcase-coral",
    bg: "bg-pastel-peach",
  },
];

/* ─── Highlight helper ─────────────────────────────────────────────────── */

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="rounded-sm bg-showcase-yellow/40 px-0.5 text-ink-dark"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function SearchDialog() {
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  /* Lazy-init Fuse with full search items (including visuals) on first open */
  useEffect(() => {
    if (!open || fuseRef.current) return;
    getSearchItems().then((items) => {
      fuseRef.current = new Fuse(items, {
        keys: ["title", "description", "category"],
        threshold: 0.3,
        includeScore: true,
      });
    });
  }, [open]);

  /* ── Grouped results ────────────────────────────────────────────────── */

  const grouped = useMemo(() => {
    const groups: { category: SearchItem["category"]; items: SearchItem[] }[] =
      [];
    for (const cat of categoryOrder) {
      const items = results.filter((r) => r.category === cat);
      if (items.length > 0) groups.push({ category: cat, items });
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation indexing
  const flatResults = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped]
  );

  /* ── Open / close ───────────────────────────────────────────────────── */

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  /* ── Navigate to result ─────────────────────────────────────────────── */

  const navigateTo = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  /* ── Keyboard shortcut: Cmd+K / Ctrl+K ──────────────────────────────── */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) handleClose();
        else handleOpen();
      }
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleOpen, handleClose]);

  /* ── Keyboard navigation inside dialog ──────────────────────────────── */

  const handleDialogKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        );
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        navigateTo(flatResults[activeIndex].href);
      }
    },
    [flatResults, activeIndex, navigateTo]
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = resultsRef.current?.querySelector(
      `[data-result-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  /* ── Listen for custom event from navbar search button ───────────────── */

  useEffect(() => {
    const handler = () => handleOpen();
    window.addEventListener("search:open", handler);
    return () => window.removeEventListener("search:open", handler);
  }, [handleOpen]);

  /* ── Focus input when dialog opens ──────────────────────────────────── */

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ── Search on query change (300ms debounce) ──────────────────────── */

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    const timer = setTimeout(() => {
      if (!fuseRef.current) return;
      const fuseResults = fuseRef.current.search(query);
      setResults(fuseResults.map((r) => r.item));
      setActiveIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  /* ── Compute group offsets for flat indexing ─────────────────────────── */

  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (const group of grouped) {
      offsets.push(offset);
      offset += group.items.length;
    }
    return offsets;
  }, [grouped]);

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-showcase-navy/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* ── Dialog container (flex-centered, fixes translate bug) ── */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
              onKeyDown={handleDialogKeyDown}
              role="dialog"
              aria-label={t("title")}
            >
              {/* ── Search input area ─────────────────────────────────── */}
              <div className="flex items-center gap-3 border-b-3 border-showcase-navy bg-gradient-to-r from-pastel-lavender/50 via-white to-pastel-mint/50 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-purple/10">
                  <Search className="h-5 w-5 text-showcase-purple" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 bg-transparent font-display text-lg font-medium outline-none placeholder:text-ink-light/70"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={handleClose}
                  className="flex h-8 items-center gap-1 rounded-lg border-2 border-ink-light/20 px-2 text-xs font-bold text-ink-muted transition-colors hover:border-ink-light/40 hover:bg-pastel-lavender/50"
                >
                  <span className="hidden sm:inline">ESC</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* ── Results area ───────────────────────────────────────── */}
              <div
                ref={resultsRef}
                className="max-h-[55vh] overflow-y-auto overscroll-contain"
              >
                {/* ── Grouped results ──────────────────────────────────── */}
                {query.trim() && results.length > 0 && (
                  <div className="p-2">
                    {grouped.map((group, groupIdx) => {
                      const config = categoryConfig[group.category];
                      const GroupIcon = config.icon;
                      const categoryLabel =
                        t(`categories.${group.category}`) || group.category;
                      const baseOffset = groupOffsets[groupIdx];

                      return (
                        <div key={group.category} className="mb-1 last:mb-0">
                          {/* Category header */}
                          <div className="flex items-center gap-2 px-3 pb-1 pt-3">
                            <GroupIcon
                              className={`h-3.5 w-3.5 ${config.text}`}
                            />
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider ${config.text}`}
                            >
                              {categoryLabel}
                            </span>
                            <div className="h-px flex-1 bg-ink-light/10" />
                          </div>

                          {/* Items */}
                          <ul>
                            {group.items.map((item, itemIdx) => {
                              const idx = baseOffset + itemIdx;
                              const isActive = idx === activeIndex;
                              return (
                                <li key={`${item.href}-${idx}`}>
                                  <button
                                    data-result-index={idx}
                                    onClick={() => navigateTo(item.href)}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                                      isActive
                                        ? `${config.bg}/60 border-l-3 ${config.border}`
                                        : "border-l-3 border-transparent hover:bg-pastel-cream/60"
                                    }`}
                                  >
                                    {/* Icon */}
                                    <div
                                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${config.bg} transition-transform duration-150 group-hover:scale-110`}
                                    >
                                      <config.icon
                                        className={`h-4 w-4 ${config.text}`}
                                      />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="truncate font-display text-sm font-bold text-ink-dark">
                                          {highlightMatch(item.title, query)}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                                        {highlightMatch(
                                          item.description,
                                          query
                                        )}
                                      </p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight
                                      className={`h-4 w-4 flex-shrink-0 transition-all duration-150 ${
                                        isActive
                                          ? `${config.text} translate-x-0.5`
                                          : "text-ink-light/40 group-hover:text-ink-muted"
                                      }`}
                                    />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── No results ───────────────────────────────────────── */}
                {query.trim() && results.length === 0 && (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-peach">
                      <SearchX className="h-8 w-8 text-showcase-pink" />
                    </div>
                    <p className="font-display text-base font-bold text-ink-dark">
                      {t("noResults")}
                    </p>
                    <p className="mt-2 max-w-xs text-sm text-ink-muted">
                      {t("noResultsSuggestion")}
                    </p>
                    <button
                      onClick={() => navigateTo("/en/resources")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/20 bg-pastel-lavender px-4 py-2 text-sm font-bold text-showcase-purple transition-all hover:border-showcase-purple/40 hover:shadow-sm"
                    >
                      {t("browseAll")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* ── Quick links (empty state) ────────────────────────── */}
                {!query.trim() && (
                  <div className="p-4">
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <Sparkles className="h-3.5 w-3.5 text-showcase-yellow" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        {t("quickLinks")}
                      </span>
                      <div className="h-px flex-1 bg-ink-light/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {quickLinks.map((link) => {
                        const LinkIcon = link.icon;
                        return (
                          <button
                            key={link.href}
                            onClick={() => navigateTo(link.href)}
                            className="group flex flex-col items-start gap-2 rounded-xl border-2 border-transparent p-3 text-left transition-all duration-150 hover:border-ink-light/15 hover:bg-pastel-cream/50 hover:shadow-sm"
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${link.bg} transition-transform duration-150 group-hover:scale-110`}
                            >
                              <LinkIcon
                                className={`h-4.5 w-4.5 ${link.color}`}
                              />
                            </div>
                            <div>
                              <span className="font-display text-sm font-bold text-ink-dark">
                                {link.title}
                              </span>
                              <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">
                                {link.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer with keyboard hints ─────────────────────────── */}
              <div className="flex items-center gap-4 border-t-2 border-ink-light/10 bg-pastel-cream/40 px-5 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-ink-light/25 bg-white text-[10px] font-bold shadow-sm">
                    <ArrowUp className="h-3 w-3" />
                  </kbd>
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-ink-light/25 bg-white text-[10px] font-bold shadow-sm">
                    <ArrowDown className="h-3 w-3" />
                  </kbd>
                  <span>{t("keyNav")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <kbd className="flex h-5 items-center justify-center rounded border border-ink-light/25 bg-white px-1.5 text-[10px] font-bold shadow-sm">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  <span>{t("keyOpen")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <kbd className="flex h-5 items-center justify-center rounded border border-ink-light/25 bg-white px-1.5 text-[10px] font-bold shadow-sm">
                    esc
                  </kbd>
                  <span>{t("keyClose")}</span>
                </div>
                <div className="ml-auto hidden items-center gap-1 text-[11px] text-ink-light sm:flex">
                  <span>
                    {results.length > 0
                      ? `${results.length} ${t("resultCount")}`
                      : ""}
                  </span>
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
