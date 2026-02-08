import type { MCQQuestion } from "./types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

// ── Export questions to CSV/TSV string ────────────────────────────────
export interface CsvExportOptions {
  delimiter: "," | "\t" | ";";
  includeExplanations: boolean;
  includeCategory: boolean;
  includeDifficulty: boolean;
  includeTags: boolean;
  includePoints: boolean;
}

const DEFAULT_CSV_OPTIONS: CsvExportOptions = {
  delimiter: ",",
  includeExplanations: true,
  includeCategory: true,
  includeDifficulty: true,
  includeTags: false,
  includePoints: false,
};

function escapeField(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportQuestionsToCSV(
  questions: MCQQuestion[],
  options: Partial<CsvExportOptions> = {},
): string {
  const opts: CsvExportOptions = { ...DEFAULT_CSV_OPTIONS, ...options };
  const d = opts.delimiter;

  // Find max options count (guard against empty array)
  const maxOptions =
    questions.length > 0
      ? Math.max(...questions.map((q) => q.options.length), 4)
      : 4;

  // Build header
  const headers = ["question"];
  for (let i = 0; i < maxOptions; i++) {
    headers.push(`option_${OPTION_LETTERS[i].toLowerCase()}`);
  }
  headers.push("correct");
  if (opts.includeExplanations) headers.push("explanation");
  if (opts.includeCategory) headers.push("category");
  if (opts.includeDifficulty) headers.push("difficulty");
  if (opts.includeTags) headers.push("tags");
  if (opts.includePoints) headers.push("points");

  const rows = [headers.map((h) => escapeField(h, d)).join(d)];

  for (const q of questions) {
    const correctIdx = q.options.findIndex(
      (o) => o.id === q.correctOptionId,
    );
    const row: string[] = [q.question];

    // Options
    for (let i = 0; i < maxOptions; i++) {
      row.push(q.options[i]?.text ?? "");
    }

    // Correct answer letter
    row.push(correctIdx >= 0 ? OPTION_LETTERS[correctIdx] : "");

    if (opts.includeExplanations) row.push(q.explanation ?? "");
    if (opts.includeCategory) row.push(q.category ?? "");
    if (opts.includeDifficulty) row.push(q.difficulty ?? "");
    if (opts.includeTags) row.push((q.tags ?? []).join(", "));
    if (opts.includePoints) row.push(String(q.points ?? 1));

    rows.push(row.map((cell) => escapeField(cell, d)).join(d));
  }

  // Add UTF-8 BOM for Excel compatibility
  return "\uFEFF" + rows.join("\n");
}

// ── Download helper ──────────────────────────────────────────────────
export function downloadCSV(
  content: string,
  filename: string,
  delimiter: string,
) {
  const mimeType =
    delimiter === "\t" ? "text/tab-separated-values" : "text/csv";
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Copy to clipboard ────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}
