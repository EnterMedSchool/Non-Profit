"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Archive, Loader2 } from "lucide-react";

interface DeckItem {
  prompt?: string;
  front?: string;
  back?: string;
  explanation?: string;
  options?: Array<{ label: string; body: string; isCorrect: boolean }>;
  stableId: string;
  ordinal: number;
}

export interface DeckDownloadPanelProps {
  type: "questions" | "flashcards";
  deckTitle: string;
  deckSlug: string;
  items: DeckItem[];
}

const ATTRIBUTION_TEXT = `Attribution Instructions
========================

This resource was created by EnterMedSchool.org — Free Medical Education Resources.

When sharing, remixing, or using this content:
- Credit EnterMedSchool.org as the source
- Link to https://entermedschool.org when possible
- For flashcards: retain the "Source: entermedschool.org" line in each card when importing to Anki or other apps

Thank you for supporting free medical education!
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

async function generateQuestionsExamPdf(
  deckTitle: string,
  items: DeckItem[],
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxW = pageW - margin * 2;
  let y = margin;

  const [pr, pg, pb] = hexToRgb("#6C5CE7");
  const [dr, dg, db] = hexToRgb("#1a1a2e");

  const addHeader = (pageNum: number, totalPages: number) => {
    doc.setFillColor(108, 92, 231); // showcase purple
    doc.rect(0, 0, pageW, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EnterMedSchool.org", margin, 9);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(deckTitle, margin, 12);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageW - margin - 20, 10);
  };

  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Source: entermedschool.org — Free Medical Education Resources",
      pageW / 2,
      pageH - 5,
      { align: "center" },
    );
  };

  const wrapText = (text: string, maxWidth: number) =>
    doc.splitTextToSize(text, maxWidth) as string[];

  // First pass: render questions
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(0.5);

  for (let i = 0; i < items.length; i++) {
    if (y > pageH - 35) {
      addFooter();
      doc.addPage();
      y = margin;
    }

    const q = items[i];
    const prompt = q.prompt ?? "";
    const options = q.options ?? [];

    doc.setTextColor(dr, dg, db);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const qLines = wrapText(`${i + 1}. ${prompt}`, maxW - 4);
    doc.text(qLines, margin, y);
    y += qLines.length * 4 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const labels = ["A", "B", "C", "D", "E"];
    for (let j = 0; j < options.length && j < 5; j++) {
      const opt = options[j];
      const optLines = wrapText(`${labels[j]}. ${opt.body}`, maxW - 10);
      doc.text(optLines, margin + 4, y);
      y += optLines.length * 3.5 + 1;
    }
    y += 4;
  }

  // Answer key page
  doc.addPage();
  y = margin + 14;
  doc.setFillColor(108, 92, 231);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("EnterMedSchool.org", margin, 9);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${deckTitle} — Answer Key`, margin, 12);

  doc.setTextColor(dr, dg, db);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Answer Key", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const labels = ["A", "B", "C", "D", "E"];
  for (let i = 0; i < items.length; i++) {
    const opts = items[i].options ?? [];
    const correct = opts.find((o) => o.isCorrect);
    const ans = correct ? labels[opts.indexOf(correct)] ?? "-" : "-";
    doc.text(`${i + 1}. ${ans}`, margin, y);
    y += 5;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeader(p, totalPages);
    addFooter();
  }

  return doc.output("blob");
}

