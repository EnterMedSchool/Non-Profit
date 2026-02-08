"use client";

import { useEffect, useCallback } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Register keyboard shortcuts. Keys are in the format "key" or "mod+key"
 * where mod can be Ctrl/Cmd. Shortcuts are ignored when the user is typing
 * in an input, textarea, or contenteditable element.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in form elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
