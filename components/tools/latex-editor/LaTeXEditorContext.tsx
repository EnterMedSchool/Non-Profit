"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  LaTeXDocument,
  CursorPosition,
  EditorSettings,
  SidePanel,
  CompileError,
} from "./types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_DOCUMENT,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "./types";

/* ── Context value ──────────────────────────────────────────── */

interface LaTeXEditorContextValue {
  /* Documents */
  documents: LaTeXDocument[];
  activeDocumentId: string;
  activeDocument: LaTeXDocument;
  setActiveDocumentId: (id: string) => void;
  addDocument: (doc: LaTeXDocument) => void;
  removeDocument: (id: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  renameDocument: (id: string, name: string) => void;
  loadTemplate: (files: LaTeXDocument[]) => void;

  /* Editor */
  cursorPosition: CursorPosition;
  setCursorPosition: (pos: CursorPosition) => void;
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string, fallbackBody?: string) => void;
  undoEditor: () => void;
  redoEditor: () => void;
  goToLine: (line: number) => void;
  editorViewRef: React.MutableRefObject<unknown | null>;

  /* Preview */
  previewHtml: string;
  setPreviewHtml: (html: string) => void;
  isPreviewLoading: boolean;
  setIsPreviewLoading: (v: boolean) => void;
  compileErrors: CompileError[];
  setCompileErrors: (errors: CompileError[]) => void;

