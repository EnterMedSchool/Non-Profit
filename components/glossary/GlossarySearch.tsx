"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useLocale } from "next-intl";
import type { GlossaryTermSummary, GlossaryTagMap } from "@/types/glossary";
import { getTagDisplayName } from "@/data/glossary-terms";

interface GlossarySearchProps {
  terms: GlossaryTermSummary[];
  tags: GlossaryTagMap;
  /** Placeholder text */
  placeholder?: string;
}

export default function GlossarySearch({
  terms,
  tags,
  placeholder = "Search terms, definitions, or abbreviations...",
}: GlossarySearchProps) {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(terms, {
        keys: [
          { name: "name", weight: 3 },
          { name: "aliases", weight: 2 },
          { name: "abbr", weight: 2 },
          { name: "definition", weight: 1 },
          { name: "tags", weight: 0.5 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [terms],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 12);
  }, [fuse, query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: / to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (
          active?.tagName !== "INPUT" &&
          active?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-light" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border-3 border-ink-dark/10 bg-white py-4 pl-12 pr-12 text-base font-medium text-ink-dark shadow-chunky-sm placeholder:text-ink-light focus:border-showcase-purple/40 focus:outline-none focus:ring-2 focus:ring-showcase-purple/20 transition-all"
          aria-label="Search glossary terms"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-light hover:bg-ink-dark/5 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="absolute right-12 top-1/2 -translate-y-1/2 hidden rounded-md border border-ink-dark/10 bg-ink-dark/5 px-1.5 py-0.5 text-xs text-ink-light sm:block">
          /
        </kbd>
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-2xl border-3 border-ink-dark/10 bg-white shadow-chunky-lg overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto divide-y divide-ink-dark/5">
              {results.map(({ item }) => {
                const tag = tags[item.primary_tag];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/${locale}/resources/glossary/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-showcase-purple/5 transition-colors"
                    >
                      <span className="mt-0.5 text-lg flex-shrink-0">
                        {tag?.icon || "📚"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-ink-dark truncate">
                            {item.name}
                          </span>
                          {item.abbr[0] && (
                            <span className="text-xs text-ink-muted">
                              ({item.abbr[0]})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                          {item.definition
                            .replace(/\*\*(.*?)\*\*/g, "$1")
                            .replace(/<[^>]+>/g, "")
                            .slice(0, 100)}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `${tag?.accent || "#6C5CE7"}15`,
                          color: tag?.accent || "#6C5CE7",
                        }}
                      >
                        {getTagDisplayName(item.primary_tag)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-ink-muted">
              No terms found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
