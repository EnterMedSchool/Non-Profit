"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

export interface Highlight {
  id: string;
  chapterSlug: string;
  text: string;
  color: HighlightColor;
  /** XPath-like path from the content root to the start container */
  startContainerPath: string;
  startOffset: number;
  /** XPath-like path from the content root to the end container */
  endContainerPath: string;
  endOffset: number;
  createdAt: string;
}

export interface Note {
  id: string;
  chapterSlug: string;
  /** Optional link to a highlight */
  highlightId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnotationStore {
  highlights: Highlight[];
  notes: Note[];
}

// ─── localStorage helpers ───────────────────────────────────────────────────

function getHighlightsKey(bookSlug: string): string {
  return `ems-pdf-${bookSlug}-highlights`;
}

function getNotesKey(bookSlug: string): string {
  return `ems-pdf-${bookSlug}-notes`;
}

function readHighlights(bookSlug: string): Highlight[] {
  try {
    const raw = localStorage.getItem(getHighlightsKey(bookSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHighlights(bookSlug: string, highlights: Highlight[]): void {
  try {
    localStorage.setItem(getHighlightsKey(bookSlug), JSON.stringify(highlights));
  } catch {
    // localStorage may be unavailable
  }
}

function readNotes(bookSlug: string): Note[] {
  try {
    const raw = localStorage.getItem(getNotesKey(bookSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotes(bookSlug: string, notes: Note[]): void {
  try {
    localStorage.setItem(getNotesKey(bookSlug), JSON.stringify(notes));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── DOM Range Serialization ────────────────────────────────────────────────

/**
 * Compute an XPath-like path from a root element to a target node.
 * Used to serialize highlight positions across page reloads.
 */
export function getNodePath(root: Node, target: Node): string {
  const path: number[] = [];
  let current: Node | null = target;
  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) break;
    const children = Array.from(parent.childNodes);
    path.unshift(children.indexOf(current as ChildNode));
    current = parent;
  }
  return path.join("/");
}

/**
 * Resolve an XPath-like path from a root element to a target node.
 */
export function resolveNodePath(root: Node, path: string): Node | null {
  if (!path) return root;
  const indices = path.split("/").map(Number);
  let current: Node = root;
  for (const idx of indices) {
    if (isNaN(idx) || !current.childNodes[idx]) return null;
    current = current.childNodes[idx];
  }
  return current;
}

// ─── Generate unique IDs ────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAnnotations(bookSlug: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load on mount
  useEffect(() => {
    setHighlights(readHighlights(bookSlug));
    setNotes(readNotes(bookSlug));
  }, [bookSlug]);

  // ── Highlights ──

  const addHighlight = useCallback(
    (
      data: Omit<Highlight, "id" | "createdAt">,
    ): Highlight => {
      const highlight: Highlight = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => {
        const next = [...prev, highlight];
        writeHighlights(bookSlug, next);
        return next;
      });
      return highlight;
    },
    [bookSlug],
  );

  const removeHighlight = useCallback(
    (id: string) => {
      setHighlights((prev) => {
        const next = prev.filter((h) => h.id !== id);
        writeHighlights(bookSlug, next);
        return next;
      });
      // Also remove any notes linked to this highlight
      setNotes((prev) => {
        const next = prev.filter((n) => n.highlightId !== id);
        writeNotes(bookSlug, next);
        return next;
      });
    },
    [bookSlug],
  );

  const updateHighlightColor = useCallback(
    (id: string, color: HighlightColor) => {
      setHighlights((prev) => {
        const next = prev.map((h) => (h.id === id ? { ...h, color } : h));
        writeHighlights(bookSlug, next);
        return next;
      });
    },
    [bookSlug],
  );

  const getChapterHighlights = useCallback(
    (chapterSlug: string): Highlight[] => {
      return highlights.filter((h) => h.chapterSlug === chapterSlug);
    },
    [highlights],
  );

  // ── Notes ──

  const addNote = useCallback(
    (
      data: Pick<Note, "chapterSlug" | "content" | "highlightId">,
    ): Note => {
      const note: Note = {
        ...data,
        id: generateId(),
        highlightId: data.highlightId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => {
        const next = [...prev, note];
        writeNotes(bookSlug, next);
        return next;
      });
      return note;
    },
    [bookSlug],
  );

  const updateNote = useCallback(
    (id: string, content: string) => {
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.id === id
            ? { ...n, content, updatedAt: new Date().toISOString() }
            : n,
        );
        writeNotes(bookSlug, next);
        return next;
      });
    },
    [bookSlug],
  );

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        writeNotes(bookSlug, next);
        return next;
      });
    },
    [bookSlug],
  );

  const getChapterNotes = useCallback(
    (chapterSlug: string): Note[] => {
      return notes.filter((n) => n.chapterSlug === chapterSlug);
    },
    [notes],
  );

  // ── Export ──

  const exportAnnotations = useCallback((): string => {
    const data: AnnotationStore = { highlights, notes };
    return JSON.stringify(data, null, 2);
  }, [highlights, notes]);

  const importAnnotations = useCallback(
    (json: string) => {
      try {
        const data = JSON.parse(json) as Partial<AnnotationStore>;
        if (Array.isArray(data.highlights)) {
          setHighlights(data.highlights);
          writeHighlights(bookSlug, data.highlights);
        }
        if (Array.isArray(data.notes)) {
          setNotes(data.notes);
          writeNotes(bookSlug, data.notes);
        }
      } catch {
        // Invalid JSON
      }
    },
    [bookSlug],
  );

  return {
    highlights,
    notes,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    getChapterHighlights,
    addNote,
    updateNote,
    removeNote,
    getChapterNotes,
    exportAnnotations,
    importAnnotations,
  };
}
