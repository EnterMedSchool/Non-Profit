"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  FlashcardCard,
  FlashcardTheme,
  ExportSettings,
  ColumnMapping,
} from "./types";
import { DEFAULT_THEME, DEFAULT_EXPORT_SETTINGS } from "./types";

// ── LocalStorage persistence ─────────────────────────────────────────
const STORAGE_KEY = "flashcard-maker-state";

interface PersistedState {
  cards: FlashcardCard[];
  theme: FlashcardTheme;
  exportSettings: ExportSettings;
}

function loadPersistedState(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return {};
  }
}

function persistState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ── Context value shape ──────────────────────────────────────────────
interface FlashcardContextValue {
  /* Card data */
  cards: FlashcardCard[];
  setCards: (cards: FlashcardCard[]) => void;
  addCards: (cards: FlashcardCard[]) => void;
  removeCard: (id: string) => void;
  updateCard: (id: string, patch: Partial<FlashcardCard>) => void;
  clearCards: () => void;

  /* Selection */
  selectedCardIndex: number;
  setSelectedCardIndex: (index: number) => void;

  /* Theme */
  theme: FlashcardTheme;
  setTheme: (theme: FlashcardTheme) => void;
  updateTheme: (patch: Partial<FlashcardTheme>) => void;

  /* Export settings */
  exportSettings: ExportSettings;
  setExportSettings: (settings: ExportSettings) => void;
  updateExportSettings: (patch: Partial<ExportSettings>) => void;

  /* Column mapping (remembered from last import) */
  columnMapping: ColumnMapping | null;
  setColumnMapping: (mapping: ColumnMapping | null) => void;

  /* UI state */
  activePanel: "import" | "customize" | "export";
  setActivePanel: (panel: "import" | "customize" | "export") => void;
}

const FlashcardContext = createContext<FlashcardContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────
export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<FlashcardCard[]>(() => {
    const persisted = loadPersistedState();
    return persisted.cards ?? [];
  });
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [theme, setTheme] = useState<FlashcardTheme>(() => {
    const persisted = loadPersistedState();
    return persisted.theme ?? DEFAULT_THEME;
  });
  const [exportSettings, setExportSettings] = useState<ExportSettings>(() => {
    const persisted = loadPersistedState();
    return persisted.exportSettings ?? DEFAULT_EXPORT_SETTINGS;
  });
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(
    null,
  );
  const [activePanel, setActivePanel] = useState<
    "import" | "customize" | "export"
  >(() => {
    // If we have persisted cards, start on customize panel
    const persisted = loadPersistedState();
    return persisted.cards && persisted.cards.length > 0 ? "customize" : "import";
  });

  // Persist state to localStorage on changes
  useEffect(() => {
    persistState({ cards, theme, exportSettings });
  }, [cards, theme, exportSettings]);

  const addCards = useCallback((newCards: FlashcardCard[]) => {
    setCards((prev) => [...prev, ...newCards]);
  }, []);

  const removeCard = useCallback(
    (id: string) => {
      setCards((prev) => {
        const removedIndex = prev.findIndex((c) => c.id === id);
        const next = prev.filter((c) => c.id !== id);
        // Only adjust index when the removed card is at or before the current selection
        setSelectedCardIndex((idx) => {
          if (next.length === 0) return 0;
          if (removedIndex <= idx) return Math.max(0, idx - 1);
          return Math.min(idx, next.length - 1);
        });
        return next;
      });
    },
    [],
  );

  const updateCard = useCallback(
    (id: string, patch: Partial<FlashcardCard>) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const clearCards = useCallback(() => {
    setCards([]);
    // Keep at 0; downstream components guard against empty arrays
    setSelectedCardIndex(0);
    // Clear persisted cards (theme/settings are preserved intentionally)
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.cards = [];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Bounds-safe setter: clamp index to valid range whenever it's changed
  const safeSetSelectedCardIndex = useCallback(
    (indexOrUpdater: number | ((prev: number) => number)) => {
      setSelectedCardIndex((prev) => {
        const raw = typeof indexOrUpdater === "function" ? indexOrUpdater(prev) : indexOrUpdater;
        // Will be re-clamped if cards change, but keeps it safe at call time
        return Math.max(0, raw);
      });
    },
    [],
  );

  const updateTheme = useCallback((patch: Partial<FlashcardTheme>) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateExportSettings = useCallback(
    (patch: Partial<ExportSettings>) => {
      setExportSettings((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  return (
    <FlashcardContext.Provider
      value={{
        cards,
        setCards,
        addCards,
        removeCard,
        updateCard,
        clearCards,
        selectedCardIndex,
        setSelectedCardIndex: safeSetSelectedCardIndex,
        theme,
        setTheme,
        updateTheme,
        exportSettings,
        setExportSettings,
        updateExportSettings,
        columnMapping,
        setColumnMapping,
        activePanel,
        setActivePanel,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useFlashcards() {
  const ctx = useContext(FlashcardContext);
  if (!ctx) {
    throw new Error("useFlashcards must be used within a FlashcardProvider");
  }
  return ctx;
}
