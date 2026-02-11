"use client";

import { useState, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  Download,
  FileText,
  Package,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { usePDFViewer } from "./PDFViewerContext";
import AttributionReminderModal from "@/components/resources/AttributionReminderModal";
import AttributionBanner from "@/components/resources/AttributionBanner";
import { hasValidAttribution } from "@/lib/attribution";

export default function DownloadPanel() {
  const t = useTranslations("pdfViewer.download");
  const { downloadPanelOpen, setDownloadPanelOpen, book, currentChapter } =
    usePDFViewer();
  const [showAttribution, setShowAttribution] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<string | null>(null);

  const handleDownload = async (url: string) => {
    if (!hasValidAttribution()) {
      setPendingDownload(url);
      setShowAttribution(true);
      return;
    }
    await validateAndDownload(url);
  };

  const validateAndDownload = async (url: string) => {
    setDownloadError(null);
    setIsChecking(url);

    try {
      // Check if the file exists with a HEAD request
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok) {
        setDownloadError(t("fileNotAvailableWithStatus", { status: String(response.status) }));
        setIsChecking(null);
        return;
      }
      triggerDownload(url);
    } catch {
      // If HEAD fails (e.g. CORS), try downloading directly
      triggerDownload(url);
    } finally {
      setIsChecking(null);
    }
  };

  const triggerDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAttributionSaved = () => {
    if (pendingDownload) {
      validateAndDownload(pendingDownload);
      setPendingDownload(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {downloadPanelOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
              onClick={() => setDownloadPanelOpen(false)}
              role="presentation"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={t("title")}
              className="fixed left-1/2 top-[10vh] z-[81] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-showcase-teal" />
                  <h3 className="font-display text-lg font-bold text-ink-dark">
                    {t("title")}
                  </h3>
                </div>
                <button
                  onClick={() => setDownloadPanelOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-gray-100"
                  aria-label={t("ariaCloseDownloadPanel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Error message */}
                {downloadError && (
                  <div className="flex items-start gap-2.5 rounded-xl border-2 border-red-300 bg-red-50 p-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-800">{t("error")}</p>
                      <p className="mt-0.5 text-xs text-red-600">{downloadError}</p>
                    </div>
                    <button
                      onClick={() => setDownloadError(null)}
                      className="ms-auto shrink-0 text-red-400 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Full book PDF */}
                <DownloadItem
                  icon={BookOpen}
                  title={`${t("fullBook")} — ${book.title}`}
                  description={t("completePdfDesc", { pages: book.totalPages })}
                  badge={t("completePdf")}
                  badgeColor="bg-showcase-purple/10 text-showcase-purple"
                  onClick={() => handleDownload(book.pdfUrl)}
                  isLoading={isChecking === book.pdfUrl}
                />

                {/* Current chapter PDF */}
                {currentChapter.pdfUrl && (
                  <DownloadItem
                    icon={FileText}
                    title={`Ch. ${currentChapter.number}: ${currentChapter.title}`}
                    description={t("downloadChapterOnly")}
                    badge={t("chapterPdf")}
                    badgeColor="bg-showcase-teal/10 text-showcase-teal"
                    onClick={() => handleDownload(currentChapter.pdfUrl!)}
                    isLoading={isChecking === currentChapter.pdfUrl}
                  />
                )}

                {/* All chapters */}
                <div className="rounded-xl border-2 border-dashed border-showcase-navy/15 bg-gray-50/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-showcase-orange" />
                    <span className="text-sm font-bold text-ink-dark">
                      {t("individualChapters")}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {book.chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() =>
                          ch.pdfUrl && handleDownload(ch.pdfUrl)
                        }
                        disabled={!ch.pdfUrl || isChecking === ch.pdfUrl}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-white disabled:opacity-40"
                      >
                        <span className="text-ink-muted">
                          <span className="me-1.5 font-mono text-xs text-ink-light">
                            {ch.number}.
                          </span>
                          {ch.title}
                        </span>
                        {isChecking === ch.pdfUrl ? (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 text-ink-light animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5 shrink-0 text-ink-light" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribution banner / notice */}
                <AttributionBanner />
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Attribution modal */}
      <AttributionReminderModal
        open={showAttribution}
        onClose={() => {
          setShowAttribution(false);
          setPendingDownload(null);
        }}
        onSaved={handleAttributionSaved}
      />
    </>
  );
}

// ─── Sub-component ──────────────────────────────────────────────────────────

const DownloadItem = memo(function DownloadItem({
  icon: Icon,
  title,
  description,
  badge,
  badgeColor,
  onClick,
  isLoading = false,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="group flex w-full items-center gap-4 rounded-xl border-3 border-showcase-navy/10 bg-white p-4 text-start transition-all hover:-translate-y-0.5 hover:border-showcase-teal/30 hover:shadow-chunky-sm disabled:opacity-70 disabled:hover:translate-y-0"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-showcase-teal/10">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-ink-muted animate-spin" />
        ) : (
          <Icon className="h-5 w-5 text-ink-muted transition-colors group-hover:text-showcase-teal" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-ink-dark">{title}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
      </div>
      <CheckCircle2 className="h-5 w-5 shrink-0 text-transparent transition-colors group-hover:text-showcase-teal" />
    </button>
  );
});
