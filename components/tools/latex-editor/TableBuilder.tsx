"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Table, Check } from "lucide-react";

const MAX_ROWS = 10;
const MAX_COLS = 8;

type BorderStyle = "all" | "horizontal" | "none";

interface TableBuilderProps {
  onInsert: (code: string) => void;
  onClose: () => void;
}

export default function TableBuilder({ onInsert, onClose }: TableBuilderProps) {
  const t = useTranslations("tools.latexEditor.ui");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("horizontal");
  const [caption, setCaption] = useState("");

  const generateLatex = useCallback(() => {
    // Column spec
    const colSep = borderStyle === "all" ? "|" : "";
    const colSpec =
      borderStyle === "all"
        ? `|${Array(cols).fill("l").join("|")}|`
        : Array(cols).fill("l").join(" ");

    const lines: string[] = [];
    lines.push("\\begin{table}[h]");
    lines.push("  \\centering");
    lines.push(`  \\begin{tabular}{${colSpec}}`);

    // Top rule
    if (borderStyle === "all" || borderStyle === "horizontal") {
      lines.push("    \\hline");
    }

    for (let r = 0; r < rows; r++) {
      const cells: string[] = [];
      for (let c = 0; c < cols; c++) {
        if (r === 0 && hasHeader) {
          cells.push(`\\textbf{Header ${c + 1}}`);
        } else {
          cells.push(`Cell ${r + 1}-${c + 1}`);
        }
      }
      lines.push(`    ${cells.join(" & ")} \\\\`);

      // Add rule after header or all rows
      if (r === 0 && hasHeader && (borderStyle === "all" || borderStyle === "horizontal")) {
        lines.push("    \\hline");
      } else if (borderStyle === "all") {
        lines.push("    \\hline");
      }
    }

    // Bottom rule
    if (borderStyle === "horizontal") {
      lines.push("    \\hline");
    }

    lines.push("  \\end{tabular}");
    if (caption.trim()) {
      lines.push(`  \\caption{${caption.trim()}}`);
      lines.push(`  \\label{tab:${caption.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 20)}}`);
    } else {
      lines.push("  \\caption{Table caption}");
      lines.push("  \\label{tab:mytable}");
    }
    lines.push("\\end{table}");

    return lines.join("\n") + "\n";
  }, [rows, cols, hasHeader, borderStyle, caption]);

  const preview = useMemo(() => generateLatex(), [generateLatex]);

  const handleGridClick = (r: number, c: number) => {
    setRows(r);
    setCols(c);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-dark/5">
          <div className="flex items-center gap-2">
            <Table size={18} className="text-showcase-purple" />
            <h2 className="text-base font-bold text-ink-dark">{t("insertTable")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pastel-cream text-ink-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Grid picker */}
          <div>
            <p className="text-xs font-semibold text-ink-dark mb-2">
              {t("selectTableSize")} <span className="text-showcase-purple">{hoverRow || rows} &times; {hoverCol || cols}</span>
            </p>
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
              {Array.from({ length: MAX_ROWS }, (_, r) =>
                Array.from({ length: MAX_COLS }, (_, c) => {
                  const isActive = r + 1 <= (hoverRow || rows) && c + 1 <= (hoverCol || cols);
                  return (
                    <button
                      key={`${r}-${c}`}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        isActive
                          ? "bg-showcase-purple/20 border-showcase-purple/40"
                          : "bg-pastel-cream/50 border-ink-dark/10 hover:border-ink-dark/20"
                      }`}
                      onMouseEnter={() => {
                        setHoverRow(r + 1);
                        setHoverCol(c + 1);
                      }}
                      onMouseLeave={() => {
                        setHoverRow(0);
                        setHoverCol(0);
                      }}
                      onClick={() => handleGridClick(r + 1, c + 1)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            {/* Header row toggle */}
            <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-ink-dark/20 text-showcase-purple focus:ring-showcase-purple/30"
              />
              <span>{t("headerRow")}</span>
            </label>

            {/* Border style */}
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span>{t("borders")}:</span>
              {(["horizontal", "all", "none"] as BorderStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setBorderStyle(style)}
                  className={`px-2 py-0.5 rounded-md capitalize transition-colors ${
                    borderStyle === style
                      ? "bg-showcase-purple/10 text-showcase-purple font-semibold"
                      : "bg-pastel-cream hover:bg-pastel-cream/80"
                  }`}
                >
                  {t(style === "horizontal" ? "horizontal" : style === "all" ? "bordersAll" : "none")}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs font-semibold text-ink-dark block mb-1">
              {t("captionOptional")}
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("captionPlaceholder")}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-ink-dark/10 focus:outline-none focus:border-showcase-purple/40"
            />
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-ink-dark mb-1">{t("generatedLatex")}</p>
            <pre className="p-3 bg-gray-50 rounded-lg border border-ink-dark/5 text-[11px] font-mono text-ink-muted overflow-x-auto max-h-40 leading-relaxed">
              {preview}
            </pre>
          </div>

          {/* Insert button */}
          <button
            onClick={() => {
              onInsert(preview);
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-showcase-purple text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Check size={16} />
            {t("insertTable")}
          </button>
        </div>
      </div>
    </div>
  );
}
