import type jsPDF from "jspdf";
import type { MCQQuestion, MCQPdfTheme, MCQExam } from "./types";
import { DEFAULT_PDF_THEME } from "./types";
import { OPTION_LETTERS } from "./constants";

// ── Paper dimensions in mm ───────────────────────────────────────────
const PAPER: Record<string, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
};

// ── Color helpers ────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

// ── Accurate height estimation ───────────────────────────────────────
function estimateQuestionHeight(
  doc: jsPDF,
  q: MCQQuestion,
  maxW: number,
  theme: MCQPdfTheme,
  showExplanation: boolean,
): number {
  const fs = theme.fontSize;
  let height = 0;

  // Question text height
  const prefix = theme.showQuestionNumbers ? "99. " : "";
  const pointsSuffix =
    theme.showPointValues && q.points !== undefined && q.points !== 1
      ? ` (${q.points} pts)`
      : "";
  doc.setFontSize(fs);
  doc.setFont(theme.fontFamily, "bold");
  const qLines = wrapText(doc, `${prefix}${q.question}${pointsSuffix}`, maxW);
  height += qLines.length * (fs * 0.4) + 2;

  // Image height (if present)
  if (q.imageUrl) {
    height += 42; // 40mm image + 2mm gap
  }

  // Options height
  doc.setFontSize(fs - 1);
  doc.setFont(theme.fontFamily, "normal");
  for (const opt of q.options) {
    const optLines = wrapText(doc, opt.text, maxW - 14);
    height += optLines.length * ((fs - 1) * 0.4) + 2.5;
  }

  // Explanation height
  if (showExplanation && q.explanation) {
    height += 1;
    doc.setFontSize(fs - 2);
    doc.setFont(theme.fontFamily, "italic");
    const explLines = wrapText(
      doc,
      `Explanation: ${q.explanation}`,
      maxW - 4,
    );
    height += explLines.length * ((fs - 2) * 0.4) + 2;
  }

  return height + 3; // bottom padding
}

// ── Draw page header ─────────────────────────────────────────────────
function drawHeader(
  doc: jsPDF,
  theme: MCQPdfTheme,
  title: string,
  subtitle: string,
  pageW: number,
): number {
  const m = theme.pageMargins;
  const usableW = pageW - m.left - m.right;
  let y = m.top;

  // Header background
  const [hbr, hbg, hbb] = hexToRgb(theme.headerBgColor);
  doc.setFillColor(hbr, hbg, hbb);
  doc.rect(0, 0, pageW, y + 22, "F");

  const [pr, pg, pb] = hexToRgb(theme.primaryColor);
  let titleX = m.left;

  // Logo rendering
  if (theme.showLogo && theme.logoDataUrl) {
    try {
      const logoH = 14;
      const logoW = 14;
      let logoX = m.left;
      if (theme.logoPosition === "center") {
        logoX = (pageW - logoW) / 2;
      } else if (theme.logoPosition === "right") {
        logoX = pageW - m.right - logoW;
      }
      doc.addImage(theme.logoDataUrl, logoX, y - 2, logoW, logoH);
      if (theme.logoPosition === "left") {
        titleX = m.left + logoW + 4;
      }
    } catch {
      // Skip logo on error (e.g. corrupted data URL)
    }
  }

  // Title
  doc.setTextColor(pr, pg, pb);
  doc.setFontSize(16);
  doc.setFont(theme.fontFamily, "bold");
  doc.text(title || "Exam", titleX, y + 8);

  // Subtitle / custom header
  if (subtitle || theme.headerTemplate) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont(theme.fontFamily, "normal");
    doc.text(subtitle || theme.headerTemplate, titleX, y + 14);
  }

  // Name / Date line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  y += 20;
  doc.text("Name: _________________________", m.left, y);
  doc.text("Date: _______________", m.left + usableW - 60, y);

  // Divider line — uses secondaryColor
  y += 6;
  const [sr, sg, sb] = hexToRgb(theme.secondaryColor || theme.primaryColor);
  doc.setDrawColor(sr, sg, sb);
  doc.setLineWidth(0.5);
  doc.line(m.left, y, m.left + usableW, y);

  return y + 4;
}