  /* Panels */
  activePanel: SidePanel;
  setActivePanel: (panel: SidePanel) => void;
  isTemplateBrowserOpen: boolean;
  setIsTemplateBrowserOpen: (v: boolean) => void;
  isExportPanelOpen: boolean;
  setIsExportPanelOpen: (v: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (v: boolean) => void;
  isTableBuilderOpen: boolean;
  setIsTableBuilderOpen: (v: boolean) => void;
  isEquationBuilderOpen: boolean;
  setIsEquationBuilderOpen: (v: boolean) => void;
  isKeyboardShortcutsOpen: boolean;
  setIsKeyboardShortcutsOpen: (v: boolean) => void;

  /* Settings */
  settings: EditorSettings;
  updateSettings: (patch: Partial<EditorSettings>) => void;

  /* Document title */
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
}

const LaTeXEditorContext = createContext<LaTeXEditorContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────── */

export function LaTeXEditorProvider({ children }: { children: ReactNode }) {
  /* ── State ──────────────────────────────────────────────── */
  const [documents, setDocuments] = useState<LaTeXDocument[]>([DEFAULT_DOCUMENT]);
  const [activeDocumentId, setActiveDocumentId] = useState("main");
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 1, col: 1 });
  const [previewHtml, setPreviewHtml] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [compileErrors, setCompileErrors] = useState<CompileError[]>([]);
  const [activePanel, setActivePanel] = useState<SidePanel>("snippets");
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTableBuilderOpen, setIsTableBuilderOpen] = useState(false);
  const [isEquationBuilderOpen, setIsEquationBuilderOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");

  const editorViewRef = useRef<unknown | null>(null);

  /* ── Derived ────────────────────────────────────────────── */
  const activeDocument =
    documents.find((d) => d.id === activeDocumentId) ?? documents[0];

  /* ── Persistence ────────────────────────────────────────── */
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // If stored data is from an older version, ignore it and start fresh
        if (data.version && data.version >= STORAGE_VERSION) {
          if (data.documents?.length) setDocuments(data.documents);
          if (data.activeDocumentId) setActiveDocumentId(data.activeDocumentId);
          if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          if (data.documentTitle) setDocumentTitle(data.documentTitle);
        } else {
          // Clear stale data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* noop */
    }
  }, []);

  // Save to localStorage on change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: STORAGE_VERSION, documents, activeDocumentId, settings, documentTitle })
        );
      } catch {
        /* noop */
      }
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [documents, activeDocumentId, settings, documentTitle]);

  /* ── Actions ────────────────────────────────────────────── */
  const addDocument = useCallback((doc: LaTeXDocument) => {
    setDocuments((prev) => [...prev, doc]);
  }, []);

  const removeDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (next.length === 0) return [DEFAULT_DOCUMENT];
        return next;
      });
      if (activeDocumentId === id) {
        setActiveDocumentId((prev) => {
          const remaining = documents.filter((d) => d.id !== id);
          return remaining[0]?.id ?? "main";
        });
      }
    },
    [activeDocumentId, documents]
  );

  const updateDocumentContent = useCallback((id: string, content: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, content } : d))
    );
  }, []);

  const renameDocument = useCallback((id: string, name: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name } : d))
    );
  }, []);

  const loadTemplate = useCallback((files: LaTeXDocument[]) => {
    setDocuments(files);
    const mainFile = files.find((f) => f.isMain) ?? files[0];
    setActiveDocumentId(mainFile.id);
    setIsTemplateBrowserOpen(false);
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const view = editorViewRef.current as { dispatch?: Function; state?: { selection?: { main?: { head?: number; from?: number; to?: number } } } } | null;
    if (view && view.dispatch && view.state?.selection?.main) {
      const pos = view.state.selection.main.head ?? 0;
      view.dispatch({
        changes: { from: pos, insert: text },
        selection: { anchor: pos + text.length },
      });
    } else {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocumentId
            ? { ...d, content: d.content + "\n" + text }
            : d
        )
      );
    }
  }, [activeDocumentId]);

  const wrapSelection = useCallback((prefix: string, suffix: string, fallbackBody = "text") => {
    const view = editorViewRef.current as {
      dispatch?: Function;
      state?: { selection?: { main?: { from?: number; to?: number; head?: number } }; doc?: { sliceString?: Function } };
      focus?: Function;
    } | null;
    if (view && view.dispatch && view.state?.selection?.main) {
      const { from = 0, to = 0 } = view.state.selection.main;
      const hasSelection = from !== to;
      if (hasSelection) {
        const selectedText = view.state.doc?.sliceString?.(from, to) ?? "";
        const replacement = `${prefix}${selectedText}${suffix}`;
        view.dispatch({
          changes: { from, to, insert: replacement },
          selection: { anchor: from + prefix.length, head: from + prefix.length + selectedText.length },
        });
      } else {
        const replacement = `${prefix}${fallbackBody}${suffix}`;
        const pos = from;
        view.dispatch({
          changes: { from: pos, insert: replacement },
          selection: { anchor: pos + prefix.length, head: pos + prefix.length + fallbackBody.length },
        });
      }
      view.focus?.();
    } else {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocumentId
            ? { ...d, content: d.content + "\n" + prefix + fallbackBody + suffix }
            : d
        )
      );
    }
  }, [activeDocumentId]);

  const undoEditor = useCallback(() => {
    const view = editorViewRef.current as { dispatch?: Function; state?: unknown } | null;
    if (view) {
      import("@codemirror/commands").then(({ undo }) => {
        undo(view as never);
      });
    }
  }, []);

  const redoEditor = useCallback(() => {
    const view = editorViewRef.current as { dispatch?: Function; state?: unknown } | null;
    if (view) {
      import("@codemirror/commands").then(({ redo }) => {
        redo(view as never);
      });
    }
  }, []);

  const goToLine = useCallback((line: number) => {
    const view = editorViewRef.current as {
      dispatch?: Function;
      state?: { doc?: { line?: Function; lines?: number } };
      focus?: Function;
    } | null;
    if (view && view.dispatch && view.state?.doc?.line) {
      try {
        const maxLines = view.state.doc.lines ?? 1;
        const safeLine = Math.min(Math.max(1, line), maxLines);
        const lineObj = view.state.doc.line(safeLine);
        import("@codemirror/view").then(({ EditorView }) => {
          view.dispatch!({
            selection: { anchor: lineObj.from },
            effects: EditorView.scrollIntoView(lineObj.from, { y: "center" }),
          });
          view.focus?.();
        });
      } catch {
        /* noop */
      }
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  /* ── Value ──────────────────────────────────────────────── */
  const value: LaTeXEditorContextValue = {
    documents,
    activeDocumentId,
    activeDocument,
    setActiveDocumentId,
    addDocument,
    removeDocument,
    updateDocumentContent,
    renameDocument,
    loadTemplate,
    cursorPosition,
    setCursorPosition,
    insertAtCursor,
    wrapSelection,
    undoEditor,
    redoEditor,
    goToLine,
    editorViewRef,
    previewHtml,
    setPreviewHtml,
    isPreviewLoading,
    setIsPreviewLoading,
    compileErrors,
    setCompileErrors,
    activePanel,
    setActivePanel,
    isTemplateBrowserOpen,
    setIsTemplateBrowserOpen,
    isExportPanelOpen,
    setIsExportPanelOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isTableBuilderOpen,
    setIsTableBuilderOpen,
    isEquationBuilderOpen,
    setIsEquationBuilderOpen,
    isKeyboardShortcutsOpen,
    setIsKeyboardShortcutsOpen,
    settings,
    updateSettings,
    documentTitle,
    setDocumentTitle,
  };

  return (
    <LaTeXEditorContext.Provider value={value}>
      {children}
    </LaTeXEditorContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */

export function useLaTeXEditor() {
  const ctx = useContext(LaTeXEditorContext);
  if (!ctx) throw new Error("useLaTeXEditor must be used within LaTeXEditorProvider");
  return ctx;
}
