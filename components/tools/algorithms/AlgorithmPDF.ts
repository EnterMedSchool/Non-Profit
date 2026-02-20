import jsPDF from "jspdf";
import type { AlgorithmDefinition, PathEntry } from "@/lib/algorithmTypes";

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PURPLE = [108, 92, 231] as const;
const DARK = [26, 26, 46] as const;
const MUTED = [100, 116, 139] as const;
const GREEN = [22, 163, 74] as const;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function generateAlgorithmPDF(
  definition: AlgorithmDefinition,
  path: PathEntry[],
  outcomeNodeId: string,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...PURPLE);
  let y = MARGIN + 5;
  const titleNode = definition.nodes.find((n) => n.id === definition.startNodeId);
  const algoTitle = titleNode
    ? `${definition.guideline} — Algorithm`
    : definition.guideline;
  y = addWrappedText(doc, algoTitle, MARGIN, y, CONTENT_W, 8);
  y += 2;

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated from EnterMedSchool.org · ${definition.guideline} · v${definition.version}`,
    MARGIN,
    y,
  );
  y += 8;

  // Separator
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // Decision path header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Your Decision Path", MARGIN, y);
  y += 8;

  // Steps
  for (let i = 0; i < path.length; i++) {
    const entry = path[i];
    const node = definition.nodes.find((n) => n.id === entry.nodeId);
    const edge = entry.edgeId
      ? definition.edges.find((e) => e.id === entry.edgeId)
      : null;

    if (!node) continue;

    if (y > 255) {
      doc.addPage();
      y = MARGIN;
    }

    // Step number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PURPLE);
    doc.text(`Step ${i + 1}`, MARGIN, y);
    y += 5;

    // Node label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    y = addWrappedText(doc, node.label, MARGIN + 4, y, CONTENT_W - 4, 5);
    y += 1;

    // Edge choice
    if (edge) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...PURPLE);
      y = addWrappedText(
        doc,
        `→ ${edge.label}`,
        MARGIN + 4,
        y,
        CONTENT_W - 4,
        4.5,
      );
    }

    // Why
    if (node.educationalContent?.why) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      y = addWrappedText(
        doc,
        node.educationalContent.why,
        MARGIN + 4,
        y + 1,
        CONTENT_W - 8,
        4,
      );
    }

    y += 5;
  }

  // Outcome
  if (y > 240) {
    doc.addPage();
    y = MARGIN;
  }

  const outcomeNode = definition.nodes.find((n) => n.id === outcomeNodeId);
  if (outcomeNode) {
    const boxStartY = y;
    const boxStartPage = doc.getNumberOfPages();

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN);
    doc.text("RECOMMENDATION", MARGIN + 5, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    y = addWrappedText(doc, outcomeNode.label, MARGIN + 5, y, CONTENT_W - 10, 5.5);
    y += 4;

    const boxEndPage = doc.getNumberOfPages();
    if (boxEndPage === boxStartPage) {
      const boxHeight = y - boxStartY;
      doc.setPage(boxStartPage);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.8);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(MARGIN, boxStartY, CONTENT_W, boxHeight, 3, 3, "FD");

      // Re-render text on top of the filled box
      let ry = boxStartY + 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GREEN);
      doc.text("RECOMMENDATION", MARGIN + 5, ry);
      ry += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...DARK);
      addWrappedText(doc, outcomeNode.label, MARGIN + 5, ry, CONTENT_W - 10, 5.5);
    }

    if (outcomeNode.educationalContent?.keyPoints?.length) {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text("Key Takeaways", MARGIN, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      for (const point of outcomeNode.educationalContent.keyPoints) {
        if (y > 270) {
          doc.addPage();
          y = MARGIN;
        }
        y = addWrappedText(doc, `• ${point}`, MARGIN + 4, y, CONTENT_W - 8, 4.5);
        y += 1;
      }
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      "EnterMedSchool.org — Free, open-source medical education",
      MARGIN,
      290,
    );
    doc.text(`Page ${p} of ${pageCount}`, PAGE_W - MARGIN, 290, {
      align: "right",
    });
  }

  doc.save(
    `${definition.id}-algorithm-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
