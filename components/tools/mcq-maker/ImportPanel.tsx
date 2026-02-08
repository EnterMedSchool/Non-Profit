"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Download,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import type { MCQQuestion, MCQOption, MCQColumnMapping } from "./types";

import { OPTION_LETTERS } from "./constants";

// ── Helpers ──────────────────────────────────────────────────────────
function makeId() {
  return crypto.randomUUID();
}

const SAMPLE_CSV = `question,option_a,option_b,option_c,option_d,correct,explanation,category,difficulty
"What is the powerhouse of the cell?","Nucleus","Mitochondria","Ribosome","Golgi Apparatus","B","Mitochondria generate most of the cell's supply of ATP, used as a source of chemical energy.","Cell Biology","easy"
"Which vitamin is produced when skin is exposed to sunlight?","Vitamin A","Vitamin B12","Vitamin C","Vitamin D","D","Ultraviolet B radiation triggers Vitamin D synthesis in the skin.","Biochemistry","easy"
"What is the normal resting heart rate for adults?","40-60 bpm","60-100 bpm","100-120 bpm","120-140 bpm","B","A normal resting heart rate for adults ranges from 60 to 100 beats per minute.","Physiology","medium"
"Which cranial nerve is responsible for the sense of smell?","Olfactory (CN I)","Optic (CN II)","Trigeminal (CN V)","Facial (CN VII)","A","The olfactory nerve (CN I) transmits sensory information for the sense of smell.","Neuroanatomy","medium"
"Which enzyme is responsible for unwinding DNA during replication?","DNA polymerase","Helicase","Ligase","Primase","B","Helicase unwinds the double helix structure at the replication fork.","Molecular Biology","hard"`;

// ── Smart column detection ───────────────────────────────────────────
function autoDetectColumns(headers: string[]): MCQColumnMapping {
  const lower = headers.map((h) => h.toLowerCase().trim());

  // Question column
  const question =
    headers[
      lower.findIndex((h) =>
        /^(question|q|stem|prompt|text)$/i.test(h),
      )
    ] ?? headers[0];

  // Option columns: look for a, b, c, d... or option_a, choice_1, etc.
  const optionPatterns = [
    // Try option_a, option_b, ... pattern
    () => {
      const opts: string[] = [];
      for (const letter of ["a", "b", "c", "d", "e", "f"]) {
        const idx = lower.findIndex(
          (h) =>
            h === letter ||
            h === `option_${letter}` ||
            h === `option${letter}` ||
            h === `choice_${letter}` ||
            h === `answer_${letter}`,
        );
        if (idx >= 0) opts.push(headers[idx]);
      }
      return opts.length >= 2 ? opts : null;
    },
    // Try choice_1, choice_2, ... pattern
    () => {
      const opts: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const idx = lower.findIndex(
          (h) =>
            h === `choice_${i}` ||
            h === `option_${i}` ||
            h === `choice${i}` ||
            h === `option${i}`,
        );
        if (idx >= 0) opts.push(headers[idx]);
      }
      return opts.length >= 2 ? opts : null;
    },
  ];

  let options: string[] = [];
  for (const detect of optionPatterns) {
    const result = detect();
    if (result) {
      options = result;
      break;
    }
  }

  // Fallback: grab columns that aren't question/correct/explanation/category/difficulty
  if (options.length === 0) {
    const skip = new Set([
      question.toLowerCase(),
      ...lower.filter((h) =>
        /^(correct|answer|key|explanation|rationale|category|topic|subject|difficulty|level|tags)$/i.test(
          h,
        ),
      ),
    ]);
    options = headers.filter((h) => !skip.has(h.toLowerCase().trim()));
    // Take up to 6 as options
    options = options.slice(0, 6);
  }

  // Correct column
  const correct =
    headers[
      lower.findIndex((h) =>
        /^(correct|answer|key|correct_answer|right_answer)$/i.test(h),
      )
    ] ?? "";

  // Explanation
  const explanation =
    headers[
      lower.findIndex((h) =>
        /^(explanation|rationale|reason|why|feedback)$/i.test(h),
      )
    ] ?? undefined;

  // Category
  const category =
    headers[
      lower.findIndex((h) =>
        /^(category|topic|subject|chapter|section)$/i.test(h),
      )
    ] ?? undefined;

  // Difficulty
  const difficulty =
    headers[
      lower.findIndex((h) =>
        /^(difficulty|level|diff)$/i.test(h),
      )
    ] ?? undefined;

  return { question, options, correct, explanation, category, difficulty };
}

