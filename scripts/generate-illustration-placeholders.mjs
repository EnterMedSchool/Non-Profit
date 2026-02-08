/**
 * Generate placeholder SVG assets for the Illustration Maker tool.
 *
 * Run: node scripts/generate-illustration-placeholders.mjs
 *
 * These will be replaced with real scientific illustration PNGs over time.
 * Each placeholder is a simple, colorful SVG with a recognizable shape and label.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "assets", "illustrations");

/* ── Color palette (matches the site's showcase colors) ─────────── */
const palette = {
  cells:     { fill: "#00D9C0", bg: "#E8FAF7", accent: "#009E8E" },
  organelles:{ fill: "#6C5CE7", bg: "#EBE6FF", accent: "#4834D4" },
  molecules: { fill: "#FF6B6B", bg: "#FFE8E8", accent: "#D63031" },
  organs:    { fill: "#FF85A2", bg: "#FFF0F3", accent: "#E84393" },
  equipment: { fill: "#54A0FF", bg: "#E8F4FF", accent: "#2E86DE" },
  arrows:    { fill: "#1a1a2e", bg: "#F0F0F5", accent: "#2d2d4e" },
  symbols:   { fill: "#FFD93D", bg: "#FFF8E1", accent: "#F39C12" },
  micro:     { fill: "#00B894", bg: "#E6FAF5", accent: "#00896B" },
};

/* ── Shape generators ───────────────────────────────────────────── */

function circleShape(cx, cy, r, fill, opacity = 1) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
}

function ellipseShape(cx, cy, rx, ry, fill, opacity = 1) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"/>`;
}

function rectShape(x, y, w, h, rx, fill, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${opacity}"/>`;
}

/* ── Asset definitions per category ─────────────────────────────── */

