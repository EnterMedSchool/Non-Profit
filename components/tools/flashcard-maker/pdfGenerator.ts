import type jsPDF from "jspdf";
import type { FlashcardCard, FlashcardTheme, ExportSettings } from "./types";
import { solidBackgrounds } from "@/data/flashcard-assets";

// ── Paper dimensions in mm ───────────────────────────────────────────
const PAPER: Record<ExportSettings["paperSize"], { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
};

// Margin in mm
const MARGIN = 10;
// Gap between cards in mm
const GAP = 4;
// Fold / cut line dash pattern
const DASH = [2, 2];
// Header/footer height in mm
const HEADER_HEIGHT = 8;
const FOOTER_HEIGHT = 6;

// ── jsPDF-compatible font mapping ───────────────────────────────────
const JSPDF_FONTS: Record<string, string> = {
  "DM Sans": "helvetica",
  "Inter": "helvetica",
  "Roboto": "helvetica",
  "system": "helvetica",
  "serif": "times",
  "monospace": "courier",
  "helvetica": "helvetica",
  "times": "times",
  "courier": "courier",
};

function resolveFont(fontFamily: string): string {
  return JSPDF_FONTS[fontFamily] || "helvetica";
}

// ── Grid layouts ─────────────────────────────────────────────────────
interface GridLayout {
  cols: number;
  rows: number;
}

function getGridLayout(
  cardsPerPage: number,
): GridLayout {
  switch (cardsPerPage) {
    case 2:
      return { cols: 1, rows: 2 };
    case 4:
      return { cols: 2, rows: 2 };
    case 6:
      return { cols: 2, rows: 3 };
    case 8:
      return { cols: 2, rows: 4 };
    default:
      return { cols: 2, rows: 2 };
  }
}

// ── Resolve background color ─────────────────────────────────────────
function resolveBgColor(backgroundId: string | null): string | null {
  if (!backgroundId) return null;
  const solid = solidBackgrounds.find((b) => b.id === backgroundId);
  return solid ? solid.color : null;
}

// ── Hex to RGB ───────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

// ── Word-wrap text ───────────────────────────────────────────────────
function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

// ── Auto font-size calculation ───────────────────────────────────────
function calculateOptimalFontSize(
  doc: jsPDF,
  text: string,
  maxW: number,
  maxH: number,
  baseFontSize: number,
): number {
  const minSize = 5;
  let fontSize = baseFontSize * 0.7; // scale from px to pt approximation
  const textPadding = 6;
  const usableW = maxW - textPadding * 2;
  const usableH = maxH - textPadding * 2;

  // Try the base size first, shrink if text overflows
  while (fontSize > minSize) {
    doc.setFontSize(fontSize);
    const lines = wrapText(doc, text, usableW);
    const lineHeight = fontSize * 0.4; // rough mm per line
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= usableH) {
      break;
    }
    fontSize -= 0.5;
  }

  return Math.max(fontSize, minSize);
}

