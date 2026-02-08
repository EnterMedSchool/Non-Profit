"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type {
  MCQQuestion,
  MCQExam,
  MCQExamSection,
  MCQPdfTheme,
  MCQEmbedTheme,
  MCQExportSettings,
  MCQPanel,
} from "./types";
import {
  DEFAULT_PDF_THEME,
  DEFAULT_EMBED_THEME,
  DEFAULT_EXPORT_SETTINGS,
  DEFAULT_EXAM_SETTINGS,
} from "./types";
import { SCHEMA_VERSION } from "./constants";

// ── Storage keys ─────────────────────────────────────────────────────
const STORAGE_KEY = "mcq-maker-data";
const AUTO_SAVE_MS = 10_000;

// ── Persisted shape ──────────────────────────────────────────────────
interface MCQPersistedData {
  version: number;
  questions: MCQQuestion[];
  exams: MCQExam[];
  pdfTheme: MCQPdfTheme;
  embedTheme: MCQEmbedTheme;
  exportSettings: MCQExportSettings;
}

// ── Validation ──────────────────────────────────────────────────────
function isValidQuestion(q: unknown): q is MCQQuestion {
  if (!q || typeof q !== "object") return false;
  const obj = q as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.question === "string" &&
    Array.isArray(obj.options) &&
    obj.options.length >= 1 &&
    typeof obj.correctOptionId === "string" &&
    obj.options.every(
      (o: unknown) =>
        o &&
        typeof o === "object" &&
        typeof (o as Record<string, unknown>).id === "string" &&
        typeof (o as Record<string, unknown>).text === "string",
    )
  );
}

function validatePersistedData(
  raw: unknown,
): MCQPersistedData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  if (!Array.isArray(data.questions)) return null;

  // Validate each question
  const validQuestions = (data.questions as unknown[]).filter(isValidQuestion);

  return {
    version: typeof data.version === "number" ? data.version : 1,
    questions: validQuestions,
    exams: Array.isArray(data.exams) ? (data.exams as MCQExam[]) : [],
    pdfTheme:
      data.pdfTheme && typeof data.pdfTheme === "object"
        ? { ...DEFAULT_PDF_THEME, ...(data.pdfTheme as Partial<MCQPdfTheme>) }
        : DEFAULT_PDF_THEME,
    embedTheme:
      data.embedTheme && typeof data.embedTheme === "object"
        ? {
            ...DEFAULT_EMBED_THEME,
            ...(data.embedTheme as Partial<MCQEmbedTheme>),
          }
        : DEFAULT_EMBED_THEME,
    exportSettings:
      data.exportSettings && typeof data.exportSettings === "object"
        ? {
            ...DEFAULT_EXPORT_SETTINGS,
            ...(data.exportSettings as Partial<MCQExportSettings>),
          }
        : DEFAULT_EXPORT_SETTINGS,
  };
}

// ── Context value ────────────────────────────────────────────────────
interface MCQContextValue {
  /* Questions */
  questions: MCQQuestion[];
  setQuestions: (q: MCQQuestion[]) => void;
  addQuestion: (q: MCQQuestion) => void;
  addQuestions: (qs: MCQQuestion[]) => void;
  updateQuestion: (id: string, patch: Partial<MCQQuestion>) => void;
  removeQuestion: (id: string) => void;
  removeQuestions: (ids: string[]) => void;
  clearQuestions: () => void;
  reorderQuestions: (fromIdx: number, toIdx: number) => void;

  /* Exams */
  exams: MCQExam[];
  setExams: (e: MCQExam[]) => void;
  addExam: (e: MCQExam) => void;
  updateExam: (id: string, patch: Partial<MCQExam>) => void;
  removeExam: (id: string) => void;

  /* Selected indices */
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  selectedExamId: string | null;
  setSelectedExamId: (id: string | null) => void;

  /* Editing question (the one in the editor) */
  editingQuestion: MCQQuestion | null;
  setEditingQuestion: (q: MCQQuestion | null) => void;

  /* Editor draft (survives tab switches) */
  editorDraft: MCQQuestion | null;
  setEditorDraft: (q: MCQQuestion | null) => void;

