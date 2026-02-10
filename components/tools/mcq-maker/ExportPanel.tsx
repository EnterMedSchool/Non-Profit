"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FileDown,
  FileText,
  BookOpen,
  Key,
  Table2,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Archive,
  Download,
  Save,
  FolderOpen,
  Eye,
  X,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import PdfCustomizer from "./PdfCustomizer";
import {
  generateExamPdf,
  generateAnswerKeyPdf,
  generateStudyGuidePdf,
  generateVariantsZip,
} from "./pdfGenerator";
import {
  exportQuestionsToCSV,
  downloadCSV,
  copyToClipboard,
} from "./csvUtils";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/shared/ToastContainer";

// ── Component ────────────────────────────────────────────────────────
export default function ExportPanel() {
  const {
    questions,
    exams,
    pdfTheme,
    exportSettings,
    updateExportSettings,
    allCategories,
    exportProject,
    importProject,
  } = useMCQ();

  const { toasts, dismiss, success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<"pdf" | "csv" | "project">("pdf");
  const [pdfFormat, setPdfFormat] = useState<
    "exam" | "answer-key" | "study-guide"
  >("exam");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [examTitle, setExamTitle] = useState("Exam");
  const [examSubtitle, setExamSubtitle] = useState("");
  const [variantCount, setVariantCount] = useState(1);
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleOpt, setShuffleOpt] = useState(true);
  const [variantProgress, setVariantProgress] = useState<string>("");

  // CSV options
  const [csvDelimiter, setCsvDelimiter] = useState<"," | "\t" | ";">(
    ",",
  );
  const [csvExplanations, setCsvExplanations] = useState(true);
  const [csvCategory, setCsvCategory] = useState(true);
  const [csvDifficulty, setCsvDifficulty] = useState(true);

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // PDF preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const filteredQuestions = categoryFilter
    ? questions.filter((q) => q.category === categoryFilter)
    : questions;

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── PDF preview ─────────────────────────────────────────────────────
  const handlePreview = useCallback(async () => {
    if (filteredQuestions.length === 0) return;
    setIsPreviewLoading(true);

    try {
      let doc;
      switch (pdfFormat) {
        case "exam":
          doc = await generateExamPdf(
            filteredQuestions,
            pdfTheme,
            examTitle,
            examSubtitle,
            "",
            pdfTheme.watermarkText,
          );
          break;
        case "answer-key":
          doc = await generateAnswerKeyPdf(
            filteredQuestions,
            pdfTheme,
            `${examTitle} — Answer Key`,
          );
          break;
        case "study-guide":
          doc = await generateStudyGuidePdf(
            filteredQuestions,
            pdfTheme,
            `${examTitle} — Study Guide`,
          );
          break;
      }

      // Clean up old preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("PDF preview failed:", err);
      showError("Failed to generate preview. Please try again.");
    } finally {
      setIsPreviewLoading(false);
    }
  }, [
    filteredQuestions,
    pdfTheme,
    pdfFormat,
    examTitle,
    examSubtitle,
    previewUrl,
    showError,
  ]);

  // ── PDF export ─────────────────────────────────────────────────────
  const handlePdfExport = useCallback(async () => {
    if (filteredQuestions.length === 0) return;
    setIsGenerating(true);
    setVariantProgress("");

    try {
      // Multiple variants -> ZIP
      if (variantCount > 1) {
        const blob = await generateVariantsZip(
          filteredQuestions,
          pdfTheme,
          examTitle,
          variantCount,
          shuffleQ,
          shuffleOpt,
          pdfTheme.watermarkText,
          (current, total) => {
            setVariantProgress(`Generating variant ${current} of ${total}...`);
          },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${examTitle} - ${variantCount} Variants.zip`;
        a.click();
        URL.revokeObjectURL(url);
        success(`${variantCount} variants exported successfully!`);
      } else {
        // Single PDF
        let doc;
        switch (pdfFormat) {
          case "exam":
            doc = await generateExamPdf(
              filteredQuestions,
              pdfTheme,
              examTitle,
              examSubtitle,
              "",
              pdfTheme.watermarkText,
            );
            break;
          case "answer-key":
            doc = await generateAnswerKeyPdf(
              filteredQuestions,
              pdfTheme,
              `${examTitle} — Answer Key`,
            );
            break;
          case "study-guide":
            doc = await generateStudyGuidePdf(
              filteredQuestions,
              pdfTheme,
              `${examTitle} — Study Guide`,
            );
            break;
        }
        doc.save(`${examTitle} - ${pdfFormat}.pdf`);
        success("PDF exported successfully!");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      showError("PDF generation failed. Please check your settings and try again.");
    } finally {
      setIsGenerating(false);
      setVariantProgress("");
    }
  }, [
    filteredQuestions,
    pdfTheme,
    pdfFormat,
    examTitle,
    examSubtitle,
    variantCount,
    shuffleQ,
    shuffleOpt,
    success,
    showError,
  ]);

  // ── CSV export ─────────────────────────────────────────────────────
  const handleCsvExport = useCallback(() => {
    if (filteredQuestions.length === 0) return;
    try {
      const csv = exportQuestionsToCSV(filteredQuestions, {
        delimiter: csvDelimiter,
        includeExplanations: csvExplanations,
        includeCategory: csvCategory,
        includeDifficulty: csvDifficulty,
      });
      const ext = csvDelimiter === "\t" ? "tsv" : "csv";
      downloadCSV(csv, `${examTitle}.${ext}`, csvDelimiter);
      success("CSV exported successfully!");
    } catch (err) {
      console.error("CSV export failed:", err);
      showError("CSV export failed. Please try again.");
    }
  }, [
    filteredQuestions,
    csvDelimiter,
    csvExplanations,
    csvCategory,
    csvDifficulty,
    examTitle,
    success,
    showError,
  ]);

  const handleCsvCopy = useCallback(async () => {
    if (filteredQuestions.length === 0) return;
    try {
      const csv = exportQuestionsToCSV(filteredQuestions, {
        delimiter: csvDelimiter,
        includeExplanations: csvExplanations,
        includeCategory: csvCategory,
        includeDifficulty: csvDifficulty,
      });
      await copyToClipboard(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError("Failed to copy to clipboard.");
    }
  }, [
    filteredQuestions,
    csvDelimiter,
    csvExplanations,
    csvCategory,
    csvDifficulty,
    showError,
  ]);

  // ── Project export/import ──────────────────────────────────────────
  const handleProjectExport = useCallback(() => {
    try {
      const json = exportProject();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${examTitle || "mcq-project"}.mcq.json`;
      a.click();
      URL.revokeObjectURL(url);
      success("Project saved!");
    } catch (err) {
      showError("Failed to export project.");
    }
  }, [exportProject, examTitle, success, showError]);

  const handleProjectImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.mcq.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importProject(reader.result as string);
        if (ok) {
          success("Project loaded successfully!");
        } else {
          showError("Invalid project file. Please check the format.");
        }
      };
      reader.onerror = () => {
        showError("Failed to read file.");
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importProject, success, showError]);

  // ── Empty state ────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-lavender/60 mb-3">
          <FileDown className="h-8 w-8 text-showcase-purple/30" />
        </div>
        <p className="font-display text-lg font-bold text-ink-dark">
          No questions to export
        </p>
        <p className="mt-1 text-sm text-ink-muted max-w-xs">
          Create or import questions first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      <h2 className="font-display text-lg font-bold text-ink-dark flex items-center gap-2">
        <FileDown className="h-5 w-5 text-showcase-purple" />
        Export
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {(
          [
            { id: "pdf", label: "PDF", icon: FileText },
            { id: "csv", label: "CSV/TSV", icon: Table2 },
            { id: "project", label: "Project", icon: Archive },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-showcase-purple shadow-sm"
                  : "text-ink-muted hover:text-ink-dark"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Common: Title & Filter */}
      {activeTab !== "project" && (
        <>
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">
              Title
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Exam title"
              className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-sm text-ink-dark focus:border-showcase-purple focus:outline-none"
            />
          </div>

          {allCategories.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">
                Filter by category
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 pr-7 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
                >
                  <option value="">All ({questions.length} questions)</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c} (
                      {
                        questions.filter((q) => q.category === c)
                          .length
                      }
                      )
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PDF tab ── */}
      {activeTab === "pdf" && (
        <>
          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={examSubtitle}
              onChange={(e) => setExamSubtitle(e.target.value)}
              placeholder="e.g. Spring 2026 — Section A"
              className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none"
            />
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-2">
              PDF Format
            </label>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    id: "exam",
                    label: "Exam Paper",
                    desc: "Questions with answer bubbles",
                    icon: FileText,
                  },
                  {
                    id: "answer-key",
                    label: "Answer Key",
                    desc: "Correct answers + explanations",
                    icon: Key,
                  },
                  {
                    id: "study-guide",
                    label: "Study Guide",
                    desc: "Grouped by topic with answers",
                    icon: BookOpen,
                  },
                ] as const
              ).map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setPdfFormat(fmt.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                      pdfFormat === fmt.id
                        ? "border-showcase-purple bg-showcase-purple/5"
                        : "border-ink-light/20 bg-white hover:border-showcase-purple/30"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        pdfFormat === fmt.id
                          ? "text-showcase-purple"
                          : "text-ink-muted"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-ink-dark">
                        {fmt.label}
                      </p>
                      <p className="text-[10px] text-ink-muted">{fmt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-xl border-2 border-ink-light/15 bg-pastel-cream/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-dark">
                Exam Variants
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={variantCount}
                onChange={(e) =>
                  setVariantCount(
                    Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                  )
                }
                className="w-14 rounded-lg border-2 border-ink-light/20 bg-white px-2 py-1 text-xs text-center text-ink-dark focus:border-showcase-purple focus:outline-none"
              />
            </div>
            {variantCount > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs text-ink-dark">
                  <input
                    type="checkbox"
                    checked={shuffleQ}
                    onChange={(e) => setShuffleQ(e.target.checked)}
                    className="accent-showcase-purple"
                  />
                  Shuffle question order
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-dark">
                  <input
                    type="checkbox"
                    checked={shuffleOpt}
                    onChange={(e) => setShuffleOpt(e.target.checked)}
                    className="accent-showcase-purple"
                  />
                  Shuffle option order
                </label>
                <p className="text-[10px] text-ink-muted">
                  Downloads as ZIP with {variantCount} exam + answer key PDFs
                </p>
              </div>
            )}
          </div>

          {/* PDF Customizer toggle */}
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-showcase-purple hover:underline"
          >
            {showCustomizer ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Customize PDF Styling
          </button>

          {showCustomizer && (
            <div className="rounded-xl border-2 border-ink-light/15 bg-white p-3">
              <PdfCustomizer />
            </div>
          )}

          {/* Preview & Generate buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={isPreviewLoading || filteredQuestions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-ink-light/30 bg-white px-4 py-3 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isPreviewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview
            </button>

            <button
              onClick={handlePdfExport}
              disabled={isGenerating || filteredQuestions.length === 0}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 px-4 py-3 font-display font-bold transition-all ${
                isGenerating || filteredQuestions.length === 0
                  ? "border-ink-light/20 bg-gray-100 text-ink-light cursor-not-allowed"
                  : "border-showcase-navy bg-showcase-purple text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky"
              }`}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating
                ? variantProgress || "Generating..."
                : variantCount > 1
                  ? `Download ${variantCount} Variants (ZIP)`
                  : `Download PDF (${filteredQuestions.length} questions)`}
            </button>
          </div>

          {/* PDF Preview iframe */}
          {previewUrl && (
            <div className="rounded-xl border-2 border-ink-light/20 overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-ink-light/10">
                <span className="text-xs font-bold text-ink-muted">PDF Preview</span>
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
                title="PDF Preview"
                className="w-full h-[400px] border-0"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {/* ── CSV tab ── */}
      {activeTab === "csv" && (
        <>
          {/* Delimiter */}
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">
              Delimiter
            </label>
            <div className="flex gap-2">
              {(
                [
                  { value: ",", label: "CSV (,)" },
                  { value: "\t", label: "TSV (Tab)" },
                  { value: ";", label: "Semi (;)" },
                ] as const
              ).map((d) => (
                <button
                  key={d.value}
                  onClick={() => setCsvDelimiter(d.value)}
                  className={`flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-bold transition-all ${
                    csvDelimiter === d.value
                      ? "border-showcase-navy bg-showcase-navy text-white"
                      : "border-ink-light/20 bg-white text-ink-muted hover:bg-gray-50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column toggles */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-ink-dark">
              Include columns:
            </label>
            {[
              {
                label: "Explanations",
                checked: csvExplanations,
                set: setCsvExplanations,
              },
              {
                label: "Categories",
                checked: csvCategory,
                set: setCsvCategory,
              },
              {
                label: "Difficulty",
                checked: csvDifficulty,
                set: setCsvDifficulty,
              },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex items-center gap-2 text-xs text-ink-dark"
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="accent-showcase-purple"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCsvExport}
              disabled={filteredQuestions.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-4 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleCsvCopy}
              disabled={filteredQuestions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-ink-light/30 bg-white px-4 py-2.5 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </>
      )}

      {/* ── Project tab ── */}
      {activeTab === "project" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink-muted">
            Save or load your entire question bank, exams, and settings as
            a project file.
          </p>

          <button
            onClick={handleProjectExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-4 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
          >
            <Save className="h-4 w-4" />
            Save Project (.mcq.json)
          </button>

          <button
            onClick={handleProjectImport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-ink-light/30 bg-white px-4 py-2.5 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
          >
            <FolderOpen className="h-4 w-4" />
            Load Project
          </button>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
