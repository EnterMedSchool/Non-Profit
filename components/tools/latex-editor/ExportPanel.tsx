"use client";

import { useState } from "react";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import {
  X,
  Download,
  FileText,
  FolderArchive,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";

export default function ExportPanel() {
  const { setIsExportPanelOpen, documents, documentTitle } = useLaTeXEditor();
  const [copiedTex, setCopiedTex] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const mainDoc = documents.find((d) => d.isMain) ?? documents[0];

  /* ── Download .tex ─────────────────────────────────────── */
  const downloadTex = () => {
    try {
      const blob = new Blob([mainDoc.content], { type: "text/x-tex;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mainDoc.name || "document.tex";
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("Downloaded .tex file!");
    } catch {
      setExportStatus("Failed to download file.");
    }
  };

  /* ── Download .zip ─────────────────────────────────────── */
  const downloadZip = async () => {
    try {
      const { default: JSZip } = await import("jszip");
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();

      // Add all documents to zip
      for (const doc of documents) {
        zip.file(doc.name, doc.content);
      }

      // Add a README
      zip.file(
        "README.txt",
        `${documentTitle}
${"=".repeat(documentTitle.length)}

This project was created using the EnterMedSchool LaTeX Editor.
https://entermedschool.org/editor

To compile this document:
1. Upload all files to Overleaf (https://overleaf.com)
2. Or install a local LaTeX distribution (TeX Live / MiKTeX)
   and run: pdflatex main.tex

Created: ${new Date().toLocaleDateString()}
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const safeName = documentTitle.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();
      saveAs(blob, `${safeName}.zip`);
      setExportStatus("Downloaded .zip file!");
    } catch {
      setExportStatus("Failed to create zip file.");
    }
  };

  /* ── Copy to clipboard ─────────────────────────────────── */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mainDoc.content);
      setCopiedTex(true);
      setExportStatus("Copied to clipboard!");
      setTimeout(() => setCopiedTex(false), 2000);
    } catch {
      setExportStatus("Failed to copy to clipboard.");
    }
  };

  /* ── Open in Overleaf ──────────────────────────────────── */
  const openInOverleaf = () => {
    try {
      // Overleaf supports opening documents via a snip URL
      const encoded = encodeURIComponent(mainDoc.content);
      const url = `https://www.overleaf.com/docs?snip_uri=data:text/x-tex;charset=utf-8,${encoded}`;
      window.open(url, "_blank");
      setExportStatus("Opening in Overleaf...");
    } catch {
      setExportStatus("Failed to open in Overleaf.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-dark/5">
          <div>
            <h2 className="text-lg font-bold text-ink-dark">Export Document</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Download your LaTeX source or open it in Overleaf.
            </p>
          </div>
          <button
            onClick={() => setIsExportPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-pastel-cream text-ink-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Export options */}
        <div className="p-6 space-y-3">
          <ExportOption
            icon={FileText}
            title="Download .tex File"
            description="Download the raw LaTeX source file. Open it in any LaTeX editor."
            onClick={downloadTex}
            color="purple"
          />

          <ExportOption
            icon={FolderArchive}
            title="Download .zip Archive"
            description="All files bundled into a ZIP. Upload directly to Overleaf."
            onClick={downloadZip}
            color="teal"
          />

          <ExportOption
            icon={copiedTex ? Check : Copy}
            title={copiedTex ? "Copied!" : "Copy to Clipboard"}
            description="Copy the LaTeX source code to paste anywhere."
            onClick={copyToClipboard}
            color="green"
          />

          <ExportOption
            icon={ExternalLink}
            title="Open in Overleaf"
            description="Open your document in Overleaf to compile it into a PDF."
            onClick={openInOverleaf}
            color="blue"
            highlight
          />
        </div>

        {/* Status */}
        {exportStatus && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
              <Check size={12} />
              {exportStatus}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="px-6 pb-5">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-pastel-lavender/30 border border-purple-100">
            <AlertCircle size={14} className="text-showcase-purple mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-ink-muted leading-relaxed">
              <strong>Tip:</strong> For the best PDF output, open your document in{" "}
              <a
                href="https://overleaf.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-showcase-purple font-semibold hover:underline"
              >
                Overleaf
              </a>{" "}
              (free). It compiles LaTeX to professional-quality PDFs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Export option button ─────────────────────────────────── */

const COLOR_MAP = {
  purple: "bg-showcase-purple/10 text-showcase-purple",
  teal: "bg-teal-100 text-teal-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
};

function ExportOption({
  icon: Icon,
  title,
  description,
  onClick,
  color,
  highlight,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  color: keyof typeof COLOR_MAP;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
        highlight
          ? "border-showcase-purple/30 bg-showcase-purple/5 hover:border-showcase-purple/50"
          : "border-ink-dark/8 hover:border-ink-dark/15"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${COLOR_MAP[color]}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-ink-dark">{title}</h4>
        <p className="text-[11px] text-ink-muted mt-0.5">{description}</p>
      </div>
    </button>
  );
}
