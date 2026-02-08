"use client";

import { useState, useCallback, useRef, useEffect, type DragEvent } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Download,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useFlashcards } from "./FlashcardContext";
import type { FlashcardCard, ColumnMapping } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────
function makeId() {
  // Use crypto.randomUUID for collision-free IDs (safe across hot reloads)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `card-${crypto.randomUUID()}`;
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SAMPLE_CSV = `front,back
"What is the powerhouse of the cell?","Mitochondria"
"What does DNA stand for?","Deoxyribonucleic Acid"
"What is the normal resting heart rate?","60-100 bpm"`;

const MAX_FILE_SIZE_MB = 50;
const WARN_FILE_SIZE_MB = 5;

// ── Component ────────────────────────────────────────────────────────
export default function ImportPanel() {
  const {
    cards,
    addCards,
    setCards,
    removeCard,
    clearCards,
    selectedCardIndex,
    setSelectedCardIndex,
    setActivePanel,
    setColumnMapping,
  } = useFlashcards();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [pendingMapping, setPendingMapping] = useState<ColumnMapping>({
    front: "",
    back: "",
  });
  const [step, setStep] = useState<"idle" | "mapping" | "done">(
    cards.length > 0 ? "done" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  // Preload PapaParse on mount
  useEffect(() => {
    import("papaparse").catch(() => {
      // Will be re-attempted on file select
    });
  }, []);

  // ── Parse file ───────────────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // File size validation
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(
          `File is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        );
        return;
      }
      if (fileSizeMB > WARN_FILE_SIZE_MB) {
        // Large file — still allow it but parsing might be slow
      }

      setParsing(true);

      try {
        const Papa = (await import("papaparse")).default;
        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          complete(results) {
            setParsing(false);
            const data = results.data as string[][];
            if (data.length < 2) {
              setError(
                "File must have at least a header row and one data row.",
              );
              return;
            }
            const headers = data[0].map((h) => h?.trim() ?? "");
            const rows = data.slice(1);
            setParsedHeaders(headers);
            setParsedRows(rows);

            // Auto-detect column mapping
            const frontCol =
              headers.find((h) => /^front$/i.test(h)) ??
              headers.find((h) => /question/i.test(h)) ??
              headers[0];
            const backCol =
              headers.find((h) => /^back$/i.test(h)) ??
              headers.find((h) => /answer/i.test(h)) ??
              headers[1] ??
              headers[0];
            const mediaCol = headers.find((h) => /media|image|img/i.test(h));

            setPendingMapping({
              front: frontCol,
              back: backCol,
              media: mediaCol,
            });
            setStep("mapping");
          },
          error(err) {
            setParsing(false);
            setError(`Parse error: ${err.message}`);
          },
        });
      } catch {
        setParsing(false);
        setError("Failed to load file parser. Please try again.");
      }
    },
    [],
  );

  // ── Drag & drop ──────────────────────────────────────────────────
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  // ── Add blank card manually ────────────────────────────────────
  const addBlankCard = useCallback(() => {
    const newCard: FlashcardCard = {
      id: makeId(),
      front: "",
      back: "",
    };
    addCards([newCard]);
    setSelectedCardIndex(cards.length); // Select the new card
    setStep("done");
    setActivePanel("customize");
  }, [addCards, cards.length, setSelectedCardIndex, setActivePanel]);

  // ── Confirm mapping ──────────────────────────────────────────────
  const confirmMapping = useCallback(() => {
    const frontIdx = parsedHeaders.indexOf(pendingMapping.front);
    const backIdx = parsedHeaders.indexOf(pendingMapping.back);
    const mediaIdx = pendingMapping.media
      ? parsedHeaders.indexOf(pendingMapping.media)
      : -1;

    if (frontIdx < 0 || backIdx < 0) {
      setError("Please select valid columns for Front and Back.");
      return;
    }

    const newCards: FlashcardCard[] = parsedRows
      .filter((row) => row[frontIdx]?.trim() || row[backIdx]?.trim())
      .map((row) => ({
        id: makeId(),
        front: row[frontIdx]?.trim() ?? "",
        back: row[backIdx]?.trim() ?? "",
        mediaUrl: mediaIdx >= 0 ? row[mediaIdx]?.trim() : undefined,
      }));

    setCards(newCards);
    setColumnMapping(pendingMapping);
    setSelectedCardIndex(0);
    setStep("done");
    setActivePanel("customize");
  }, [
    parsedHeaders,
    parsedRows,
    pendingMapping,
    setCards,
    setColumnMapping,
    setSelectedCardIndex,
    setActivePanel,
  ]);

  // ── Download sample CSV ──────────────────────────────────────────
  const downloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="font-display text-lg font-bold text-ink-dark">
        Import Cards
      </h2>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── STEP: Idle — drag & drop zone ── */}
      {step === "idle" && (
        <>
          {parsing ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-3 border-dashed border-showcase-teal/30 bg-showcase-teal/5 p-8 text-center">
              <Loader2 className="h-8 w-8 text-showcase-teal animate-spin" />
              <p className="text-sm font-bold text-ink-dark">
                Parsing file...
              </p>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload CSV or TSV file"
              className={`
                flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-3 border-dashed p-8 text-center transition-all
                ${
                  dragOver
                    ? "border-showcase-teal bg-showcase-teal/10 scale-[1.02]"
                    : "border-ink-light/30 bg-pastel-cream/30 hover:border-showcase-teal/50 hover:bg-pastel-cream/50"
                }
              `}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-showcase-teal/30 bg-showcase-teal/10">
                <Upload className="h-7 w-7 text-showcase-teal" />
              </div>
              <div>
                <p className="font-display font-bold text-ink-dark">
                  Drop your CSV or TSV file here
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  or click to browse — supports Anki exports
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={onFileSelect}
            aria-hidden="true"
          />

          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={downloadSample}
              className="inline-flex items-center gap-2 text-sm font-bold text-showcase-purple hover:underline"
            >
              <Download className="h-4 w-4" />
              Download sample CSV
            </button>
            <span className="text-ink-light/40">|</span>
            <button
              onClick={addBlankCard}
              className="inline-flex items-center gap-2 text-sm font-bold text-showcase-teal hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add card manually
            </button>
          </div>
        </>
      )}

      {/* ── STEP: Column mapping ── */}
      {step === "mapping" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">
            We found <strong>{parsedRows.length}</strong> rows and{" "}
            <strong>{parsedHeaders.length}</strong> columns. Map them below:
          </p>

          {/* Front column */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-ink-dark">
              Front (question)
            </span>
            <select
              value={pendingMapping.front}
              onChange={(e) =>
                setPendingMapping((m) => ({ ...m, front: e.target.value }))
              }
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            >
              {parsedHeaders.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>

          {/* Back column */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-ink-dark">
              Back (answer)
            </span>
            <select
              value={pendingMapping.back}
              onChange={(e) =>
                setPendingMapping((m) => ({ ...m, back: e.target.value }))
              }
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            >
              {parsedHeaders.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>

          {/* Media column (optional) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-ink-dark">
              Media column{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </span>
            <select
              value={pendingMapping.media ?? ""}
              onChange={(e) =>
                setPendingMapping((m) => ({
                  ...m,
                  media: e.target.value || undefined,
                }))
              }
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            >
              <option value="">-- None --</option>
              {parsedHeaders.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>

          {/* Preview table */}
          <div className="rounded-xl border-2 border-ink-light/20 overflow-auto max-h-40">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-pastel-cream/50">
                  {parsedHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-2 py-1.5 text-left font-bold text-ink-dark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-ink-light/10">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-2 py-1 text-ink-muted max-w-[120px] truncate"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 5 && (
              <p className="px-2 py-1 text-xs text-ink-muted text-center bg-pastel-cream/30">
                ...and {parsedRows.length - 5} more rows
              </p>
            )}
          </div>

          <button
            onClick={confirmMapping}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-4 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
          >
            <Check className="h-4 w-4" />
            Import {parsedRows.length} Cards
          </button>
        </div>
      )}

      {/* ── STEP: Done — card list ── */}
      {step === "done" && cards.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink-dark">
              {cards.length} card{cards.length !== 1 ? "s" : ""} loaded
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("idle");
                  setParsedHeaders([]);
                  setParsedRows([]);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-showcase-purple hover:underline"
                title="Replace all cards with a new file"
              >
                <FileText className="h-3 w-3" />
                Replace file
              </button>
              <button
                onClick={() => {
                  clearCards();
                  setStep("idle");
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            </div>
          </div>

          {/* Add card manually button */}
          <button
            onClick={addBlankCard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-light/30 px-3 py-2 text-sm font-bold text-showcase-teal hover:border-showcase-teal/50 hover:bg-showcase-teal/5 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add card manually
          </button>

          {/* Scrollable card list */}
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100dvh-380px)] pr-1">
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={`
                  flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm transition-all
                  ${
                    i === selectedCardIndex
                      ? "border-showcase-teal bg-showcase-teal/10"
                      : "border-ink-light/20 bg-white hover:border-showcase-teal/40"
                  }
                `}
              >
                <button
                  onClick={() => setSelectedCardIndex(i)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-pastel-cream text-xs font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <span className="truncate text-ink-dark">
                    {card.front || "(empty)"}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCard(card.id);
                  }}
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Delete card ${i + 1}`}
                  title="Delete card"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show idle state when cards were cleared */}
      {step === "done" && cards.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-center py-4">
          <p className="text-sm text-ink-muted">All cards cleared.</p>
          <button
            onClick={() => setStep("idle")}
            className="text-sm font-bold text-showcase-teal hover:underline"
          >
            Import new cards
          </button>
        </div>
      )}
    </div>
  );
}
