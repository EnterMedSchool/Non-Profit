"use client";

import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Text Formatting",
    shortcuts: [
      { keys: "Ctrl + B", description: "Bold selected text" },
      { keys: "Ctrl + I", description: "Italicize selected text" },
      { keys: "Ctrl + U", description: "Underline selected text" },
    ],
  },
  {
    title: "Math & Equations",
    shortcuts: [
      { keys: "Ctrl + M", description: "Wrap selection in inline math $...$" },
      { keys: "Ctrl + Shift + M", description: "Insert display math block $$...$$" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: "Ctrl + Z", description: "Undo" },
      { keys: "Ctrl + Y", description: "Redo" },
      { keys: "Ctrl + S", description: "Save (auto-saved)" },
      { keys: "Ctrl + F", description: "Find in document" },
      { keys: "Ctrl + H", description: "Find and replace" },
      { keys: "Tab", description: "Indent selection" },
      { keys: "Shift + Tab", description: "Un-indent selection" },
      { keys: "Ctrl + /", description: "Toggle comment (%)" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: "Ctrl + K", description: "Open command palette" },
      { keys: "Ctrl + G", description: "Go to line" },
      { keys: "Escape", description: "Close current overlay" },
    ],
  },
];

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export default function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-dark/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-showcase-purple" />
            <h2 className="text-base font-bold text-ink-dark">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pastel-cream text-ink-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-xs text-ink-muted">{shortcut.description}</span>
                    <kbd className="flex items-center gap-0.5 text-[10px] font-mono text-ink-dark bg-pastel-cream px-2 py-0.5 rounded border border-ink-dark/10 whitespace-nowrap">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-dark/5 bg-pastel-cream/30 flex-shrink-0">
          <p className="text-[10px] text-ink-muted text-center">
            On Mac, use Cmd instead of Ctrl
          </p>
        </div>
      </div>
    </div>
  );
}
