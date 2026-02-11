"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  FileText,
  Printer,
  Scissors,
  FoldVertical,
  Loader2,
  Eye,
  X,
  Hash,
  Type,
} from "lucide-react";
import { useFlashcards } from "./FlashcardContext";
import { generateFlashcardPdf } from "./pdfGenerator";
import type { ExportSettings } from "./types";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/shared/ToastContainer";

// ── Component ────────────────────────────────────────────────────────
export default function ExportPanel() {
  const t = useTranslations("tools.flashcardMaker.ui");
  const { cards, theme, exportSettings, updateExportSettings } =
    useFlashcards();
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toasts, dismiss, success, error: showError } = useToast();

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleExport = useCallback(async () => {
    if (cards.length === 0) return;
    setGenerating(true);

    // Let the UI update before heavy PDF generation
    await new Promise((r) => setTimeout(r, 50));

    try {
      const doc = await generateFlashcardPdf(cards, theme, exportSettings);
      const filename = exportSettings.filename?.trim() || "flashcards";
      doc.save(`${filename}.pdf`);
      success(t("pdfExportSuccess"));
    } catch (err) {
      console.error("PDF generation failed:", err);
      showError(t("pdfExportFailed"));
    } finally {
      setGenerating(false);
    }
  }, [cards, theme, exportSettings, success, showError, t]);

  const handlePreview = useCallback(async () => {
    if (cards.length === 0) return;
    setIsPreviewLoading(true);

    try {
      const doc = await generateFlashcardPdf(cards, theme, exportSettings);

      // Clean up old preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("PDF preview failed:", err);
      showError(t("previewFailed"));
    } finally {
      setIsPreviewLoading(false);
    }
  }, [cards, theme, exportSettings, previewUrl, showError, t]);

  return (
    <div className="flex flex-col gap-5 h-full">
      <h2 className="font-display text-lg font-bold text-ink-dark">
        {t("exportPdf")}
      </h2>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink-light/30 bg-pastel-cream/30 p-6 text-center">
          <FileText className="h-8 w-8 text-ink-muted/40" />
          <p className="text-sm text-ink-muted">
            {t("importFirst")}
          </p>
        </div>
      ) : (
        <>
          {/* ── Filename ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark">{t("filename")}</span>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={exportSettings.filename}
                onChange={(e) =>
                  updateExportSettings({ filename: e.target.value })
                }
                placeholder={t("filenamePlaceholder")}
                className="flex-1 rounded-xl border-2 border-ink-light/20 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
              />
              <span className="text-sm text-ink-muted">.pdf</span>
            </div>
          </section>

          {/* ── Page Title ────────────────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark flex items-center gap-2">
              <Type className="h-4 w-4 text-showcase-purple" />
              {t("pageTitle")}
            </span>
            <input
              type="text"
              value={exportSettings.pageTitle}
              onChange={(e) =>
                updateExportSettings({ pageTitle: e.target.value })
              }
              placeholder={t("pageTitlePlaceholder")}
              className="rounded-xl border-2 border-ink-light/20 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            />
          </section>

          {/* ── Layout mode ──────────────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark flex items-center gap-2">
              <Printer className="h-4 w-4 text-showcase-purple" />
              {t("printLayout")}
            </span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("printLayoutAria")}>
              <button
                onClick={() =>
                  updateExportSettings({ layoutMode: "fold" })
                }
                role="radio"
                aria-checked={exportSettings.layoutMode === "fold"}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all ${
                  exportSettings.layoutMode === "fold"
                    ? "border-showcase-teal bg-showcase-teal/10 shadow-chunky-sm"
                    : "border-ink-light/20 bg-white hover:border-showcase-teal/40"
                }`}
              >
                <FoldVertical className="h-5 w-5 text-showcase-teal" />
                <span className="text-xs font-bold text-ink-dark">
                  {t("foldInHalf")}
                </span>
                <span className="text-[10px] text-ink-muted">
                  {t("singleSided")}
                </span>
              </button>
              <button
                onClick={() =>
                  updateExportSettings({ layoutMode: "duplex" })
                }
                role="radio"
                aria-checked={exportSettings.layoutMode === "duplex"}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all ${
                  exportSettings.layoutMode === "duplex"
                    ? "border-showcase-teal bg-showcase-teal/10 shadow-chunky-sm"
                    : "border-ink-light/20 bg-white hover:border-showcase-teal/40"
                }`}
              >
                <Printer className="h-5 w-5 text-showcase-teal" />
                <span className="text-xs font-bold text-ink-dark">
                  {t("doubleSided")}
                </span>
                <span className="text-[10px] text-ink-muted">
                  {t("duplexPrint")}
                </span>
              </button>
            </div>
          </section>

          {/* ── Paper size ───────────────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark">{t("paperSize")}</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("paperSizeAria")}>
              {(["a4", "letter"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateExportSettings({ paperSize: size })}
                  role="radio"
                  aria-checked={exportSettings.paperSize === size}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all ${
                    exportSettings.paperSize === size
                      ? "border-showcase-teal bg-showcase-teal/10"
                      : "border-ink-light/20 bg-white hover:border-showcase-teal/40"
                  }`}
                >
                  {size === "a4" ? t("a4") : t("letter")}
                </button>
              ))}
            </div>
          </section>

          {/* ── Cards per page ───────────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark">
              {t("cardsPerPage")}
            </span>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={t("cardsPerPageAria")}>
              {([2, 4, 6, 8] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => updateExportSettings({ cardsPerPage: n })}
                  role="radio"
                  aria-checked={exportSettings.cardsPerPage === n}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all ${
                    exportSettings.cardsPerPage === n
                      ? "border-showcase-teal bg-showcase-teal/10"
                      : "border-ink-light/20 bg-white hover:border-showcase-teal/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* ── Guide lines & options ─────────────────────────────── */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark flex items-center gap-2">
              <Scissors className="h-4 w-4 text-showcase-coral" />
              {t("options")}
            </span>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.showCutLines}
                onChange={(e) =>
                  updateExportSettings({ showCutLines: e.target.checked })
                }
                className="h-4 w-4 rounded accent-showcase-teal"
              />
              <span className="text-sm text-ink-dark">{t("cutLines")}</span>
            </label>
            {exportSettings.layoutMode === "fold" && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSettings.showFoldLines}
                  onChange={(e) =>
                    updateExportSettings({
                      showFoldLines: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded accent-showcase-teal"
                />
                <span className="text-sm text-ink-dark">{t("foldLines")}</span>
              </label>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.showCardNumbers}
                onChange={(e) =>
                  updateExportSettings({
                    showCardNumbers: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded accent-showcase-teal"
              />
                <span className="text-sm text-ink-dark flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {t("cardNumbers")}
              </span>
            </label>
          </section>

          {/* ── Summary ──────────────────────────────────────────── */}
          <div className="rounded-xl border-2 border-ink-light/20 bg-pastel-cream/30 px-3 py-2 text-xs text-ink-muted">
            <p>
              <strong>
                {cards.length === 1
                  ? t("cardsToPages", { cards: 1 })
                  : t("cardsToPagesPlural", { cards: cards.length })}
              </strong>
              {" → "}
              <strong>
                {(() => {
                  const pageCount = Math.ceil(cards.length / exportSettings.cardsPerPage) * (exportSettings.layoutMode === "duplex" ? 2 : 1);
                  return pageCount === 1
                    ? t("pagesCount", { pages: 1 })
                    : t("pagesCountPlural", { pages: pageCount });
                })()}
              </strong>
              {exportSettings.layoutMode === "duplex" && ` ${t("frontsAndBacks")}`}
            </p>
          </div>

          {/* ── Preview & Download buttons ────────────────────────── */}
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={isPreviewLoading || cards.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-ink-light/30 bg-white px-4 py-3 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isPreviewLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
              {t("preview")}
            </button>

            <button
              onClick={handleExport}
              disabled={generating || cards.length === 0}
              aria-busy={generating}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-4 py-3 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  {t("downloadPdf")}
                </>
              )}
            </button>
          </div>

          {/* PDF Preview iframe */}
          {previewUrl && (
            <div className="rounded-xl border-2 border-ink-light/20 overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-ink-light/10">
                <span className="text-xs font-bold text-ink-muted">{t("pdfPreview")}</span>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-ink-muted hover:bg-gray-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <iframe
                src={previewUrl}
                title="Flashcard PDF Preview"
                className="w-full h-[400px] border-0"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
