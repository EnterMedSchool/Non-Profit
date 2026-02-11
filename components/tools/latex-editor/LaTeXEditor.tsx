"use client";

import { useState, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import { LaTeXEditorProvider, useLaTeXEditor } from "./LaTeXEditorContext";
import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";
import ToolbarBar from "./ToolbarBar";
import SnippetDrawer from "./SnippetDrawer";
import LearningSidebar from "./LearningSidebar";
import TemplateBrowser from "./TemplateBrowser";
import ExportPanel from "./ExportPanel";
import CommandPalette from "./CommandPalette";
import OnboardingTour from "./OnboardingTour";
import FileManager from "./FileManager";
import TableBuilder from "./TableBuilder";
import EquationBuilder from "./EquationBuilder";
import KeyboardShortcuts from "./KeyboardShortcuts";

/* ── Inner shell (has access to context) ──────────────────── */

function EditorShell() {
  const {
    activePanel,
    setActivePanel,
    compileErrors,
    isTemplateBrowserOpen,
    isExportPanelOpen,
    isCommandPaletteOpen,
    isTableBuilderOpen,
    setIsTableBuilderOpen,
    isEquationBuilderOpen,
    setIsEquationBuilderOpen,
    isKeyboardShortcutsOpen,
    setIsKeyboardShortcutsOpen,
    insertAtCursor,
    settings,
    updateSettings,
  } = useLaTeXEditor();

  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDividerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const handleMouseMove = (moveE: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Account for sidebar width
        const relativeX = moveE.clientX - rect.left;
        const ratio = Math.min(75, Math.max(25, (relativeX / rect.width) * 100));
        updateSettings({ splitRatio: Math.round(ratio) });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [updateSettings]
  );

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-200 ${
      settings.theme === "dark"
        ? "bg-[#1e1e2e] text-gray-200 latex-editor-dark"
        : "bg-white text-ink-dark"
    }`}>
      {/* Top toolbar */}
      <ToolbarBar />

      {/* Mobile tab bar */}
      <div className="flex lg:hidden border-b-2 border-ink-dark/10 bg-pastel-cream/50">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            mobileTab === "editor"
              ? "text-showcase-purple border-b-2 border-showcase-purple"
              : "text-ink-muted"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            mobileTab === "preview"
              ? "text-showcase-purple border-b-2 border-showcase-purple"
              : "text-ink-muted"
          }`}
        >
          Preview
          {compileErrors.filter((e) => e.severity === "error").length > 0 && (
            <span className="ms-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
              {compileErrors.filter((e) => e.severity === "error").length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile bottom sheet for sidebar panels */}
      {activePanel && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setActivePanel(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t-2 border-ink-dark/10 max-h-[70vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-ink-dark/20 rounded-full" />
            </div>
            {activePanel === "snippets" && <SnippetDrawer />}
            {activePanel === "learning" && <LearningSidebar />}
            {activePanel === "files" && <FileManager />}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left sidebar (snippets / learning / files) — desktop only */}
        {activePanel && (
          <div className="hidden lg:flex w-72 xl:w-80 border-e-2 border-ink-dark/10 flex-col overflow-hidden bg-pastel-cream/30">
            {activePanel === "snippets" && <SnippetDrawer />}
            {activePanel === "learning" && <LearningSidebar />}
            {activePanel === "files" && <FileManager />}
          </div>
        )}

        {/* Editor */}
        <div
          data-tour="editor-panel"
          className={`flex flex-col overflow-hidden ${
            mobileTab !== "editor" ? "hidden lg:flex" : "flex"
          }`}
          style={{ flex: `0 0 ${settings.splitRatio}%` }}
        >
          <EditorPanel />
        </div>

        {/* Draggable divider — desktop only */}
        <div
          className={`hidden lg:flex items-center justify-center w-1.5 cursor-col-resize group hover:bg-showcase-purple/10 transition-colors relative flex-shrink-0 ${
            isDragging ? "bg-showcase-purple/20" : ""
          }`}
          onMouseDown={handleDividerMouseDown}
          onDoubleClick={() => updateSettings({ splitRatio: 50 })}
          title="Drag to resize. Double-click to reset."
        >
          <div
            className={`w-0.5 h-8 rounded-full transition-colors ${
              isDragging
                ? "bg-showcase-purple"
                : "bg-ink-dark/15 group-hover:bg-showcase-purple/50"
            }`}
          />
        </div>

        {/* Preview */}
        <div
          data-tour="preview-panel"
          className={`flex flex-col overflow-hidden border-s border-ink-dark/5 ${
            mobileTab !== "preview" ? "hidden lg:flex" : "flex"
          }`}
          style={{ flex: `0 0 ${100 - settings.splitRatio}%` }}
        >
          <PreviewPanel />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Overlays */}
      {isTemplateBrowserOpen && <TemplateBrowser />}
      {isExportPanelOpen && <ExportPanel />}
      {isCommandPaletteOpen && <CommandPalette />}
      {isTableBuilderOpen && (
        <TableBuilder
          onInsert={insertAtCursor}
          onClose={() => setIsTableBuilderOpen(false)}
        />
      )}
      {isEquationBuilderOpen && (
        <EquationBuilder
          onInsert={insertAtCursor}
          onClose={() => setIsEquationBuilderOpen(false)}
        />
      )}
      {isKeyboardShortcutsOpen && (
        <KeyboardShortcuts
          onClose={() => setIsKeyboardShortcutsOpen(false)}
        />
      )}

      {/* Onboarding tour */}
      <OnboardingTour />
    </div>
  );
}

/* ── Status bar ───────────────────────────────────────────── */

function StatusBar() {
  const locale = useLocale();
  const { cursorPosition, activeDocument, compileErrors, settings } = useLaTeXEditor();

  const content = activeDocument.content;
  const cleanText = content
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}[\]$%&\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const errorCount = compileErrors.filter((e) => e.severity === "error").length;
  const warningCount = compileErrors.filter((e) => e.severity === "warning").length;

  // Detect current LaTeX environment context
  const getEnvironmentContext = () => {
    const lines = content.split("\n").slice(0, cursorPosition.line);
    const envStack: string[] = [];
    for (const line of lines) {
      const beginMatch = line.match(/\\begin\{(\w+)\}/);
      if (beginMatch) envStack.push(beginMatch[1]);
      const endMatch = line.match(/\\end\{(\w+)\}/);
      if (endMatch) {
        const idx = envStack.lastIndexOf(endMatch[1]);
        if (idx >= 0) envStack.splice(idx, 1);
      }
    }
    return envStack.length > 0 ? envStack.join(" > ") : null;
  };

  const envContext = getEnvironmentContext();

  return (
    <div className={`flex items-center justify-between px-4 py-1.5 border-t-2 border-ink-dark/10 text-xs font-medium ${
      settings.theme === "dark" ? "bg-[#181825] text-gray-400" : "bg-pastel-cream/30 text-ink-muted"
    }`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="flex-shrink-0">
          Ln {cursorPosition.line}, Col {cursorPosition.col}
        </span>
        <span className="hidden sm:inline flex-shrink-0">{wordCount} words</span>
        <span className="hidden md:inline flex-shrink-0">{charCount.toLocaleString(locale)} chars</span>
        <span className="hidden md:inline flex-shrink-0">~{readingTime} min read</span>
        <span className="hidden lg:inline flex-shrink-0 truncate">{activeDocument.name}</span>
        {envContext && (
          <span className="hidden xl:inline flex-shrink-0 text-showcase-purple/70 truncate" title={`Inside: ${envContext}`}>
            {envContext}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Auto-save indicator */}
        <span className="hidden sm:inline text-green-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Saved
        </span>
        {errorCount > 0 && (
          <span className="text-red-600">{errorCount} error{errorCount !== 1 ? "s" : ""}</span>
        )}
        {warningCount > 0 && (
          <span className="text-amber-600">{warningCount} warning{warningCount !== 1 ? "s" : ""}</span>
        )}
        {errorCount === 0 && warningCount === 0 && (
          <span className="text-green-600">Ready</span>
        )}
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────── */

export default function LaTeXEditor() {
  return (
    <LaTeXEditorProvider>
      <EditorShell />
    </LaTeXEditorProvider>
  );
}