// ── Draw page footer ─────────────────────────────────────────────────
function drawFooter(
  doc: jsPDF,
  theme: MCQPdfTheme,
  pageNum: number,
  totalPages: number,
  pageW: number,
  pageH: number,
) {
  const m = theme.pageMargins;
  const footer = theme.footerTemplate
    .replace("{page}", String(pageNum))
    .replace("{pages}", String(totalPages));

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.setFont(theme.fontFamily, "normal");
  doc.text(footer, pageW / 2, pageH - m.bottom / 2, { align: "center" });
}

// ── Draw watermark ──────────────────────────────────────────────────
function drawWatermark(
  doc: jsPDF,
  text: string,
  pageW: number,
  pageH: number,
) {
  if (!text) return;
  doc.saveGraphicsState();
  doc.setFontSize(60);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "bold");
  // Rotate and center
  const centerX = pageW / 2;
  const centerY = pageH / 2;
  // jsPDF text rotation: angle is in degrees, measured counterclockwise
  doc.text(text, centerX, centerY, {
    align: "center",
    angle: 45,
  });
  doc.restoreGraphicsState();
}

// ── Draw answer bubble ───────────────────────────────────────────────
function drawAnswerIndicator(
  doc: jsPDF,
  style: MCQPdfTheme["answerStyle"],
  x: number,
  y: number,
  letter: string,
  filled: boolean,
  theme: MCQPdfTheme,
) {
  const [pr, pg, pb] = hexToRgb(theme.primaryColor);
  const [tr, tg, tb] = hexToRgb(theme.textColor);

  switch (style) {
    case "bubbles":
      if (filled) {
        doc.setFillColor(pr, pg, pb);
        doc.circle(x + 3, y - 1.2, 3, "F");
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.circle(x + 3, y - 1.2, 3, "S");
        doc.setTextColor(tr, tg, tb);
      }
      doc.setFontSize(8);
      doc.setFont(theme.fontFamily, "bold");
      doc.text(letter, x + 3, y, { align: "center" });
      break;

    case "letters":
      if (filled) {
        doc.setFillColor(pr, pg, pb);
        doc.roundedRect(x, y - 3.5, 7, 5, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y - 3.5, 7, 5, 1, 1, "S");
        doc.setTextColor(tr, tg, tb);
      }
      doc.setFontSize(8);
      doc.setFont(theme.fontFamily, "bold");
      doc.text(letter, x + 3.5, y, { align: "center" });
      break;

    case "checkboxes":
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(x, y - 3.5, 5, 5);
      if (filled) {
        doc.setFillColor(pr, pg, pb);
        doc.rect(x + 0.5, y - 3, 4, 4, "F");
      }
      doc.setTextColor(tr, tg, tb);
      doc.setFontSize(8);
      doc.setFont(theme.fontFamily, "bold");
      doc.text(letter, x + 8, y);
      break;

    case "lines":
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(x, y + 1, x + 5, y + 1);
      doc.setTextColor(tr, tg, tb);
      doc.setFontSize(8);
      doc.setFont(theme.fontFamily, filled ? "bold" : "normal");
      doc.text(`${letter}.`, x + 7, y);
      break;
  }
}