async function generateQuestionsStudyGuidePdf(
  deckTitle: string,
  items: DeckItem[],
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxW = pageW - margin * 2;
  let y = margin;

  const [pr, pg, pb] = hexToRgb("#6C5CE7");
  const [dr, dg, db] = hexToRgb("#1a1a2e");

  const addHeader = (pageNum: number, totalPages: number) => {
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EnterMedSchool.org", margin, 9);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${deckTitle} — Study Guide`, margin, 12);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageW - margin - 20, 10);
  };

  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Source: entermedschool.org — Free Medical Education Resources",
      pageW / 2,
      pageH - 5,
      { align: "center" },
    );
  };

  const wrapText = (text: string, maxWidth: number) =>
    doc.splitTextToSize(text, maxWidth) as string[];

  const labels = ["A", "B", "C", "D", "E"];

  for (let i = 0; i < items.length; i++) {
    if (y > pageH - 40) {
      addFooter();
      doc.addPage();
      y = margin;
    }

    const q = items[i];
    const prompt = q.prompt ?? "";
    const options = q.options ?? [];
    const explanation = q.explanation ?? "";

    doc.setTextColor(dr, dg, db);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const qLines = wrapText(`${i + 1}. ${prompt}`, maxW - 4);
    doc.text(qLines, margin, y);
    y += qLines.length * 4 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (let j = 0; j < options.length && j < 5; j++) {
      const opt = options[j];
      const mark = opt.isCorrect ? " ✓" : "";
      const optLines = wrapText(`${labels[j]}. ${opt.body}${mark}`, maxW - 10);
      doc.text(optLines, margin + 4, y);
      y += optLines.length * 3.5 + 1;
    }

    if (explanation) {
      y += 2;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const explLines = wrapText(`Explanation: ${explanation}`, maxW - 4);
      doc.text(explLines, margin, y);
      y += explLines.length * 3.5 + 3;
    }
    doc.setTextColor(dr, dg, db);
    y += 4;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeader(p, totalPages);
    addFooter();
  }

  return doc.output("blob");
}