// ── Resolve correct answer ───────────────────────────────────────────
function resolveCorrectAnswer(
  correctRaw: string,
  options: MCQOption[],
): string | null {
  const trimmed = correctRaw.trim();
  if (!trimmed) return null;

  // Check if it's a letter (A, B, C, D...)
  const letterIdx = OPTION_LETTERS.findIndex(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  if (letterIdx >= 0 && letterIdx < options.length) {
    return options[letterIdx].id;
  }

  // Check if it's a 1-based index
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 1 && num <= options.length) {
    return options[num - 1].id;
  }

  // Check if it matches option text exactly
  const textMatch = options.find(
    (o) => o.text.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (textMatch) return textMatch.id;

  return null;
}

// ── Component ────────────────────────────────────────────────────────
export default function ImportPanel() {
  const { addQuestions, questions, setActivePanel } = useMCQ();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MCQColumnMapping>({
    question: "",
    options: [],
    correct: "",
  });
  const [step, setStep] = useState<"idle" | "mapping" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [importCount, setImportCount] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);

  // ── Parse file ─────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setWarnings([]);
    const Papa = (await import("papaparse")).default;
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete(results) {
        const data = results.data as string[][];
        if (data.length < 2) {
          setError("File must have at least a header row and one data row.");
          return;
        }
        const headers = data[0].map((h) => h.trim());
        const rows = data.slice(1);
        setParsedHeaders(headers);
        setParsedRows(rows);

        const detected = autoDetectColumns(headers);
        setMapping(detected);
        setStep("mapping");
      },
      error(err) {
        setError(`Parse error: ${err.message}`);
      },
    });
  }, []);

  // ── Drag & drop ────────────────────────────────────────────────────
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

  // ── Confirm mapping ────────────────────────────────────────────────
  const confirmMapping = useCallback(() => {
    const qIdx = parsedHeaders.indexOf(mapping.question);
    const optionIdxs = mapping.options.map((o) => parsedHeaders.indexOf(o));
    const correctIdx = mapping.correct
      ? parsedHeaders.indexOf(mapping.correct)
      : -1;
    const explIdx = mapping.explanation
      ? parsedHeaders.indexOf(mapping.explanation)
      : -1;
    const catIdx = mapping.category
      ? parsedHeaders.indexOf(mapping.category)
      : -1;
    const diffIdx = mapping.difficulty
      ? parsedHeaders.indexOf(mapping.difficulty)
      : -1;

    if (qIdx < 0) {
      setError("Please select a valid question column.");
      return;
    }

    if (optionIdxs.filter((i) => i >= 0).length < 2) {
      setError("Please map at least 2 option columns.");
      return;
    }

    const importWarnings: string[] = [];
    const newQuestions: MCQQuestion[] = [];

    for (let rowNum = 0; rowNum < parsedRows.length; rowNum++) {
      const row = parsedRows[rowNum];
      const questionText = row[qIdx]?.trim() ?? "";
      if (!questionText) continue;

      // Build options
      const options: MCQOption[] = optionIdxs
        .filter((i) => i >= 0)
        .map((colIdx) => ({
          id: makeId(),
          text: row[colIdx]?.trim() ?? "",
          isCorrect: false,
        }))
        .filter((o) => o.text.length > 0);

      if (options.length < 2) {
        importWarnings.push(
          `Row ${rowNum + 2}: Skipped — fewer than 2 non-empty options.`,
        );
        continue;
      }

      // Resolve correct answer
      const correctRaw = correctIdx >= 0 ? row[correctIdx]?.trim() ?? "" : "";
      const correctId = resolveCorrectAnswer(correctRaw, options);

      if (!correctId && correctRaw) {
        importWarnings.push(
          `Row ${rowNum + 2}: Could not match correct answer "${correctRaw}" — defaulting to first option.`,
        );
      }

      const resolvedCorrectId = correctId ?? options[0].id;
      options.forEach((o) => {
        o.isCorrect = o.id === resolvedCorrectId;
      });

      // Parse difficulty
      let difficulty: MCQQuestion["difficulty"] = undefined;
      if (diffIdx >= 0) {
        const raw = row[diffIdx]?.trim().toLowerCase() ?? "";
        if (raw === "easy" || raw === "medium" || raw === "hard") {
          difficulty = raw;
        }
      }

      const q: MCQQuestion = {
        id: makeId(),
        question: questionText,
        options,
        correctOptionId: resolvedCorrectId,
        explanation:
          explIdx >= 0 ? row[explIdx]?.trim() || undefined : undefined,
        category: catIdx >= 0 ? row[catIdx]?.trim() || undefined : undefined,
        difficulty,
        points: 1,
        tags: [],
        source: "import",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      newQuestions.push(q);
    }

    if (newQuestions.length === 0) {
      setError("No valid questions found. Check your column mapping.");
      return;
    }

    addQuestions(newQuestions);
    setImportCount(newQuestions.length);
    setWarnings(importWarnings);
    setStep("done");
  }, [parsedHeaders, parsedRows, mapping, addQuestions]);

  // ── Download sample CSV ────────────────────────────────────────────
  const downloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Update mapping helper ──────────────────────────────────────────
  const updateMappingOption = useCallback(
    (idx: number, value: string) => {
      setMapping((prev) => {
        const next = [...prev.options];
        next[idx] = value;
        return { ...prev, options: next };
      });
    },
    [],
  );

  const addMappingOption = useCallback(() => {
    if (mapping.options.length >= 6) return;
    const unused = parsedHeaders.filter(
      (h) =>
        h !== mapping.question &&
        !mapping.options.includes(h) &&
        h !== mapping.correct &&
        h !== mapping.explanation &&
        h !== mapping.category &&
        h !== mapping.difficulty,
    );
    setMapping((prev) => ({
      ...prev,
      options: [...prev.options, unused[0] ?? ""],
    }));
  }, [mapping, parsedHeaders]);

  const removeMappingOption = useCallback((idx: number) => {
    setMapping((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="font-display text-lg font-bold text-ink-dark flex items-center gap-2">
        <Upload className="h-5 w-5 text-showcase-teal" />
        Import Questions
      </h2>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── STEP: Idle — drag & drop zone ── */}
      {step === "idle" && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop CSV or TSV file here, or click to browse"
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
                or click to browse
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={onFileSelect}
          />

          <button
            onClick={downloadSample}
            className="inline-flex items-center justify-center gap-2 text-sm font-bold text-showcase-purple hover:underline"
          >
            <Download className="h-4 w-4" />
            Download sample CSV
          </button>

          {/* Format help */}
          <div className="rounded-xl border-2 border-ink-light/15 bg-pastel-cream/20 p-3">
            <p className="text-xs font-bold text-ink-dark mb-1">
              Supported formats:
            </p>
            <ul className="text-xs text-ink-muted space-y-0.5">
              <li>
                CSV/TSV with columns: question, option_a..d, correct, explanation
              </li>
              <li>Auto-detects column names and maps them</li>
              <li>Correct answer can be a letter (A, B...) or the full text</li>
            </ul>
          </div>
        </>
      )}

      {/* ── STEP: Column mapping ── */}
      {step === "mapping" && (
        <div className="flex flex-col gap-4 overflow-y-auto">
          <p className="text-sm text-ink-muted">
            Found <strong>{parsedRows.length}</strong> rows and{" "}
            <strong>{parsedHeaders.length}</strong> columns. Map them below:
          </p>

          {/* Question column */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-ink-dark">
              Question column <span className="text-red-400">*</span>
            </span>
            <div className="relative">
              <select
                value={mapping.question}
                onChange={(e) =>
                  setMapping((m) => ({ ...m, question: e.target.value }))
                }
                className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
              >
                {parsedHeaders.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
            </div>
          </label>

          {/* Option columns */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-dark">
              Option columns <span className="text-red-400">*</span>
              <span className="ml-1 text-xs font-normal text-ink-muted">
                (min 2)
              </span>
            </span>
            {mapping.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-ink-muted">
                  {OPTION_LETTERS[idx]}
                </span>
                <div className="relative flex-1">
                  <select
                    value={opt}
                    onChange={(e) => updateMappingOption(idx, e.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
                  >
                    <option value="">— Select —</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
                </div>
                {mapping.options.length > 2 && (
                  <button
                    onClick={() => removeMappingOption(idx)}
                    className="text-ink-light hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {mapping.options.length < 6 && (
              <button
                onClick={addMappingOption}
                className="text-xs font-bold text-showcase-purple hover:underline"
              >
                + Add option column
              </button>
            )}
          </div>

          {/* Correct answer column */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-ink-dark">
              Correct answer column
            </span>
            <div className="relative">
              <select
                value={mapping.correct}
                onChange={(e) =>
                  setMapping((m) => ({ ...m, correct: e.target.value }))
                }
                className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
              >
                <option value="">— None —</option>
                {parsedHeaders.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
            </div>
          </label>

          {/* Optional columns */}
          <div className="grid grid-cols-1 gap-3">
            {/* Explanation */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-ink-dark">
                Explanation <span className="text-ink-muted font-normal">(optional)</span>
              </span>
              <div className="relative">
                <select
                  value={mapping.explanation ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({
                      ...m,
                      explanation: e.target.value || undefined,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
                >
                  <option value="">— None —</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
              </div>
            </label>

            {/* Category */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-ink-dark">
                Category <span className="text-ink-muted font-normal">(optional)</span>
              </span>
              <div className="relative">
                <select
                  value={mapping.category ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({
                      ...m,
                      category: e.target.value || undefined,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
                >
                  <option value="">— None —</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
              </div>
            </label>

            {/* Difficulty */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-ink-dark">
                Difficulty <span className="text-ink-muted font-normal">(optional)</span>
              </span>
              <div className="relative">
                <select
                  value={mapping.difficulty ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({
                      ...m,
                      difficulty: e.target.value || undefined,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 pr-8 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
                >
                  <option value="">— None —</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light pointer-events-none" />
              </div>
            </label>
          </div>

          {/* Preview table */}
          <div className="rounded-xl border-2 border-ink-light/20 overflow-auto max-h-40">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-pastel-cream/50">
                  {parsedHeaders.map((h) => (
                    <th key={h} className="px-2 py-1.5 text-left font-bold text-ink-dark whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-ink-light/10">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 text-ink-muted max-w-[120px] truncate">
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
            Import {parsedRows.length} Questions
          </button>

          <button
            onClick={() => {
              setStep("idle");
              setParsedHeaders([]);
              setParsedRows([]);
              setError(null);
            }}
            className="text-xs font-bold text-ink-muted hover:underline text-center"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── STEP: Done ── */}
      {step === "done" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border-2 border-green-300 bg-green-50 px-3 py-2.5 text-sm font-bold text-green-700">
            <Check className="h-4 w-4" />
            Successfully imported {importCount} questions!
          </div>

          {warnings.length > 0 && (
            <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 px-3 py-2">
              <p className="text-xs font-bold text-yellow-700 mb-1">
                Warnings ({warnings.length}):
              </p>
              <ul className="text-xs text-yellow-600 space-y-0.5 max-h-24 overflow-y-auto">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setActivePanel("bank")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-4 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              View Questions
            </button>
            <button
              onClick={() => {
                setStep("idle");
                setParsedHeaders([]);
                setParsedRows([]);
                setWarnings([]);
                setError(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl border-3 border-ink-light/30 bg-white px-4 py-2.5 font-display font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              <FileText className="h-4 w-4" />
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
