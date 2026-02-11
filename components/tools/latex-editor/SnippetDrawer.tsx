"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import SnippetCard from "./SnippetCard";
import type { LaTeXSnippet } from "./types";
import { Search, X, Puzzle, Star, Clock, Sparkles } from "lucide-react";

const FAVORITES_KEY = "ems-latex-snippet-favorites";
const RECENT_KEY = "ems-latex-snippet-recent";
const MAX_RECENT = 8;

export default function SnippetDrawer() {
  const t = useTranslations("tools.latexEditor.ui");
  const { insertAtCursor, setActivePanel, activeDocument } = useLaTeXEditor();
  const [activeCategory, setActiveCategory] = useState<string | "all" | "favorites" | "recent" | "suggested">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [latexSnippets, setLatexSnippets] = useState<LaTeXSnippet[]>([]);

  useEffect(() => {
    import("@/data/latex-snippets").then((mod) => setLatexSnippets(mod.latexSnippets));
  }, []);

  const categories = useMemo(
    () => [...new Set(latexSnippets.map((s) => s.category))],
    [latexSnippets],
  );

  // Load favorites and recent from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(FAVORITES_KEY);
      if (storedFavs) setFavorites(new Set(JSON.parse(storedFavs)));
      const storedRecent = localStorage.getItem(RECENT_KEY);
      if (storedRecent) setRecentIds(JSON.parse(storedRecent));
    } catch {
      /* noop */
    }
  }, []);

  const saveFavorites = useCallback((fav: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(fav)));
    } catch { /* noop */ }
  }, []);

  const saveRecent = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
    } catch { /* noop */ }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavorites(next);
      return next;
    });
  }, [saveFavorites]);

  const addToRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, [saveRecent]);

  // Suggested snippets based on document content
  const suggestedSnippets = useMemo(() => {
    const content = activeDocument?.content ?? "";
    const suggestions: LaTeXSnippet[] = [];

    // If no itemize, suggest it
    if (!content.includes("\\begin{itemize}") && !content.includes("\\begin{enumerate}")) {
      const listSnippet = latexSnippets.find((s) => s.id === "itemize");
      if (listSnippet) suggestions.push(listSnippet);
    }
    // If no math, suggest it
    if (!content.includes("$") && !content.includes("\\begin{equation}")) {
      const mathSnippet = latexSnippets.find((s) => s.id === "inline-math");
      if (mathSnippet) suggestions.push(mathSnippet);
    }
    // If no table, suggest it
    if (!content.includes("\\begin{tabular}")) {
      const tableSnippet = latexSnippets.find((s) => s.id === "basic-table");
      if (tableSnippet) suggestions.push(tableSnippet);
    }
    // If no figure, suggest it
    if (!content.includes("\\begin{figure}")) {
      const figSnippet = latexSnippets.find((s) => s.id === "figure");
      if (figSnippet) suggestions.push(figSnippet);
    }
    // If no section beyond default, suggest subsection
    if ((content.match(/\\section\{/g) || []).length <= 1) {
      const secSnippet = latexSnippets.find((s) => s.id === "section");
      if (secSnippet) suggestions.push(secSnippet);
    }

    return suggestions.slice(0, 5);
  }, [activeDocument?.content, latexSnippets]);

  const filtered = useMemo(() => {
    if (activeCategory === "favorites") {
      return latexSnippets.filter((s) => favorites.has(s.id));
    }
    if (activeCategory === "recent") {
      return recentIds
        .map((id) => latexSnippets.find((s) => s.id === id))
        .filter(Boolean) as LaTeXSnippet[];
    }
    if (activeCategory === "suggested") {
      return suggestedSnippets;
    }

    let result = latexSnippets;
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          s.code.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery, favorites, recentIds, suggestedSnippets, latexSnippets]);

  const handleInsert = (snippet: LaTeXSnippet) => {
    insertAtCursor(snippet.code);
    addToRecent(snippet.id);
  };

  const handleLearnMore = (snippet: LaTeXSnippet) => {
    setActivePanel("learning");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink-dark/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Puzzle size={15} className="text-showcase-purple" />
            <h3 className="text-sm font-bold text-ink-dark">{t("snippets")}</h3>
          </div>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1 rounded-md text-ink-light hover:text-ink-muted hover:bg-pastel-cream transition-colors lg:hidden"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-[10px] text-ink-muted mb-2">
          {t("snippetsHint")}
        </p>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-light" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchSnippetsPlaceholder")}
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-ink-dark/10 text-xs focus:outline-none focus:border-showcase-purple/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="px-4 py-2 flex gap-1 flex-wrap border-b border-ink-dark/5">
        {/* Special categories */}
        <CategoryPill
          icon={<Star size={9} />}
          label={t("favorites")}
          active={activeCategory === "favorites"}
          onClick={() => setActiveCategory("favorites")}
          count={favorites.size}
        />
        <CategoryPill
          icon={<Clock size={9} />}
          label={t("recent")}
          active={activeCategory === "recent"}
          onClick={() => setActiveCategory("recent")}
          count={recentIds.length}
        />
        {suggestedSnippets.length > 0 && (
          <CategoryPill
            icon={<Sparkles size={9} />}
            label={t("suggested")}
            active={activeCategory === "suggested"}
            onClick={() => setActiveCategory("suggested")}
          />
        )}
        <div className="w-full h-0" /> {/* Line break */}
        <CategoryPill
          label={t("all")}
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Snippet list */}
      <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-ink-muted">
            <p className="text-xs">
              {activeCategory === "favorites"
                ? t("noFavoritesYet")
                : activeCategory === "recent"
                ? t("noRecentlyUsed")
                : t("noSnippetsFound")}
            </p>
          </div>
        ) : (
          filtered.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onInsert={() => handleInsert(snippet)}
              onLearnMore={handleLearnMore}
              isFavorite={favorites.has(snippet.id)}
              onToggleFavorite={() => toggleFavorite(snippet.id)}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-ink-dark/5 bg-pastel-cream/30">
        <p className="text-[10px] text-ink-muted text-center">
          {t("starTip")}
        </p>
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
  icon,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-showcase-purple text-white"
          : "bg-pastel-cream text-ink-muted hover:text-ink-dark"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-[8px] ${active ? "text-white/70" : "text-ink-light"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