const categories = {
  cells: [
    {
      id: "animal-cell",
      name: "Animal Cell",
      shape: (c) => [
        circleShape(100, 85, 52, c.fill, 0.2),
        circleShape(100, 85, 42, c.fill, 0.4),
        circleShape(100, 85, 18, c.accent, 0.7),
        circleShape(78, 70, 5, c.accent, 0.5),
        circleShape(120, 95, 4, c.accent, 0.5),
        circleShape(90, 105, 6, c.accent, 0.4),
      ],
    },
    {
      id: "plant-cell",
      name: "Plant Cell",
      shape: (c) => [
        rectShape(45, 40, 110, 90, 8, c.fill, 0.2),
        rectShape(52, 47, 96, 76, 5, c.fill, 0.35),
        rectShape(65, 55, 70, 60, 3, c.accent, 0.15),
        circleShape(100, 80, 14, c.accent, 0.6),
      ],
    },
    {
      id: "bacteria",
      name: "Bacteria",
      shape: (c) => [
        ellipseShape(100, 85, 50, 28, c.fill, 0.3),
        ellipseShape(100, 85, 42, 22, c.fill, 0.6),
        circleShape(85, 82, 5, c.accent, 0.7),
        `<line x1="50" y1="85" x2="30" y2="70" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        `<line x1="50" y1="85" x2="35" y2="100" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        `<line x1="150" y1="85" x2="170" y2="72" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
      ],
    },
    {
      id: "red-blood-cell",
      name: "Red Blood Cell",
      shape: (c) => [
        ellipseShape(100, 85, 48, 30, c.fill, 0.3),
        ellipseShape(100, 85, 40, 24, c.fill, 0.5),
        ellipseShape(100, 85, 20, 12, c.bg, 0.6),
      ],
    },
    {
      id: "white-blood-cell",
      name: "White Blood Cell",
      shape: (c) => [
        circleShape(100, 85, 45, c.fill, 0.25),
        circleShape(100, 85, 38, c.fill, 0.5),
        circleShape(92, 78, 14, c.accent, 0.5),
        circleShape(108, 90, 12, c.accent, 0.45),
        circleShape(96, 95, 10, c.accent, 0.4),
      ],
    },
    {
      id: "neuron",
      name: "Neuron",
      shape: (c) => [
        circleShape(80, 80, 22, c.fill, 0.5),
        circleShape(80, 80, 14, c.accent, 0.6),
        `<line x1="100" y1="80" x2="165" y2="80" stroke="${c.fill}" stroke-width="4" opacity="0.6"/>`,
        `<line x1="60" y1="65" x2="40" y2="50" stroke="${c.fill}" stroke-width="3" opacity="0.4"/>`,
        `<line x1="62" y1="95" x2="42" y2="110" stroke="${c.fill}" stroke-width="3" opacity="0.4"/>`,
        `<line x1="65" y1="75" x2="45" y2="68" stroke="${c.fill}" stroke-width="2" opacity="0.3"/>`,
        circleShape(165, 80, 6, c.accent, 0.5),
      ],
    },
    {
      id: "epithelial-cell",
      name: "Epithelial Cell",
      shape: (c) => [
        `<polygon points="100,40 150,65 150,105 100,130 50,105 50,65" fill="${c.fill}" opacity="0.3"/>`,
        `<polygon points="100,50 140,70 140,100 100,120 60,100 60,70" fill="${c.fill}" opacity="0.5"/>`,
        circleShape(100, 85, 12, c.accent, 0.6),
      ],
    },
    {
      id: "stem-cell",
      name: "Stem Cell",
      shape: (c) => [
        circleShape(100, 85, 48, c.fill, 0.15),
        circleShape(100, 85, 40, c.fill, 0.25),
        circleShape(100, 85, 32, c.fill, 0.4),
        circleShape(100, 85, 16, c.accent, 0.6),
        circleShape(100, 85, 8, c.accent, 0.8),
      ],
    },
  ],

  organelles: [
    {
      id: "nucleus",
      name: "Nucleus",
      shape: (c) => [
        circleShape(100, 85, 42, c.fill, 0.25),
        circleShape(100, 85, 38, c.fill, 0.15),
        `<circle cx="100" cy="85" r="38" fill="none" stroke="${c.fill}" stroke-width="3" opacity="0.6"/>`,
        `<circle cx="100" cy="85" r="42" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.4"/>`,
        circleShape(100, 85, 14, c.accent, 0.5),
      ],
    },
    {
      id: "mitochondria",
      name: "Mitochondria",
      shape: (c) => [
        ellipseShape(100, 85, 50, 25, c.fill, 0.3),
        ellipseShape(100, 85, 46, 21, c.fill, 0.5),
        `<path d="M65,85 Q75,65 85,85 Q95,105 105,85 Q115,65 125,85 Q135,105 140,85" fill="none" stroke="${c.accent}" stroke-width="2.5" opacity="0.6"/>`,
      ],
    },
    {
      id: "rough-er",
      name: "Rough ER",
      shape: (c) => [
        `<path d="M40,70 Q60,55 80,70 Q100,85 120,70 Q140,55 160,70" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.5"/>`,
        `<path d="M40,90 Q60,75 80,90 Q100,105 120,90 Q140,75 160,90" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.5"/>`,
        circleShape(55, 68, 3, c.accent, 0.7),
        circleShape(75, 72, 3, c.accent, 0.7),
        circleShape(95, 68, 3, c.accent, 0.7),
        circleShape(115, 72, 3, c.accent, 0.7),
        circleShape(135, 68, 3, c.accent, 0.7),
        circleShape(65, 88, 3, c.accent, 0.7),
        circleShape(85, 92, 3, c.accent, 0.7),
        circleShape(105, 88, 3, c.accent, 0.7),
        circleShape(125, 92, 3, c.accent, 0.7),
      ],
    },
    {
      id: "smooth-er",
      name: "Smooth ER",
      shape: (c) => [
        `<path d="M40,65 Q60,50 80,65 Q100,80 120,65 Q140,50 160,65" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.5"/>`,
        `<path d="M40,85 Q60,70 80,85 Q100,100 120,85 Q140,70 160,85" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.5"/>`,
        `<path d="M40,105 Q60,90 80,105 Q100,120 120,105 Q140,90 160,105" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.4"/>`,
      ],
    },
    {
      id: "golgi-apparatus",
      name: "Golgi Apparatus",
      shape: (c) => [
        `<path d="M50,65 Q100,55 150,65" fill="none" stroke="${c.fill}" stroke-width="5" opacity="0.5" stroke-linecap="round"/>`,
        `<path d="M55,80 Q100,70 145,80" fill="none" stroke="${c.fill}" stroke-width="5" opacity="0.6" stroke-linecap="round"/>`,
        `<path d="M60,95 Q100,85 140,95" fill="none" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
        `<path d="M65,110 Q100,100 135,110" fill="none" stroke="${c.accent}" stroke-width="5" opacity="0.5" stroke-linecap="round"/>`,
        circleShape(145, 70, 6, c.accent, 0.5),
        circleShape(150, 85, 5, c.accent, 0.4),
      ],
    },
    {
      id: "ribosome",
      name: "Ribosome",
      shape: (c) => [
        ellipseShape(100, 78, 22, 16, c.fill, 0.5),
        ellipseShape(100, 95, 18, 12, c.accent, 0.5),
      ],
    },
    {
      id: "lysosome",
      name: "Lysosome",
      shape: (c) => [
        circleShape(100, 85, 35, c.fill, 0.3),
        circleShape(100, 85, 30, c.fill, 0.5),
        circleShape(90, 78, 5, c.accent, 0.6),
        circleShape(110, 88, 4, c.accent, 0.5),
        circleShape(95, 95, 6, c.accent, 0.4),
        circleShape(108, 76, 3, c.accent, 0.7),
      ],
    },
    {
      id: "cell-membrane",
      name: "Cell Membrane",
      shape: (c) => [
        `<line x1="30" y1="75" x2="170" y2="75" stroke="${c.fill}" stroke-width="3" opacity="0.5"/>`,
        `<line x1="30" y1="95" x2="170" y2="95" stroke="${c.fill}" stroke-width="3" opacity="0.5"/>`,
        ...[40, 55, 70, 85, 100, 115, 130, 145, 160].map(
          (x) =>
            circleShape(x, 73, 5, c.accent, 0.6) +
            circleShape(x, 97, 5, c.accent, 0.6)
        ),
      ],
    },
  ],

  molecules: [
    {
      id: "dna-helix",
      name: "DNA Helix",
      shape: (c) => [
        `<path d="M70,40 Q130,60 70,85 Q130,110 70,130" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.6"/>`,
        `<path d="M130,40 Q70,60 130,85 Q70,110 130,130" fill="none" stroke="${c.accent}" stroke-width="4" opacity="0.6"/>`,
        `<line x1="80" y1="50" x2="120" y2="50" stroke="${c.fill}" stroke-width="2" opacity="0.3"/>`,
        `<line x1="75" y1="72" x2="125" y2="72" stroke="${c.fill}" stroke-width="2" opacity="0.3"/>`,
        `<line x1="80" y1="95" x2="120" y2="95" stroke="${c.fill}" stroke-width="2" opacity="0.3"/>`,
        `<line x1="75" y1="118" x2="125" y2="118" stroke="${c.fill}" stroke-width="2" opacity="0.3"/>`,
      ],
    },
    {
      id: "rna-strand",
      name: "RNA Strand",
      shape: (c) => [
        `<path d="M60,45 Q80,55 70,75 Q60,95 80,105 Q100,115 90,135" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.6" stroke-linecap="round"/>`,
        circleShape(60, 45, 5, c.accent, 0.7),
        circleShape(70, 75, 5, c.accent, 0.7),
        circleShape(80, 105, 5, c.accent, 0.7),
        circleShape(90, 135, 5, c.accent, 0.7),
      ],
    },
    {
      id: "protein",
      name: "Protein",
      shape: (c) => [
        `<path d="M55,90 Q65,50 85,70 Q105,90 100,60 Q120,40 140,75 Q150,100 130,110 Q100,120 80,105 Z" fill="${c.fill}" opacity="0.4"/>`,
        `<path d="M60,88 Q70,55 85,72 Q102,88 98,62 Q118,45 138,78 Q146,98 128,108 Q100,116 82,102 Z" fill="${c.accent}" opacity="0.3"/>`,
      ],
    },
    {
      id: "antibody",
      name: "Antibody",
      shape: (c) => [
        `<line x1="100" y1="85" x2="100" y2="130" stroke="${c.fill}" stroke-width="5" opacity="0.6" stroke-linecap="round"/>`,
        `<line x1="100" y1="85" x2="65" y2="55" stroke="${c.fill}" stroke-width="5" opacity="0.6" stroke-linecap="round"/>`,
        `<line x1="100" y1="85" x2="135" y2="55" stroke="${c.fill}" stroke-width="5" opacity="0.6" stroke-linecap="round"/>`,
        circleShape(65, 50, 12, c.accent, 0.5),
        circleShape(135, 50, 12, c.accent, 0.5),
        circleShape(100, 130, 8, c.fill, 0.4),
      ],
    },
    {
      id: "receptor",
      name: "Receptor",
      shape: (c) => [
        rectShape(90, 85, 20, 50, 3, c.fill, 0.5),
        `<path d="M70,85 Q100,55 130,85" fill="${c.accent}" opacity="0.4"/>`,
        `<path d="M75,85 Q100,60 125,85" fill="${c.fill}" opacity="0.3"/>`,
      ],
    },
    {
      id: "enzyme",
      name: "Enzyme",
      shape: (c) => [
        `<path d="M100,45 A40,40 0 1 1 100,125 L100,95 A10,10 0 0 0 100,75 Z" fill="${c.fill}" opacity="0.4"/>`,
        `<path d="M100,50 A37,37 0 1 1 100,122 L100,93 A8,8 0 0 0 100,77 Z" fill="${c.accent}" opacity="0.25"/>`,
      ],
    },
    {
      id: "atp",
      name: "ATP",
      shape: (c) => [
        circleShape(70, 85, 18, c.fill, 0.4),
        circleShape(100, 85, 18, c.accent, 0.4),
        circleShape(130, 85, 18, c.fill, 0.5),
        `<line x1="88" y1="85" x2="82" y2="85" stroke="${c.accent}" stroke-width="3" opacity="0.7"/>`,
        `<line x1="118" y1="85" x2="112" y2="85" stroke="${c.accent}" stroke-width="3" opacity="0.7"/>`,
        `<text x="70" y="89" text-anchor="middle" font-size="11" font-weight="bold" fill="${c.accent}">A</text>`,
        `<text x="100" y="89" text-anchor="middle" font-size="11" font-weight="bold" fill="${c.fill}">T</text>`,
        `<text x="130" y="89" text-anchor="middle" font-size="11" font-weight="bold" fill="${c.accent}">P</text>`,
      ],
    },
    {
      id: "glucose",
      name: "Glucose",
      shape: (c) => [
        `<polygon points="100,50 140,70 140,100 100,120 60,100 60,70" fill="${c.fill}" opacity="0.3" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.5"/>`,
        circleShape(100, 50, 4, c.accent, 0.6),
        circleShape(140, 70, 4, c.accent, 0.6),
        circleShape(140, 100, 4, c.accent, 0.6),
        circleShape(100, 120, 4, c.accent, 0.6),
        circleShape(60, 100, 4, c.accent, 0.6),
        circleShape(60, 70, 4, c.accent, 0.6),
      ],
    },
  ],

  organs: [
    {
      id: "heart",
      name: "Heart",
      shape: (c) => [
        `<path d="M100,120 C100,120 55,95 55,70 C55,55 68,45 82,50 C90,53 96,60 100,65 C104,60 110,53 118,50 C132,45 145,55 145,70 C145,95 100,120 100,120 Z" fill="${c.fill}" opacity="0.5"/>`,
        `<path d="M100,115 C100,115 62,92 62,72 C62,60 72,52 83,55 C90,57 96,63 100,68 C104,63 110,57 117,55 C128,52 138,60 138,72 C138,92 100,115 100,115 Z" fill="${c.accent}" opacity="0.3"/>`,
      ],
    },
    {
      id: "brain",
      name: "Brain",
      shape: (c) => [
        ellipseShape(95, 80, 45, 38, c.fill, 0.35),
        `<path d="M60,65 Q80,50 100,65 Q120,50 140,65" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        `<path d="M65,80 Q85,70 100,80 Q115,70 135,80" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.4"/>`,
        `<path d="M70,95 Q90,85 100,95 Q110,85 130,95" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.3"/>`,
        `<line x1="100" y1="50" x2="100" y2="115" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>`,
      ],
    },
    {
      id: "lungs",
      name: "Lungs",
      shape: (c) => [
        `<path d="M100,50 L100,110" stroke="${c.accent}" stroke-width="3" opacity="0.5"/>`,
        ellipseShape(72, 82, 28, 35, c.fill, 0.35),
        ellipseShape(128, 82, 28, 35, c.fill, 0.35),
        `<line x1="100" y1="65" x2="80" y2="75" stroke="${c.accent}" stroke-width="2" opacity="0.4"/>`,
        `<line x1="100" y1="65" x2="120" y2="75" stroke="${c.accent}" stroke-width="2" opacity="0.4"/>`,
        `<line x1="100" y1="80" x2="75" y2="90" stroke="${c.accent}" stroke-width="2" opacity="0.3"/>`,
        `<line x1="100" y1="80" x2="125" y2="90" stroke="${c.accent}" stroke-width="2" opacity="0.3"/>`,
      ],
    },
    {
      id: "liver",
      name: "Liver",
      shape: (c) => [
        `<path d="M50,75 Q60,50 100,55 Q150,50 160,80 Q155,110 100,115 Q60,112 50,75 Z" fill="${c.fill}" opacity="0.4"/>`,
        `<path d="M55,76 Q65,55 100,60 Q145,55 155,82 Q150,108 100,112 Q65,110 55,76 Z" fill="${c.accent}" opacity="0.2"/>`,
        `<line x1="100" y1="55" x2="100" y2="115" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>`,
      ],
    },
    {
      id: "kidney",
      name: "Kidney",
      shape: (c) => [
        `<path d="M70,55 Q55,55 50,75 Q45,105 65,120 Q85,130 100,115 Q100,95 90,85 Q85,80 90,70 Q95,55 70,55 Z" fill="${c.fill}" opacity="0.4"/>`,
        `<path d="M72,60 Q60,60 55,78 Q50,105 68,118 Q85,125 98,112 Q98,95 90,86 Q86,82 90,72 Q93,60 72,60 Z" fill="${c.accent}" opacity="0.25"/>`,
      ],
    },
    {
      id: "stomach",
      name: "Stomach",
      shape: (c) => [
        `<path d="M80,50 Q60,55 55,80 Q50,110 75,125 Q100,130 115,110 Q125,90 120,70 Q118,55 105,50 Z" fill="${c.fill}" opacity="0.4"/>`,
        `<path d="M82,55 Q65,60 60,82 Q55,108 78,122 Q98,126 112,108 Q120,90 116,72 Q114,58 104,55 Z" fill="${c.accent}" opacity="0.2"/>`,
      ],
    },
    {
      id: "eye-organ",
      name: "Eye",
      shape: (c) => [
        `<path d="M40,85 Q100,40 160,85 Q100,130 40,85 Z" fill="${c.fill}" opacity="0.25"/>`,
        circleShape(100, 85, 22, c.fill, 0.5),
        circleShape(100, 85, 12, c.accent, 0.7),
        circleShape(100, 85, 5, "#1a1a2e", 0.8),
        circleShape(95, 80, 3, "white", 0.6),
      ],
    },
    {
      id: "bone",
      name: "Bone",
      shape: (c) => [
        rectShape(90, 55, 20, 60, 4, c.fill, 0.5),
        ellipseShape(90, 55, 15, 10, c.fill, 0.4),
        ellipseShape(110, 55, 15, 10, c.fill, 0.4),
        ellipseShape(90, 115, 15, 10, c.fill, 0.4),
        ellipseShape(110, 115, 15, 10, c.fill, 0.4),
      ],
    },
  ],

  equipment: [
    {
      id: "microscope",
      name: "Microscope",
      shape: (c) => [
        rectShape(85, 115, 40, 8, 2, c.accent, 0.6),
        rectShape(95, 50, 12, 65, 2, c.fill, 0.5),
        circleShape(101, 45, 12, c.fill, 0.4),
        `<circle cx="101" cy="45" r="12" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        rectShape(75, 95, 50, 5, 2, c.accent, 0.4),
      ],
    },
    {
      id: "test-tube",
      name: "Test Tube",
      shape: (c) => [
        rectShape(90, 40, 20, 65, 0, c.fill, 0.2),
        `<path d="M90,105 Q90,120 100,120 Q110,120 110,105" fill="${c.fill}" opacity="0.2"/>`,
        rectShape(90, 70, 20, 35, 0, c.fill, 0.4),
        `<path d="M90,105 Q90,120 100,120 Q110,120 110,105" fill="${c.accent}" opacity="0.4"/>`,
        `<line x1="88" y1="40" x2="112" y2="40" stroke="${c.accent}" stroke-width="3" opacity="0.6"/>`,
      ],
    },
    {
      id: "beaker",
      name: "Beaker",
      shape: (c) => [
        `<path d="M60,45 L55,120 L145,120 L140,45" fill="none" stroke="${c.fill}" stroke-width="3" opacity="0.5"/>`,
        rectShape(57, 80, 86, 40, 0, c.fill, 0.3),
        `<line x1="140" y1="55" x2="155" y2="50" stroke="${c.accent}" stroke-width="3" opacity="0.4"/>`,
        `<line x1="65" y1="60" x2="70" y2="60" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>`,
        `<line x1="65" y1="70" x2="73" y2="70" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>`,
        `<line x1="65" y1="80" x2="70" y2="80" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>`,
      ],
    },
    {
      id: "pipette",
      name: "Pipette",
      shape: (c) => [
        rectShape(96, 35, 8, 70, 2, c.fill, 0.4),
        `<path d="M96,105 Q96,125 100,130 Q104,125 104,105" fill="${c.accent}" opacity="0.5"/>`,
        rectShape(92, 30, 16, 10, 3, c.fill, 0.3),
        circleShape(100, 130, 3, c.accent, 0.6),
      ],
    },
    {
      id: "petri-dish",
      name: "Petri Dish",
      shape: (c) => [
        ellipseShape(100, 90, 50, 25, c.fill, 0.2),
        `<ellipse cx="100" cy="90" rx="50" ry="25" fill="none" stroke="${c.fill}" stroke-width="2.5" opacity="0.5"/>`,
        ellipseShape(100, 85, 45, 22, c.fill, 0.15),
        circleShape(85, 82, 5, c.accent, 0.4),
        circleShape(110, 88, 7, c.accent, 0.3),
        circleShape(95, 95, 4, c.accent, 0.5),
        circleShape(120, 80, 3, c.accent, 0.4),
      ],
    },
    {
      id: "syringe",
      name: "Syringe",
      shape: (c) => [
        rectShape(55, 80, 70, 12, 2, c.fill, 0.3),
        `<path d="M125,80 L140,83 L140,89 L125,92" fill="${c.accent}" opacity="0.4"/>`,
        `<line x1="140" y1="86" x2="155" y2="86" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        rectShape(40, 78, 15, 16, 2, c.fill, 0.4),
        `<line x1="75" y1="80" x2="75" y2="92" stroke="${c.accent}" stroke-width="1" opacity="0.3"/>`,
        `<line x1="85" y1="80" x2="85" y2="92" stroke="${c.accent}" stroke-width="1" opacity="0.3"/>`,
        `<line x1="95" y1="80" x2="95" y2="92" stroke="${c.accent}" stroke-width="1" opacity="0.3"/>`,
      ],
    },
    {
      id: "flask",
      name: "Erlenmeyer Flask",
      shape: (c) => [
        `<path d="M90,40 L60,115 Q60,125 100,125 Q140,125 140,115 L110,40 Z" fill="${c.fill}" opacity="0.2"/>`,
        rectShape(88, 35, 24, 8, 2, c.accent, 0.4),
        `<path d="M65,100 L135,100 Q138,115 100,122 Q62,115 65,100 Z" fill="${c.fill}" opacity="0.35"/>`,
      ],
    },
    {
      id: "centrifuge",
      name: "Centrifuge",
      shape: (c) => [
        rectShape(55, 55, 90, 65, 8, c.fill, 0.2),
        `<rect x="55" y="55" width="90" height="65" rx="8" fill="none" stroke="${c.fill}" stroke-width="2.5" opacity="0.5"/>`,
        circleShape(100, 88, 22, c.accent, 0.3),
        `<circle cx="100" cy="88" r="22" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        circleShape(100, 88, 5, c.accent, 0.6),
        rectShape(65, 60, 25, 8, 3, c.fill, 0.4),
      ],
    },
  ],

  arrows: [
    {
      id: "arrow-right",
      name: "Right Arrow",
      shape: (c) => [
        `<line x1="40" y1="85" x2="145" y2="85" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
        `<polygon points="145,85 125,70 125,100" fill="${c.fill}" opacity="0.7"/>`,
      ],
    },
    {
      id: "arrow-left",
      name: "Left Arrow",
      shape: (c) => [
        `<line x1="55" y1="85" x2="160" y2="85" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
        `<polygon points="55,85 75,70 75,100" fill="${c.fill}" opacity="0.7"/>`,
      ],
    },
    {
      id: "arrow-bidirectional",
      name: "Bidirectional Arrow",
      shape: (c) => [
        `<line x1="55" y1="85" x2="145" y2="85" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
        `<polygon points="145,85 125,70 125,100" fill="${c.fill}" opacity="0.7"/>`,
        `<polygon points="55,85 75,70 75,100" fill="${c.fill}" opacity="0.7"/>`,
      ],
    },
    {
      id: "arrow-curved",
      name: "Curved Arrow",
      shape: (c) => [
        `<path d="M45,100 Q100,30 155,100" fill="none" stroke="${c.fill}" stroke-width="4" opacity="0.7"/>`,
        `<polygon points="155,100 145,80 165,90" fill="${c.fill}" opacity="0.7"/>`,
      ],
    },
    {
      id: "arrow-inhibition",
      name: "Inhibition Arrow",
      shape: (c) => [
        `<line x1="40" y1="85" x2="140" y2="85" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
        `<line x1="150" y1="65" x2="150" y2="105" stroke="${c.fill}" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
      ],
    },
    {
      id: "arrow-activation",
      name: "Activation Arrow",
      shape: (c) => [
        `<line x1="40" y1="85" x2="130" y2="85" stroke="${c.fill}" stroke-width="4" opacity="0.7" stroke-linecap="round"/>`,
        `<polygon points="155,85 130,70 130,100" fill="${c.fill}" opacity="0.7"/>`,
        `<line x1="135" y1="75" x2="135" y2="95" stroke="${c.bg}" stroke-width="2" opacity="0.9"/>`,
      ],
    },
  ],

  symbols: [
    {
      id: "symbol-plus",
      name: "Plus Sign",
      shape: (c) => [
        rectShape(88, 60, 24, 50, 4, c.fill, 0.6),
        rectShape(75, 73, 50, 24, 4, c.fill, 0.6),
      ],
    },
    {
      id: "symbol-minus",
      name: "Minus Sign",
      shape: (c) => [
        rectShape(65, 78, 70, 16, 4, c.fill, 0.6),
      ],
    },
    {
      id: "symbol-check",
      name: "Checkmark",
      shape: (c) => [
        `<polyline points="55,90 85,115 150,55" fill="none" stroke="${c.fill}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`,
      ],
    },
    {
      id: "symbol-x",
      name: "X Mark",
      shape: (c) => [
        `<line x1="60" y1="55" x2="140" y2="115" stroke="${c.fill}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>`,
        `<line x1="140" y1="55" x2="60" y2="115" stroke="${c.fill}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>`,
      ],
    },
    {
      id: "symbol-star",
      name: "Star",
      shape: (c) => [
        `<polygon points="100,45 112,75 145,78 120,98 127,130 100,112 73,130 80,98 55,78 88,75" fill="${c.fill}" opacity="0.5"/>`,
      ],
    },
    {
      id: "symbol-label",
      name: "Label Box",
      shape: (c) => [
        rectShape(50, 65, 100, 40, 8, c.fill, 0.3),
        `<rect x="50" y="65" width="100" height="40" rx="8" fill="none" stroke="${c.fill}" stroke-width="2.5" opacity="0.5"/>`,
        `<text x="100" y="90" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="${c.accent}">Label</text>`,
      ],
    },
  ],

  micro: [
    {
      id: "virus",
      name: "Virus",
      shape: (c) => [
        circleShape(100, 85, 25, c.fill, 0.4),
        ...[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 100 + 35 * Math.cos(rad);
          const y = 85 + 35 * Math.sin(rad);
          const ix = 100 + 25 * Math.cos(rad);
          const iy = 85 + 25 * Math.sin(rad);
          return (
            `<line x1="${ix}" y1="${iy}" x2="${x}" y2="${y}" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>` +
            circleShape(x, y, 4, c.accent, 0.6)
          );
        }),
        circleShape(100, 85, 10, c.accent, 0.5),
      ],
    },
    {
      id: "bacteriophage",
      name: "Bacteriophage",
      shape: (c) => [
        `<polygon points="100,40 120,60 120,80 80,80 80,60" fill="${c.fill}" opacity="0.4" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.4"/>`,
        rectShape(97, 80, 6, 30, 0, c.accent, 0.5),
        `<line x1="100" y1="110" x2="75" y2="130" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        `<line x1="100" y1="110" x2="100" y2="135" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
        `<line x1="100" y1="110" x2="125" y2="130" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>`,
      ],
    },
    {
      id: "yeast",
      name: "Yeast Cell",
      shape: (c) => [
        ellipseShape(95, 88, 35, 28, c.fill, 0.35),
        circleShape(95, 85, 10, c.accent, 0.5),
        ellipseShape(132, 72, 18, 15, c.fill, 0.3),
      ],
    },
    {
      id: "amoeba",
      name: "Amoeba",
      shape: (c) => [
        `<path d="M60,80 Q50,55 80,50 Q110,40 130,60 Q155,65 150,90 Q155,115 130,120 Q100,130 75,115 Q45,105 60,80 Z" fill="${c.fill}" opacity="0.35"/>`,
        circleShape(100, 82, 12, c.accent, 0.5),
        circleShape(85, 95, 5, c.accent, 0.3),
      ],
    },
  ],
};

/* ── SVG generator ──────────────────────────────────────────────── */

function generateSVG(asset, catColors) {
  const shapes = asset.shape(catColors);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="20" fill="${catColors.bg}"/>
  ${shapes.flat().join("\n  ")}
  <text x="100" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="${catColors.accent}" opacity="0.8">${asset.name}</text>
</svg>`;
}

/* ── Main ───────────────────────────────────────────────────────── */

let count = 0;

for (const [catId, assets] of Object.entries(categories)) {
  const catDir = join(OUT, catId);
  mkdirSync(catDir, { recursive: true });

  const colors = palette[catId];

  for (const asset of assets) {
    const svg = generateSVG(asset, colors);
    const filePath = join(catDir, `${asset.id}.svg`);
    writeFileSync(filePath, svg, "utf-8");
    count++;
  }
}

console.log(`Generated ${count} placeholder SVGs in ${OUT}`);