// ── Render a single question ─────────────────────────────────────────
function renderQuestion(
  doc: jsPDF,
  q: MCQQuestion,
  qNum: number,
  x: number,
  y: number,
  maxW: number,
  theme: MCQPdfTheme,
  showAnswer: boolean,
  showExplanation: boolean,
): number {
  const [tr, tg, tb] = hexToRgb(theme.textColor);
  const fs = theme.fontSize;

  // Question number + text
  doc.setTextColor(tr, tg, tb);
  doc.setFontSize(fs);
  doc.setFont(theme.fontFamily, "bold");

  const prefix = theme.showQuestionNumbers ? `${qNum}. ` : "";
  const pointsSuffix =
    theme.showPointValues && q.points !== undefined && q.points !== 1
      ? ` (${q.points} pts)`
      : "";
  const qText = `${prefix}${q.question}${pointsSuffix}`;
  const qLines = wrapText(doc, qText, maxW);
  doc.text(qLines, x, y);
  y += qLines.length * (fs * 0.4) + 2;

  // Question image (if present)
  if (q.imageUrl) {
    try {
      const imgW = Math.min(maxW * 0.6, 100); // max 100mm or 60% of width
      const imgH = 40; // fixed height
      doc.addImage(q.imageUrl, "PNG", x + 2, y, imgW, imgH);
      y += imgH + 2;
    } catch {
      // Skip image if it fails to render
    }
  }

  // Options
  doc.setFont(theme.fontFamily, "normal");
  doc.setFontSize(fs - 1);

  for (let i = 0; i < q.options.length; i++) {
    const opt = q.options[i];
    const isCorrect = opt.id === q.correctOptionId;
    const letter = OPTION_LETTERS[i];

    drawAnswerIndicator(
      doc,
      theme.answerStyle,
      x + 2,
      y,
      letter,
      showAnswer && isCorrect,
      theme,
    );

    const optX =
      theme.answerStyle === "checkboxes" ? x + 16 : x + 12;
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(fs - 1);
    doc.setFont(
      theme.fontFamily,
      showAnswer && isCorrect ? "bold" : "normal",
    );

    const optLines = wrapText(doc, opt.text, maxW - 14);
    doc.text(optLines, optX, y);
    y += optLines.length * ((fs - 1) * 0.4) + 2.5;
  }

  // Explanation (only in answer key / study guide)
  if (showExplanation && q.explanation) {
    y += 1;
    const [pr, pg, pb] = hexToRgb(theme.primaryColor);
    doc.setFontSize(fs - 2);
    doc.setFont(theme.fontFamily, "italic");
    doc.setTextColor(pr, pg, pb);
    const explLines = wrapText(
      doc,
      `Explanation: ${q.explanation}`,
      maxW - 4,
    );
    doc.text(explLines, x + 2, y);
    y += explLines.length * ((fs - 2) * 0.4) + 2;
  }

  return y + 3;
}

// ── Set PDF document metadata ────────────────────────────────────────
function setDocumentMetadata(
  doc: jsPDF,
  title: string,
  subject?: string,
) {
  doc.setProperties({
    title,
    subject: subject || "Generated exam document",
    author: "MCQ Maker",
    creator: "MCQ Maker — EMS Tools",
    keywords: "exam, MCQ, multiple choice",
  });
}

// ══════════════════════════════════════════════════════════════════════
// FORMAT 1: EXAM PAPER
// ══════════════════════════════════════════════════════════════════════
export async function generateExamPdf(
  questions: MCQQuestion[],
  theme: MCQPdfTheme = DEFAULT_PDF_THEME,
  title = "Exam",
  subtitle = "",
  variantLabel = "",
  watermarkText = "",
): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const paper = PAPER[theme.paperSize] ?? PAPER.a4;
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paper.w, paper.h],
  });

  doc.setFont(theme.fontFamily);
  setDocumentMetadata(doc, variantLabel ? `${title} — ${variantLabel}` : title);

  const m = theme.pageMargins;
  const usableW = paper.w - m.left - m.right;
  const bottomLimit = paper.h - m.bottom - 10;

  let currentPage = 1;
  let y = drawHeader(
    doc,
    theme,
    variantLabel ? `${title} — ${variantLabel}` : title,
    subtitle,
    paper.w,
  );

  // Draw watermark on first page
  if (watermarkText) {
    drawWatermark(doc, watermarkText, paper.w, paper.h);
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Accurate height estimation using actual text measurement
    const estHeight = estimateQuestionHeight(doc, q, usableW, theme, false);

    // Page break if needed
    if (y + estHeight > bottomLimit) {
      doc.addPage();
      currentPage++;
      y = m.top + 4;
      if (watermarkText) {
        drawWatermark(doc, watermarkText, paper.w, paper.h);
      }
    }

    y = renderQuestion(
      doc,
      q,
      i + 1,
      m.left,
      y,
      usableW,
      theme,
      false,
      false,
    );
  }

  // Draw footers on all pages (single pass — no double-footer)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, theme, p, totalPages, paper.w, paper.h);
  }

  return doc;
}