async function generateFlashcardsPdf(
  deckTitle: string,
  items: DeckItem[],
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxW = pageW - margin * 2;
  let y = margin;

  const [dr, dg, db] = hexToRgb("#1a1a2e");

  const addHeader = (pageNum: number, totalPages: number) => {
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EnterMedSchool.org", margin, 9);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(deckTitle, margin, 12);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageW - margin - 20, 10);
  };

  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Source: entermedschool.org — Free Medical Education Resources",
      pageW / 2,
      pageH - 5,
      { align: "center" },
    );
  };

  const wrapText = (text: string, maxWidth: number) =>
    doc.splitTextToSize(text, maxWidth) as string[];

  doc.setTextColor(dr, dg, db);

  for (let i = 0; i < items.length; i++) {
    if (y > pageH - 35) {
      addFooter();
      doc.addPage();
      y = margin;
    }

    const card = items[i];
    const front = card.front ?? "";
    const back = card.back ?? "";

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Front:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const frontLines = wrapText(front, maxW - 4);
    doc.text(frontLines, margin, y);
    y += frontLines.length * 4 + 3;

    doc.setFont("helvetica", "bold");
    doc.text("Back:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const backLines = wrapText(back, maxW - 4);
    doc.text(backLines, margin, y);
    y += backLines.length * 4 + 6;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeader(p, totalPages);
    addFooter();
  }

  return doc.output("blob");
}

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function DeckDownloadPanel({
  type,
  deckTitle,
  deckSlug,
  items,
}: DeckDownloadPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTsv = async () => {
    if (type !== "flashcards") return;
    setLoading("tsv");
    try {
      const BOM = "\uFEFF";
      const header = `# Flashcard deck: ${deckTitle} — Generated by EnterMedSchool.org\n`;
      const rows = items.map(
        (item) =>
          `${item.front ?? ""}\t${(item.back ?? "")} | Source: entermedschool.org`,
      );
      const content = BOM + header + rows.join("\n");
      const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8" });
      triggerDownload(blob, `entermedschool-${deckSlug}-flashcards.tsv`);
    } finally {
      setLoading(null);
    }
  };

  const handleCsv = async () => {
    if (type !== "flashcards") return;
    setLoading("csv");
    try {
      const BOM = "\uFEFF";
      const header = `# Flashcard deck: ${deckTitle} — Generated by EnterMedSchool.org\n`;
      const rows = items.map((item) => {
        const front = escapeCsv(item.front ?? "");
        const back = escapeCsv(`${item.back ?? ""} | Source: entermedschool.org`);
        return `${front},${back}`;
      });
      const content = BOM + header + rows.join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      triggerDownload(blob, `entermedschool-${deckSlug}-flashcards.csv`);
    } finally {
      setLoading(null);
    }
  };

  const handlePdfExam = async () => {
    if (type !== "questions") return;
    setLoading("pdf-exam");
    try {
      const blob = await generateQuestionsExamPdf(deckTitle, items);
      triggerDownload(blob, `entermedschool-${deckSlug}-exam.pdf`);
    } finally {
      setLoading(null);
    }
  };

  const handlePdfStudyGuide = async () => {
    if (type !== "questions") return;
    setLoading("pdf-study");
    try {
      const blob = await generateQuestionsStudyGuidePdf(deckTitle, items);
      triggerDownload(blob, `entermedschool-${deckSlug}-study-guide.pdf`);
    } finally {
      setLoading(null);
    }
  };

  const handlePdf = async () => {
    if (type !== "flashcards") return;
    setLoading("pdf");
    try {
      const blob = await generateFlashcardsPdf(deckTitle, items);
      triggerDownload(blob, `entermedschool-${deckSlug}-flashcards.pdf`);
    } finally {
      setLoading(null);
    }
  };

  const handleZip = async () => {
    setLoading("zip");
    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();

      zip.file("HOW-TO-ATTRIBUTE.txt", ATTRIBUTION_TEXT);

      if (type === "questions") {
        const pdfBlob = await generateQuestionsExamPdf(deckTitle, items);
        zip.file(`entermedschool-${deckSlug}-exam.pdf`, pdfBlob);
      } else {
        const pdfBlob = await generateFlashcardsPdf(deckTitle, items);
        zip.file(`entermedschool-${deckSlug}-flashcards.pdf`, pdfBlob);
        const BOM = "\uFEFF";
        const tsvHeader = `# Flashcard deck: ${deckTitle} — Generated by EnterMedSchool.org\n`;
        const tsvRows = items.map(
          (item) =>
            `${item.front ?? ""}\t${(item.back ?? "")} | Source: entermedschool.org`,
        );
        zip.file(
          `entermedschool-${deckSlug}-flashcards.tsv`,
          BOM + tsvHeader + tsvRows.join("\n"),
        );
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `entermedschool-${deckSlug}-package.zip`);
    } finally {
      setLoading(null);
    }
  };

  const DownloadButton = ({
    id,
    icon: Icon,
    label,
    onClick,
  }: {
    id: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    onClick: () => void;
  }) => {
    const isActive = loading === id;
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!!loading}
        className="flex items-center gap-2 rounded-xl border-2 border-ink-dark bg-white px-4 py-3 text-sm font-semibold text-ink-dark transition-all hover:bg-pastel-lavender disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isActive ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Icon size={18} />
        )}
        {label}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-ink-dark/10 bg-pastel-cream p-5">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-dark">
        <Download size={20} />
        Download
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {type === "questions" && (
          <>
            <DownloadButton
              id="pdf-exam"
              icon={FileText}
              label="PDF Exam"
              onClick={handlePdfExam}
            />
            <DownloadButton
              id="pdf-study"
              icon={FileText}
              label="PDF Study Guide"
              onClick={handlePdfStudyGuide}
            />
          </>
        )}
        {type === "flashcards" && (
          <>
            <DownloadButton
              id="tsv"
              icon={FileSpreadsheet}
              label="TSV (Anki)"
              onClick={handleTsv}
            />
            <DownloadButton
              id="csv"
              icon={FileSpreadsheet}
              label="CSV"
              onClick={handleCsv}
            />
            <DownloadButton
              id="pdf"
              icon={FileText}
              label="PDF"
              onClick={handlePdf}
            />
          </>
        )}
        <DownloadButton
          id="zip"
          icon={Archive}
          label="ZIP Package"
          onClick={handleZip}
        />
      </div>
    </div>
  );
}
