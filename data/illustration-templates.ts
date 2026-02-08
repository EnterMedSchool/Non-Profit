/* ─────────────────────────────────────────────────────────────────
 *  Illustration Maker — Template Library
 *
 *  Each template is a pre-built canvas layout that users can start from.
 *  Templates are stored as minimal canvas JSON configurations.
 * ────────────────────────────────────────────────────────────────── */

export interface IllustrationTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  /** Simplified canvas JSON with objects */
  objects: any[];
  backgroundColor: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
}

export const templateCategories: TemplateCategory[] = [
  { id: "cell-biology", name: "Cell Biology" },
  { id: "molecular", name: "Molecular Biology" },
  { id: "anatomy", name: "Anatomy" },
  { id: "lab", name: "Lab Protocols" },
  { id: "flowchart", name: "Flowcharts" },
  { id: "graphical-abstract", name: "Graphical Abstracts" },
];

export const illustrationTemplates: IllustrationTemplate[] = [
  {
    id: "cell-signaling-pathway",
    name: "Cell Signaling Pathway",
    category: "cell-biology",
    description: "A basic cell signaling cascade with receptor, kinase chain, and nuclear response",
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 760, top: 30, width: 400, text: "Cell Signaling Pathway", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 860, top: 120, width: 200, height: 60, fill: "rgba(108, 92, 231, 0.15)", stroke: "#6C5CE7", strokeWidth: 2, rx: 8, ry: 8 },
      { type: "textbox", left: 870, top: 133, width: 180, text: "Ligand", fontSize: 16, fontFamily: "system-ui", fill: "#6C5CE7", textAlign: "center" },
      { type: "rect", left: 820, top: 240, width: 280, height: 70, fill: "rgba(0, 217, 192, 0.15)", stroke: "#00D9C0", strokeWidth: 2, rx: 8, ry: 8 },
      { type: "textbox", left: 830, top: 258, width: 260, text: "Membrane Receptor", fontSize: 16, fontFamily: "system-ui", fill: "#00796B", textAlign: "center" },
      { type: "rect", left: 840, top: 380, width: 240, height: 60, fill: "rgba(255, 107, 107, 0.15)", stroke: "#FF6B6B", strokeWidth: 2, rx: 8, ry: 8 },
      { type: "textbox", left: 850, top: 393, width: 220, text: "Kinase Cascade", fontSize: 16, fontFamily: "system-ui", fill: "#C62828", textAlign: "center" },
      { type: "rect", left: 840, top: 520, width: 240, height: 60, fill: "rgba(255, 217, 61, 0.15)", stroke: "#FFD93D", strokeWidth: 2, rx: 8, ry: 8 },
      { type: "textbox", left: 850, top: 533, width: 220, text: "Transcription Factor", fontSize: 16, fontFamily: "system-ui", fill: "#F57F17", textAlign: "center" },
      { type: "rect", left: 810, top: 660, width: 300, height: 70, fill: "rgba(108, 92, 231, 0.1)", stroke: "#6C5CE7", strokeWidth: 2, rx: 30, ry: 30 },
      { type: "textbox", left: 830, top: 678, width: 260, text: "Gene Expression", fontSize: 18, fontWeight: "bold", fontFamily: "system-ui", fill: "#6C5CE7", textAlign: "center" },
    ],
  },
  {
    id: "cell-diagram",
    name: "Basic Cell Diagram",
    category: "cell-biology",
    description: "A template for labeling cell organelles and structures",
    canvasWidth: 1200,
    canvasHeight: 1200,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 350, top: 30, width: 500, text: "Cell Diagram", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "circle", left: 250, top: 150, radius: 350, fill: "rgba(0, 217, 192, 0.08)", stroke: "#00D9C0", strokeWidth: 3 },
      { type: "circle", left: 450, top: 400, radius: 100, fill: "rgba(108, 92, 231, 0.15)", stroke: "#6C5CE7", strokeWidth: 2 },
      { type: "textbox", left: 480, top: 490, width: 140, text: "Nucleus", fontSize: 14, fontFamily: "system-ui", fill: "#6C5CE7", textAlign: "center" },
      { type: "textbox", left: 50, top: 1100, width: 1100, text: "Label the organelles using the assets panel", fontSize: 14, fontFamily: "system-ui", fill: "#b2bec3", textAlign: "center", fontStyle: "italic" },
    ],
  },
  {
    id: "lab-protocol",
    name: "Lab Protocol Flow",
    category: "lab",
    description: "Step-by-step lab protocol with numbered steps",
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 660, top: 30, width: 600, text: "Lab Protocol", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 100, top: 150, width: 300, height: 180, fill: "rgba(108, 92, 231, 0.08)", stroke: "#6C5CE7", strokeWidth: 2, rx: 12, ry: 12 },
      { type: "textbox", left: 120, top: 165, width: 260, text: "Step 1", fontSize: 20, fontWeight: "bold", fontFamily: "system-ui", fill: "#6C5CE7" },
      { type: "textbox", left: 120, top: 200, width: 260, text: "Add reagents and prepare samples", fontSize: 14, fontFamily: "system-ui", fill: "#636e72" },
      { type: "rect", left: 500, top: 150, width: 300, height: 180, fill: "rgba(0, 217, 192, 0.08)", stroke: "#00D9C0", strokeWidth: 2, rx: 12, ry: 12 },
      { type: "textbox", left: 520, top: 165, width: 260, text: "Step 2", fontSize: 20, fontWeight: "bold", fontFamily: "system-ui", fill: "#00796B" },
      { type: "textbox", left: 520, top: 200, width: 260, text: "Incubate at 37\u00B0C for 30 min", fontSize: 14, fontFamily: "system-ui", fill: "#636e72" },
      { type: "rect", left: 900, top: 150, width: 300, height: 180, fill: "rgba(255, 107, 107, 0.08)", stroke: "#FF6B6B", strokeWidth: 2, rx: 12, ry: 12 },
      { type: "textbox", left: 920, top: 165, width: 260, text: "Step 3", fontSize: 20, fontWeight: "bold", fontFamily: "system-ui", fill: "#C62828" },
      { type: "textbox", left: 920, top: 200, width: 260, text: "Centrifuge at 12,000 rpm", fontSize: 14, fontFamily: "system-ui", fill: "#636e72" },
      { type: "rect", left: 1300, top: 150, width: 300, height: 180, fill: "rgba(255, 217, 61, 0.08)", stroke: "#FFD93D", strokeWidth: 2, rx: 12, ry: 12 },
      { type: "textbox", left: 1320, top: 165, width: 260, text: "Step 4", fontSize: 20, fontWeight: "bold", fontFamily: "system-ui", fill: "#F57F17" },
      { type: "textbox", left: 1320, top: 200, width: 260, text: "Analyze results", fontSize: 14, fontFamily: "system-ui", fill: "#636e72" },
    ],
  },
  {
    id: "comparison-diagram",
    name: "Comparison Diagram",
    category: "cell-biology",
    description: "Side-by-side comparison layout for two concepts",
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 560, top: 30, width: 800, text: "Comparison Title", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 60, top: 120, width: 880, height: 880, fill: "rgba(108, 92, 231, 0.05)", stroke: "#6C5CE7", strokeWidth: 2, rx: 16, ry: 16 },
      { type: "textbox", left: 200, top: 140, width: 600, text: "Concept A", fontSize: 28, fontWeight: "bold", fontFamily: "system-ui", fill: "#6C5CE7", textAlign: "center" },
      { type: "rect", left: 980, top: 120, width: 880, height: 880, fill: "rgba(0, 217, 192, 0.05)", stroke: "#00D9C0", strokeWidth: 2, rx: 16, ry: 16 },
      { type: "textbox", left: 1120, top: 140, width: 600, text: "Concept B", fontSize: 28, fontWeight: "bold", fontFamily: "system-ui", fill: "#00796B", textAlign: "center" },
      { type: "textbox", left: 660, top: 1020, width: 600, text: "Add illustrations and labels from the asset panel", fontSize: 14, fontFamily: "system-ui", fill: "#b2bec3", textAlign: "center", fontStyle: "italic" },
    ],
  },
  {
    id: "graphical-abstract-1",
    name: "Graphical Abstract",
    category: "graphical-abstract",
    description: "Publication-ready graphical abstract layout",
    canvasWidth: 1200,
    canvasHeight: 600,
    backgroundColor: "#ffffff",
    objects: [
      { type: "rect", left: 0, top: 0, width: 1200, height: 60, fill: "#6C5CE7" },
      { type: "textbox", left: 20, top: 12, width: 1160, text: "Graphical Abstract", fontSize: 28, fontWeight: "bold", fontFamily: "system-ui", fill: "#ffffff", textAlign: "center" },
      { type: "rect", left: 30, top: 90, width: 350, height: 460, fill: "rgba(108, 92, 231, 0.05)", stroke: "#dfe6e9", strokeWidth: 1, rx: 8, ry: 8 },
      { type: "textbox", left: 80, top: 110, width: 250, text: "Introduction", fontSize: 18, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 420, top: 90, width: 350, height: 460, fill: "rgba(0, 217, 192, 0.05)", stroke: "#dfe6e9", strokeWidth: 1, rx: 8, ry: 8 },
      { type: "textbox", left: 470, top: 110, width: 250, text: "Methods", fontSize: 18, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 810, top: 90, width: 350, height: 460, fill: "rgba(255, 217, 61, 0.05)", stroke: "#dfe6e9", strokeWidth: 1, rx: 8, ry: 8 },
      { type: "textbox", left: 860, top: 110, width: 250, text: "Results", fontSize: 18, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
    ],
  },
  {
    id: "flowchart-basic",
    name: "Basic Flowchart",
    category: "flowchart",
    description: "A simple decision flowchart with yes/no branches",
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 660, top: 30, width: 600, text: "Decision Flowchart", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 810, top: 120, width: 300, height: 70, fill: "#6C5CE7", stroke: "#6C5CE7", strokeWidth: 2, rx: 30, ry: 30 },
      { type: "textbox", left: 830, top: 138, width: 260, text: "START", fontSize: 20, fontWeight: "bold", fontFamily: "system-ui", fill: "#ffffff", textAlign: "center" },
      { type: "rect", left: 810, top: 260, width: 300, height: 80, fill: "rgba(0, 217, 192, 0.1)", stroke: "#00D9C0", strokeWidth: 2, rx: 8, ry: 8 },
      { type: "textbox", left: 830, top: 283, width: 260, text: "Process Step", fontSize: 16, fontFamily: "system-ui", fill: "#00796B", textAlign: "center" },
      { type: "rect", left: 830, top: 420, width: 260, height: 80, fill: "rgba(255, 217, 61, 0.15)", stroke: "#FFD93D", strokeWidth: 2 },
      { type: "textbox", left: 850, top: 443, width: 220, text: "Decision?", fontSize: 16, fontFamily: "system-ui", fill: "#F57F17", textAlign: "center" },
      { type: "textbox", left: 600, top: 440, width: 100, text: "Yes", fontSize: 14, fontWeight: "bold", fontFamily: "system-ui", fill: "#00B894" },
      { type: "textbox", left: 1200, top: 440, width: 100, text: "No", fontSize: 14, fontWeight: "bold", fontFamily: "system-ui", fill: "#FF6B6B" },
    ],
  },
  {
    id: "anatomy-labels",
    name: "Anatomy Label Template",
    category: "anatomy",
    description: "Template for labeling anatomical structures with leader lines",
    canvasWidth: 1200,
    canvasHeight: 1200,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 300, top: 30, width: 600, text: "Anatomical Structure", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "textbox", left: 300, top: 80, width: 600, text: "Add organ/structure from Assets panel, then use Label tool (K) to annotate", fontSize: 14, fontFamily: "system-ui", fill: "#b2bec3", textAlign: "center", fontStyle: "italic" },
      { type: "circle", left: 350, top: 200, radius: 250, fill: "rgba(0, 217, 192, 0.05)", stroke: "#dfe6e9", strokeWidth: 2, strokeDashArray: [8, 4] },
      { type: "textbox", left: 380, top: 680, width: 440, text: "Place your illustration here", fontSize: 16, fontFamily: "system-ui", fill: "#dfe6e9", textAlign: "center" },
      { type: "textbox", left: 100, top: 1100, width: 1000, text: "Use the Marker tool (M) for numbered annotations", fontSize: 13, fontFamily: "system-ui", fill: "#b2bec3", textAlign: "center", fontStyle: "italic" },
    ],
  },
  {
    id: "molecular-pathway",
    name: "Molecular Pathway",
    category: "molecular",
    description: "Linear molecular pathway with reaction steps",
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#ffffff",
    objects: [
      { type: "textbox", left: 560, top: 30, width: 800, text: "Molecular Pathway", fontSize: 36, fontWeight: "bold", fontFamily: "system-ui", fill: "#1a1a2e", textAlign: "center" },
      { type: "rect", left: 100, top: 400, width: 200, height: 80, fill: "rgba(108, 92, 231, 0.12)", stroke: "#6C5CE7", strokeWidth: 2, rx: 40, ry: 40 },
      { type: "textbox", left: 120, top: 425, width: 160, text: "Substrate", fontSize: 16, fontFamily: "system-ui", fill: "#6C5CE7", textAlign: "center" },
      { type: "textbox", left: 370, top: 380, width: 120, text: "Enzyme 1", fontSize: 12, fontFamily: "system-ui", fill: "#FF6B6B", textAlign: "center" },
      { type: "rect", left: 510, top: 400, width: 200, height: 80, fill: "rgba(0, 217, 192, 0.12)", stroke: "#00D9C0", strokeWidth: 2, rx: 40, ry: 40 },
      { type: "textbox", left: 530, top: 425, width: 160, text: "Intermediate", fontSize: 16, fontFamily: "system-ui", fill: "#00796B", textAlign: "center" },
      { type: "textbox", left: 780, top: 380, width: 120, text: "Enzyme 2", fontSize: 12, fontFamily: "system-ui", fill: "#FF6B6B", textAlign: "center" },
      { type: "rect", left: 920, top: 400, width: 200, height: 80, fill: "rgba(255, 217, 61, 0.12)", stroke: "#FFD93D", strokeWidth: 2, rx: 40, ry: 40 },
      { type: "textbox", left: 940, top: 425, width: 160, text: "Product", fontSize: 16, fontFamily: "system-ui", fill: "#F57F17", textAlign: "center" },
    ],
  },
];

export function getTemplatesByCategory(categoryId: string): IllustrationTemplate[] {
  return illustrationTemplates.filter((t) => t.category === categoryId);
}

export function getTemplateById(id: string): IllustrationTemplate | undefined {
  return illustrationTemplates.find((t) => t.id === id);
}
