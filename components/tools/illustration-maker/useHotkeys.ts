"use client";

import { useEffect } from "react";
import { useIllustration, type ActiveTool } from "./IllustrationContext";

/**
 * Global keyboard shortcuts for the illustration maker.
 *
 * Shortcuts only fire when the canvas area is focused
 * (i.e. not when typing in an input/textarea).
 */
export function useHotkeys() {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    selectAll,
    groupSelected,
    ungroupSelected,
    toggleGrid,
    zoom,
    setZoom,
    saveToLocalStorage,
    selectedObjects,
    canvas,
  } = useIllustration();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input fields
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Check if we're editing text on canvas
      if (canvas && (canvas as any).isEditing) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      /* ── Tool shortcuts ──────────────────────────────────── */
      const toolMap: Record<string, ActiveTool> = {
        v: "select",
        t: "text",
        r: "rect",
        c: "circle",
        l: "line",
        a: "arrow",
        f: "freehand",
        k: "label",
        m: "marker",
      };

      // Single key tool shortcuts (only when no modifier)
      if (!ctrl && !shift && toolMap[key]) {
        e.preventDefault();
        setActiveTool(toolMap[key]);
        return;
      }

      /* ── Escape: deselect or cancel tool ─────────────────── */
      if (key === "escape") {
        e.preventDefault();
        if (activeTool !== "select") {
          setActiveTool("select");
        } else if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        return;
      }

      /* ── Delete / Backspace: delete selected ─────────────── */
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }

      /* ── Grid toggle ─────────────────────────────────────── */
      if (key === "g" && !ctrl) {
        e.preventDefault();
        toggleGrid();
        return;
      }

      /* ── Zoom ────────────────────────────────────────────── */
      if (key === "=" || key === "+") {
        e.preventDefault();
        setZoom(zoom * 1.2);
        return;
      }
      if (key === "-") {
        e.preventDefault();
        setZoom(zoom / 1.2);
        return;
      }

      /* ── Ctrl shortcuts ──────────────────────────────────── */
      if (ctrl) {
        switch (key) {
          case "z":
            e.preventDefault();
            if (shift) {
              redo();
            } else {
              undo();
            }
            break;

          case "y":
            e.preventDefault();
            redo();
            break;

          case "c":
            e.preventDefault();
            copySelected();
            break;

          case "v":
            e.preventDefault();
            pasteClipboard();
            break;

          case "d":
            e.preventDefault();
            duplicateSelected();
            break;

          case "a":
            e.preventDefault();
            selectAll();
            break;

          case "g":
            e.preventDefault();
            if (shift) {
              ungroupSelected();
            } else {
              groupSelected();
            }
            break;

          case "s":
            e.preventDefault();
            saveToLocalStorage();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    selectAll,
    groupSelected,
    ungroupSelected,
    toggleGrid,
    zoom,
    setZoom,
    saveToLocalStorage,
    selectedObjects,
    canvas,
  ]);
}
