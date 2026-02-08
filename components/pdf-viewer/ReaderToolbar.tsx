"use client";

import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Highlighter,
  StickyNote,
  Type,
  Sun,
  Moon,
  BookOpen,
  Download,
  PanelLeftClose,
  PanelLeft,
  Settings,
  X,
  Search,
  FileUp,
  FileDown,
  Printer,
} from "lucide-react";
import { usePDFViewer } from "./PDFViewerContext";
import BookSearch from "./BookSearch";
import type { HighlightColor } from "@/hooks/useAnnotations";
import {
  fontSizeLabels,
  type FontSize,
  type ReaderTheme,
} from "@/hooks/useReaderPreferences";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getAdjacentChapters } from "@/data/pdf-books";

const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string; label: string }[] =
  [
    { color: "yellow", bg: "bg-yellow-300", label: "Yellow" },
    { color: "green", bg: "bg-emerald-300", label: "Green" },
    { color: "blue", bg: "bg-blue-300", label: "Blue" },
    { color: "pink", bg: "bg-pink-300", label: "Pink" },
    { color: "orange", bg: "bg-orange-300", label: "Orange" },
  ];

const FONT_SIZES: FontSize[] = ["small", "medium", "large", "xl"];

const THEMES: { id: ReaderTheme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "sepia", label: "Sepia", icon: BookOpen },
  { id: "dark", label: "Dark", icon: Moon },
];

