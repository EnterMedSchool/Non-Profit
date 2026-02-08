"use client";

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { useIllustration } from "./IllustrationContext";

export default function PageTabs() {
  const {
    pages,
    activePageIndex,
    addPage,
    switchPage,
    deletePage,
    renamePage,
  } = useIllustration();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
    setEditingName(pages[index].name);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleRenameSubmit = (index: number) => {
    if (editingName.trim()) {
      renamePage(index, editingName.trim());
    }
    setEditingIndex(null);
  };

  if (pages.length <= 1) {
    return (
      <div className="flex items-center border-t border-showcase-navy/5 bg-pastel-cream/20 px-2 py-0.5">
        <button
          onClick={addPage}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-ink-light transition-colors hover:bg-pastel-lavender/50 hover:text-showcase-purple"
          title="Add new page"
        >
          <Plus className="h-3 w-3" />
          <span>Add Page</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 border-t border-showcase-navy/5 bg-pastel-cream/20 px-2 py-0.5 overflow-x-auto">
      {pages.map((page, i) => (
        <div
          key={page.id}
          className={`group flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-all ${
            i === activePageIndex
              ? "bg-white border border-showcase-purple/30 text-showcase-purple shadow-sm"
              : "text-ink-muted hover:bg-white/80 hover:text-ink-dark"
          }`}
          onClick={() => switchPage(i)}
          onDoubleClick={() => handleDoubleClick(i)}
        >
          {editingIndex === i ? (
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleRenameSubmit(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(i);
                if (e.key === "Escape") setEditingIndex(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-16 rounded border border-showcase-purple/30 bg-white px-1 py-0 text-[10px] text-ink-dark focus:outline-none"
            />
          ) : (
            <span className="max-w-[80px] truncate">{page.name}</span>
          )}
          {pages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePage(i);
              }}
              className={`rounded p-0.5 transition-colors ${
                i === activePageIndex
                  ? "text-showcase-purple/50 hover:text-showcase-coral"
                  : "text-ink-light opacity-0 group-hover:opacity-100 hover:text-showcase-coral"
              }`}
              title="Delete page"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addPage}
        className="flex items-center rounded-md p-0.5 text-ink-light transition-colors hover:bg-pastel-lavender/50 hover:text-showcase-purple"
        title="Add new page"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
