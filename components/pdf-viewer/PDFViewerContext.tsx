"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAnnotations } from "@/hooks/useAnnotations";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReaderPreferences } from "@/hooks/useReaderPreferences";
import type { PDFBook, PDFChapter } from "@/data/pdf-books";
import type { HighlightColor } from "@/hooks/useAnnotations";
import type { FontSize, ReaderTheme } from "@/hooks/useReaderPreferences";

// ─── Context Value Type ─────────────────────────────────────────────────────

interface PDFViewerContextValue {
  // Book data
  book: PDFBook;
  currentChapter: PDFChapter;

  // Reader preferences
  fontSize: FontSize;
  theme: ReaderTheme;
  sidebarOpen: boolean;
  setFontSize: (size: FontSize) => void;
  setTheme: (theme: ReaderTheme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Annotations (forwarded from hook)
  annotations: ReturnType<typeof useAnnotations>;

  // Reading progress (forwarded from hook)
  readingProgress: ReturnType<typeof useReadingProgress>;

  // Active highlight color for new highlights
  activeHighlightColor: HighlightColor;
  setActiveHighlightColor: (color: HighlightColor) => void;

  // Highlight mode toggle
  highlightMode: boolean;
  setHighlightMode: (enabled: boolean) => void;

  // Notes panel
  notesPanelOpen: boolean;
  setNotesPanelOpen: (open: boolean) => void;
  toggleNotesPanel: () => void;

  // Download panel
  downloadPanelOpen: boolean;
  setDownloadPanelOpen: (open: boolean) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const PDFViewerContext = createContext<PDFViewerContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

interface PDFViewerProviderProps {
  book: PDFBook;
  currentChapter: PDFChapter;
  children: ReactNode;
}

export function PDFViewerProvider({
  book,
  currentChapter,
  children,
}: PDFViewerProviderProps) {
  const annotations = useAnnotations(book.slug);
  const readingProgress = useReadingProgress(book.slug);
  const {
    fontSize,
    theme,
    sidebarOpen,
    setFontSize,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
  } = useReaderPreferences();

  const [activeHighlightColor, setActiveHighlightColor] =
    useState<HighlightColor>("yellow");
  const [highlightMode, setHighlightMode] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [downloadPanelOpen, setDownloadPanelOpen] = useState(false);

  const toggleNotesPanel = useCallback(() => {
    setNotesPanelOpen((prev) => !prev);
  }, []);

  return (
    <PDFViewerContext.Provider
      value={{
        book,
        currentChapter,
        fontSize,
        theme,
        sidebarOpen,
        setFontSize,
        setTheme,
        toggleSidebar,
        setSidebarOpen,
        annotations,
        readingProgress,
        activeHighlightColor,
        setActiveHighlightColor,
        highlightMode,
        setHighlightMode,
        notesPanelOpen,
        setNotesPanelOpen,
        toggleNotesPanel,
        downloadPanelOpen,
        setDownloadPanelOpen,
      }}
    >
      {children}
    </PDFViewerContext.Provider>
  );
}

// ─── Consumer Hook ──────────────────────────────────────────────────────────

export function usePDFViewer(): PDFViewerContextValue {
  const ctx = useContext(PDFViewerContext);
  if (!ctx) {
    throw new Error("usePDFViewer must be used within a PDFViewerProvider");
  }
  return ctx;
}
