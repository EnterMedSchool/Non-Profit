"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type FontSize = "small" | "medium" | "large" | "xl";
export type ReaderTheme = "light" | "sepia" | "dark";

export interface ReaderPreferences {
  fontSize: FontSize;
  theme: ReaderTheme;
  sidebarOpen: boolean;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSize: "medium",
  theme: "light",
  sidebarOpen: true,
};

const STORAGE_KEY = "ems-reader-prefs";

// ─── Font size classes ──────────────────────────────────────────────────────

export const fontSizeClasses: Record<FontSize, string> = {
  small: "text-sm leading-relaxed",
  medium: "text-base leading-relaxed",
  large: "text-lg leading-loose",
  xl: "text-xl leading-loose",
};

export const fontSizeLabels: Record<FontSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  xl: "Extra Large",
};

// ─── Theme classes ──────────────────────────────────────────────────────────

export const themeClasses: Record<
  ReaderTheme,
  { bg: string; text: string; prose: string; surface: string; border: string }
> = {
  light: {
    bg: "bg-white",
    text: "text-ink-dark",
    prose: "prose-gray",
    surface: "bg-gray-50",
    border: "border-gray-200",
  },
  sepia: {
    bg: "bg-amber-50/80",
    text: "text-amber-950",
    prose: "prose-amber",
    surface: "bg-amber-100/50",
    border: "border-amber-200",
  },
  dark: {
    bg: "bg-gray-900",
    text: "text-gray-100",
    prose: "prose-invert",
    surface: "bg-gray-800",
    border: "border-gray-700",
  },
};

// ─── localStorage helpers ───────────────────────────────────────────────────

function readPreferences(): ReaderPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;
    return {
      fontSize:
        parsed.fontSize &&
        ["small", "medium", "large", "xl"].includes(parsed.fontSize)
          ? (parsed.fontSize as FontSize)
          : DEFAULT_PREFERENCES.fontSize,
      theme:
        parsed.theme &&
        ["light", "sepia", "dark"].includes(parsed.theme)
          ? (parsed.theme as ReaderTheme)
          : DEFAULT_PREFERENCES.theme,
      sidebarOpen:
        typeof parsed.sidebarOpen === "boolean"
          ? parsed.sidebarOpen
          : DEFAULT_PREFERENCES.sidebarOpen,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(prefs: ReaderPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useReaderPreferences() {
  const [prefs, setPrefs] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);

  // Load on mount
  useEffect(() => {
    setPrefs(readPreferences());
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<ReaderPreferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...updates };
        writePreferences(next);
        return next;
      });
    },
    [],
  );

  const setFontSize = useCallback(
    (fontSize: FontSize) => updatePreferences({ fontSize }),
    [updatePreferences],
  );

  const setTheme = useCallback(
    (theme: ReaderTheme) => updatePreferences({ theme }),
    [updatePreferences],
  );

  const toggleSidebar = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, sidebarOpen: !prev.sidebarOpen };
      writePreferences(next);
      return next;
    });
  }, []);

  const setSidebarOpen = useCallback(
    (open: boolean) => updatePreferences({ sidebarOpen: open }),
    [updatePreferences],
  );

  const resetPreferences = useCallback(() => {
    writePreferences(DEFAULT_PREFERENCES);
    setPrefs(DEFAULT_PREFERENCES);
  }, []);

  return {
    ...prefs,
    updatePreferences,
    setFontSize,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    resetPreferences,
  };
}