// ══════════════════════════════════════════════════════════════════════
// FORMAT 2: ANSWER KEY
// ══════════════════════════════════════════════════════════════════════
export async function generateAnswerKeyPdf(
  questions: MCQQuestion[],
  theme: MCQPdfTheme = DEFAULT_PDF_THEME,
  title = "Answer Key",
  variantLabel = "",
): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const paper = PAPER[theme.paperSize] ?? PAPER.a4;
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paper.w, paper.h],
  });

  doc.setFont(theme.fontFamily);
  setDocumentMetadata(doc, variantLabel ? `${title} — ${variantLabel}` : title, "Answer Key");

  const m = theme.pageMargins;
  const usableW = paper.w - m.left - m.right;
  const bottomLimit = paper.h - m.bottom - 10;

  let currentPage = 1;
  let y = drawHeader(
    doc,
    theme,
    variantLabel ? `${title} — ${variantLabel}` : title,
    "Correct answers highlighted",
    paper.w,
  );

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Accurate height estimation
    const estHeight = estimateQuestionHeight(doc, q, usableW, theme, true);

    if (y + estHeight > bottomLimit) {
      doc.addPage();
      currentPage++;
      y = m.top + 4;
    }

    y = renderQuestion(
      doc,
      q,
      i + 1,
      m.left,
      y,
      usableW,
      theme,
      true,
      true,
    );
  }

  // Summary
  y += 4;
  if (y + 20 > bottomLimit) {
    doc.addPage();
    currentPage++;
    y = m.top + 4;
  }

  const [pr, pg, pb] = hexToRgb(theme.primaryColor);
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(0.5);
  doc.line(m.left, y, m.left + usableW, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont(theme.fontFamily, "bold");
  doc.setTextColor(pr, pg, pb);
  doc.text("Summary", m.left, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont(theme.fontFamily, "normal");
  doc.setTextColor(80, 80, 80);

  const totalPoints = questions.reduce(
    (sum, q) => sum + (q.points ?? 1),
    0,
  );
  doc.text(`Total Questions: ${questions.length}`, m.left, y);
  y += 4;
  doc.text(`Total Points: ${totalPoints}`, m.left, y);
  y += 4;

  // Quick answer list
  const answers = questions
    .map((q, i) => {
      const idx = q.options.findIndex((o) => o.id === q.correctOptionId);
      return `${i + 1}:${OPTION_LETTERS[idx] ?? "?"}`;
    })
    .join("  ");
  const ansLines = wrapText(doc, `Answers: ${answers}`, usableW);
  doc.text(ansLines, m.left, y);

  // Draw footers on all pages (single pass)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, theme, p, totalPages, paper.w, paper.h);
  }

  return doc;
}

