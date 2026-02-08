"use client";

import { useState } from "react";
import {
  X,
  Download,
  FileImage,
  FileType2,
  FileText,
  ClipboardCopy,
  Check,
} from "lucide-react";
import { useIllustration } from "./IllustrationContext";

type ExportFormat = "png" | "jpeg" | "svg" | "pdf";

const FORMAT_TABS: { id: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "png", label: "PNG", icon: FileImage },
  { id: "jpeg", label: "JPEG", icon: FileImage },
  { id: "svg", label: "SVG", icon: FileType2 },
  { id: "pdf", label: "PDF", icon: FileText },
];

export default function ExportDialog({ onClose }: { onClose: () => void }) {
  const {
    canvasSize,
    exportImage,
    exportSVG,
    exportPDF,
    copyImageToClipboard,
  } = useIllustration();

  const [format, setFormat] = useState<ExportFormat>("png");
  const [multiplier, setMultiplier] = useState(2);
  const [transparent, setTransparent] = useState(false);
  const [pdfDpi, setPdfDpi] = useState(300);
  const [quality, setQuality] = useState(92);
  const [filename, setFilename] = useState("illustration");
  const [copied, setCopied] = useState(false);

  const outputWidth = canvasSize.width * multiplier;
  const outputHeight = canvasSize.height * multiplier;

  const handleExport = () => {
    switch (format) {
      case "png":
        exportImage("png", multiplier, transparent);
        break;
      case "jpeg":
        exportImage("jpeg", multiplier, false);
        break;
      case "svg":
        exportSVG();
        break;
      case "pdf":
        exportPDF(pdfDpi);
        break;
    }
    onClose();
  };

  const handleCopyToClipboard = async () => {
    await copyImageToClipboard(multiplier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-showcase-purple" />
            <h2 className="font-display text-lg font-bold text-ink-dark">Export</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-pastel-lavender">
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>

        <div className="p-6">
          {/* Format tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border-2 border-showcase-navy/10 p-1">
            {FORMAT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFormat(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                    format === tab.id
                      ? "bg-showcase-purple text-white"
                      : "text-ink-muted hover:bg-pastel-lavender/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filename */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-bold text-ink-muted">Filename</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-3 py-2 text-sm text-ink-dark focus:border-showcase-purple/40 focus:outline-none"
              />
              <span className="text-sm text-ink-light">.{format}</span>
            </div>
          </div>

          {/* Format-specific options */}
          {(format === "png" || format === "jpeg") && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-muted">Resolution</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className={`flex-1 rounded-lg border-2 py-1.5 text-xs font-bold transition-all ${
                        multiplier === m
                          ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                          : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-ink-light">
                  Output: {outputWidth} x {outputHeight} px
                </p>
              </div>

              {format === "png" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transparent}
                    onChange={(e) => setTransparent(e.target.checked)}
                    className="rounded border-showcase-navy/20 accent-showcase-purple"
                  />
                  <span className="text-xs text-ink-muted">Transparent background</span>
                </label>
              )}

              {format === "jpeg" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink-muted">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-showcase-purple"
                  />
                </div>
              )}
            </div>
          )}

          {format === "pdf" && (
            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-ink-muted">DPI (Resolution)</label>
              <div className="flex gap-1">
                {[
                  { dpi: 150, label: "Web (150)" },
                  { dpi: 300, label: "Print (300)" },
                  { dpi: 600, label: "High-Res (600)" },
                ].map(({ dpi, label }) => (
                  <button
                    key={dpi}
                    onClick={() => setPdfDpi(dpi)}
                    className={`flex-1 rounded-lg border-2 py-1.5 text-xs font-bold transition-all ${
                      pdfDpi === dpi
                        ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                        : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {format === "svg" && (
            <div className="mb-4 rounded-lg border-2 border-showcase-teal/20 bg-showcase-teal/5 p-3">
              <p className="text-xs text-showcase-teal font-bold">Scalable Vector Graphics</p>
              <p className="mt-1 text-[11px] text-ink-muted">
                SVG files are resolution-independent and perfect for publications.
                They can be opened in Illustrator, Inkscape, or any web browser.
              </p>
            </div>
          )}

          {/* Canvas info */}
          <div className="mb-5 rounded-lg border border-showcase-navy/5 bg-pastel-cream/20 px-3 py-2">
            <p className="text-[10px] text-ink-light">
              Canvas: {canvasSize.width} x {canvasSize.height} px
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {(format === "png" || format === "jpeg") && (
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1.5 rounded-lg border-2 border-showcase-navy/10 px-4 py-2.5 text-xs font-bold text-ink-muted transition-all hover:bg-pastel-lavender/50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-showcase-green" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            )}
            <button
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-showcase-purple bg-showcase-purple px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-showcase-purple/90"
            >
              <Download className="h-4 w-4" />
              Export {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
