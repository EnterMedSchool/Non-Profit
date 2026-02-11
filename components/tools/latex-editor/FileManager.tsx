"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import { FileText, Plus, Trash2, FolderOpen, X, Edit2, Check } from "lucide-react";

export default function FileManager() {
  const t = useTranslations("tools.latexEditor.ui");
  const locale = useLocale();
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    addDocument,
    removeDocument,
    renameDocument,
    setActivePanel,
  } = useLaTeXEditor();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleConfirmRename = () => {
    if (renamingId && renameValue.trim()) {
      renameDocument(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.endsWith(".tex") && !name.endsWith(".bib") && !name.endsWith(".sty")) {
      name += ".tex";
    }
    const id = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
    addDocument({
      id,
      name,
      content: `% ${name}\n% Created ${new Date().toLocaleDateString(locale)}\n\n`,
      isMain: false,
    });
    setActiveDocumentId(id);
    setShowNewFileInput(false);
    setNewFileName("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink-dark/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={15} className="text-showcase-purple" />
            <h3 className="text-sm font-bold text-ink-dark">{t("files")}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewFileInput(true)}
              className="p-1 rounded-md text-ink-muted hover:text-ink-dark hover:bg-pastel-cream transition-colors"
              title={t("addNewFile")}
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-md text-ink-light hover:text-ink-muted hover:bg-pastel-cream transition-colors lg:hidden"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-ink-muted mt-1">
          {t("filesHint")}
        </p>
      </div>

      {/* New file input */}
      {showNewFileInput && (
        <div className="px-4 py-2 border-b border-ink-dark/5 bg-pastel-cream/30">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFile();
                if (e.key === "Escape") setShowNewFileInput(false);
              }}
              placeholder={t("filenamePlaceholder")}
              className="flex-1 px-2 py-1 rounded-md border border-ink-dark/10 text-xs focus:outline-none focus:border-showcase-purple/40"
            />
            <button
              onClick={handleAddFile}
              className="p-1 rounded-md text-green-600 hover:bg-green-50 transition-colors"
              title={t("createFile")}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setShowNewFileInput(false);
                setNewFileName("");
              }}
              className="p-1 rounded-md text-ink-light hover:text-ink-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-start transition-colors ${
              activeDocumentId === doc.id
                ? "bg-showcase-purple/10 text-showcase-purple"
                : "text-ink-muted hover:bg-pastel-cream"
            }`}
          >
            <FileText size={14} className="flex-shrink-0" />

            {renamingId === doc.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmRename();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onBlur={handleConfirmRename}
                className="flex-1 px-1 py-0.5 rounded text-xs border border-ink-dark/10 focus:outline-none focus:border-showcase-purple/40 bg-white"
              />
            ) : (
              <button
                onClick={() => setActiveDocumentId(doc.id)}
                className="flex-1 text-start text-xs font-medium truncate"
              >
                {doc.name}
                {doc.isMain && (
                  <span className="ms-2 px-1 py-0.5 bg-showcase-purple/10 text-showcase-purple text-[9px] font-bold rounded">
                    {t("mainBadge")}
                  </span>
                )}
              </button>
            )}

            {/* Actions */}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                onClick={() => handleStartRename(doc.id, doc.name)}
                className="p-1 rounded text-ink-light hover:text-ink-muted transition-colors"
                title={t("rename")}
              >
                <Edit2 size={11} />
              </button>
              {!doc.isMain && documents.length > 1 && (
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-1 rounded text-ink-light hover:text-red-500 transition-colors"
                  title={t("delete")}
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-ink-dark/5 bg-pastel-cream/30">
        <p className="text-[10px] text-ink-muted text-center">
          {documents.length === 1
            ? t("filesInProject", { count: documents.length })
            : t("filesInProjectPlural", { count: documents.length })}
        </p>
      </div>
    </div>
  );
}