export default function ReaderToolbar() {
  const {
    highlightMode,
    setHighlightMode,
    activeHighlightColor,
    setActiveHighlightColor,
    toggleNotesPanel,
    notesPanelOpen,
    setNotesPanelOpen,
    setDownloadPanelOpen,
    downloadPanelOpen,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    annotations,
    book,
    currentChapter,
  } = usePDFViewer();

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);

  const { prev, next } = getAdjacentChapters(book, currentChapter.slug);

  // ── Keyboard shortcuts ──
  const shortcuts = useMemo(
    () => ({
      h: () => setHighlightMode(!highlightMode),
      n: () => toggleNotesPanel(),
      escape: () => {
        if (notesPanelOpen) setNotesPanelOpen(false);
        else if (downloadPanelOpen) setDownloadPanelOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (searchOpen) setSearchOpen(false);
        else if (sidebarOpen) setSidebarOpen(false);
      },
      arrowleft: () => {
        if (prev) router.push(`/${locale}/resources/pdfs/${book.slug}/${prev.slug}`);
      },
      arrowright: () => {
        if (next) router.push(`/${locale}/resources/pdfs/${book.slug}/${next.slug}`);
      },
      "/": () => setSearchOpen(true),
      s: () => toggleSidebar(),
      d: () => setDownloadPanelOpen(!downloadPanelOpen),
      p: () => window.print(),
    }),
    [
      highlightMode, setHighlightMode, toggleNotesPanel, notesPanelOpen,
      setNotesPanelOpen, downloadPanelOpen, setDownloadPanelOpen,
      settingsOpen, searchOpen, sidebarOpen, setSidebarOpen,
      prev, next, router, locale, book.slug, toggleSidebar,
    ],
  );

  useKeyboardShortcuts(shortcuts);

  // ── Annotation export/import ──
  const handleExportAnnotations = useCallback(() => {
    const json = annotations.exportAnnotations();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.slug}-annotations.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowAnnotationMenu(false);
  }, [annotations, book.slug]);

  const handleImportAnnotations = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        annotations.importAnnotations(reader.result as string);
      };
      reader.readAsText(file);
    };
    input.click();
    setShowAnnotationMenu(false);
  }, [annotations]);

  return (
    <>
      {/* Desktop toolbar — fixed on the right side */}
      <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <div className="flex flex-col gap-1.5 rounded-2xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky-sm">
          {/* Sidebar toggle */}
          <ToolbarButton
            icon={sidebarOpen ? PanelLeftClose : PanelLeft}
            label={sidebarOpen ? "Hide sidebar (S)" : "Show sidebar (S)"}
            onClick={toggleSidebar}
            active={sidebarOpen}
          />

          <div className="mx-auto h-px w-6 bg-gray-100" />

          {/* Search */}
          <ToolbarButton
            icon={Search}
            label="Search in book (/)"
            onClick={() => setSearchOpen(true)}
          />

          {/* Highlight toggle */}
          <ToolbarButton
            icon={Highlighter}
            label="Highlight mode (H)"
            onClick={() => setHighlightMode(!highlightMode)}
            active={highlightMode}
            activeColor="text-yellow-600 bg-yellow-50"
          />

          {/* Highlight color picker (visible when highlight mode is on) */}
          <AnimatePresence>
            {highlightMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col items-center gap-1 overflow-hidden"
              >
                {HIGHLIGHT_COLORS.map(({ color, bg }) => (
                  <button
                    key={color}
                    onClick={() => setActiveHighlightColor(color)}
                    className={`h-5 w-5 rounded-full border-2 transition-transform ${bg} ${
                      activeHighlightColor === color
                        ? "scale-110 border-showcase-navy"
                        : "border-transparent hover:scale-105"
                    }`}
                    title={color}
                    aria-label={`Highlight color: ${color}`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes */}
          <ToolbarButton
            icon={StickyNote}
            label="Notes (N)"
            onClick={toggleNotesPanel}
            active={notesPanelOpen}
            activeColor="text-showcase-teal bg-showcase-teal/10"
          />

          <div className="mx-auto h-px w-6 bg-gray-100" />

          {/* Annotation export/import */}
          <div className="relative">
            <ToolbarButton
              icon={FileUp}
              label="Annotations"
              onClick={() => setShowAnnotationMenu(!showAnnotationMenu)}
              active={showAnnotationMenu}
            />
            <AnimatePresence>
              {showAnnotationMenu && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-12 top-0 z-10 w-44 rounded-xl border-2 border-showcase-navy/10 bg-white p-1.5 shadow-lg"
                >
                  <button
                    onClick={handleExportAnnotations}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-gray-50"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Export annotations
                  </button>
                  <button
                    onClick={handleImportAnnotations}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-gray-50"
                  >
                    <FileUp className="h-3.5 w-3.5" />
                    Import annotations
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <ToolbarButton
            icon={Settings}
            label="Settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            active={settingsOpen}
          />

          {/* Print */}
          <ToolbarButton
            icon={Printer}
            label="Print chapter (P)"
            onClick={() => window.print()}
          />

          {/* Download */}
          <ToolbarButton
            icon={Download}
            label="Download (D)"
            onClick={() => setDownloadPanelOpen(true)}
          />
        </div>
      </div>

      {/* Mobile toolbar — fixed at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-showcase-navy/10 bg-white/95 px-2 py-2 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <MobileToolbarButton
            icon={sidebarOpen ? PanelLeftClose : PanelLeft}
            label="TOC"
            onClick={toggleSidebar}
            active={sidebarOpen}
          />
          <MobileToolbarButton
            icon={Search}
            label="Search"
            onClick={() => setSearchOpen(true)}
          />
          <MobileToolbarButton
            icon={Highlighter}
            label="Highlight"
            onClick={() => setHighlightMode(!highlightMode)}
            active={highlightMode}
            activeColor="text-yellow-600"
          />
          <MobileToolbarButton
            icon={StickyNote}
            label="Notes"
            onClick={toggleNotesPanel}
            active={notesPanelOpen}
            activeColor="text-showcase-teal"
          />
          <MobileToolbarButton
            icon={Settings}
            label="Settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            active={settingsOpen}
          />
          <MobileToolbarButton
            icon={Download}
            label="Download"
            onClick={() => setDownloadPanelOpen(true)}
          />
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm"
              onClick={() => setSettingsOpen(false)}
              role="presentation"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-label="Reading Settings"
              className="fixed bottom-16 right-4 z-[71] w-72 rounded-2xl border-3 border-showcase-navy bg-white p-5 shadow-chunky lg:bottom-auto lg:right-20 lg:top-1/2 lg:-translate-y-1/2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-bold text-ink-dark">
                  Reading Settings
                </h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted hover:bg-gray-100"
                  aria-label="Close settings"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Font size */}
              <div className="mb-4">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-muted">
                  <Type className="h-3.5 w-3.5" />
                  Font Size
                </label>
                <div className="flex gap-1">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        fontSize === size
                          ? "bg-showcase-purple text-white"
                          : "bg-gray-50 text-ink-muted hover:bg-gray-100"
                      }`}
                    >
                      {fontSizeLabels[size]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-muted">
                  <Sun className="h-3.5 w-3.5" />
                  Theme
                </label>
                <div className="flex gap-1">
                  {THEMES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        theme === id
                          ? "bg-showcase-purple text-white"
                          : "bg-gray-50 text-ink-muted hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile highlight colors */}
              <div className="mt-4 lg:hidden">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-muted">
                  <Highlighter className="h-3.5 w-3.5" />
                  Highlight Color
                </label>
                <div className="flex gap-2">
                  {HIGHLIGHT_COLORS.map(({ color, bg, label }) => (
                    <button
                      key={color}
                      onClick={() => setActiveHighlightColor(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${bg} ${
                        activeHighlightColor === color
                          ? "scale-110 border-showcase-navy"
                          : "border-transparent hover:scale-105"
                      }`}
                      title={label}
                      aria-label={`Highlight color: ${label}`}
                    />
                  ))}
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="mt-4 rounded-lg bg-gray-50 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light mb-1.5">
                  Keyboard Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-ink-muted">
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">H</kbd> Highlight</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">N</kbd> Notes</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">S</kbd> Sidebar</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">D</kbd> Download</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">/</kbd> Search</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">P</kbd> Print</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">&larr;</kbd> Prev chapter</span>
                  <span><kbd className="rounded bg-gray-200 px-1 font-mono">&rarr;</kbd> Next chapter</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search dialog */}
      {searchOpen && (
        <SearchDialog
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}

// ─── Search Dialog wrapper ───────────────────────────────────────────────────

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { book } = usePDFViewer();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search results
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const results: Array<{
      chapterSlug: string;
      chapterNumber: number;
      sectionTitle: string;
      sectionId: string;
      excerpt: string;
      matchStart: number;
      matchLength: number;
    }> = [];
    const lowerQuery = query.toLowerCase();

    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        const plainText = section.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
        const lowerText = plainText.toLowerCase();
        let searchFrom = 0;

        while (searchFrom < lowerText.length && results.length < 50) {
          const idx = lowerText.indexOf(lowerQuery, searchFrom);
          if (idx === -1) break;

          const contextStart = Math.max(0, idx - 40);
          const contextEnd = Math.min(plainText.length, idx + query.length + 40);
          const excerpt = (contextStart > 0 ? "..." : "") +
            plainText.slice(contextStart, contextEnd).trim() +
            (contextEnd < plainText.length ? "..." : "");

          results.push({
            chapterSlug: chapter.slug,
            chapterNumber: chapter.number,
            sectionTitle: section.title,
            sectionId: section.id,
            excerpt,
            matchStart: idx - contextStart + (contextStart > 0 ? 3 : 0),
            matchLength: query.length,
          });

          searchFrom = idx + query.length;
        }
      }
    }
    return results;
  }, [query, book.chapters]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        role="dialog"
        aria-modal="true"
        aria-label="Search in book"
        className="fixed left-1/2 top-[8vh] z-[91] w-[94vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
      >
        <div className="flex items-center gap-3 border-b-2 border-showcase-navy/10 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this book..."
            className="flex-1 bg-transparent text-sm text-ink-dark outline-none placeholder:text-ink-light"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-ink-light hover:text-ink-muted">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs font-bold text-ink-muted hover:bg-gray-100">
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-ink-light/40" />
              <p className="mt-2 text-sm text-ink-muted">Type at least 2 characters to search</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-muted">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              {results.map((r, i) => (
                <a
                  key={`${r.sectionId}-${i}`}
                  href={`/${locale}/resources/pdfs/${book.slug}/${r.chapterSlug}#${r.sectionId}`}
                  onClick={onClose}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold text-showcase-purple">Ch. {r.chapterNumber}</span>
                      <span className="text-ink-light">&middot;</span>
                      <span className="font-semibold text-ink-muted truncate">{r.sectionTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                      {r.excerpt.slice(0, r.matchStart)}
                      <mark className="rounded bg-yellow-200 px-0.5 font-semibold text-ink-dark">
                        {r.excerpt.slice(r.matchStart, r.matchStart + r.matchLength)}
                      </mark>
                      {r.excerpt.slice(r.matchStart + r.matchLength)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const ToolbarButton = memo(function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  activeColor = "text-showcase-purple bg-showcase-purple/10",
}: {
  icon: typeof Highlighter;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
        active ? activeColor : "text-ink-muted hover:bg-gray-50 hover:text-ink-dark"
      }`}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
});

const MobileToolbarButton = memo(function MobileToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  activeColor = "text-showcase-purple",
}: {
  icon: typeof Highlighter;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
        active ? activeColor : "text-ink-muted"
      }`}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
});
