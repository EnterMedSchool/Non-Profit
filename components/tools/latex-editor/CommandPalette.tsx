"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import { Search, CornerDownLeft, X } from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
}

export default function CommandPalette() {
  const { setIsCommandPaletteOpen, insertAtCursor } = useLaTeXEditor();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Dynamically load snippets
  const [allCommands, setAllCommands] = useState<CommandItem[]>([]);

  useEffect(() => {
    import("@/data/latex-snippets").then((mod) => {
      setAllCommands(
        mod.latexSnippets.map((s) => ({
          id: s.id,
          title: s.title,
          category: s.category,
          description: s.description,
          code: s.code,
        })),
      );
    });
  }, []);

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.code.toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        insertAtCursor(filtered[selectedIndex].code);
        setIsCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filtered, selectedIndex, insertAtCursor, setIsCommandPaletteOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [setIsCommandPaletteOpen]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-dark/5">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LaTeX commands and snippets..."
            className="flex-1 text-sm bg-transparent outline-none text-ink-dark placeholder:text-ink-light"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-pastel-cream text-[10px] text-ink-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              No commands found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                data-index={i}
                onClick={() => {
                  insertAtCursor(cmd.code);
                  setIsCommandPaletteOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-showcase-purple/10"
                    : "hover:bg-pastel-cream/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-dark truncate">
                      {cmd.title}
                    </span>
                    <span className="text-[10px] text-ink-light px-1.5 py-0.5 bg-pastel-cream rounded">
                      {cmd.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-muted truncate mt-0.5">
                    {cmd.description}
                  </p>
                </div>
                {i === selectedIndex && (
                  <div className="flex items-center gap-1 text-[10px] text-showcase-purple flex-shrink-0">
                    <CornerDownLeft size={10} />
                    <span>Insert</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-ink-dark/5 bg-pastel-cream/30">
          <div className="flex items-center gap-3 text-[10px] text-ink-muted">
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-ink-dark/10">↑</kbd>{" "}
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-ink-dark/10">↓</kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-ink-dark/10">Enter</kbd>{" "}
              Insert
            </span>
          </div>
          <span className="text-[10px] text-ink-muted">
            {filtered.length} command{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