// ── Draw a single card cell ──────────────────────────────────────────
function drawCardCell(
  doc: jsPDF,
  text: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: FlashcardTheme,
  baseFontSize: number,
  cardNumber?: string,
) {
  const font = resolveFont(theme.fontFamily);

  // Background
  const bgColor = resolveBgColor(theme.backgroundId);
  if (bgColor) {
    const [r, g, b] = hexToRgb(bgColor);
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, y, w, h, 3, 3, "F");
  }

  // Border
  if (theme.borderStyle !== "none" && theme.borderWidth > 0) {
    const [r, g, b] = hexToRgb(theme.borderColor);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(theme.borderWidth * 0.264583); // px to mm

    if (theme.borderStyle === "dashed") {
      doc.setLineDashPattern([3, 2], 0);
    } else if (theme.borderStyle === "dotted") {
      doc.setLineDashPattern([1, 1], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }
    doc.roundedRect(x, y, w, h, 3, 3, "S");
    doc.setLineDashPattern([], 0); // reset
  }

  // Label (tiny text in corner)
  doc.setFontSize(6);
  doc.setFont(font, "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(label, x + 2, y + 4);

  // Card number (top-right corner)
  if (cardNumber) {
    doc.setFontSize(6);
    doc.setFont(font, "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(cardNumber, x + w - 2, y + 4, { align: "right" });
  }

  // Main text with auto font-size scaling
  const [tr, tg, tb] = hexToRgb(theme.textColor);
  doc.setTextColor(tr, tg, tb);
  doc.setFont(font, "normal");

  const fontSize = calculateOptimalFontSize(doc, text, w, h, baseFontSize);
  doc.setFontSize(fontSize);

  const textPadding = 6;
  const maxW = w - textPadding * 2;
  const lines = wrapText(doc, text, maxW);
  const lineHeight = fontSize * 0.4; // rough mm per line
  const textBlockH = lines.length * lineHeight;
  const startY = y + (h - textBlockH) / 2 + lineHeight;

  doc.text(lines, x + w / 2, startY, { align: "center" });
}

// ── Draw page header ────────────────────────────────────────────────
function drawPageHeader(
  doc: jsPDF,
  title: string,
  pageW: number,
  font: string,
) {
  if (!title) return;
  doc.setFontSize(9);
  doc.setFont(font, "bold");
  doc.setTextColor(120, 120, 120);
  doc.text(title, pageW / 2, MARGIN + 3, { align: "center" });
}

// ── Draw page footer ────────────────────────────────────────────────
function drawPageFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  pageW: number,
  pageH: number,
  font: string,
) {
  doc.setFontSize(7);
  doc.setFont(font, "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    pageW / 2,
    pageH - MARGIN / 2,
    { align: "center" },
  );
}

// ── Draw dashed guide line ───────────────────────────────────────────
function drawGuideLine(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern(DASH, 0);
  doc.line(x1, y1, x2, y2);
  doc.setLineDashPattern([], 0);
}

// ── FOLD-IN-HALF layout ──────────────────────────────────────────────
function generateFoldLayout(
  doc: jsPDF,
  cards: FlashcardCard[],
  theme: FlashcardTheme,
  settings: ExportSettings,
) {
  const paper = PAPER[settings.paperSize];
  const grid = getGridLayout(settings.cardsPerPage);
  const hasHeader = !!settings.pageTitle;
  const topOffset = MARGIN + (hasHeader ? HEADER_HEIGHT : 0);
  const usableW = paper.w - MARGIN * 2;
  const usableH = paper.h - topOffset - MARGIN;
  const cellW = (usableW - GAP * (grid.cols - 1)) / grid.cols;
  const cellH = (usableH - GAP * (grid.rows - 1)) / grid.rows;
  const halfH = cellH / 2;
  const font = resolveFont(theme.fontFamily);

  const perPage = settings.cardsPerPage;

  for (let i = 0; i < cards.length; i++) {
    const posOnPage = i % perPage;

    if (posOnPage === 0 && i > 0) {
      doc.addPage();
    }

    // Draw header on new pages
    if (posOnPage === 0 && hasHeader) {
      drawPageHeader(doc, settings.pageTitle, paper.w, font);
    }

    const col = posOnPage % grid.cols;
    const row = Math.floor(posOnPage / grid.cols);

    const x = MARGIN + col * (cellW + GAP);
    const y = topOffset + row * (cellH + GAP);

    const card = cards[i];
    const cardTheme = card.themeOverride
      ? { ...theme, ...card.themeOverride }
      : theme;

    const cardNum = settings.showCardNumbers
      ? `${i + 1}/${cards.length}`
      : undefined;

    // Front (top half)
    drawCardCell(
      doc,
      card.front,
      "FRONT",
      x,
      y,
      cellW,
      halfH,
      cardTheme,
      cardTheme.frontFontSize,
      cardNum,
    );

    // Back (bottom half)
    drawCardCell(
      doc,
      card.back,
      "BACK",
      x,
      y + halfH,
      cellW,
      halfH,
      cardTheme,
      cardTheme.backFontSize,
    );

    // Fold line
    if (settings.showFoldLines) {
      drawGuideLine(doc, x, y + halfH, x + cellW, y + halfH);
    }

    // Cut lines (around the card perimeter)
    if (settings.showCutLines) {
      drawGuideLine(doc, x, y, x + cellW, y);
      drawGuideLine(doc, x, y + cellH, x + cellW, y + cellH);
      drawGuideLine(doc, x, y, x, y + cellH);
      drawGuideLine(doc, x + cellW, y, x + cellW, y + cellH);
    }
  }
}

// ── DUPLEX layout ────────────────────────────────────────────────────
function generateDuplexLayout(
  doc: jsPDF,
  cards: FlashcardCard[],
  theme: FlashcardTheme,
  settings: ExportSettings,
) {
  const paper = PAPER[settings.paperSize];
  const grid = getGridLayout(settings.cardsPerPage);
  const hasHeader = !!settings.pageTitle;
  const topOffset = MARGIN + (hasHeader ? HEADER_HEIGHT : 0);
  const usableW = paper.w - MARGIN * 2;
  const usableH = paper.h - topOffset - MARGIN;
  const cellW = (usableW - GAP * (grid.cols - 1)) / grid.cols;
  const cellH = (usableH - GAP * (grid.rows - 1)) / grid.rows;
  const font = resolveFont(theme.fontFamily);

  const perPage = settings.cardsPerPage;
  const totalPages = Math.ceil(cards.length / perPage);

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startIdx = pageNum * perPage;
    const pageCards = cards.slice(startIdx, startIdx + perPage);

    // ── Fronts page ──
    if (pageNum > 0) doc.addPage();

    if (hasHeader) {
      drawPageHeader(doc, settings.pageTitle, paper.w, font);
    }

    for (let j = 0; j < pageCards.length; j++) {
      const col = j % grid.cols;
      const row = Math.floor(j / grid.cols);
      const x = MARGIN + col * (cellW + GAP);
      const y = topOffset + row * (cellH + GAP);
      const card = pageCards[j];
      const cardTheme = card.themeOverride
        ? { ...theme, ...card.themeOverride }
        : theme;

      const cardNum = settings.showCardNumbers
        ? `${startIdx + j + 1}/${cards.length}`
        : undefined;

      drawCardCell(
        doc,
        card.front,
        "FRONT",
        x,
        y,
        cellW,
        cellH,
        cardTheme,
        cardTheme.frontFontSize,
        cardNum,
      );

      if (settings.showCutLines) {
        drawGuideLine(doc, x, y, x + cellW, y);
        drawGuideLine(doc, x, y + cellH, x + cellW, y + cellH);
        drawGuideLine(doc, x, y, x, y + cellH);
        drawGuideLine(doc, x + cellW, y, x + cellW, y + cellH);
      }
    }

    // ── Backs page (mirrored horizontally for duplex) ──
    doc.addPage();

    if (hasHeader) {
      drawPageHeader(doc, `${settings.pageTitle} (Back)`, paper.w, font);
    }

    for (let j = 0; j < pageCards.length; j++) {
      const col = j % grid.cols;
      const mirroredCol = grid.cols - 1 - col;
      const row = Math.floor(j / grid.cols);
      const x = MARGIN + mirroredCol * (cellW + GAP);
      const y = topOffset + row * (cellH + GAP);
      const card = pageCards[j];
      const cardTheme = card.themeOverride
        ? { ...theme, ...card.themeOverride }
        : theme;

      drawCardCell(
        doc,
        card.back,
        "BACK",
        x,
        y,
        cellW,
        cellH,
        cardTheme,
        cardTheme.backFontSize,
      );

      if (settings.showCutLines) {
        drawGuideLine(doc, x, y, x + cellW, y);
        drawGuideLine(doc, x, y + cellH, x + cellW, y + cellH);
        drawGuideLine(doc, x, y, x, y + cellH);
        drawGuideLine(doc, x + cellW, y, x + cellW, y + cellH);
      }
    }
  }
}

// ── Public API ───────────────────────────────────────────────────────
export async function generateFlashcardPdf(
  cards: FlashcardCard[],
  theme: FlashcardTheme,
  settings: ExportSettings,
): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const paper = PAPER[settings.paperSize];
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paper.w, paper.h],
  });

  // Use theme font family (resolved to jsPDF-compatible name)
  const font = resolveFont(theme.fontFamily);
  doc.setFont(font);

  // Set PDF metadata
  doc.setProperties({
    title: settings.pageTitle || "Flashcards",
    author: "Flashcard Maker",
    creator: "Flashcard Maker — EMS Tools",
    subject: "Printable Flashcards",
  });

  if (settings.layoutMode === "fold") {
    generateFoldLayout(doc, cards, theme, settings);
  } else {
    generateDuplexLayout(doc, cards, theme, settings);
  }

  // Draw page footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(doc, p, totalPages, paper.w, paper.h, font);
  }

  return doc;
}