// ══════════════════════════════════════════════════════════════════════
// FORMAT 3: STUDY GUIDE
// ══════════════════════════════════════════════════════════════════════
export async function generateStudyGuidePdf(
  questions: MCQQuestion[],
  theme: MCQPdfTheme = DEFAULT_PDF_THEME,
  title = "Study Guide",
): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const paper = PAPER[theme.paperSize] ?? PAPER.a4;
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paper.w, paper.h],
  });

  doc.setFont(theme.fontFamily);
  setDocumentMetadata(doc, title, "Study Guide");

  const m = theme.pageMargins;
  const usableW = paper.w - m.left - m.right;
  const bottomLimit = paper.h - m.bottom - 10;

  let currentPage = 1;
  let y = drawHeader(doc, theme, title, "Questions grouped by category", paper.w);

  // Group by category
  const grouped = new Map<string, MCQQuestion[]>();
  for (const q of questions) {
    const cat = q.category ?? "Uncategorized";
    const group = grouped.get(cat) ?? [];
    group.push(q);
    grouped.set(cat, group);
  }

  let globalIdx = 0;

  for (const [category, catQuestions] of grouped) {
    // Category header
    if (y + 12 > bottomLimit) {
      doc.addPage();
      currentPage++;
      y = m.top + 4;
    }

    const [pr, pg, pb] = hexToRgb(theme.primaryColor);
    doc.setFillColor(pr, pg, pb);
    doc.roundedRect(m.left, y - 1, usableW, 7, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(theme.fontFamily, "bold");
    doc.text(
      `${category} (${catQuestions.length} question${catQuestions.length !== 1 ? "s" : ""})`,
      m.left + 3,
      y + 4,
    );
    y += 12;

    for (const q of catQuestions) {
      globalIdx++;

      // Accurate height estimation
      const estHeight = estimateQuestionHeight(doc, q, usableW, theme, true);

      if (y + estHeight > bottomLimit) {
        doc.addPage();
        currentPage++;
        y = m.top + 4;
      }

      y = renderQuestion(
        doc,
        q,
        globalIdx,
        m.left,
        y,
        usableW,
        theme,
        true,
        true,
      );
    }

    y += 4;
  }

  // Draw footers on all pages (single pass)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, theme, p, totalPages, paper.w, paper.h);
  }

  return doc;
}

// ══════════════════════════════════════════════════════════════════════
// VARIANT GENERATOR (for exams)
// ══════════════════════════════════════════════════════════════════════
function shuffleArray<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let m = copy.length;
  let s = seed;
  while (m) {
    // Simple seeded RNG (xorshift)
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    const i = ((s >>> 0) % m--);
    [copy[m], copy[i]] = [copy[i], copy[m]];
  }
  return copy;
}

export function generateVariant(
  questions: MCQQuestion[],
  variantIndex: number,
  shuffleQuestions: boolean,
  shuffleOptions: boolean,
): MCQQuestion[] {
  const seed = variantIndex * 31337 + 42;
  let variant = shuffleQuestions
    ? shuffleArray(questions, seed)
    : [...questions];

  if (shuffleOptions) {
    variant = variant.map((q, i) => {
      const optSeed = seed + i * 7;
      const shuffledOpts = shuffleArray(q.options, optSeed);
      return { ...q, options: shuffledOpts };
    });
  }

  return variant;
}

// ── Generate ZIP of variants ─────────────────────────────────────────
export async function generateVariantsZip(
  questions: MCQQuestion[],
  theme: MCQPdfTheme,
  title: string,
  numVariants: number,
  shuffleQuestions: boolean,
  shuffleOptions: boolean,
  watermarkText = "",
  onProgress?: (current: number, total: number) => void,
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const variantLetters = "ABCDEFGHIJ";

  for (let v = 0; v < numVariants; v++) {
    const label = `Version ${variantLetters[v] ?? v + 1}`;
    const variant = generateVariant(
      questions,
      v,
      shuffleQuestions,
      shuffleOptions,
    );

    // Report progress
    onProgress?.(v + 1, numVariants);

    // Exam PDF
    const examDoc = await generateExamPdf(variant, theme, title, "", label, watermarkText);
    const examBlob = examDoc.output("arraybuffer");
    zip.file(`${label} - Exam.pdf`, examBlob);

    // Answer key PDF
    const keyDoc = await generateAnswerKeyPdf(variant, theme, `${title} - Answer Key`, label);
    const keyBlob = keyDoc.output("arraybuffer");
    zip.file(`${label} - Answer Key.pdf`, keyBlob);

    // Yield to let UI update between variants
    await new Promise((r) => setTimeout(r, 10));
  }

  return zip.generateAsync({ type: "blob" });
}
