/**
 * Pre-build script: Reads all glossary JSON term files and bundles
 * them into a single data/glossary/all-terms.json file.
 *
 * Run: node scripts/bundle-glossary.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TERMS_DIR = path.join(__dirname, "..", "data", "glossary", "terms");
const OUTPUT_FILE = path.join(__dirname, "..", "data", "glossary", "all-terms.json");

function walkDir(dir) {
  const terms = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      terms.push(...walkDir(fullPath));
    } else if (entry.name.endsWith(".json")) {
      try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const term = JSON.parse(raw);
        terms.push(term);
      } catch (e) {
        console.warn(`Skipping invalid JSON: ${fullPath}`);
      }
    }
  }
  return terms;
}

console.log("Bundling glossary terms...");
const terms = walkDir(TERMS_DIR);
terms.sort((a, b) => a.names[0].toLowerCase().localeCompare(b.names[0].toLowerCase()));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(terms, null, 0), "utf-8");
console.log(`Bundled ${terms.length} terms → ${OUTPUT_FILE}`);