  /* Themes & settings */
  pdfTheme: MCQPdfTheme;
  setPdfTheme: (t: MCQPdfTheme) => void;
  updatePdfTheme: (patch: Partial<MCQPdfTheme>) => void;
  embedTheme: MCQEmbedTheme;
  setEmbedTheme: (t: MCQEmbedTheme) => void;
  updateEmbedTheme: (patch: Partial<MCQEmbedTheme>) => void;
  exportSettings: MCQExportSettings;
  setExportSettings: (s: MCQExportSettings) => void;
  updateExportSettings: (patch: Partial<MCQExportSettings>) => void;

  /* UI state */
  activePanel: MCQPanel;
  setActivePanel: (panel: MCQPanel) => void;

  /* Project import/export */
  exportProject: () => string;
  importProject: (json: string) => boolean;

  /* Derived helpers */
  allCategories: string[];
  allTags: string[];
  isDirty: boolean;

  /* Storage warning */
  storageWarning: string | null;
  clearStorageWarning: () => void;
}

const MCQContext = createContext<MCQContextValue | null>(null);

// ── Load from localStorage ───────────────────────────────────────────
function loadPersistedData(): MCQPersistedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validatePersistedData(parsed);
  } catch {
    return null;
  }
}

// ── Provider ─────────────────────────────────────────────────────────
export function MCQProvider({ children }: { children: ReactNode }) {
  const persisted = useRef(loadPersistedData());

  const [questions, setQuestions] = useState<MCQQuestion[]>(
    persisted.current?.questions ?? [],
  );
  const [exams, setExams] = useState<MCQExam[]>(
    persisted.current?.exams ?? [],
  );
  const [pdfTheme, setPdfTheme] = useState<MCQPdfTheme>(
    persisted.current?.pdfTheme ?? DEFAULT_PDF_THEME,
  );
  const [embedTheme, setEmbedTheme] = useState<MCQEmbedTheme>(
    persisted.current?.embedTheme ?? DEFAULT_EMBED_THEME,
  );
  const [exportSettings, setExportSettings] = useState<MCQExportSettings>(
    persisted.current?.exportSettings ?? DEFAULT_EXPORT_SETTINGS,
  );

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<MCQQuestion | null>(
    null,
  );
  const [editorDraft, setEditorDraft] = useState<MCQQuestion | null>(null);
  const [activePanel, setActivePanel] = useState<MCQPanel>("editor");
  const [isDirty, setIsDirty] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const clearStorageWarning = useCallback(() => setStorageWarning(null), []);

  // ── Auto-save (stable interval via refs) ────────────────────────
  const dataRef = useRef({ questions, exams, pdfTheme, embedTheme, exportSettings });
  const dirtyRef = useRef(isDirty);

  useEffect(() => {
    dataRef.current = { questions, exams, pdfTheme, embedTheme, exportSettings };
  }, [questions, exams, pdfTheme, embedTheme, exportSettings]);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!dirtyRef.current) return;
      try {
        const data: MCQPersistedData = {
          version: SCHEMA_VERSION,
          ...dataRef.current,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIsDirty(false);
        setStorageWarning(null);
      } catch {
        setStorageWarning(
          "Auto-save failed — storage may be full. Export your project to avoid data loss.",
        );
      }
    }, AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, []);

  // Mark dirty on data change — skip the initial load
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    setIsDirty(true);
  }, [questions, exams, pdfTheme, embedTheme, exportSettings]);

  // Warn before close if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Question CRUD ────────────────────────────────────────────────
  const addQuestion = useCallback((q: MCQQuestion) => {
    setQuestions((prev) => [...prev, q]);
  }, []);

  const addQuestions = useCallback((qs: MCQQuestion[]) => {
    setQuestions((prev) => [...prev, ...qs]);
  }, []);

  const updateQuestion = useCallback(
    (id: string, patch: Partial<MCQQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, ...patch, updatedAt: Date.now() } : q,
        ),
      );
    },
    [],
  );

  // Fix 1.6: clear dangling references after deletion
  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionId((prev) => (prev === id ? null : prev));
    setEditingQuestion((prev) => (prev?.id === id ? null : prev));
    setEditorDraft((prev) => (prev?.id === id ? null : prev));
  }, []);

  const removeQuestions = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setQuestions((prev) => prev.filter((q) => !idSet.has(q.id)));
    setSelectedQuestionId((prev) => (prev && idSet.has(prev) ? null : prev));
    setEditingQuestion((prev) =>
      prev && idSet.has(prev.id) ? null : prev,
    );
    setEditorDraft((prev) => (prev && idSet.has(prev.id) ? null : prev));
  }, []);

  const clearQuestions = useCallback(() => {
    setQuestions([]);
    setSelectedQuestionId(null);
    setEditingQuestion(null);
    setEditorDraft(null);
  }, []);

  const reorderQuestions = useCallback((fromIdx: number, toIdx: number) => {
    setQuestions((prev) => {
      if (fromIdx < 0 || fromIdx >= prev.length) return prev;
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  // ── Exam CRUD ────────────────────────────────────────────────────
  const addExam = useCallback((e: MCQExam) => {
    setExams((prev) => [...prev, e]);
  }, []);

  const updateExam = useCallback(
    (id: string, patch: Partial<MCQExam>) => {
      setExams((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
        ),
      );
    },
    [],
  );

  // Fix 1.6: clear dangling selectedExamId
  const removeExam = useCallback((id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    setSelectedExamId((prev) => (prev === id ? null : prev));
  }, []);

  // ── Theme helpers ────────────────────────────────────────────────
  const updatePdfTheme = useCallback((patch: Partial<MCQPdfTheme>) => {
    setPdfTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateEmbedTheme = useCallback((patch: Partial<MCQEmbedTheme>) => {
    setEmbedTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateExportSettings = useCallback(
    (patch: Partial<MCQExportSettings>) => {
      setExportSettings((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  // ── Project import/export ────────────────────────────────────────
  const exportProject = useCallback(() => {
    const data: MCQPersistedData = {
      version: SCHEMA_VERSION,
      questions,
      exams,
      pdfTheme,
      embedTheme,
      exportSettings,
    };
    return JSON.stringify(data, null, 2);
  }, [questions, exams, pdfTheme, embedTheme, exportSettings]);

  const importProject = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const data = validatePersistedData(parsed);
      if (!data || data.questions.length === 0) return false;
      setQuestions(data.questions);
      setExams(data.exams);
      setPdfTheme(data.pdfTheme);
      setEmbedTheme(data.embedTheme);
      setExportSettings(data.exportSettings);
      setActivePanel("bank");
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Derived helpers (memoized — Phase 6.2) ──────────────────────
  const allCategories = useMemo(
    () =>
      Array.from(
        new Set(questions.map((q) => q.category).filter(Boolean) as string[]),
      ).sort(),
    [questions],
  );

  const allTags = useMemo(
    () =>
      Array.from(new Set(questions.flatMap((q) => q.tags ?? []))).sort(),
    [questions],
  );

  // ── Memoize context value (Phase 6.1) ───────────────────────────
  const value = useMemo<MCQContextValue>(
    () => ({
      questions,
      setQuestions,
      addQuestion,
      addQuestions,
      updateQuestion,
      removeQuestion,
      removeQuestions,
      clearQuestions,
      reorderQuestions,
      exams,
      setExams,
      addExam,
      updateExam,
      removeExam,
      selectedQuestionId,
      setSelectedQuestionId,
      selectedExamId,
      setSelectedExamId,
      editingQuestion,
      setEditingQuestion,
      editorDraft,
      setEditorDraft,
      activePanel,
      setActivePanel,
      pdfTheme,
      setPdfTheme,
      updatePdfTheme,
      embedTheme,
      setEmbedTheme,
      updateEmbedTheme,
      exportSettings,
      setExportSettings,
      updateExportSettings,
      exportProject,
      importProject,
      allCategories,
      allTags,
      isDirty,
      storageWarning,
      clearStorageWarning,
    }),
    [
      questions,
      exams,
      selectedQuestionId,
      selectedExamId,
      editingQuestion,
      editorDraft,
      activePanel,
      pdfTheme,
      embedTheme,
      exportSettings,
      isDirty,
      storageWarning,
      allCategories,
      allTags,
      addQuestion,
      addQuestions,
      updateQuestion,
      removeQuestion,
      removeQuestions,
      clearQuestions,
      reorderQuestions,
      addExam,
      updateExam,
      removeExam,
      updatePdfTheme,
      updateEmbedTheme,
      updateExportSettings,
      exportProject,
      importProject,
      clearStorageWarning,
    ],
  );

  return (
    <MCQContext.Provider value={value}>
      {children}
    </MCQContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useMCQ() {
  const ctx = useContext(MCQContext);
  if (!ctx) {
    throw new Error("useMCQ must be used within an MCQProvider");
  }
  return ctx;
}
