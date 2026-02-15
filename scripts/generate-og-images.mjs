#!/usr/bin/env node
/**
 * Pre-generate OG images and upload them to Vercel Blob.
 *
 * Generates ~11,000 images using 3 template tiers:
 *   Tier 1 "Rich"    — Hub & static pages (~20 images)
 *   Tier 2 "Standard" — Categories, decks, collections (~250 images)
 *   Tier 3 "Compact"  — Individual items (~10,700 images)
 *
 * Run:   node scripts/generate-og-images.mjs           (upload to blob)
 *        node scripts/generate-og-images.mjs --local    (write to public/og/)
 * Deps:  pnpm add -D satori @resvg/resvg-js @vercel/blob
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load env for blob token
config({ path: join(ROOT, ".env.local") });

const LOCAL_MODE = process.argv.includes("--local");

// ── Design tokens ─────────────────────────────────────────────────────
const C = {
  navy: "#1a1a2e",
  purple: "#6C5CE7",
  teal: "#00D9C0",
  green: "#2ECC71",
  blue: "#54A0FF",
  orange: "#FF9F43",
  pink: "#FF85A2",
  coral: "#7E22CE",
  yellow: "#FFD93D",
  bgStart: "#F0EEFF",
  bgMid: "#EDF4FF",
  bgEnd: "#EEFBF9",
  white: "#FFFFFF",
  muted: "#4a4a6a",
  light: "#8888aa",
};

const ACCENTS = [C.purple, C.teal, C.green, C.blue, C.orange, C.pink, C.coral];
function accentFor(index) { return ACCENTS[index % ACCENTS.length]; }

// ── Fonts ─────────────────────────────────────────────────────────────
async function loadFonts() {
  console.log("  Loading fonts...");
  const urls = [
    ["https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-700-normal.ttf", "Bricolage Grotesque", 700],
    ["https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-800-normal.ttf", "Bricolage Grotesque", 800],
    ["https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-400-normal.ttf", "DM Sans", 400],
    ["https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-700-normal.ttf", "DM Sans", 700],
  ];
  const results = await Promise.all(urls.map(([url]) => fetch(url).then(r => r.arrayBuffer())));
  return results.map((data, i) => ({ name: urls[i][1], data, weight: urls[i][2], style: "normal" }));
}

// ── Logo loading ──────────────────────────────────────────────────────
function loadBase64(absPath) {
  if (!existsSync(absPath)) return null;
  const buf = readFileSync(absPath);
  const ext = absPath.endsWith(".svg") ? "svg+xml" : "png";
  return `data:image/${ext};base64,${buf.toString("base64")}`;
}

const logoBase64 = loadBase64(join(__dirname, "assets", "logo.png"))
  || loadBase64(join(ROOT, "public", "logo.png"));
if (!logoBase64) console.log("  Warning: logo.png not found in scripts/assets/ or public/ — images will render without mascot");

// ── Data loading (TS file parsing) ────────────────────────────────────
function extractJsonArray(content, startMarker) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return [];
  const tail = content.slice(startIdx);
  const assignMatch = tail.match(/=\s*\[/);
  if (!assignMatch) return [];
  const arrStart = startIdx + tail.indexOf(assignMatch[0]) + assignMatch[0].indexOf("[");
  let depth = 0, inString = false, escape = false, quote = "", i = arrStart;
  while (i < content.length) {
    const c = content[i];
    if (escape) { escape = false; i++; continue; }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === quote) inString = false;
      i++; continue;
    }
    if (c === '"' || c === "'") { inString = true; quote = c; i++; continue; }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        let arrStr = content.slice(arrStart, i + 1);
        arrStr = arrStr.replace(/,\s*\]/g, "]").replace(/,\s*\}/g, "}");
        try { return JSON.parse(arrStr); } catch { return []; }
      }
    }
    i++;
  }
  return [];
}

function readTs(relPath, marker) {
  const content = readFileSync(join(ROOT, relPath), "utf-8");
  return extractJsonArray(content, marker);
}

function readJson(relPath) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf-8"));
}

// ── Load all data ─────────────────────────────────────────────────────
function loadAllData() {
  console.log("  Loading data...");

  const practiceCategories = readTs("data/practice-categories.ts", "export const practiceCategories");
  const practiceDecks = readTs("data/practice-categories.ts", "export const practiceDecks");
  const practiceQuestions = readTs("data/practice-questions.ts", "export const practiceQuestions");

  const flashcardCategories = readTs("data/flashcard-categories.ts", "export const flashcardCategories");
  const flashcardDecks = readTs("data/flashcard-categories.ts", "export const flashcardDecks");
  const flashcardData = readTs("data/flashcard-data.ts", "export const flashcards");

  const glossaryTerms = readJson("data/glossary/all-terms.json");
  const glossaryTags = readJson("data/glossary/tags.json");
  const tagCounts = {};
  for (const t of glossaryTerms) {
    tagCounts[t.primary_tag] = (tagCounts[t.primary_tag] || 0) + 1;
  }
  const glossaryCategories = Object.entries(tagCounts).map(([id, count]) => ({
    id,
    name: id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    count,
  }));

  const visualLessons = readTs("data/visuals.ts", "export const visualLessons");
  const pdfBooks = readTs("data/pdf-books.ts", "export const pdfBooks");
  const clinicalCases = readTs("data/clinical-cases.ts", "export const clinicalCases");

  const mediaContent = readFileSync(join(ROOT, "data/media-assets.ts"), "utf-8");
  const mediaAssets = extractJsonArray(mediaContent, "export const mediaAssets");
  const mediaCategories = extractJsonArray(mediaContent, "export const mediaAssetCategories");
  const mediaCollections = extractJsonArray(mediaContent, "export const mediaAssetCollections");
  const allMediaTags = [...new Set(mediaAssets.flatMap(a => a.tags || []))];

  const blogPosts = readTs("data/blog-posts.ts", "export const blogPosts");
  const tools = readTs("data/tools.ts", "export const tools");

  const examTypes = [
    { id: "manual-bp", title: "Manual Blood Pressure" },
    { id: "cardiac", title: "Cardiac Examination" },
    { id: "thoracic", title: "Thoracic Examination" },
  ];

  return {
    practiceCategories, practiceDecks, practiceQuestions,
    flashcardCategories, flashcardDecks, flashcardData,
    glossaryTerms, glossaryTags, glossaryCategories,
    visualLessons, pdfBooks, clinicalCases,
    mediaAssets, mediaCategories, mediaCollections, allMediaTags,
    blogPosts, tools, examTypes,
  };
}

// ══════════════════════════════════════════════════════════════════════
//  SHARED ELEMENTS
// ══════════════════════════════════════════════════════════════════════

function brandingBar(size = "normal") {
  const logoSize = size === "small" ? 36 : 48;
  const fontSize = size === "small" ? 16 : 20;
  return {
    type: "div",
    props: {
      style: { display: "flex", alignItems: "center", gap: 12, marginTop: "auto" },
      children: [
        ...(logoBase64 ? [{
          type: "img",
          props: { src: logoBase64, width: logoSize, height: logoSize, style: { borderRadius: 8 } },
        }] : []),
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "baseline", gap: 2 },
            children: [
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize, color: C.navy }, children: "EnterMedSchool" } },
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize, color: C.purple }, children: ".org" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex", marginLeft: 12, padding: "4px 10px", borderRadius: 8,
              backgroundColor: `${C.teal}18`, border: `1.5px solid ${C.teal}40`,
              fontSize: 11, fontWeight: 700, color: C.teal,
            },
            children: "Free & Open-Source",
          },
        },
      ],
    },
  };
}

function statPill(value, label, accent) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
        borderRadius: 10, border: `2px solid ${C.navy}`, boxShadow: `2px 2px 0 ${C.navy}`,
        backgroundColor: `${accent}15`, fontSize: 15, fontWeight: 700,
        fontFamily: "DM Sans", color: C.navy,
      },
      children: [
        { type: "span", props: { style: { color: accent, fontWeight: 800 }, children: String(value) } },
        { type: "span", props: { style: { color: C.muted, fontWeight: 600 }, children: label } },
      ],
    },
  };
}

function eyebrowBadge(text, accent) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex", alignSelf: "flex-start", padding: "5px 14px", borderRadius: 20,
        backgroundColor: `${accent}18`, border: `1.5px solid ${accent}40`,
        fontSize: 13, fontWeight: 700, fontFamily: "DM Sans", color: accent,
        letterSpacing: 0.5, textTransform: "uppercase",
      },
      children: text,
    },
  };
}

function truncate(text, maxLen) {
  if (!text) return "";
  const clean = text.replace(/\\n/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 1) + "\u2026" : clean;
}

function gradientBg(children) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%", height: "100%", display: "flex",
        background: `linear-gradient(135deg, ${C.bgStart} 0%, ${C.bgMid} 45%, ${C.bgEnd} 100%)`,
        padding: 40, fontFamily: "DM Sans",
      },
      children,
    },
  };
}

// ── Mascot element builder ────────────────────────────────────────────
function mascotWithGlow(size, accent) {
  if (!logoBase64) return [];
  const glowSize = Math.round(size * 1.4);
  return [
    // Glow circle behind mascot
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          width: glowSize, height: glowSize, borderRadius: "50%",
          backgroundColor: accent, opacity: 0.08,
          top: "50%", left: "50%",
          marginTop: -glowSize / 2, marginLeft: -glowSize / 2,
        },
      },
    },
    // Second subtle circle offset
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          width: 80, height: 80, borderRadius: "50%",
          backgroundColor: accent === C.purple ? C.teal : C.purple,
          opacity: 0.05,
          top: 20, right: 20,
        },
      },
    },
    // Mascot image
    {
      type: "img",
      props: {
        src: logoBase64,
        width: size, height: size,
        style: {
          position: "absolute",
          top: "50%", left: "50%",
          marginTop: -size / 2, marginLeft: -size / 2,
          borderRadius: Math.round(size * 0.12),
        },
      },
    },
  ];
}

// ══════════════════════════════════════════════════════════════════════
//  TIER 1 — RICH TEMPLATE (Hub & static pages)
// ══════════════════════════════════════════════════════════════════════

function buildRichTemplate({ title, eyebrow, stats = [], accent = C.purple }) {
  const card = {
    type: "div",
    props: {
      style: {
        display: "flex", width: "100%", height: "100%",
        backgroundColor: C.white, borderRadius: 24,
        border: `3px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}`,
        position: "relative",
      },
      children: [
        // Accent bar at top
        {
          type: "div",
          props: {
            style: {
              position: "absolute", top: 0, left: 0, right: 0, height: 6,
              background: `linear-gradient(90deg, ${accent}, ${accent === C.purple ? C.teal : C.purple})`,
              borderRadius: "24px 24px 0 0",
            },
          },
        },
        // Left content area
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "column", flex: 1,
              padding: "44px 0 36px 48px", gap: 16,
            },
            children: [
              ...(eyebrow ? [eyebrowBadge(eyebrow, accent)] : []),
              {
                type: "div",
                props: {
                  style: {
                    display: "flex", fontFamily: "Bricolage Grotesque", fontWeight: 800,
                    fontSize: 56, color: C.navy, lineHeight: 1.15, maxWidth: 600,
                  },
                  children: truncate(title, 60),
                },
              },
              ...(stats.length > 0 ? [{
                type: "div",
                props: {
                  style: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 },
                  children: stats.map(s => statPill(s.value, s.label, accent)),
                },
              }] : []),
              brandingBar(),
            ],
          },
        },
        // Right mascot area — Leo big & centered
        {
          type: "div",
          props: {
            style: {
              display: "flex", width: 300, position: "relative",
              alignItems: "center", justifyContent: "center",
            },
            children: mascotWithGlow(200, accent),
          },
        },
      ],
    },
  };

  return gradientBg(card);
}

// ══════════════════════════════════════════════════════════════════════
//  TIER 2 — STANDARD TEMPLATE (Categories, decks, collections)
// ══════════════════════════════════════════════════════════════════════

function buildStandardTemplate({ title, breadcrumb, stats = [], accent = C.purple }) {
  const card = {
    type: "div",
    props: {
      style: {
        display: "flex", width: "100%", height: "100%",
        backgroundColor: C.white, borderRadius: 24,
        border: `3px solid ${C.navy}`, boxShadow: `5px 5px 0 ${C.navy}`,
        position: "relative",
      },
      children: [
        // Accent bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute", top: 0, left: 0, right: 0, height: 5,
              backgroundColor: accent, borderRadius: "24px 24px 0 0",
            },
          },
        },
        // Content
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "column", flex: 1,
              padding: "40px 44px 32px", gap: 14,
            },
            children: [
              ...(breadcrumb ? [eyebrowBadge(breadcrumb, accent)] : []),
              {
                type: "div",
                props: {
                  style: {
                    display: "flex", fontFamily: "Bricolage Grotesque", fontWeight: 800,
                    fontSize: 44, color: C.navy, lineHeight: 1.2, maxWidth: 700,
                  },
                  children: truncate(title, 70),
                },
              },
              ...(stats.length > 0 ? [{
                type: "div",
                props: {
                  style: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 },
                  children: stats.map(s => statPill(s.value, s.label, accent)),
                },
              }] : []),
              brandingBar(),
            ],
          },
        },
        // Small mascot bottom-right
        ...(logoBase64 ? [{
          type: "img",
          props: {
            src: logoBase64, width: 100, height: 100,
            style: {
              position: "absolute", right: 32, bottom: 32,
              opacity: 0.85, borderRadius: 12,
            },
          },
        }] : []),
        // Subtle accent circle
        {
          type: "div",
          props: {
            style: {
              position: "absolute", right: -30, top: -30,
              width: 180, height: 180, borderRadius: "50%",
              backgroundColor: accent, opacity: 0.05,
            },
          },
        },
      ],
    },
  };

  return gradientBg(card);
}

// ══════════════════════════════════════════════════════════════════════
//  TIER 3 — COMPACT TEMPLATE (Individual items — fast & light)
// ══════════════════════════════════════════════════════════════════════

function buildCompactTemplate({ text, breadcrumb, accent = C.purple }) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: `linear-gradient(150deg, ${C.bgStart} 0%, ${C.white} 40%, ${C.bgEnd} 100%)`,
        fontFamily: "DM Sans", padding: 0,
      },
      children: [
        // Accent line
        { type: "div", props: { style: { height: 5, width: "100%", backgroundColor: accent } } },
        // Content
        {
          type: "div",
          props: {
            style: { display: "flex", flex: 1, flexDirection: "column", padding: "36px 48px 0", gap: 12 },
            children: [
              ...(breadcrumb ? [{
                type: "div",
                props: {
                  style: {
                    display: "flex", fontSize: 14, fontWeight: 700, color: accent,
                    letterSpacing: 0.3, textTransform: "uppercase",
                  },
                  children: breadcrumb,
                },
              }] : []),
              {
                type: "div",
                props: {
                  style: {
                    display: "flex", fontFamily: "Bricolage Grotesque", fontWeight: 700,
                    fontSize: 34, color: C.navy, lineHeight: 1.3, maxWidth: 1050, overflow: "hidden",
                  },
                  children: truncate(text, 180),
                },
              },
            ],
          },
        },
        // Bottom branding
        {
          type: "div",
          props: {
            style: {
              display: "flex", alignItems: "center", gap: 10,
              padding: "16px 48px 24px", borderTop: `1.5px solid ${C.navy}10`,
            },
            children: [
              ...(logoBase64 ? [{
                type: "img",
                props: { src: logoBase64, width: 32, height: 32, style: { borderRadius: 6 } },
              }] : []),
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 15, color: C.navy }, children: "EnterMedSchool" } },
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 15, color: C.purple }, children: ".org" } },
            ],
          },
        },
      ],
    },
  };
}

// ══════════════════════════════════════════════════════════════════════
//  TIER 3b — QUESTION COMPACT TEMPLATE (with answer options)
// ══════════════════════════════════════════════════════════════════════

function buildOptionRow(label, body, accent) {
  return {
    type: "div",
    props: {
      style: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 2 },
      children: [
        // Letter circle
        {
          type: "div",
          props: {
            style: {
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, minWidth: 26, borderRadius: "50%",
              backgroundColor: `${accent}18`, border: `1.5px solid ${accent}50`,
              fontSize: 13, fontWeight: 800, fontFamily: "DM Sans", color: accent,
            },
            children: label,
          },
        },
        // Option text
        {
          type: "div",
          props: {
            style: {
              display: "flex", fontSize: 14, fontWeight: 500,
              fontFamily: "DM Sans", color: C.muted, lineHeight: 1.35,
              overflow: "hidden",
            },
            children: truncate(body, 90),
          },
        },
      ],
    },
  };
}

function buildQuestionCompactTemplate({ text, options = [], breadcrumb, accent = C.purple }) {
  const optionRows = options.slice(0, 5).map(o => buildOptionRow(o.label, o.body, accent));

  return {
    type: "div",
    props: {
      style: {
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: `linear-gradient(150deg, ${C.bgStart} 0%, ${C.white} 40%, ${C.bgEnd} 100%)`,
        fontFamily: "DM Sans", padding: 0,
      },
      children: [
        // Accent line
        { type: "div", props: { style: { height: 5, width: "100%", backgroundColor: accent } } },
        // Content
        {
          type: "div",
          props: {
            style: { display: "flex", flex: 1, flexDirection: "column", padding: "28px 48px 0", gap: 8 },
            children: [
              // Breadcrumb
              ...(breadcrumb ? [{
                type: "div",
                props: {
                  style: {
                    display: "flex", fontSize: 13, fontWeight: 700, color: accent,
                    letterSpacing: 0.3, textTransform: "uppercase",
                  },
                  children: breadcrumb,
                },
              }] : []),
              // Question prompt
              {
                type: "div",
                props: {
                  style: {
                    display: "flex", fontFamily: "Bricolage Grotesque", fontWeight: 700,
                    fontSize: 28, color: C.navy, lineHeight: 1.3, maxWidth: 1050, overflow: "hidden",
                  },
                  children: truncate(text, 160),
                },
              },
              // Answer options
              ...(optionRows.length > 0 ? [{
                type: "div",
                props: {
                  style: {
                    display: "flex", flexDirection: "column", gap: 6,
                    marginTop: 10, paddingLeft: 4,
                  },
                  children: optionRows,
                },
              }] : []),
            ],
          },
        },
        // Bottom branding
        {
          type: "div",
          props: {
            style: {
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 48px 20px", borderTop: `1.5px solid ${C.navy}10`,
            },
            children: [
              ...(logoBase64 ? [{
                type: "img",
                props: { src: logoBase64, width: 28, height: 28, style: { borderRadius: 5 } },
              }] : []),
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 14, color: C.navy }, children: "EnterMedSchool" } },
              { type: "span", props: { style: { fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 14, color: C.purple }, children: ".org" } },
            ],
          },
        },
      ],
    },
  };
}

// ══════════════════════════════════════════════════════════════════════
//  IMAGE GENERATION ENGINE
// ══════════════════════════════════════════════════════════════════════

let totalGenerated = 0;
let totalBytes = 0;

// Output directory for local mode
const OUTPUT_DIR = LOCAL_MODE ? join(ROOT, "public", "og") : join(ROOT, "_og-output");

// Collect generated images for blob upload
const pendingUploads = [];

async function gen(element, outputPath, fonts) {
  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();
  const abs = join(OUTPUT_DIR, outputPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, png);
  if (!LOCAL_MODE) pendingUploads.push({ path: `og/${outputPath}`, buffer: png });
  totalGenerated++;
  totalBytes += png.length;
  if (totalGenerated % 200 === 0) {
    console.log(`    ... ${totalGenerated} images generated (${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);
  }
}

async function genBatch(items, batchSize, fonts) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(({ element, path }) => gen(element, path, fonts)));
  }
}

async function uploadToBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.log("\n  No BLOB_READ_WRITE_TOKEN found — skipping upload. Images saved locally.");
    return;
  }
  const { put } = await import("@vercel/blob");
  console.log(`\n  Uploading ${pendingUploads.length} images to Vercel Blob...`);
  let uploaded = 0;
  const BATCH = 50;
  for (let i = 0; i < pendingUploads.length; i += BATCH) {
    const batch = pendingUploads.slice(i, i + BATCH);
    await Promise.all(batch.map(async ({ path, buffer }) => {
      await put(path, buffer, { access: "public", addRandomSuffix: false, contentType: "image/png", token });
      uploaded++;
    }));
    if (uploaded % 200 < BATCH && uploaded >= 200) {
      console.log(`    ... ${uploaded} uploaded`);
    }
  }
  console.log(`    Done uploading ${uploaded} images to blob.`);
  // Clean up temp dir
  if (existsSync(OUTPUT_DIR) && !LOCAL_MODE) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
    console.log("    Cleaned up temp directory.");
  }
}

// ── Deck-to-category resolution helpers ───────────────────────────────
function resolveDeckCategory(deck, categories) {
  const catIds = deck.categoryIds || (deck.primaryCategoryId ? [deck.primaryCategoryId] : []);
  if (catIds.length > 0) {
    const cat = categories.find(c => catIds.includes(c.id));
    if (cat) return cat;
  }
  for (const cat of categories) {
    if (deck.slug && cat.slug && (deck.slug.startsWith(cat.slug + "-") || deck.slug === cat.slug)) {
      return cat;
    }
  }
  return null;
}

function resolveFlashcardDeckCategory(deck, categories) {
  if (deck.categoryId != null) {
    const cat = categories.find(c => c.id === deck.categoryId);
    if (cat) return cat;
  }
  for (const cat of categories) {
    if (deck.slug && cat.slug && (deck.slug.startsWith(cat.slug + "-") || deck.slug === cat.slug)) {
      return cat;
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now();
  console.log("\n  Generating OG images...\n");

  const fonts = await loadFonts();
  const data = loadAllData();

  const {
    practiceCategories, practiceDecks, practiceQuestions,
    flashcardCategories, flashcardDecks, flashcardData,
    glossaryTerms, glossaryCategories,
    visualLessons, pdfBooks, clinicalCases,
    mediaAssets, mediaCategories, mediaCollections, allMediaTags,
    blogPosts, tools, examTypes,
  } = data;

  const totalQuestions = practiceQuestions.length;
  const totalCards = flashcardData.length;
  const totalTerms = glossaryTerms.length;

  const questionsPerDeck = {};
  for (const q of practiceQuestions) {
    questionsPerDeck[q.deckId] = (questionsPerDeck[q.deckId] || 0) + 1;
  }
  const cardsPerDeck = {};
  for (const c of flashcardData) {
    cardsPerDeck[c.deckId] = (cardsPerDeck[c.deckId] || 0) + 1;
  }

  // ────────────────────────────────────────────────────────────────
  //  TIER 1: RICH TEMPLATES — Hub & static pages
  // ────────────────────────────────────────────────────────────────
  console.log("  Tier 1: Rich templates (hubs & static pages)...");

  await gen(buildRichTemplate({
    title: "EnterMedSchool",
    eyebrow: "Free Medical Education",
    stats: [
      { value: totalQuestions.toLocaleString(), label: "questions" },
      { value: totalCards.toLocaleString(), label: "flashcards" },
      { value: totalTerms.toLocaleString(), label: "glossary terms" },
    ],
    accent: C.purple,
  }), "home.png", fonts);

  await gen(buildRichTemplate({
    title: "Free Medical Resources",
    eyebrow: "Resources",
    stats: [
      { value: practiceDecks.length.toString(), label: "question decks" },
      { value: flashcardDecks.length.toString(), label: "flashcard decks" },
    ],
    accent: C.purple,
  }), "resources.png", fonts);

  await gen(buildRichTemplate({
    title: "Practice Questions",
    eyebrow: "Question Banks",
    stats: [
      { value: totalQuestions.toLocaleString(), label: "questions" },
      { value: practiceDecks.length.toString(), label: "decks" },
    ],
    accent: C.purple,
  }), "resources/questions.png", fonts);

  await gen(buildRichTemplate({
    title: "Flashcard Decks",
    eyebrow: "Study Cards",
    stats: [
      { value: totalCards.toLocaleString(), label: "cards" },
      { value: flashcardDecks.length.toString(), label: "decks" },
    ],
    accent: C.teal,
  }), "resources/flashcards.png", fonts);

  await gen(buildRichTemplate({
    title: "Medical Glossary",
    eyebrow: "Terminology",
    stats: [
      { value: totalTerms.toLocaleString(), label: "terms" },
      { value: glossaryCategories.length.toString(), label: "categories" },
    ],
    accent: C.green,
  }), "resources/glossary.png", fonts);

  await gen(buildRichTemplate({
    title: "Visual Lessons",
    eyebrow: "Interactive Learning",
    stats: [{ value: visualLessons.length.toString(), label: "lessons" }],
    accent: C.blue,
  }), "resources/visuals.png", fonts);

  await gen(buildRichTemplate({
    title: "Free PDF Books",
    eyebrow: "Study Materials",
    stats: [{ value: pdfBooks.length.toString(), label: "books" }],
    accent: C.orange,
  }), "resources/pdfs.png", fonts);

  await gen(buildRichTemplate({
    title: "Clinical Cases",
    eyebrow: "Case Studies",
    stats: [{ value: clinicalCases.length.toString(), label: "cases" }],
    accent: C.pink,
  }), "resources/clinical-cases.png", fonts);

  await gen(buildRichTemplate({
    title: "Media Library",
    eyebrow: "Illustrations & Assets",
    stats: [
      { value: mediaAssets.length.toString(), label: "assets" },
      { value: mediaCollections.length.toString(), label: "collections" },
    ],
    accent: C.coral,
  }), "resources/media.png", fonts);

  await gen(buildStandardTemplate({
    title: "Media Collections",
    breadcrumb: "Media \u2192 Collections",
    stats: [{ value: mediaCollections.length.toString(), label: "collections" }],
    accent: C.coral,
  }), "resources/media/collections.png", fonts);

  await gen(buildRichTemplate({
    title: "Educational Videos",
    eyebrow: "Video Resources",
    accent: C.blue,
  }), "resources/videos.png", fonts);

  await gen(buildRichTemplate({
    title: "Articles & Guides",
    eyebrow: "Blog",
    stats: blogPosts.length > 0 ? [{ value: blogPosts.length.toString(), label: "articles" }] : [],
    accent: C.purple,
  }), "articles.png", fonts);

  const calcTools = tools.filter(t => t.category === "calculator");
  await gen(buildRichTemplate({
    title: "Medical Calculators",
    eyebrow: "Tools",
    stats: [{ value: calcTools.length.toString(), label: "calculators" }],
    accent: C.teal,
  }), "calculators.png", fonts);

  const creatorTools = tools.filter(t => t.category === "creator");
  await gen(buildRichTemplate({
    title: "Creator Tools",
    eyebrow: "Tools",
    stats: [{ value: creatorTools.length.toString(), label: "tools" }],
    accent: C.purple,
  }), "tools.png", fonts);

  await gen(buildRichTemplate({
    title: "Clinical Semiotics",
    eyebrow: "Interactive Exams",
    stats: [{ value: examTypes.length.toString(), label: "exam types" }],
    accent: C.pink,
  }), "clinical-semiotics.png", fonts);

  const staticPages = [
    { path: "about.png", title: "About EnterMedSchool", eyebrow: "Our Mission", accent: C.purple },
    { path: "privacy.png", title: "Privacy Policy", eyebrow: "Legal", accent: C.blue },
    { path: "license.png", title: "Open-Source License", eyebrow: "Legal", accent: C.green },
    { path: "events.png", title: "Events & Community", eyebrow: "Community", accent: C.orange },
    { path: "for-professors.png", title: "For Professors", eyebrow: "Educators", accent: C.coral },
    { path: "for-professors/templates.png", title: "Teaching Templates", eyebrow: "For Professors", accent: C.coral },
    { path: "for-professors/assets.png", title: "Educational Assets", eyebrow: "For Professors", accent: C.coral },
    { path: "for-professors/guides.png", title: "Teaching Guides", eyebrow: "For Professors", accent: C.coral },
    { path: "resources/media/how-to-cite.png", title: "How to Cite Our Assets", eyebrow: "Media", accent: C.coral },
  ];
  for (const p of staticPages) {
    await gen(buildRichTemplate({ title: p.title, eyebrow: p.eyebrow, accent: p.accent }), p.path, fonts);
  }

  console.log(`    Done Tier 1: ${totalGenerated} images`);

  // ────────────────────────────────────────────────────────────────
  //  TIER 2: STANDARD TEMPLATES — Categories, decks, collections
  // ────────────────────────────────────────────────────────────────
  console.log("  Tier 2: Standard templates (categories, decks, collections)...");
  const tier2Start = totalGenerated;

  for (let i = 0; i < practiceCategories.length; i++) {
    const cat = practiceCategories[i];
    const decksInCat = practiceDecks.filter(d => {
      const ids = d.categoryIds || (d.primaryCategoryId ? [d.primaryCategoryId] : []);
      return ids.includes(cat.id);
    });
    const qCount = decksInCat.reduce((s, d) => s + (questionsPerDeck[d.id] || d.questionCount || 0), 0);
    await gen(buildStandardTemplate({
      title: cat.name, breadcrumb: "Questions",
      stats: [{ value: qCount.toLocaleString(), label: "questions" }, { value: decksInCat.length.toString(), label: "decks" }],
      accent: accentFor(i),
    }), `resources/questions/${cat.slug}.png`, fonts);
  }

  for (let i = 0; i < practiceDecks.length; i++) {
    const deck = practiceDecks[i];
    const cat = resolveDeckCategory(deck, practiceCategories);
    const qCount = questionsPerDeck[deck.id] || deck.questionCount || 0;
    await gen(buildStandardTemplate({
      title: deck.title || deck.slug,
      breadcrumb: cat ? `Questions \u2192 ${cat.name}` : "Questions",
      stats: [{ value: qCount.toLocaleString(), label: "questions" }],
      accent: accentFor(i),
    }), `resources/questions/${cat ? cat.slug : "general"}/${deck.slug}.png`, fonts);
  }

  for (let i = 0; i < flashcardCategories.length; i++) {
    const cat = flashcardCategories[i];
    const decksInCat = flashcardDecks.filter(d => {
      if (d.categoryId === cat.id) return true;
      return d.slug && cat.slug && (d.slug.startsWith(cat.slug + "-") || d.slug === cat.slug);
    });
    const cardCount = decksInCat.reduce((s, d) => s + (cardsPerDeck[d.id] || d.cardCount || 0), 0);
    await gen(buildStandardTemplate({
      title: cat.name, breadcrumb: "Flashcards",
      stats: [{ value: cardCount.toLocaleString(), label: "cards" }, { value: decksInCat.length.toString(), label: "decks" }],
      accent: accentFor(i + 3),
    }), `resources/flashcards/${cat.slug}.png`, fonts);
  }

  for (let i = 0; i < flashcardDecks.length; i++) {
    const deck = flashcardDecks[i];
    const cat = resolveFlashcardDeckCategory(deck, flashcardCategories);
    const cardCount = cardsPerDeck[deck.id] || deck.cardCount || 0;
    await gen(buildStandardTemplate({
      title: deck.title || deck.slug,
      breadcrumb: cat ? `Flashcards \u2192 ${cat.name}` : "Flashcards",
      stats: [{ value: cardCount.toLocaleString(), label: "cards" }],
      accent: accentFor(i + 2),
    }), `resources/flashcards/${cat ? cat.slug : "general"}/${deck.slug}.png`, fonts);
  }

  for (let i = 0; i < glossaryCategories.length; i++) {
    const cat = glossaryCategories[i];
    await gen(buildStandardTemplate({
      title: cat.name, breadcrumb: "Glossary",
      stats: [{ value: cat.count.toString(), label: "terms" }],
      accent: accentFor(i + 1),
    }), `resources/glossary/category/${cat.id}.png`, fonts);
  }

  for (let i = 0; i < mediaCategories.length; i++) {
    const cat = mediaCategories[i];
    const assetsInCat = mediaAssets.filter(a => a.category === cat.id);
    await gen(buildStandardTemplate({
      title: cat.name, breadcrumb: "Media",
      stats: [{ value: assetsInCat.length.toString(), label: "assets" }],
      accent: accentFor(i + 4),
    }), `resources/media/category/${cat.id}.png`, fonts);
  }

  for (let i = 0; i < mediaCollections.length; i++) {
    const col = mediaCollections[i];
    await gen(buildStandardTemplate({
      title: col.name, breadcrumb: "Media \u2192 Collections",
      stats: [{ value: (col.assetIds || []).length.toString(), label: "assets" }],
      accent: accentFor(i + 5),
    }), `resources/media/collections/${col.slug}.png`, fonts);
  }

  for (let i = 0; i < allMediaTags.length; i++) {
    const tag = allMediaTags[i];
    const assetsWithTag = mediaAssets.filter(a => (a.tags || []).includes(tag));
    const displayName = tag.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    await gen(buildStandardTemplate({
      title: displayName, breadcrumb: "Media \u2192 Tags",
      stats: [{ value: assetsWithTag.length.toString(), label: "assets" }],
      accent: accentFor(i),
    }), `resources/media/tag/${tag}.png`, fonts);
  }

  for (let i = 0; i < pdfBooks.length; i++) {
    const book = pdfBooks[i];
    await gen(buildStandardTemplate({
      title: book.title, breadcrumb: "PDF Books",
      stats: [{ value: (book.chapters || []).length.toString(), label: "chapters" }],
      accent: accentFor(i + 2),
    }), `resources/pdfs/${book.slug}.png`, fonts);
  }

  for (let i = 0; i < examTypes.length; i++) {
    const ex = examTypes[i];
    await gen(buildStandardTemplate({
      title: ex.title, breadcrumb: "Clinical Semiotics", accent: accentFor(i + 3),
    }), `clinical-semiotics/${ex.id}.png`, fonts);
  }

  console.log(`    Done Tier 2: ${totalGenerated - tier2Start} images`);

  // ────────────────────────────────────────────────────────────────
  //  TIER 3: COMPACT TEMPLATES — Individual items (batched)
  // ────────────────────────────────────────────────────────────────
  console.log("  Tier 3: Compact templates (individual items)...");
  const tier3Start = totalGenerated;
  const compactItems = [];

  // Individual practice questions — USE QUESTION TEMPLATE WITH OPTIONS
  for (const q of practiceQuestions) {
    const deck = practiceDecks.find(d => d.id === q.deckId);
    const cat = deck ? resolveDeckCategory(deck, practiceCategories) : null;
    const catSlug = cat ? cat.slug : "general";
    const deckSlug = deck ? deck.slug : "unknown";
    const accent = cat ? accentFor(practiceCategories.indexOf(cat)) : C.purple;
    compactItems.push({
      element: buildQuestionCompactTemplate({
        text: q.prompt || `Question #${q.ordinal}`,
        options: (q.options || []).slice(0, 5),
        breadcrumb: cat ? `Questions \u2192 ${cat.name} \u2192 ${deck?.title || deckSlug}` : "Questions",
        accent,
      }),
      path: `resources/questions/${catSlug}/${deckSlug}/${q.stableId || q.id}.png`,
    });
  }

  // Individual flashcards
  for (const card of flashcardData) {
    const deck = flashcardDecks.find(d => d.id === card.deckId);
    const cat = deck ? resolveFlashcardDeckCategory(deck, flashcardCategories) : null;
    const catSlug = cat ? cat.slug : "general";
    const deckSlug = deck ? deck.slug : "unknown";
    const accent = cat ? accentFor(flashcardCategories.indexOf(cat) + 3) : C.teal;
    compactItems.push({
      element: buildCompactTemplate({
        text: card.front || `Card #${card.ordinal}`,
        breadcrumb: cat ? `Flashcards \u2192 ${cat.name} \u2192 ${deck?.title || deckSlug}` : "Flashcards",
        accent,
      }),
      path: `resources/flashcards/${catSlug}/${deckSlug}/${card.stableId || card.id}.png`,
    });
  }

  // Individual glossary terms
  for (const term of glossaryTerms) {
    compactItems.push({
      element: buildCompactTemplate({
        text: `${term.names[0]}: ${truncate(term.definition, 140)}`,
        breadcrumb: `Glossary \u2192 ${(term.primary_tag || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        accent: C.green,
      }),
      path: `resources/glossary/${term.id}.png`,
    });
  }

  // Individual visual lessons
  for (const lesson of visualLessons) {
    compactItems.push({
      element: buildCompactTemplate({
        text: lesson.title,
        breadcrumb: `Visuals \u2192 ${lesson.category || "Lesson"}`,
        accent: C.blue,
      }),
      path: `resources/visuals/${lesson.id}.png`,
    });
  }

  // Individual PDF chapters
  for (const book of pdfBooks) {
    for (const ch of (book.chapters || [])) {
      compactItems.push({
        element: buildCompactTemplate({
          text: ch.title, breadcrumb: `PDFs \u2192 ${book.title}`, accent: C.orange,
        }),
        path: `resources/pdfs/${book.slug}/${ch.slug}.png`,
      });
    }
  }

  // Individual clinical cases
  for (const cs of clinicalCases) {
    compactItems.push({
      element: buildCompactTemplate({
        text: cs.title, breadcrumb: `Clinical Cases \u2192 ${cs.category || "Case"}`, accent: C.pink,
      }),
      path: `resources/clinical-cases/${cs.id || cs.slug}.png`,
    });
  }

  // Individual media assets
  for (const asset of mediaAssets) {
    compactItems.push({
      element: buildCompactTemplate({
        text: asset.name || asset.title,
        breadcrumb: `Media \u2192 ${asset.category || "Asset"}`, accent: C.coral,
      }),
      path: `resources/media/${asset.slug}.png`,
    });
  }

  // Individual blog posts
  for (const post of blogPosts) {
    compactItems.push({
      element: buildCompactTemplate({
        text: post.title, breadcrumb: `Articles \u2192 ${post.category || "Blog"}`, accent: C.purple,
      }),
      path: `articles/${post.slug}.png`,
    });
  }

  // Individual tools & calculators
  for (const tool of tools) {
    const displayName = tool.i18nKey.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()).trim();
    const prefix = tool.category === "calculator" ? "calculators" : "tools";
    compactItems.push({
      element: buildCompactTemplate({
        text: displayName,
        breadcrumb: tool.category === "calculator" ? "Calculators" : "Tools",
        accent: tool.category === "calculator" ? C.teal : C.purple,
      }),
      path: `${prefix}/${tool.id}.png`,
    });
  }

  console.log(`    Queued ${compactItems.length} compact images, generating in batches of 25...`);
  await genBatch(compactItems, 25, fonts);

  console.log(`    Done Tier 3: ${totalGenerated - tier3Start} images`);

  // ── Upload to blob (unless --local) ─────────────────────────────
  if (!LOCAL_MODE) {
    await uploadToBlob();
  }

  // ── Summary ─────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const sizeMB = (totalBytes / 1024 / 1024).toFixed(1);
  const dest = LOCAL_MODE ? "public/og/" : "Vercel Blob";
  console.log(`\n  Done! Generated ${totalGenerated} OG images (${sizeMB} MB) in ${elapsed}s → ${dest}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
